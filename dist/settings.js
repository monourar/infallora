(() => {
const internals = window.__TAURI_INTERNALS__;
const invoke = internals
  ? (cmd, args = {}) => internals.invoke(cmd, args)
  : async () => { throw new Error('Tauri bridge unavailable'); };

const $ = (id) => document.getElementById(id);

const state = {
  theme: 'system',
  reduce_motion: false,
  quality: 'best',
  codec: 'h264',
  format: 'auto',
  allow_h265: false,
  bitrate: 'best',
  audio_format: 'mp3',
  filename_style: 'basic',
  metadata: true,
  subtitle_lang: '',
  saving_method: 'download',
  max_concurrent: 3,
  write_thumbnail: false,
  cookies_file: '',
  extra_args: '',
  auto_update: true,
  language: 'system',
};

function applyTheme(theme) {
  const next = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.dataset.theme = next;
}

function setSeg(group, value) {
  document.querySelectorAll(`.set-seg [data-group="${group}"]`).forEach((b) => {
    b.classList.toggle('active', b.dataset.value === String(value));
  });
}

function syncLanguage(value) {
  document.querySelectorAll('.opt-chip[data-lang]').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === (value || ''));
  });
}

function setToggle(id, on) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('active', on);
  el.setAttribute('aria-pressed', String(on));
  if (id === 'reduceMotion') {
    const state = $('reduceMotionState');
    if (state) state.textContent = on ? 'on' : 'off';
    const row = $('reduceMotionRow');
    if (row) row.classList.toggle('active', on);
  }
}

const previews = {
  basic: [['Video Title.mp4', 'video file preview'], ['Audio Title.mp3', 'audio file preview']],
  pretty: [['Video Title (1080p, h264, youtube).mp4', 'video file preview'], ['Audio Title (youtube).mp3', 'audio file preview']],
  classic: [['Video Title - Video Author (1080p, h264, youtube).mp4', 'video file preview'], ['Audio Title - Audio Author (youtube).mp3', 'audio file preview']],
  nerdy: [['dQw4w9WgXcQ - Video Title [bv1+ba2].mp4', 'video file preview'], ['dQw4w9WgXcQ - Audio Title [ba2].mp3', 'audio file preview']],
};

function renderPreview(style) {
  const box = $('filenamePreview');
  if (!box) return;
  box.innerHTML = '';
  (previews[style] || previews.basic).forEach(([name, note], i) => {
    const row = document.createElement('div');
    row.className = 'set-preview-row';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', i === 0
      ? 'M4 5h16v14H4zM10 9l5 3-5 3V9Z'
      : 'M9 18V5l11-2v13M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z');
    svg.appendChild(path);
    row.appendChild(svg);
    const copy = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = name;
    const small = document.createElement('small');
    small.textContent = note;
    copy.append(strong, small);
    row.appendChild(copy);
    box.appendChild(row);
  });
}

function fill(settings) {
  Object.assign(state, settings || {});
  setSeg('theme', state.theme);
  setSeg('quality', state.quality);
  setSeg('codec', state.codec);
  setSeg('container', state.format);
  setSeg('bitrate', state.bitrate);
  setSeg('audiofmt', state.audio_format);
  setSeg('filename', state.filename_style);
  setSeg('concurrent', state.max_concurrent);
  setSeg('saving', state.saving_method);
  setSeg('autoUpdate', state.auto_update ? 'on' : 'off');
  if ($('languageSelect')) $('languageSelect').value = state.language || 'system';
  setToggle('reduceMotion', state.reduce_motion);
  setToggle('h265', state.allow_h265);
  setToggle('metadata', state.metadata);
  setToggle('writeThumbnail', state.write_thumbnail);
  $('subtitleLang').value = state.subtitle_lang || '';
  syncLanguage(state.subtitle_lang);
  $('cookiesFile').value = state.cookies_file || '';
  $('extraArgs').value = state.extra_args || '';
  applyTheme(state.theme);
  document.documentElement.classList.toggle('reduce-motion', state.reduce_motion);
  renderPreview(state.filename_style);
}

