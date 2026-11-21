#![cfg_attr(windows, windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Arc, Condvar, Mutex};
use tauri::{AppHandle, Emitter, Listener, Manager, State};

/// Build a command that never opens a visible console window on Windows.
fn hidden_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    cmd
}

#[derive(Clone, Serialize, Deserialize)]
pub struct DownloadItem {
    id: u64,
    url: String,
    title: String,
    status: String, // queued | downloading | done | error | canceled
    percent: f64,
    speed: String,
    eta: String,
    path: String,
    message: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct LinkPreview {
    title: String,
    thumbnail: String,
    duration: String,
    uploader: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct FormatInfo {
    id: String,
    ext: String,
    resolution: String,
    codec: String,
    size: String,
    tbr: String,
    fps: String,
    kind: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct AppSettings {
    theme: String,
    download_dir: String,
    quality: String,
    format: String,
    bitrate: String,
    codec: String,
    filename_style: String,
    subtitle_lang: String,
    metadata: bool,
    playlist: bool,
    extra_args: String,
    max_concurrent: usize,
    audio_format: String,
    allow_h265: bool,
    saving_method: String,
    reduce_motion: bool,
    write_thumbnail: bool,
    cookies_file: String,
    auto_update: bool,
    language: String,
    engine_auto_update: bool,
    palette: String,
    speed_limit: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".into(),
            download_dir: String::new(),
            quality: "best".into(),
            format: "auto".into(),
            bitrate: "best".into(),
            codec: "auto".into(),
            filename_style: "basic".into(),
            subtitle_lang: String::new(),
            metadata: true,
            playlist: false,
            extra_args: String::new(),
            max_concurrent: 3,
            audio_format: "mp3".into(),
            allow_h265: false,
            saving_method: "download".into(),
            reduce_motion: false,
            write_thumbnail: false,
            cookies_file: String::new(),
            auto_update: true,
            language: "system".into(),
            engine_auto_update: true,
            palette: "violet".into(),
            speed_limit: String::new(),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct PlaylistEntry {
    index: usize,
    title: String,
    duration: String,
    thumbnail: String,
    url: String,
}

#[derive(Default)]
struct Gate {
    active: usize,
    limit: usize,
}

pub struct DownloadState {
    items: Arc<Mutex<Vec<DownloadItem>>>,
    next_id: Arc<Mutex<u64>>,
    processes: Arc<Mutex<HashMap<u64, u32>>>,
    gate: Arc<(Mutex<Gate>, Condvar)>,
}

fn history_path() -> PathBuf {
    if let Ok(appdata) = std::env::var("APPDATA") {
        PathBuf::from(appdata).join("Infallora").join("downloads.json")
    } else {
        PathBuf::from("downloads.json")
    }
}

fn load_history() -> Vec<DownloadItem> {
    let text = match std::fs::read_to_string(history_path()) {
        Ok(t) => t,
        Err(_) => return Vec::new(),
    };
    let mut items: Vec<DownloadItem> = match serde_json::from_str(&text) {
        Ok(v) => v,
        Err(_) => return Vec::new(),
    };
    for item in &mut items {
        if item.status == "downloading" || item.status == "queued" {
            item.status = "error".into();
            item.message = "Interrupted by restart".into();
            item.speed.clear();
            item.eta.clear();
        }
    }
    items
}

fn save_history(items: &[DownloadItem]) {
    if let Ok(text) = serde_json::to_string_pretty(items) {
        if let Some(dir) = history_path().parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        let _ = std::fs::write(history_path(), text);
    }
}

impl Default for DownloadState {
    fn default() -> Self {
        let items = load_history();
        let next = items.iter().map(|i| i.id).max().unwrap_or(0) + 1;
        Self {
            items: Arc::new(Mutex::new(items)),
            next_id: Arc::new(Mutex::new(next)),
            processes: Arc::new(Mutex::new(HashMap::new())),
            gate: Arc::new((Mutex::new(Gate::default()), Condvar::new())),
        }
    }
}

fn update_item<F: FnOnce(&mut DownloadItem)>(items: &Arc<Mutex<Vec<DownloadItem>>>, id: u64, f: F) {
    let mut changed = false;
    if let Ok(mut list) = items.lock() {
        if let Some(item) = list.iter_mut().find(|i| i.id == id) {
            let before = item.status.clone();
            f(item);
            changed = item.status != before;
        }
    }
    if changed {
        if let Ok(list) = items.lock() {
            save_history(&list);
        }
    }
}

fn find_ytdlp() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("YTDLP_PATH") {
        let p = PathBuf::from(p);
        if p.exists() {
            return Some(p);
        }
    }
    let exe = std::env::current_exe().ok()?;
    let mut candidates = Vec::new();
    if let Some(dir) = exe.parent() {
        // NSIS installs bundled resources under the _up_ folder
        candidates.push(dir.join("_up_").join("yt-dlp.exe"));
        candidates.push(dir.join("_up_").join("yt-dlp"));
        candidates.push(dir.join("resources").join("yt-dlp.exe"));
        candidates.push(dir.join("bin").join("yt-dlp.exe"));
        candidates.push(dir.join("yt-dlp.exe"));
        candidates.push(dir.join("yt-dlp"));
        if let Some(parent) = dir.parent() {
            candidates.push(parent.join("yt-dlp.exe"));
            if let Some(root) = parent.parent() {
                candidates.push(root.join("yt-dlp.exe"));
                if let Some(project) = root.parent() {
                    candidates.push(project.join("yt-dlp.exe"));
                }
            }
        }
    }
    candidates.push(PathBuf::from("yt-dlp.exe"));
    candidates.into_iter().find(|p| p.exists())
}

fn find_ffmpeg_dir(ytdlp: &Path) -> Option<String> {
    if let Ok(p) = std::env::var("FFMPEG_LOCATION") {
        let p = PathBuf::from(p);
        let dir = if p.is_dir() { p } else { p.parent()?.to_path_buf() };
        if dir.join("ffmpeg.exe").exists() || dir.join("ffmpeg").exists() {
            return Some(dir.to_string_lossy().into_owned());
        }
    }
    if let Some(dir) = ytdlp.parent() {
        if dir.join("ffmpeg.exe").exists() || dir.join("ffmpeg").exists() {
            return Some(dir.to_string_lossy().into_owned());
        }
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(base) = exe.parent() {
            for sub in ["_up_", "resources", "bin", ""] {
                let dir = if sub.is_empty() { base.to_path_buf() } else { base.join(sub) };
                if dir.join("ffmpeg.exe").exists() || dir.join("ffmpeg").exists() {
                    return Some(dir.to_string_lossy().into_owned());
                }
            }
        }
    }
    None
}

fn engine_dir() -> Option<PathBuf> {
    if let Some(p) = find_ytdlp() {
        if let Some(d) = p.parent() {
            return Some(d.to_path_buf());
        }
    }
    let exe = std::env::current_exe().ok()?;
    let dir = exe.parent()?;
    let up = dir.join("_up_");
    Some(if up.exists() { up } else { dir.to_path_buf() })
}

fn command_first_line(program: &Path, arg: &str) -> Option<String> {
    let out = hidden_command(&program.to_string_lossy()).arg(arg).output().ok()?;
    if !out.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&out.stdout);
    Some(text.lines().next().unwrap_or("").trim().to_string())
}

fn local_ytdlp_version() -> String {
    find_ytdlp()
        .and_then(|p| command_first_line(&p, "--version"))
        .unwrap_or_default()
}

fn http_client() -> Result<reqwest::blocking::Client, String> {
    reqwest::blocking::Client::builder()
        .user_agent("Infallora")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())
}

fn latest_ytdlp_version() -> Result<String, String> {
    let text = http_client()?
        .get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
        .send()
        .map_err(|e| e.to_string())?
        .text()
        .map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    json.get("tag_name")
        .and_then(|v| v.as_str())
        .map(|s| s.trim_start_matches('v').trim().to_string())
        .filter(|s| !s.is_empty())
        .ok_or_else(|| "no version in release".to_string())
}

fn download_ytdlp() -> Result<String, String> {
    let dir = engine_dir().ok_or_else(|| "engine folder not found".to_string())?;
    let target = dir.join("yt-dlp.exe");
    let tmp = dir.join("yt-dlp.new.exe");

    let bytes = http_client()?
        .get("https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe")
        .send()
        .map_err(|e| e.to_string())?
        .bytes()
        .map_err(|e| e.to_string())?;
    if bytes.len() < 1_000_000 {
        return Err("download too small".to_string());
    }
    std::fs::write(&tmp, &bytes).map_err(|e| e.to_string())?;

    let version = command_first_line(&tmp, "--version")
        .ok_or_else(|| "downloaded file is not usable".to_string())?;

    if target.exists() {
        std::fs::remove_file(&target).map_err(|e| e.to_string())?;
    }
    std::fs::rename(&tmp, &target).map_err(|e| e.to_string())?;
    Ok(version)
}

fn downloads_active(state: &State<'_, DownloadState>) -> bool {
    state
        .items
        .lock()
        .map(|list| list.iter().any(|i| i.status == "downloading" || i.status == "queued"))
        .unwrap_or(false)
}

#[tauri::command]
fn engine_versions() -> serde_json::Value {
    serde_json::json!({
        "current": local_ytdlp_version(),
        "latest": latest_ytdlp_version().unwrap_or_default(),
    })
}

#[tauri::command]
fn update_engine(state: State<'_, DownloadState>) -> Result<String, String> {
    if downloads_active(&state) {
        return Err("busy".to_string());
    }
    download_ytdlp()
}

fn build_args(
    mode: &str,
    quality: &str,
    format: &str,
    bitrate: &str,
    codec: &str,
    filename_style: &str,
    subtitle_lang: &str,
    metadata: bool,
    write_thumbnail: bool,
    playlist: bool,
    extra_args: &str,
    out_dir: &str,
    speed_limit: &str,
) -> Vec<String> {
    let mut args = vec![
        "--newline".to_string(),
        "--no-colors".to_string(),
        "--socket-timeout".to_string(),
        "20".to_string(),
        "--js-runtimes".to_string(),
        "node".to_string(),
    ];
    if !playlist {
        args.push("--no-playlist".into());
    }

    let height_sel = match quality {
        "4320" => "[height<=4320]",
        "2160" => "[height<=2160]",
        "1440" => "[height<=1440]",
        "1080" => "[height<=1080]",
        "720" => "[height<=720]",
        "480" => "[height<=480]",
        "360" => "[height<=360]",
        "240" => "[height<=240]",
        _ => "",
    };
    let codec_sel = match codec {
        "h264" => "[vcodec*=avc1]",
        "vp9" => "[vcodec*=vp9]",
        "av1" => "[vcodec*=av1]",
        _ => "",
    };
    let sel = format!("{codec_sel}{height_sel}");

    if mode == "audio" {
        args.push("-f".into());
        args.push("bestaudio/best".into());
        if quality != "source" {
            args.push("--extract-audio".into());
            args.push("--audio-format".into());
            args.push(quality.to_string());
        }
        if bitrate != "best" {
            args.push("--audio-quality".into());
            args.push(format!("{}K", bitrate));
        }
    } else if mode == "mute" {
        args.push("-f".into());
        args.push(format!("bv*{sel}/bestvideo{sel}/best"));
    } else if mode == "auto" {
        args.push("-f".into());
        args.push("bv*+ba/best".into());
    } else {
        let expr = if quality == "worst" {
            match format {
                "mp4" => "worst[ext=mp4]/worst".to_string(),
                "webm" => "worst[ext=webm]/worst".to_string(),
                _ => "worst".to_string(),
            }
        } else {
            match format {
                "mp4" => format!("bv*[ext=mp4{sel}]+ba[ext=m4a]/bv*{sel}+ba/b[ext=mp4{sel}]/b{sel}/best"),
                "webm" => format!("bv*[ext=webm{sel}]+ba[ext=webm]/bv*{sel}+ba/b[ext=webm{sel}]/b{sel}/best"),
                _ => format!("bv*{sel}+ba/b{sel}/best"),
            }
        };
        args.push("-f".into());
        args.push(expr);
    }

    if (mode == "video" || mode == "mute")
        && (format == "mp4" || format == "webm" || format == "mkv")
    {
        args.push("--merge-output-format".into());
        args.push(format.to_string());
        args.push("--recode-video".into());
        args.push(format.to_string());
    }

    let cookies = find_cookies_file();
    if !cookies.is_empty() {
        args.push("--cookies".into());
        args.push(cookies);
    }
    if !subtitle_lang.is_empty() {
        args.push("--write-subs".into());
        args.push("--sub-langs".into());
        args.push(subtitle_lang.to_string());
        args.push("--embed-subs".into());
    }
    if metadata {
        args.push("--add-metadata".into());
    }
    if write_thumbnail {
        args.push("--write-thumbnail".into());
        args.push("--convert-thumbnails".into());
        args.push("jpg".into());
    }

    let name_template = match filename_style {
        "pretty" => "%(title)s [%(resolution)s].%(ext)s",
        "classic" => "%(uploader)s - %(title)s.%(ext)s",
        "nerdy" => "%(id)s - %(title)s [%(format_id)s].%(ext)s",
        _ => "%(title)s.%(ext)s",
    };
    let template = PathBuf::from(out_dir).join(name_template);
    args.push("-o".into());
    args.push(template.to_string_lossy().into_owned());
    let limit = speed_limit.trim();
    if !limit.is_empty() {
        args.push("--limit-rate".into());
        args.push(limit.to_string());
    }
    for arg in extra_args.split_whitespace() {
        args.push(arg.to_string());
    }
    args
}

fn parse_progress(line: &str, item: &mut DownloadItem) {
    if line.starts_with("ERROR:") {
        if item.status != "error" {
            item.status = "error".into();
            item.message = friendly_error(line.trim_start_matches("ERROR:").trim());
        }
        return;
    }

    if line.starts_with("[download]") {
        if let Some(rest) = line.split("Destination:").nth(1) {
            let path = rest.trim().to_string();
            if !path.is_empty() {
                item.path = path.clone();
                if let Some(name) = PathBuf::from(&path).file_stem() {
                    let name = name.to_string_lossy().into_owned();
                    if !name.is_empty() && item.title.starts_with("http") {
                        item.title = name;
                    }
                }
            }
        }

        for token in line.split_whitespace() {
            if token.ends_with('%') {
                if let Ok(value) = token.trim_end_matches('%').parse::<f64>() {
                    item.percent = value;
                    if item.status != "done" {
                        item.status = "downloading".into();
                    }
                }
                break;
            }
        }

        let tokens: Vec<&str> = line.split_whitespace().collect();
        if let Some(i) = tokens.iter().position(|t| *t == "at") {
            if let Some(speed) = tokens.get(i + 1) {
                item.speed = (*speed).to_string();
            }
        }
        if let Some(i) = tokens.iter().position(|t| t.eq_ignore_ascii_case("ETA")) {
            if let Some(eta) = tokens.get(i + 1) {
                item.eta = (*eta).to_string();
            }
        }
        if line.contains("has already been downloaded") || line.contains("100%") {
            item.percent = 100.0;
        }
    }
}

fn run_download(
    id: u64,
    url: &str,
    mode: &str,
    quality: &str,
    format: &str,
    bitrate: &str,
    codec: &str,
    filename_style: &str,
    subtitle_lang: &str,
    metadata: bool,
    write_thumbnail: bool,
    playlist: bool,
    extra_args: &str,
    out_dir: &str,
    items: Arc<Mutex<Vec<DownloadItem>>>,
    processes: Arc<Mutex<HashMap<u64, u32>>>,
    gate: Arc<(Mutex<Gate>, Condvar)>,
) {
    let ytdlp = match find_ytdlp() {
        Some(p) => p,
        None => {
            update_item(&items, id, |i| {
                i.status = "error".into();
                i.message = "yt-dlp.exe not found. Reinstall Infallora or place it next to the app.".into();
            });
            return;
        }
    };

    let mut args = build_args(
        mode,
        quality,
        format,
        bitrate,
        codec,
        filename_style,
        subtitle_lang,
        metadata,
        write_thumbnail,
        playlist,
        extra_args,
        out_dir,
        &get_settings().speed_limit,
    );
    if let Some(dir) = find_ffmpeg_dir(&ytdlp) {
        args.push("--ffmpeg-location".into());
        args.push(dir);
    }
    args.push(url.to_string());

    let mut final_status = None;
    for attempt in 0..3 {
    {
        let (lock, cvar) = &*gate;
        let mut g = lock.lock().unwrap();
        while g.active >= g.limit.max(1) {
            g = cvar.wait(g).unwrap();
        }
        g.active += 1;
    }

    let mut child = match hidden_command(&ytdlp.to_string_lossy())
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            {
                let (lock, cvar) = &*gate;
                let mut g = lock.lock().unwrap();
                g.active = g.active.saturating_sub(1);
                cvar.notify_one();
            }
            update_item(&items, id, |i| {
                i.status = "error".into();
                i.message = e.to_string();
            });
            return;
        }
    };

