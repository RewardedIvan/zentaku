mod error;
mod types;
mod commands;

use error::AppError;
use tauri::Manager;
use tauri_plugin_http::reqwest;
use tauri_plugin_store::StoreExt;

use reqwest::Client as RqClient;
use tokio::sync::Mutex;
use libaes::{Cipher, AES_256_KEY_LEN};
use base64::prelude::{BASE64_STANDARD, Engine};

#[macro_use]
extern crate dotenv_codegen;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(
            tauri::generate_handler![
                commands::get_token,
                commands::oauth,
                commands::check_login
            ]
        )
        .setup(|app| {
            let mut store_token = None;
            let aes = {
                let key = dotenv!("TOKEN_ENCRYPT_KEY").as_bytes();

                if key.len() != AES_256_KEY_LEN {
                    Err(AppError::Custom("TOKEN_ENCRYPT_KEY is not 32 bytes long".to_string()))
                } else {
                    // the things you do for type safety
                    let mut key_typed = [0u8; 32];
                    key_typed.copy_from_slice(key);
                    Ok(Cipher::new_256(&key_typed))
                }
            }?;

            // token_store contains two keys:
            // enc_iv: the base64'd iv used for the aes-256 encryption
            // token_encrypted: a `Token` json serialized, aes-256 encrypted, base64'd
            // > good luck brave reader
            let token_store = app.store("token")?;
            if let Some(token) = token_store.get("token_encrypted") {
                let token =
                    BASE64_STANDARD.decode(
                        token.as_str().
                        ok_or(
                            AppError::TokenStore("token isn't a string".to_string())
                        )?
                    )?;

                let enc_iv =
                    BASE64_STANDARD.decode(
                        token_store.get("enc_iv")
                        .ok_or(
                            AppError::TokenStore("no enc_iv".to_string())
                        )?
                        .as_str()
                        .ok_or(
                            AppError::TokenStore("enc_iv isn't a string".to_string())
                        )?
                    )?;

                store_token = Some(
                    serde_json::from_str(
                        &String::from_utf8(
                            aes.cbc_decrypt(&enc_iv, &token)
                        )?
                    )?
                );
            }
            drop(token_store);

            app.manage(Mutex::new(
                types::AppState {
                    client: RqClient::new(),
                    token: store_token,
                    aes,
                }
            ));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
