(() => {
  const internals = window.__TAURI_INTERNALS__;
  if (!internals) return;
  const invoke = (cmd, args = {}) => internals.invoke(cmd, args);
  const $ = (id) => document.getElementById(id);

  let pendingUpdate = null;
  let busy = false;

  class ProgressChannel {
    constructor(onMessage) {
      this.handler = onMessage || (() => {});
      this.id = internals.transformCallback((raw) => {
        if (raw && 'end' in raw) return;
        this.handler(raw && raw.message);
      });
    }
    toJSON() {
      return `__CHANNEL__:${this.id}`;
    }
  }

  function status(text, isError) {
    const el = $('updateStatus');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('error', !!isError);
  }

  function showProgress(show) {
    const bar = $('updateProgress');
    if (bar) bar.hidden = !show;
    if (!show) {
      const fill = $('updateBar');
      if (fill) fill.style.width = '0%';
    }
  }

  async function check(announce) {
    if (busy) return;
    busy = true;
    pendingUpdate = null;
    const btn = $('checkUpdateBtn');
    if (btn) btn.disabled = true;
    if (announce) status('Checking for updates…');
    try {
      const update = await invoke('plugin:updater|check');
      if (!update) {
        status('You are up to date.');
        const install = $('installUpdateBtn');
        if (install) install.hidden = true;
        return;
      }
      pendingUpdate = update;
      status(`Version ${update.version} is available (you have ${update.currentVersion}).`);
      const install = $('installUpdateBtn');
      if (install) install.hidden = false;
    } catch (e) {
      status(`Update check failed: ${String(e)}`, true);
    } finally {
      busy = false;
      if (btn) btn.disabled = false;
    }
  }

  async function install() {
    if (!pendingUpdate || busy) return;
    busy = true;
    const install = $('installUpdateBtn');
    if (install) install.disabled = true;
    showProgress(true);
    status('Downloading update…');
    let received = 0;
    let total = 0;
    const channel = new ProgressChannel((msg) => {
      if (!msg) return;
      if (msg.event === 'started') {
        total = msg.data && msg.data.contentLength ? Number(msg.data.contentLength) : 0;
      } else if (msg.event === 'progress') {
        received += msg.data && msg.data.chunkLength ? Number(msg.data.chunkLength) : 0;
        const fill = $('updateBar');
        if (fill) {
          const pct = total ? Math.min(100, Math.round((received / total) * 100)) : 0;
          fill.style.width = `${pct}%`;
        }
        status(`Downloading update… ${total ? `${Math.round((received / total) * 100)}%` : ''}`);
      } else if (msg.event === 'finished') {
        status('Installing…');
      }
    });
    try {
      await invoke('plugin:updater|download_and_install', {
        rid: pendingUpdate.rid,
        onEvent: channel,
        restartAfterInstall: true,
      });
      status('Update installed. Restarting…');
    } catch (e) {
      status(`Install failed: ${String(e)}`, true);
      showProgress(false);
    } finally {
      busy = false;
      if (install) install.disabled = false;
    }
  }

  const checkBtn = $('checkUpdateBtn');
  const installBtn = $('installUpdateBtn');
  if (checkBtn) checkBtn.addEventListener('click', () => check(true));
  if (installBtn) installBtn.addEventListener('click', install);

  (async function autoCheck() {
    try {
      const settings = await invoke('get_settings');
      if (settings && settings.auto_update) {
        window.setTimeout(() => check(false), 3000);
      }
    } catch (_) {
      /* settings unavailable; skip auto-check */
    }
  })();
})();
