<p align="center">
  <img src="dist/logo.png" alt="Infallora" width="92">
</p>

<h1 align="center">Infallora</h1>

<p align="center">
  A fast, private media downloader for Windows. Liquid-glass UI, playlist support,
  full format control, and Arabic/RTL out of the box.
</p>

<p align="center">
  <a href="https://github.com/monourar/infallora/releases/latest"><img src="https://img.shields.io/github/v/release/monourar/infallora?style=flat-square&color=7C3AED" alt="Latest release"></a>
  <a href="https://github.com/monourar/infallora/releases"><img src="https://img.shields.io/github/downloads/monourar/infallora/total?style=flat-square&color=7C3AED" alt="Downloads"></a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square" alt="Windows">
  <img src="https://img.shields.io/badge/built%20with-Rust%20%2B%20Tauri-orange?style=flat-square" alt="Rust and Tauri">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
</p>

---

## Download

Get the latest signed installer from **[Releases](https://github.com/monourar/infallora/releases/latest)**.

1. Download `Infallora_x.x.x_x64-setup.exe`.
2. Run it. If Windows SmartScreen appears, click **More info → Run anyway** (the installer is not code-signed yet).
3. Open Infallora and paste a link.

Infallora updates itself. You can check manually in **Settings → updates**, or leave *check on startup* enabled.

> **Requires Windows 10/11 with WebView2** (already installed on most Windows systems; [install it here](https://developer.microsoft.com/microsoft-edge/webview2/) if needed).

---

## Screenshots

| Main window | Settings |
|:---:|:---:|
| ![Infallora main window](docs/main.png) | ![Infallora settings](docs/settings.png) |

Arabic interface with automatic RTL layout:

![Infallora in Arabic](docs/arabic.png)

---

## Features

- **Download from thousands of sites** — anything [yt-dlp](https://github.com/yt-dlp/yt-dlp) supports
- **Quality up to 8K** — 8K/4K/1440p/1080p/720p and lower, plus *smallest file*
- **Full format control** — container (MP4/WebM/MKV), codec (H.264/AV1/VP9), bitrate, and audio format
- **Playlists** — browse every entry, preview thumbnails, select all/none, and download one row per video
- **Subtitles and metadata** — language chips for 10 languages, embedded metadata, thumbnail sidecar files
- **Liquid-glass interface** — light/dark themes, reduced-motion mode, and in-window settings
- **Six languages** — English, العربية, Français, Español, Deutsch and Türkçe, with automatic RTL mirroring for Arabic
- **Private videos** — automatic `cookies.txt` detection, no settings needed for public content
- **Self-updating app and engines** — signed app updates via GitHub Releases, plus automatic yt-dlp updates on startup (or on demand in **Settings → updates → engines**)
- **Persistent history** — your download list survives restarts
- **System tray** — closing the window hides to tray; downloads keep running
- **Notifications** — native Windows toast when a download finishes or fails
- **Browser links** — `infallora://<url>` opens a link directly in the app
- **Local only** — no account, no telemetry, no upload, no cloud

---

## Quick start

1. Paste a video or playlist URL into **Media link**.
2. Pick a preset: **Auto**, **MP3 320**, **1080p MP4**, or **Playlist**.
3. Choose a download folder and click **Download**.

Use **Browse formats** for per-format details (resolution, codec, bitrate, size) before downloading.

### Playlists

Paste a playlist link and Infallora lists every video with its thumbnail and duration. Use **all** / **none** or tick individual entries, then press **Download** — only the selected videos are queued.

### Private or members-only videos

Public videos need no setup. For restricted content:

1. Install the **Get cookies.txt LOCALLY** browser extension.
2. While signed in to the site, export cookies as `cookies.txt`.
3. Place the file **next to `Infallora.exe`** — it is picked up automatically — or select it in **Settings → advanced → cookies file**.

Infallora cannot bypass authentication. Your sign-in is required to access your own private content.

### Language

**Settings → appearance → language** offers *system*, *English*, *العربية*, *Français*, *Español*, *Deutsch* and *Türkçe*. The interface mirrors automatically in Arabic. With *system*, Infallora follows your Windows language.

---

## Privacy

Everything runs on your PC. Infallora downloads using the bundled yt-dlp and ffmpeg binaries, writes files only to your chosen folder, and stores preferences in `%APPDATA%\Infallora\settings.json`. There is no account, analytics, or upload path.

---

## Build from source

Requirements: Windows 10/11, [Rust](https://rustup.rs/), Node.js 20+, and WebView2.

```powershell
git clone https://github.com/monourar/infallora.git
cd infallora
npm install --no-save @tauri-apps/cli
```

Download the engines into the repository root:

```powershell
curl.exe -L -o yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
curl.exe -L -o ffmpeg.zip https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
# extract ffmpeg.exe and ffprobe.exe from the zip into this folder
```

Then build:

```powershell
npx tauri build
```

The signed installer is written to `src-tauri/target/release/bundle/nsis/`. Signing requires the `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secrets — see [RELEASING.md](RELEASING.md). Without them the app builds, but no update signature is produced.

For a quick debug build without bundling:

```powershell
cd src-tauri
cargo build
.\target\debug\infallora.exe
```

> On machines without the MSVC linker, the GNU toolchain works:
> `cargo +stable-x86_64-pc-windows-gnu build --release`.

---

## Project layout

```
dist/            HTML, CSS and JS interface (including i18n.js)
src-tauri/       Rust backend and Tauri configuration
  src/main.rs    download engine, settings, playlists, cookies
  icons/         app icon
  capabilities/  plugin permissions
docs/            README screenshots
.github/workflows/ signed release workflow
```

The UI polls the Rust backend for progress, which keeps the implementation small and dependency-light. Cancelling stops yt-dlp and its child processes. Transient HTTP 403 failures are retried automatically.

---

## FAQ

**Why does Windows warn about the installer?**
Infallora is not code-signed. Windows shows a SmartScreen warning for any unsigned app, even safe ones. Verify you downloaded from this repository's Releases page, then click **More info → Run anyway**. The installer is built on GitHub Actions and published with a signed update manifest.

**Why does a video fail with 403?**
YouTube's CDN sometimes rejects a stream token. Infallora retries up to three times with a short backoff. If it still fails, it is usually account-restricted — use a cookies file.

**Does it work without internet?**
No. Downloading and update checks need a network connection, but your settings and files stay local.

**Can it bypass paywalls or region locks?**
No. It only accesses content your browser session can already access.

---

## License

Infallora's source is [MIT licensed](LICENSE). The release bundles third-party engines with their own licenses — see [NOTICE.md](NOTICE.md) and the bundled `LICENSE-GPLv3.txt`. Respect the terms of service of the sites you use and the rights of content creators.

---

## Links

- [Download](https://github.com/monourar/infallora/releases/latest)
- [Report an issue](https://github.com/monourar/infallora/issues)
- [Release process](RELEASING.md)
- [Licensing notice](NOTICE.md)
