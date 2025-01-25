# Zentaku

## About

Zen-taku (zen-otaku) is an anilist client and anime player (and future manga reader).

## Runtime dependencies

> [The msi takes care of the installation for both of them](https://github.com/tauri-apps/tauri/discussions/2924#discussioncomment-1666317).  
> WebView 2 is already installed on Windows 10 (from version 1803 onward) and later versions of Windows.

- WebView 2
- A c++ redistributable

## Building/Hacking

- Prerequisites

1. [Tauri's](https://v2.tauri.app/start/prerequisites/).
2. [pnpm](https://pnpm.io/installation) and [node](https://nodejs.org/) or install them using your favourite package manager.

- Clone the repo

```bash
git clone https://github.com/RewardedIvan/zentaku
```

- Make a .env file (in the root directory of the project)

```bash
# AniList app; This is the zentaku one
CLIENT_ID=23320
# 32 bytes for AES 256
# Also I know I'm stupid, you don't have to tell me
TOKEN_ENCRYPT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Compile and run dev server

```bash
pnpm tauri dev
```

- Or build for release

```bash
pnpm tauri build
```

- Or build with debug

```bash
pnpm tauri build -d
```
