use tauri::Manager;
use tauri_plugin_oauth::OauthConfig;
use tauri_plugin_store::StoreExt;

use base64::prelude::{Engine, BASE64_STANDARD};
use rand::Rng;
use serde_json::json;
use std::{
    collections::HashMap,
    fs,
    sync::{atomic::Ordering, mpsc::channel},
};
use tokio::sync::Mutex;
use url::Url;

use crate::{
    error::AppError,
    types::{self, AppState, FetchMethod, FetchResponse, Json, Token},
};

#[tauri::command]
pub async fn check_login(state: tauri::State<'_, Mutex<AppState>>) -> Result<bool, AppError> {
    Ok(state.lock().await.token.is_some())
}

#[tauri::command]
pub async fn oauth(
    state: tauri::State<'_, Mutex<AppState>>,
    app_handle: tauri::AppHandle,
) -> Result<(), AppError> {
    let config = OauthConfig {
        ports: Some(vec![3622]),
        response: Some("<style>body { background: #000; color: #FFF; }</style>Auth process completed. You can close this tab/window.".into()),
    };

    let _ = open::that(format!(
        "https://anilist.co/api/v2/oauth/authorize?client_id={}&response_type=token",
        dotenv!("CLIENT_ID")
    ));

    let (tx, rx) = channel::<Token>();

    let _ = tauri_plugin_oauth::start_with_config(config, move |url| {
        // i'm not going to ask why they used # instead of ?, even
        // though they didn't do this when you set response_type=code
        let binding = Url::parse(&url.replace("#", "?")).expect("Failed to parse url");

        let query = binding.query_pairs().collect::<HashMap<_, _>>();

        tx.send(Token {
            access_token: query
                .get("access_token")
                .expect("Failed to get access_token")
                .to_string(),
            token_type: query
                .get("token_type")
                .expect("Failed to get token_type")
                .to_string(),
            expires_in: query
                .get("expires_in")
                .expect("Failed to get expires_in")
                .parse::<u32>()
                .expect("Failed to parse expires_in"),
        })
        .expect("Failed to send code to main thread");
    })?;

    let token = rx.recv()?;
    let token_store = app_handle.store("token")?;

    // token_store SHOULD contains two keys:
    // enc_iv: the base64'd iv used for the aes-256 encryption
    // token_encrypted: a `Token` json serialized, aes-256 encrypted, base64'd
    let enc_iv = rand::thread_rng().gen::<[u8; 16]>();
    token_store.set("enc_iv", BASE64_STANDARD.encode(enc_iv));
    token_store.set(
        "token_encrypted",
        BASE64_STANDARD.encode(
            state
                .lock()
                .await
                .aes
                .cbc_encrypt(&enc_iv, serde_json::to_string(&token)?.as_bytes()),
        ),
    );

    state.lock().await.token = Some(token);

    Ok(())
}

#[tauri::command]
pub async fn graphql(
    state: tauri::State<'_, Mutex<AppState>>,
    query: String,
    variables: Json,
) -> Result<Json, AppError> {
    let token = state
        .lock()
        .await
        .token
        .clone()
        .ok_or(AppError::Graphql("no token".to_string()))?;

    Ok(state
        .lock()
        .await
        .client
        .post("https://graphql.anilist.co")
        .header(
            "Authorization",
            format!("{} {}", token.token_type, token.access_token),
        )
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .body(serde_json::to_string(
            &json!({ "query": query, "variables": variables }),
        )?)
        .send()
        .await?
        .json()
        .await?)
}

#[tauri::command]
pub async fn fetch(
    state: tauri::State<'_, Mutex<AppState>>,
    url: String,
    method: FetchMethod,
    body: Option<String>,
    headers: Option<HashMap<String, String>>,
) -> Result<FetchResponse, AppError> {
    let mut req = state.lock().await.client.request(method.to_reqwest(), url);

    if let Some(body) = body {
        req = req.body(body);
    }

    if let Some(headers) = headers {
        req = headers.iter().fold(req, |prev, (k, v)| prev.header(k, v));
    }

    let res = req.send().await?;

    Ok(FetchResponse {
        headers: res
            .headers()
            .iter()
            .map(|(key, value)| (key.to_string(), value.to_str().unwrap().to_string()))
            .collect(),
        status: res.status().as_u16(),
        body: res.text().await?,
    })
}