    if let Some(pid) = child.id().try_into().ok() {
        if let Ok(mut map) = processes.lock() {
            map.insert(id, pid);
        }
    }

    // Read stderr on a side thread so error text is not lost.
    let stderr_items = items.clone();
    let stderr_thread = child.stderr.take().map(|stderr| {
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            let mut raw: Vec<String> = Vec::new();
            let mut errors: Vec<String> = Vec::new();
            for line in reader.lines().map_while(Result::ok) {
                let line = line.trim().to_string();
                if line.is_empty() {
                    continue;
                }
                raw.push(line.clone());
                if line.starts_with("ERROR:") {
                    errors.push(friendly_error(line.trim_start_matches("ERROR:").trim()));
                }
            }
            let forbidden = raw.iter().any(|l| l.contains("403") || l.contains("Forbidden"));
            if !errors.is_empty() {
                let first = errors[0].clone();
                let count = errors.len();
                update_item(&stderr_items, id, |i| {
                    i.status = "error".into();
                    i.message = if count > 1 {
                        format!("{} (+{} more)", first, count - 1)
                    } else {
                        first
                    };
                });
            }
            (errors.len(), forbidden)
        })
    });

    if let Some(stdout) = child.stdout.take() {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            let line = line.trim().to_string();
            if line.is_empty() {
                continue;
            }
            update_item(&items, id, |i| parse_progress(&line, i));
        }
    }

    let status = child.wait().ok();
    final_status = status;
    let mut forbidden = false;
    if let Some(t) = stderr_thread {
        if let Ok((_, f)) = t.join() {
            forbidden = f;
        }
    }
    if let Ok(mut map) = processes.lock() {
        map.remove(&id);
    }
    {
        let (lock, cvar) = &*gate;
        let mut g = lock.lock().unwrap();
        g.active = g.active.saturating_sub(1);
        cvar.notify_one();
    }

    if forbidden && attempt < 2 {
        update_item(&items, id, |i| {
            i.status = "downloading".into();
            i.message = format!("Retrying after 403 (attempt {})", attempt + 2);
            i.speed.clear();
            i.eta.clear();
        });
        std::thread::sleep(std::time::Duration::from_secs(1 + attempt));
        continue;
    }
    }

    update_item(&items, id, |i| {
        if i.status == "canceled" || i.status == "error" {
            return;
        }
        let ok = final_status.map(|s| s.success()).unwrap_or(false);
        if ok && (!i.path.is_empty() || i.percent >= 100.0) {
            i.status = "done".into();
            i.percent = 100.0;
            i.speed.clear();
            i.eta.clear();
        } else {
            i.status = "error".into();
            if i.message.is_empty() {
                i.message = "Download failed. Check the link and try again.".into();
            }
        }
    });
}

