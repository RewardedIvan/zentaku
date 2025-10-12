use tauri::Manager;
use tauri_plugin_oauth::OauthConfig;
use tauri_plugin_store::StoreExt;

use base64::prelude::{Engine, BASE64_STANDARD};
use rand::Rng;
use serde_json::json;
use std::{collections::HashMap, fs, sync::mpsc::channel};
use tokio::sync::Mutex;
use url::Url;

use crate::{
    error::AppError,
    types::{AppState, FetchMethod, FetchResponse, Json, Token},
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