#[tauri::command]
pub async fn get_sources(
    app_handle: tauri::AppHandle,
) -> Result<HashMap<String, String>, AppError> {
    let path = app_handle.path().app_data_dir()?.join("sources");

    if !path.exists() {
        fs::create_dir_all(&path)?;
    }

    Ok(fs::read_dir(&path)?
        .map(|e| {
            let e = e.as_ref().unwrap();

            (
                e.file_name().into_string().unwrap(),
                fs::read_to_string(e.path()).unwrap(),
            )
        })
        .collect())
}

#[tauri::command]
pub async fn open_source_dir(app_handle: tauri::AppHandle) -> Result<(), AppError> {
    let path = app_handle.path().app_data_dir()?.join("sources");

    if !path.exists() {
        fs::create_dir_all(&path)?;
    }

    open::that(path)?;

    Ok(())
}

#[tauri::command]
pub async fn restart_rpc(state: tauri::State<'_, Mutex<AppState>>) -> Result<(), AppError> {
    let s = &mut state.lock().await;

    s.discord_connected.store(false, Ordering::SeqCst);
    if let Some(client) = s.discord.take() {
        client.shutdown()?;
    }

    let mut new_discord =
        discord_presence::Client::new(dotenv!("DISCORD_CLIENT_ID").parse::<u64>().unwrap());

    new_discord
        .on_connected({
            let connected_clone = s.discord_connected.clone();
            move |_| {
                connected_clone.store(true, Ordering::SeqCst);
            }
        })
        .persist();
    new_discord
        .on_disconnected({
            let connected_clone = s.discord_connected.clone();
            move |_| {
                connected_clone.store(false, Ordering::SeqCst);
            }
        })
        .persist();

    new_discord.start();
    s.discord = Some(new_discord);

    Ok(())
}

#[tauri::command]
pub async fn set_activity(
    state: tauri::State<'_, Mutex<AppState>>,
    activity: crate::types::DiscordActivity,
) -> Result<(), AppError> {
    let l = &mut state.lock().await;
    if !l.discord_connected.load(Ordering::SeqCst) || !discord_presence::Client::is_ready() {
        return Err(AppError::NoDiscord);
    }

    if let Some(discord) = &l.discord {
        if let Some(state) = &activity.state {
            if state.len() < 3 {
                return Err(AppError::InvalidDiscordState);
            }
        }

        discord.set_activity(move |mut a| {
            if let Some(state) = &activity.state {
                a = a.state(state.as_str());
            }

            if let Some(details) = &activity.details {
                a = a.details(details.as_str());
            }

            if let Some(activity_type) = &activity.activity_type {
                use discord_presence::models::ActivityType;

                a = a.activity_type(match activity_type {
                    types::ActivityType::Playing => ActivityType::Playing,
                    types::ActivityType::Watching => ActivityType::Watching,
                    types::ActivityType::Competing => ActivityType::Competing,
                    types::ActivityType::Listening => ActivityType::Listening,
                })
            }

            if let Some(timestamps) = activity.timestamps {
                a = a.timestamps(|mut ts| {
                    if let Some(start) = timestamps.start {
                        ts = ts.start(start.round() as u64);
                    }
                    if let Some(end) = timestamps.end {
                        ts = ts.end(end.round() as u64);
                    }

                    ts
                });
            }

            if let Some(assets) = &activity.assets {
                a = a.assets(|mut ass| {
                    if let Some(large_image) = &assets.large_image {
                        ass = ass.large_image(large_image);
                    }
                    if let Some(large_text) = &assets.large_text {
                        ass = ass.large_text(large_text);
                    }
                    if let Some(small_image) = &assets.small_image {
                        ass = ass.small_image(small_image);
                    }
                    if let Some(small_text) = &assets.small_text {
                        ass = ass.small_text(small_text);
                    }

                    ass
                });
            }

            if let Some(secrets) = &activity.secrets {
                a = a.secrets(|mut sec| {
                    if let Some(game) = &secrets.game {
                        sec = sec.game(game);
                    }
                    if let Some(join) = &secrets.join {
                        sec = sec.join(join);
                    }
                    if let Some(spectate) = &secrets.spectate {
                        sec = sec.spectate(spectate);
                    }

                    sec
                });
            }

            if let Some(party) = &activity.party {
                a = a.party(|mut par| {
                    if let Some(id) = &party.id {
                        par = par.id(id);
                    }
                    if let Some(size) = party.size {
                        par = par.size(size);
                    }

                    par
                });
            }

            if let Some(buttons) = &activity.buttons {
                for button in buttons.iter() {
                    a = a.append_buttons(move |mut b| {
                        b = b.label(button.label.clone());
                        b = b.url(button.url.clone());
                        b
                    });
                }
            }

            a
        })?;

        Ok(())
    } else {
        Err(AppError::NoDiscord)
    }
}