#[tauri::command]
fn default_dir() -> String {
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into());
    PathBuf::from(home)
        .join("Downloads")
        .to_string_lossy()
        .into_owned()
}

#[tauri::command]
fn get_downloads(state: State<'_, DownloadState>) -> Vec<DownloadItem> {
    state
        .items
        .lock()
        .map(|list| list.clone())
        .unwrap_or_default()
}

#[tauri::command]
fn reorder_downloads(state: State<'_, DownloadState>, ids: Vec<u64>) {
    if let Ok(mut list) = state.items.lock() {
        let mut positions: HashMap<u64, usize> = HashMap::new();
        for (i, id) in ids.iter().enumerate() {
            positions.insert(*id, i);
        }
        list.sort_by_key(|item| positions.get(&item.id).copied().unwrap_or(usize::MAX));
        save_history(&list);
    }
}

#[tauri::command]
fn start_download(
    url: String,
    mode: String,
    quality: String,
    format: String,
    bitrate: String,
    codec: String,
    filename_style: String,
    subtitle_lang: String,
    metadata: bool,
    write_thumbnail: bool,
    playlist: bool,
    extra_args: String,
    out_dir: String,
    label: String,
    state: State<'_, DownloadState>,
) -> u64 {
    let id = {
        let mut next = state.next_id.lock().unwrap();
        *next += 1;
        *next
    };

    let item = DownloadItem {
        id,
        url: url.clone(),
        title: if label.is_empty() { url.clone() } else { label },
        status: "queued".into(),
        percent: 0.0,
        speed: String::new(),
        eta: String::new(),
        path: String::new(),
        message: String::new(),
    };
    if let Ok(mut list) = state.items.lock() {
        list.push(item);
        save_history(&list);
    }

    {
        let limit = get_settings().max_concurrent.max(1);
        let (lock, _) = &*state.gate;
        if let Ok(mut g) = lock.lock() {
            g.limit = limit;
        }
    }

    let items = state.items.clone();
    let processes = state.processes.clone();
    let gate = state.gate.clone();
    std::thread::spawn(move || {
        run_download(
            id,
            &url,
            &mode,
            &quality,
            &format,
            &bitrate,
            &codec,
            &filename_style,
            &subtitle_lang,
            metadata,
            write_thumbnail,
            playlist,
            &extra_args,
            &out_dir,
            items,
            processes,
            gate,
        );
    });

    id
}

