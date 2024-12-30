use tauri_plugin_oauth::OauthConfig;
use tauri_plugin_store::StoreExt;

use url::Url;
use tokio::sync::Mutex;
use base64::prelude::{BASE64_STANDARD, Engine};
use rand::Rng;
use serde_json::json;
use std::{
    sync::mpsc::channel,
    collections::HashMap
};

use crate::{
    error::AppError,
    types::{AppState, Token}
};

#[tauri::command]
pub async fn check_login(state: tauri::State<'_, Mutex<AppState>>) -> Result<bool, AppError> {
    Ok(state.lock().await.token.is_some())
}

#[tauri::command]
pub async fn oauth(state: tauri::State<'_, Mutex<AppState>>, app_handle: tauri::AppHandle) -> Result<(), AppError> {
    let config = OauthConfig {
        ports: Some(vec![3622]),
        response: Some("<style>body { background: #000; color: #FFF; }</style>Auth process completed. You can close this tab/window.".into()),
    };

    let _ = open::that(format!("https://anilist.co/api/v2/oauth/authorize?client_id={}&response_type=token", dotenv!("CLIENT_ID")));

    let (tx, rx) = channel::<Token>();

    let _ = tauri_plugin_oauth::start_with_config(config, move |url| {
        // i'm not going to ask why they used # instead of ?, even
        // though they didn't do this when you set response_type=code
        let binding = Url::parse(&url.replace("#", "?"))
            .expect("Failed to parse url");

        let query = binding.query_pairs().collect::<HashMap<_, _>>();

        tx.send(
            Token {
                access_token: query.get("access_token").expect("Failed to get access_token").to_string(),
                token_type: query.get("token_type").expect("Failed to get token_type").to_string(),
                expires_in: query.get("expires_in").expect("Failed to get expires_in").parse::<u32>().expect("Failed to parse expires_in"),
            }
        ).expect("Failed to send code to main thread");
    })?;
    
    let token = rx.recv()?;
    let token_store = app_handle.store("token")?;

    // token_store SHOULD contains two keys:
    // enc_iv: the base64'd iv used for the aes-256 encryption
    // token_encrypted: a `Token` json serialized, aes-256 encrypted, base64'd
    let enc_iv = rand::thread_rng().gen::<[u8; 16]>();
    token_store.set("enc_iv", BASE64_STANDARD.encode(enc_iv));
    token_store.set("token_encrypted", 
        BASE64_STANDARD.encode(
            state.lock().await
            .aes
            .cbc_encrypt(
                &enc_iv,
                serde_json::to_string(&token)?.as_bytes()
            )
        )
    );

    state.lock().await.token = Some(token);

    Ok(())
}

#[tauri::command]
pub async fn graphql(state: tauri::State<'_, Mutex<AppState>>, query: String) -> Result<HashMap<String, serde_json::Value>, AppError> {
    let token =
        state.lock().await
        .token.clone()
        .ok_or(
            AppError::Graphql("no token".to_string())
        )?;

    Ok(
        state.lock().await.client.post("https://graphql.anilist.co")
            .header("Authorization", format!("{} {}", token.token_type, token.access_token))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .body(
                serde_json::to_string(
                    &json!({ "query": query })
                )?
            )
            .send().await?
            .json().await?
    )
}
