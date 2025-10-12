use libaes::Cipher;
use reqwest::Client as RqClient;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
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