#[tauri::command]
fn cancel_download(id: u64, state: State<'_, DownloadState>) {
    let pid = state
        .processes
        .lock()
        .ok()
        .and_then(|map| map.get(&id).copied());
    if let Some(pid) = pid {
        #[cfg(windows)]
        let _ = hidden_command("taskkill").args(["/PID", &pid.to_string(), "/T", "/F"]).spawn();
        #[cfg(not(windows))]
        let _ = hidden_command("kill").arg(pid.to_string()).spawn();
    }
    update_item(&state.items, id, |i| {
        if i.status == "queued" || i.status == "downloading" {
            i.status = "canceled".into();
            i.speed.clear();
            i.eta.clear();
        }
    });
}

#[tauri::command]
fn cancel_all(state: State<'_, DownloadState>) {
    let pids: Vec<u32> = state
        .processes
        .lock()
        .map(|map| map.values().copied().collect())
        .unwrap_or_default();
    for pid in pids {
        #[cfg(windows)]
        let _ = hidden_command("taskkill").args(["/PID", &pid.to_string(), "/T", "/F"]).spawn();
        #[cfg(not(windows))]
        let _ = hidden_command("kill").arg(pid.to_string()).spawn();
    }
    if let Ok(mut list) = state.items.lock() {
        for item in list.iter_mut() {
            if item.status == "queued" || item.status == "downloading" {
                item.status = "canceled".into();
                item.speed.clear();
                item.eta.clear();
            }
        }
    }
}

