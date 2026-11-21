(() => {
  const internals = window.__TAURI_INTERNALS__;
  if (!internals) return;
  const invoke = (cmd, args = {}) => internals.invoke(cmd, args);
  const $ = (id) => document.getElementById(id);
  const t = (key, vars) => window.I18n.t(key, vars);

  let versions = { current: '', latest: '' };
  let statusKey = 'set.engineIdle';
  let statusVars = {};

  function status(key, vars) {
    statusKey = key;
    statusVars = vars || {};
    const el = $('engineStatus');
    if (el) el.textContent = t(key, statusVars);
  }

  function render() {
    const cur = $('engineCurrent');
    const lat = $('engineLatest');
    if (cur) {
      cur.textContent = t('set.engineCurrent', { v: versions.current || '—' });
      cur.dataset.i18nRaw = 'set.engineCurrent';
      cur.removeAttribute('data-i18n');
    }
    if (lat) {
      lat.textContent = t('set.engineLatest', { v: versions.latest || '—' });
      lat.removeAttribute('data-i18n');
    }
    status(statusKey, statusVars);
  }

  async function loadVersions() {
    try {
      const v = await invoke('engine_versions');
      if (v && typeof v === 'object') versions = v;
    } catch (_) {
      /* engine info is optional */
    }
    render();
  }

  const btn = $('updateEngineBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      status('set.engineChecking');
      try {
        const version = await invoke('update_engine');
        versions.current = version;
        status('set.engineUpdated', { v: version });
      } catch (e) {
        const msg = String(e);
        status(msg.includes('busy') ? 'set.engineBusy' : 'set.engineFailed', {
          e: msg.includes('busy') ? '' : msg,
        });
      } finally {
        btn.disabled = false;
        render();
      }
    });
  }

  window.addEventListener('infallora:languagechange', render);
  loadVersions();
})();