function collect() {
  return {
    theme: state.theme,
    reduce_motion: state.reduce_motion,
    quality: state.quality,
    codec: state.codec,
    format: state.format,
    allow_h265: state.allow_h265,
    bitrate: state.bitrate,
    audio_format: state.audio_format,
    filename_style: state.filename_style,
    metadata: state.metadata,
    write_thumbnail: state.write_thumbnail,
    cookies_file: $('cookiesFile').value.trim(),
    subtitle_lang: $('subtitleLang').value.trim(),
    saving_method: state.saving_method,
    max_concurrent: state.max_concurrent,
    extra_args: $('extraArgs').value.trim(),
    auto_update: state.auto_update,
    language: state.language,
  };
}

document.querySelectorAll('.set-nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.set-nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelectorAll('.set-section').forEach((s) => s.classList.remove('active'));
    item.classList.add('active');
    $('setHeading').textContent = window.I18n.t(`nav.${item.dataset.section}`);
    $('setHeading').dataset.i18n = `nav.${item.dataset.section}`;
    $(`section-${item.dataset.section}`).classList.add('active');
  });
});

window.addEventListener('infallora:languagechange', () => {
  const active = document.querySelector('.set-nav-item.active');
  if (active) $('setHeading').textContent = window.I18n.t(`nav.${active.dataset.section}`);
});

document.querySelectorAll('.set-seg [data-group]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    const value = btn.dataset.value;
    document.querySelectorAll(`.set-seg [data-group="${group}"]`).forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (group === 'theme') { state.theme = value; applyTheme(value); }
    if (group === 'quality') state.quality = value;
    if (group === 'codec') {
      state.codec = value;
      state.format = value === 'h264' ? 'mp4' : 'webm';
      setSeg('container', state.format);
    }
    if (group === 'container') state.format = value;
    if (group === 'bitrate') state.bitrate = value;
    if (group === 'audiofmt') state.audio_format = value;
    if (group === 'filename') { state.filename_style = value; renderPreview(value); }
    if (group === 'concurrent') state.max_concurrent = Number(value);
    if (group === 'saving') state.saving_method = value;
    if (group === 'autoUpdate') state.auto_update = value === 'on';
  });
});

$('languageSelect').addEventListener('change', (e) => {
  state.language = e.target.value;
  window.I18n.setLanguage(e.target.value);
});

document.querySelectorAll('.opt-chip[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    $('subtitleLang').value = btn.dataset.lang;
    syncLanguage(btn.dataset.lang);
  });
});

$('subtitleLang').addEventListener('input', (e) => syncLanguage(e.target.value.trim()));

$('reduceMotion').addEventListener('click', () => {
  state.reduce_motion = !state.reduce_motion;
  setToggle('reduceMotion', state.reduce_motion);
  document.documentElement.classList.toggle('reduce-motion', state.reduce_motion);
});

$('h265').addEventListener('click', () => {
  state.allow_h265 = !state.allow_h265;
  setToggle('h265', state.allow_h265);
});

$('metadata').addEventListener('click', () => {
  state.metadata = !state.metadata;
  setToggle('metadata', state.metadata);
});

$('pickCookiesBtn').addEventListener('click', async () => {
  try {
    const path = await invoke('pick_cookies_file');
    if (path) $('cookiesFile').value = path;
  } catch (e) {
    $('setStatus').textContent = String(e);
  }
});

$('writeThumbnail').addEventListener('click', () => {
  state.write_thumbnail = !state.write_thumbnail;
  setToggle('writeThumbnail', state.write_thumbnail);
});

$('closeBtn').addEventListener('click', () => {
  const overlay = $('settingsOverlay');
  overlay.hidden = true;
  overlay.classList.remove('is-open');
});

$('saveBtn').addEventListener('click', async () => {
  try {
    await invoke('set_settings', { settings: collect() });
    $('setStatus').textContent = window.I18n.t('set.saved');
  } catch (e) {
    $('setStatus').textContent = String(e);
  }
});

$('resetBtn').addEventListener('click', () => {
  fill({
    theme: 'system', reduce_motion: false, quality: 'best', codec: 'h264', format: 'auto',
    allow_h265: false, bitrate: 'best', audio_format: 'mp3', filename_style: 'basic',
    metadata: true, write_thumbnail: false, cookies_file: '', subtitle_lang: '', saving_method: 'download', max_concurrent: 3, extra_args: '', auto_update: true, language: 'system',
  });
  window.I18n.setLanguage('system');
  $('setStatus').textContent = window.I18n.t('set.restored');
});

(async function init() {
  try {
    const settings = await invoke('get_settings');
    fill(settings || state);
    if (settings && settings.language) window.I18n.setLanguage(settings.language);
  } catch (_) {
    fill(state);
  }
})();
})();