#[tauri::command]
fn clear_finished(state: State<'_, DownloadState>) {
    if let Ok(mut list) = state.items.lock() {
        list.retain(|i| i.status == "queued" || i.status == "downloading");
        save_history(&list);
    }
}

#[tauri::command]
fn open_path(path: String) {
    open_file_inner(&path);
}

#[cfg(windows)]
fn open_file_inner(path: &str) {
    use windows_sys::Win32::UI::Shell::ShellExecuteW;
    let wide: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
    let verb: Vec<u16> = "open\0".encode_utf16().collect();
    let result = unsafe {
        ShellExecuteW(
            std::ptr::null_mut(),
            verb.as_ptr(),
            wide.as_ptr(),
            std::ptr::null(),
            std::ptr::null(),
            5,
        )
    };
    if result as i32 <= 32 {
        let _ = hidden_command("explorer").arg(format!("/select,{}", path)).spawn();
    }
}

#[cfg(not(windows))]
fn open_file_inner(path: &str) {
    let _ = hidden_command("xdg-open").arg(path).spawn();
}

#[tauri::command]
fn open_file(path: String) {
    open_file_inner(&path);
}

#[tauri::command]
fn open_folder(path: String) {
    #[cfg(windows)]
    let _ = hidden_command("explorer").arg(format!("/select,{}", path)).spawn();
    #[cfg(not(windows))]
    {
        let parent = PathBuf::from(&path).parent().map(|p| p.to_path_buf()).unwrap_or_default();
        let _ = hidden_command("xdg-open").arg(parent).spawn();
    }
}

