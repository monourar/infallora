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
  speed_limit: '',
  multi_audio: false,
  auto_update: true,
  language: 'system',
  engine_auto_update: true,
  palette: 'violet',
};

function applyTheme(theme) {
  const next = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.dataset.theme = next;
}

const PALETTES = [
  ['violet', '#7C3AED'],
  ['ocean', '#0B7285'],
  ['ember', '#B5431D'],
  ['mint', '#127A55'],
  ['rose', '#B02A6A'],
  ['slate', '#3F4B5B'],
  ['amber', '#9A6708'],
];

function applyPalette(palette) {
  document.documentElement.dataset.palette = palette || 'violet';
}

function renderPalettes() {
  const valueEl = $('paletteValue');
  const current = state.palette || 'violet';
  const found = PALETTES.find(([k]) => k === current);
  if (valueEl) valueEl.textContent = found ? found[0].charAt(0).toUpperCase() + found[0].slice(1) : 'Violet';
  const swatches = $('paletteSwatches');
  if (swatches) {
    swatches.innerHTML = '';
    for (const [key, color] of PALETTES) {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'palette-swatch' + (key === current ? ' active' : '');
      s.style.setProperty('--swatch', color);
      s.setAttribute('aria-label', key);
      s.addEventListener('click', () => {
        state.palette = key;
        applyPalette(key);
        renderPalettes();
        renderPaletteList();
      });
      swatches.appendChild(s);
    }
  }
  renderPaletteList();
}

function renderPaletteList() {
  const list = $('paletteList');
  if (!list) return;
  const current = state.palette || 'violet';
  list.innerHTML = '';
  for (const [key, color] of PALETTES) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'select-option';
    opt.setAttribute('role', 'option');
    opt.dataset.value = key;
    opt.setAttribute('aria-selected', String(key === current));
    const label = document.createElement('span');
    label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    const dot = document.createElement('i');
    dot.className = 'palette-dot';
    dot.style.background = color;
    opt.append(label, dot);
    opt.addEventListener('click', () => {
      state.palette = key;
      applyPalette(key);
      renderPalettes();
      closePalette();
    });
    list.appendChild(opt);
  }
}

function closePalette() {
  const list = $('paletteList');
  if (list) list.hidden = true;
  const btn = $('paletteSelect');
  if (btn) btn.setAttribute('aria-expanded', 'false');
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
    const icon = document.createElement('img');
    icon.className = 'icon glass-icon';
    icon.src = i === 0 ? 'icons/video.svg' : 'icons/audio.svg';
    icon.alt = '';
    row.appendChild(icon);
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
  setSeg('engineUpdate', state.engine_auto_update ? 'on' : 'off');
  renderLanguage();
  renderPalettes();
  setToggle('reduceMotion', state.reduce_motion);
  setToggle('h265', state.allow_h265);
  setToggle('metadata', state.metadata);
  setToggle('writeThumbnail', state.write_thumbnail);
  setToggle('multiAudio', state.multi_audio);
  $('subtitleLang').value = state.subtitle_lang || '';
  syncLanguage(state.subtitle_lang);
  $('cookiesFile').value = state.cookies_file || '';
  $('extraArgs').value = state.extra_args || '';
  $('speedLimit').value = state.speed_limit || '';
  applyTheme(state.theme);
  applyPalette(state.palette);
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
    multi_audio: state.multi_audio,
    cookies_file: $('cookiesFile').value.trim(),
    subtitle_lang: $('subtitleLang').value.trim(),
    saving_method: state.saving_method,
    max_concurrent: state.max_concurrent,
    extra_args: $('extraArgs').value.trim(),
    speed_limit: $('speedLimit').value.trim(),
    auto_update: state.auto_update,
    language: state.language,
    engine_auto_update: state.engine_auto_update,
    palette: state.palette,
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
  renderLanguage();
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
    if (group === 'engineUpdate') state.engine_auto_update = value === 'on';
  });
});

const LANGUAGE_VALUES = ['system', 'en', 'ar', 'fr', 'es', 'de', 'tr', 'pt', 'ru', 'zh'];

function languageLabel(value) {
  if (value === 'system') return window.I18n.t('set.system');
  if (value === 'en') return window.I18n.t('set.english');
  if (value === 'ar') return window.I18n.t('set.arabic');
  return {
    fr: 'Français', es: 'Español', de: 'Deutsch', tr: 'Türkçe',
    pt: 'Português', ru: 'Русский', zh: '中文',
  }[value] || value;
}

function languageCheckIcon() {
  const img = document.createElement('img');
  img.className = 'icon option-check';
  img.src = 'icons/check.svg';
  img.alt = '';
  return img;
}

function renderLanguage() {
  const valueEl = $('languageValue');
  const current = state.language || 'system';
  if (valueEl) valueEl.textContent = languageLabel(current);
  const list = $('languageList');
  if (!list) return;
  list.innerHTML = '';
  for (const value of LANGUAGE_VALUES) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'select-option';
    opt.setAttribute('role', 'option');
    opt.dataset.value = value;
    opt.setAttribute('aria-selected', String(value === current));
    const span = document.createElement('span');
    span.textContent = languageLabel(value);
    opt.appendChild(span);
    if (value === current) opt.appendChild(languageCheckIcon());
    opt.addEventListener('click', () => {
      state.language = value;
      window.I18n.setLanguage(value);
      renderLanguage();
      closeLanguage();
    });
    list.appendChild(opt);
  }
}

function closeLanguage() {
  const list = $('languageList');
  if (list) list.hidden = true;
  const btn = $('languageSelect');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

$('languageSelect').addEventListener('click', () => {
  const list = $('languageList');
  const open = list.hidden;
  list.hidden = !open;
  $('languageSelect').setAttribute('aria-expanded', String(open));
  if (open) renderLanguage();
});

$('paletteSelect').addEventListener('click', () => {
  const list = $('paletteList');
  const open = list.hidden;
  list.hidden = !open;
  $('paletteSelect').setAttribute('aria-expanded', String(open));
  if (open) renderPaletteList();
});

document.addEventListener('pointerdown', (e) => {
  if (e.target && !e.target.closest('.select-wrap')) {
    closeLanguage();
    closePalette();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLanguage(); closePalette(); }
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

$('multiAudio').addEventListener('click', () => {
  state.multi_audio = !state.multi_audio;
  setToggle('multiAudio', state.multi_audio);
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
    metadata: true, write_thumbnail: false, multi_audio: false, cookies_file: '', subtitle_lang: '', saving_method: 'download', max_concurrent: 3, extra_args: '', speed_limit: '', auto_update: true, language: 'system', engine_auto_update: true, palette: 'violet',
  });
  window.I18n.setLanguage('system');
  $('setStatus').textContent = window.I18n.t('set.restored');
});

(async function init() {
  try {
    const settings = await invoke('get_settings');
    fill(settings || state);
    if (settings && settings.language) window.I18n.setLanguage(settings.language);
    if (settings && settings.palette) applyPalette(settings.palette);
  } catch (_) {
    fill(state);
  }
})();
})();
