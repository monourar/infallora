# Releasing Infallora

Updates are delivered through Tauri's built-in updater using GitHub Releases.
Users get a "check for updates" button in **Settings → updates**, plus an
optional automatic check on startup.

## One-time setup

The update installer must be signed so the app can verify it came from you.

1. The signing keypair already exists locally:
   - `.tauri/infallora.key` — private key (secret)
   - `.tauri/infallora.key.pub` — public key (embedded in `tauri.conf.json`)
   - `.tauri/signing-password.txt` — private key password
2. In the GitHub repo, go to **Settings → Secrets and variables → Actions**
   and add:
   - `TAURI_SIGNING_PRIVATE_KEY` → contents of `.tauri/infallora.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` → contents of `.tauri/signing-password.txt`
3. Never commit `.tauri/`. It is listed in `.gitignore`.

**If you lose the private key or password, existing users can never receive
signed updates.** Back both up somewhere safe.

## Publishing an update

1. Bump the version in **both** `src-tauri/tauri.conf.json` and
   `src-tauri/Cargo.toml`.
2. Commit the change.
3. Tag and push:
   ```powershell
   git tag v0.1.1
   git push origin main --tags
   ```
4. The `Release Infallora` workflow builds a signed NSIS installer, generates
   `latest.json`, and publishes both to the GitHub Release for that tag.
5. Users running 0.1.0 see the update within 3 seconds of startup (if they
   left "check on startup" on), or immediately when they click
   **check for updates**.

## What gets shipped

The NSIS installer bundles:
- `infallora.exe`
- `WebView2Loader.dll`
- `yt-dlp.exe`, `ffmpeg.exe`, `ffprobe.exe`
- the UI and logo

Tauri signs the installer and writes the signature into `latest.json`. The app
verifies that signature with the embedded public key before installing.

## Endpoints

The updater checks:

```
https://github.com/monourar/infallora/releases/latest/download/latest.json
```

If the repo name or owner changes, update the URL in `tauri.conf.json` and
rebuild — otherwise existing users will keep checking the old address.