fn settings_path() -> PathBuf {
    if let Ok(appdata) = std::env::var("APPDATA") {
        PathBuf::from(appdata).join("Infallora").join("settings.json")
    } else {
        PathBuf::from("settings.json")
    }
}

#[tauri::command]
fn get_settings() -> AppSettings {
    let path = settings_path();
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

#[tauri::command]
fn set_settings(settings: AppSettings) -> Result<(), String> {
    let path = settings_path();
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_settings(app: AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn close_settings(app: AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.close();
    }
}

fn find_cookies_file() -> String {
    let configured = get_settings().cookies_file;
    if !configured.trim().is_empty() && PathBuf::from(configured.trim()).exists() {
        return configured.trim().to_string();
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let candidate = dir.join("cookies.txt");
            if candidate.exists() {
                return candidate.to_string_lossy().into_owned();
            }
        }
    }
    if let Ok(home) = std::env::var("USERPROFILE") {
        let candidate = PathBuf::from(home).join("Downloads").join("cookies.txt");
        if candidate.exists() {
            return candidate.to_string_lossy().into_owned();
        }
    }
    String::new()
}

fn extra_cookie_args() -> Vec<String> {
    let cookies = find_cookies_file();
    if cookies.is_empty() {
        Vec::new()
    } else {
        vec!["--cookies".to_string(), cookies]
    }
}

fn friendly_error(raw: &str) -> String {
    if raw.contains("This video is not available") {
        let id = raw
            .split_whitespace()
            .find(|part| part.ends_with(':') && part.len() > 2)
            .map(|part| part.trim_end_matches(':'))
            .unwrap_or("");
        if id.is_empty() {
            "Video unavailable".to_string()
        } else {
            format!("Video unavailable ({})", id)
        }
    } else {
        raw.to_string()
    }
}

fn clean_error(text: &str) -> String {
    let mut errors: Vec<String> = text
        .lines()
        .map(|line| line.trim())
        .filter(|line| line.starts_with("ERROR:"))
        .map(|line| friendly_error(line.trim_start_matches("ERROR:").trim()))
        .collect();
    errors.dedup();
    if errors.is_empty() {
        return text.trim().to_string();
    }
    if errors.len() > 1 {
        format!("{} (+{} more)", errors[0], errors.len() - 1)
    } else {
        errors[0].clone()
    }
}

fn preview_link_blocking(url: &str) -> Result<LinkPreview, String> {
    let ytdlp = find_ytdlp().ok_or_else(|| "yt-dlp.exe not found".to_string())?;
    let output = hidden_command(&ytdlp.to_string_lossy())
        .args(["--js-runtimes", "node", "--dump-single-json", "--skip-download", "--no-playlist", "--no-warnings", url])
        .args(extra_cookie_args())
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(clean_error(&String::from_utf8_lossy(&output.stderr)));
    }
    let value: serde_json::Value =
        serde_json::from_slice(&output.stdout).map_err(|e| e.to_string())?;
    let seconds = value.get("duration").and_then(|d| d.as_f64()).unwrap_or(0.0) as u64;
    let duration = format!("{:02}:{:02}", seconds / 60, seconds % 60);
    let str_field = |key: &str| -> String {
        value.get(key).and_then(|v| v.as_str()).unwrap_or("").to_string()
    };
    Ok(LinkPreview {
        title: str_field("title"),
        thumbnail: str_field("thumbnail"),
        duration,
        uploader: {
            let u = str_field("uploader");
            if u.is_empty() { str_field("channel") } else { u }
        },
    })
}

