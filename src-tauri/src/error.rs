#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("failed to parse as string: {0}")]
    Utf8(#[from] std::str::Utf8Error),
    #[error("reqwest failed: {0}")]
    Reqwest(#[from] tauri_plugin_http::reqwest::Error),
    #[error("failed to receive message: {0}")]
    RecvError(#[from] std::sync::mpsc::RecvError),
    #[error("store error: {0}")]
    Store(#[from] tauri_plugin_store::Error),
    #[error("serde_json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("error deserializing token: {0}")]
    TokenStore(String),
    #[error("graphql error: {0}")]
    Graphql(String),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum ErrorKind {
    Io(String),
    Utf8(String),
    Reqwest(String),
    RecvError(String),
    Store(String),
    SerdeJson(String),
    TokenStore(String),
    Graphql(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::Io(_) => ErrorKind::Io(error_message),
            Self::Utf8(_) => ErrorKind::Utf8(error_message),
            Self::Reqwest(_) => ErrorKind::Reqwest(error_message),
            Self::RecvError(_) => ErrorKind::RecvError(error_message),
            Self::Store(_) => ErrorKind::Store(error_message),
            Self::SerdeJson(_) => ErrorKind::SerdeJson(error_message),
            Self::TokenStore(_) => ErrorKind::TokenStore(error_message),
            Self::Graphql(_) => ErrorKind::Graphql(error_message),
        };
        error_kind.serialize(serializer)
    }
}
