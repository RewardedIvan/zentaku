use tauri_plugin_http::reqwest;
use reqwest::Client as RqClient;
use serde::{Deserialize, Serialize};
use libaes::Cipher;

#[derive(Debug, Deserialize, Serialize)]
pub struct Token {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u32,
}

pub struct AppState {
    pub token: Option<Token>,

    pub client: RqClient,
    pub aes: Cipher,
}