#[tauri::command]
async fn preview_link(url: String) -> Result<LinkPreview, String> {
    tauri::async_runtime::spawn_blocking(move || preview_link_blocking(&url))
        .await
        .unwrap_or_else(|e| Err(e.to_string()))
}

fn list_formats_blocking(url: &str) -> Result<Vec<FormatInfo>, String> {
    let ytdlp = find_ytdlp().ok_or_else(|| "yt-dlp.exe not found".to_string())?;
    let output = hidden_command(&ytdlp.to_string_lossy())
        .args(["--js-runtimes", "node", "-F", "--no-playlist", "--no-warnings", url])
        .args(extra_cookie_args())
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(clean_error(&String::from_utf8_lossy(&output.stderr)));
    }
    let text = String::from_utf8_lossy(&output.stdout);
    let mut formats = Vec::new();
    let mut seen = HashSet::new();
    let mut started = false;
    for line in text.lines() {
        if line.starts_with("ID") && line.contains("RESOLUTION") {
            started = true;
            continue;
        }
        if !started || line.trim().is_empty() || line.starts_with("ERROR") || line.starts_with('-') {
            continue;
        }
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 3 {
            continue;
        }
        let ext = parts[1];
        if matches!(ext, "mhtml" | "jpg" | "png" | "webp") {
            continue;
        }
        let kind = if line.contains("audio only") { "audio" } else { "video" };
        let resolution = parts[2].to_string();
        if kind == "video" {
            let height = resolution
                .split('x')
                .nth(1)
                .and_then(|v| v.parse::<u32>().ok())
                .unwrap_or(0);
            if height < 144 {
                continue;
            }
        }
        let codec = if line.contains("avc1") || line.contains("h264") {
            "H.264"
        } else if line.contains("vp9") {
            "VP9"
        } else if line.contains("av01") {
            "AV1"
        } else if line.contains("mp4a") {
            "AAC"
        } else if line.contains("opus") {
            "Opus"
        } else {
            ""
        }
        .to_string();
        let size_idx = parts
            .iter()
            .rposition(|p| p.contains("MiB") || p.contains("KiB") || p.contains("GiB"));
        let size = size_idx
            .and_then(|i| parts.get(i))
            .copied()
            .unwrap_or("")
            .trim_start_matches('~')
            .to_string();
        let tbr = size_idx
            .and_then(|i| parts.get(i + 1))
            .filter(|p| p.contains('K') || p.contains('M'))
            .copied()
            .unwrap_or("")
            .trim_start_matches('~')
            .to_string();
        let fps = parts
            .get(3)
            .filter(|p| !p.is_empty() && p.chars().all(|c| c.is_ascii_digit()))
            .copied()
            .unwrap_or("")
            .to_string();
        let key = (resolution.clone(), codec.clone(), size.clone());
        if !seen.insert(key) {
            continue;
        }
        formats.push(FormatInfo {
            id: parts[0].to_string(),
            ext: ext.to_string(),
            resolution,
            codec,
            size,
            tbr,
            fps,
            kind: kind.to_string(),
        });
    }
    Ok(formats)
}

#[tauri::command]
async fn list_formats(url: String) -> Result<Vec<FormatInfo>, String> {
    tauri::async_runtime::spawn_blocking(move || list_formats_blocking(&url))
        .await
        .unwrap_or_else(|e| Err(e.to_string()))
}

#[tauri::command]
async fn pick_cookies_file() -> Option<String> {
    tauri::async_runtime::spawn_blocking(|| {
        rfd::FileDialog::new()
            .add_filter("Cookies", &["txt"])
            .pick_file()
            .map(|p| p.to_string_lossy().into_owned())
    })
    .await
    .ok()
    .flatten()
}

#[tauri::command]
async fn pick_folder() -> Option<String> {
    tauri::async_runtime::spawn_blocking(|| {
        rfd::FileDialog::new()
            .pick_folder()
            .map(|p| p.to_string_lossy().into_owned())
    })
    .await
    .ok()
    .flatten()
}

