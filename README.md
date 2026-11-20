# Infallora

A polished Windows media downloader built with Rust + Tauri. It drives
`yt-dlp.exe` and `ffmpeg.exe` locally through a liquid-glass interface.

Everything runs on your PC: no account, no telemetry, no cloud, no upload.

## Features

- Video and audio downloads from thousands of sites supported by yt-dlp
- Quality options up to 8K/4K, plus per-format bitrate, codec and container choice
- Playlist browsing with thumbnails, select all/none, and one row per selected video
- Subtitles, metadata and thumbnail sidecar files
- Light/dark themes, reduced motion, and a settings panel inside the main window
- Automatic detection of a `cookies.txt` file for private or members-only videos
- Persistent settings in `%APPDATA%\Infallora\settings.json`
- Self-updater: **Settings → updates**, with an optional startup check. Updates
  are signed and delivered through GitHub Releases. See `RELEASING.md`.

## Run it

From this folder:

```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
cd src-tauri
cargo build
.\target\debug\infallora.exe
```

`yt-dlp.exe` must be either:

- in the same folder as `infallora.exe`, or
- in this project's root folder (the default during development), or
- pointed to by the `YTDLP_PATH` environment variable.

## Private or members-only videos

Public videos need no setup. For private or age-restricted content, export
`cookies.txt` from your signed-in browser (for example with the
"Get cookies.txt LOCALLY" extension) and either pick it in
**Settings → Advanced → cookies file** or place it next to `Infallora.exe`.
Infallora detects it automatically.

## Project layout

- `src-tauri/` — Rust backend (downloads, progress, state)
- `dist/` — the interface (HTML / CSS / JS)
- `yt-dlp.exe`, `ffmpeg.exe`, `ffprobe.exe` — bundled engines

## Notes

- The interface polls the Rust backend for progress instead of using events,
  which keeps the code simple and dependency-free.
- "Open file" launches Windows Explorer on the downloaded file.
- Cancelling uses `taskkill /PID /T /F`, so it stops yt-dlp and its children.
- Transient HTTP 403 failures are retried automatically up to three times.

## Resolutions and formats

Video quality options range from Best down to 240p plus smallest file.
Container options: MP4, WebM, MKV, or Auto/source. Selecting a container
forces conversion with ffmpeg.

Audio format options: MP3, M4A/AAC, AAC, Opus, Vorbis, FLAC, WAV and original.
Audio conversion requires ffmpeg.

## ffmpeg

`ffmpeg.exe` and `ffprobe.exe` must sit next to `yt-dlp.exe` (or in the
project root). The app passes their folder to yt-dlp with
`--ffmpeg-location`. They are bundled from the official
`ffmpeg-release-essentials.zip` build.

## Build on this PC

The MSVC linker is not available here. Use the installed GNU toolchain from
`src-tauri` (w64devkit supplies the compiler; `.buildfix` holds the small
`libgcc_eh.a` stub that Rust's GNU target expects):

```powershell
$env:PATH = "D:\Dev\w64devkit\bin;D:\Dev\cargo\bin;$env:PATH"
$env:CC = "gcc"
$env:LIBRARY_PATH = "E:\Downloads\seal\.buildfix"
cargo +stable-x86_64-pc-windows-gnu build --release
```

The release binary is `src-tauri\target\release\infallora.exe`.
