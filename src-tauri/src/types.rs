use libaes::Cipher;
use reqwest::Client as RqClient;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{atomic::AtomicBool, Arc},
};
use tauri_plugin_http::reqwest;

pub type Json = HashMap<String, serde_json::Value>;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Token {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u32,
}

pub struct AppState {
    pub token: Option<Token>,

    pub discord: Option<discord_presence::Client>,
    pub discord_connected: Arc<AtomicBool>,
    pub client: RqClient,
    pub aes: Cipher,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FetchResponse {
    pub headers: HashMap<String, String>,
    pub status: u16,
    pub body: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum FetchMethod {
    GET,
    POST,
    PUT,
    DELETE,
    OPTIONS,
    PATCH,
}

impl FetchMethod {
    pub fn to_reqwest(&self) -> reqwest::Method {
        match self {
            FetchMethod::GET => reqwest::Method::GET,
            FetchMethod::POST => reqwest::Method::POST,
            FetchMethod::PUT => reqwest::Method::PUT,
            FetchMethod::DELETE => reqwest::Method::DELETE,
            FetchMethod::OPTIONS => reqwest::Method::OPTIONS,
            FetchMethod::PATCH => reqwest::Method::PATCH,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DiscordActivity {
    pub state: Option<String>,
    pub activity_type: Option<ActivityType>,
    pub details: Option<String>,
    pub timestamps: Option<ActivityTimestamps>,
    pub assets: Option<ActivityAssets>,
    pub party: Option<ActivityParty>,
    pub secrets: Option<ActivitySecrets>,
    pub buttons: Option<Vec<ActivityButton>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum ActivityType {
    Playing,
    Listening,
    Watching,
    Competing,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivityTimestamps {
    pub start: Option<f64>,
    pub end: Option<f64>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivityAssets {
    pub large_image: Option<String>,
    pub large_text: Option<String>,
    pub small_image: Option<String>,
    pub small_text: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivityParty {
    pub id: Option<String>,
    pub size: Option<(u32, u32)>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivitySecrets {
    pub game: Option<String>,
    pub join: Option<String>,
    pub spectate: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivityButton {
    pub label: String,
    pub url: String,
}