fn playlist_duration(value: Option<&serde_json::Value>) -> String {
    let seconds = value.and_then(|v| v.as_f64()).unwrap_or(0.0) as u64;
    if seconds == 0 {
        return String::new();
    }
    format!("{:02}:{:02}", seconds / 60, seconds % 60)
}

fn list_playlist_blocking(url: &str) -> Result<Vec<PlaylistEntry>, String> {
    let ytdlp = find_ytdlp().ok_or_else(|| "yt-dlp.exe not found".to_string())?;
    let output = hidden_command(&ytdlp.to_string_lossy())
        .args(["--js-runtimes", "node", "--flat-playlist", "--dump-single-json", "--skip-download", "--no-warnings", url])
        .args(extra_cookie_args())
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(clean_error(&String::from_utf8_lossy(&output.stderr)));
    }
    let value: serde_json::Value =
        serde_json::from_slice(&output.stdout).map_err(|e| e.to_string())?;
    let mut entries = Vec::new();
    if let Some(list) = value.get("entries").and_then(|e| e.as_array()) {
        for (i, item) in list.iter().enumerate() {
            let text = |key: &str| -> String {
                item.get(key)
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string()
            };
            let title = {
                let t = text("title");
                if t.is_empty() { format!("Video {}", i + 1) } else { t }
            };
            let thumbnail = {
                let t = text("thumbnail");
                if !t.is_empty() {
                    t
                } else {
                    item.get("thumbnails")
                        .and_then(|v| v.as_array())
                        .and_then(|list| list.first())
                        .and_then(|th| th.get("url").and_then(|u| u.as_str()))
                        .unwrap_or("")
                        .to_string()
                }
            };
            entries.push(PlaylistEntry {
                index: i + 1,
                title,
                duration: playlist_duration(item.get("duration")),
                thumbnail,
                url: {
                    let u = text("url");
                    if u.is_empty() { text("webpage_url") } else { u }
                },
            });
        }
    }
    Ok(entries)
}

#[tauri::command]
async fn list_playlist(url: String) -> Result<Vec<PlaylistEntry>, String> {
    tauri::async_runtime::spawn_blocking(move || list_playlist_blocking(&url))
        .await
        .unwrap_or_else(|e| Err(e.to_string()))
}

#[tauri::command]
async fn notify(app: AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}

fn tray_label(key: &str) -> &'static str {
    match get_settings().language.as_str() {
        "ar" => match key { "show" => "إظهار", "quit" => "خروج", _ => "إنفالورا" },
        "fr" => match key { "show" => "Afficher", "quit" => "Quitter", _ => "Infallora" },
        "es" => match key { "show" => "Mostrar", "quit" => "Salir", _ => "Infallora" },
        "de" => match key { "show" => "Anzeigen", "quit" => "Beenden", _ => "Infallora" },
        "tr" => match key { "show" => "Göster", "quit" => "Çık", _ => "Infallora" },
        _ => match key { "show" => "Show", "quit" => "Quit", _ => "Infallora" },
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(DownloadState::default())
        .setup(|app| {
            std::thread::spawn(|| {
                std::thread::sleep(std::time::Duration::from_secs(8));
                if !get_settings().engine_auto_update {
                    return;
                }
                let current = local_ytdlp_version();
                let latest = match latest_ytdlp_version() {
                    Ok(v) => v,
                    Err(_) => return,
                };
                if latest.is_empty() || current == latest {
                    return;
                }
                let _ = download_ytdlp();
            });

            // Deep links: infallora://<url>
            let handle = app.handle().clone();
            app.listen("deep-link://new-url", move |event| {
                let raw = event.payload();
                let url = serde_json::from_str::<String>(raw).unwrap_or_else(|_| raw.to_string());
                let _ = handle.emit("infallora:open-url", url);
            });

            // System tray
            use tauri::menu::{Menu, MenuItem};
            let show = MenuItem::with_id(app, "show", tray_label("show"), true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", tray_label("quit"), true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;
            let icon = tauri::image::Image::from_bytes(include_bytes!("../icons/icon.ico"))?;
            tauri::tray::TrayIconBuilder::new()
                .icon(icon)
                .tooltip(tray_label("app"))
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        ..
                    } = event
                    {
                        if let Some(w) = tray.app_handle().get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Close hides to tray
            if let Some(window) = app.get_webview_window("main") {
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = w.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            default_dir,
            get_downloads,
            start_download,
            cancel_download,
            cancel_all,
            clear_finished,
            open_path,
            open_file,
            open_folder,
            preview_link,
            list_formats,
            get_settings,
            set_settings,
            open_settings,
            close_settings,
            pick_folder,
            pick_cookies_file,
            list_playlist,
            engine_versions,
            update_engine,
            notify,
            reorder_downloads,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Infallora");
}
