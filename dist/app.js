const internals = window.__TAURI_INTERNALS__;
const invoke = internals
  ? (cmd, args = {}) => internals.invoke(cmd, args)
  : async () => { throw new Error('Tauri bridge unavailable'); };

const $ = (id) => document.getElementById(id);
const t = (key, vars) => window.I18n.t(key, vars);

const QUALITY_OPTIONS = {
  video: [
    ['best', 'Best quality'],
    ['4320', '8K (4320p)'],
    ['2160', '4K (2160p)'],
    ['1440', '1440p'],
    ['1080', '1080p'],
    ['720', '720p'],
    ['480', '480p'],
    ['360', '360p'],
    ['240', '240p'],
    ['worst', 'Smallest file'],
  ],
  mute: [
    ['best', 'Best quality'],
    ['4320', '8K (4320p)'],
    ['1080', '1080p'],
    ['720', '720p'],
    ['480', '480p'],
    ['worst', 'Smallest file'],
  ],
  auto: [['best', 'Auto quality']],
  audio: [
    ['mp3', 'MP3'],
    ['m4a', 'M4A / AAC'],
    ['aac', 'AAC'],
    ['opus', 'Opus'],
    ['vorbis', 'Vorbis'],
    ['flac', 'FLAC (lossless)'],
    ['wav', 'WAV (lossless)'],
    ['source', 'Original (no conversion)'],
  ],
};

const FORMAT_OPTIONS = [
  ['mp4', 'MP4'],
  ['webm', 'WebM'],
  ['mkv', 'MKV'],
  ['auto', 'Auto / source'],
];

let mode = 'auto';
let lastItems = [];
let themeTimer = 0;

let bitrateValue = 'best';
let codecValue = 'auto';
let filenameValue = 'basic';
let subtitleValue = '';
let metadataValue = true;
let playlistValue = false;
let writeThumbnailValue = false;
let extraArgsValue = '';
let previewTimer = 0;
let playlistEntries = [];
let playlistSelected = new Set();
let playlistUrl = '';
let storedTheme = null;
const lastStatus = new Map();

function setHint(text, isError = false) {
  const el = $('hint');
  el.textContent = text;
  el.classList.toggle('is-error', isError);
}

function setUrlError(isError) {
  $('urlInput').setAttribute('aria-invalid', isError ? 'true' : 'false');
}

let qualityValue = 'best';
let formatValue = 'mp4';
let openSelect = null;

function labelFor(options, value) {
  const match = options.find(([v]) => v === value);
  return match ? window.I18n.translateText(match[1]) : value;
}

function formatIcon(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', kind === 'audio'
    ? 'M9 18V5l11-2v13M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
    : 'M4 5h16v14H4zM10 9l5 3-5 3V9Z');
  svg.appendChild(path);
  return svg;
}

function checkIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon option-check');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'm5 12 4 4L19 6');
  svg.appendChild(path);
  return svg;
}

function fillSelect(spec) {
  const { list, getOptions, getSelected, onSelect } = spec;
  list.innerHTML = '';
  for (const [value, label] of getOptions()) {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'select-option';
    opt.setAttribute('role', 'option');
    opt.dataset.value = value;
    opt.setAttribute('aria-selected', String(value === getSelected()));
    const text = document.createElement('span');
    text.textContent = window.I18n.translateText(label);
    text.dataset.i18nRaw = label;
    opt.appendChild(text);
    if (value === getSelected()) opt.appendChild(checkIcon());
    opt.addEventListener('click', () => onSelect(value));
    list.appendChild(opt);
  }
}

function closeSelect() {
  if (!openSelect) return;
  openSelect.list.hidden = true;
  openSelect.trigger.setAttribute('aria-expanded', 'false');
  openSelect = null;
}

function setupSelect(trigger, list, valueEl, getOptions, getSelected, onSelect) {
  const spec = { trigger, list, valueEl, getOptions, getSelected, onSelect, wrap: trigger.parentElement };
  function open(focusList) {
    closeSelect();
    fillSelect(spec);
    list.hidden = false;
    list.scrollTop = 0;
    trigger.setAttribute('aria-expanded', 'true');
    openSelect = spec;
    if (focusList) {
      const chosen = list.querySelector('[aria-selected="true"]') || list.firstElementChild;
      if (chosen) chosen.focus();
    }
  }
  trigger.addEventListener('click', () => {
    if (openSelect === spec) closeSelect(); else open(false);
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(true);
    }
  });
  list.addEventListener('keydown', (e) => {
    const opts = [...list.querySelectorAll('.select-option')];
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); opts[(i + 1) % opts.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length]?.focus(); }
    if (e.key === 'Home') { e.preventDefault(); opts[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1]?.focus(); }
    if (e.key === 'Escape' || e.key === 'Tab') { closeSelect(); trigger.focus(); }
  });
  return spec;
}

document.addEventListener('pointerdown', (e) => {
  if (openSelect && !openSelect.wrap.contains(e.target)) closeSelect();
});

const qualitySpec = setupSelect(
  $('qualitySelect'), $('qualityList'), $('qualityValue'),
  () => QUALITY_OPTIONS[mode],
  () => qualityValue,
  (v) => { qualityValue = v; qualitySpec.valueEl.textContent = labelFor(QUALITY_OPTIONS[mode], v); closeSelect(); qualitySpec.trigger.focus(); }
);

const formatSpec = setupSelect(
  $('formatSelect'), $('formatList'), $('formatValue'),
  () => FORMAT_OPTIONS,
  () => formatValue,
  (v) => { formatValue = v; formatSpec.valueEl.textContent = labelFor(FORMAT_OPTIONS, v); closeSelect(); formatSpec.trigger.focus(); }
);

function renderQuality() {
  const options = QUALITY_OPTIONS[mode];
  if (!options.some(([v]) => v === qualityValue)) qualityValue = mode === 'audio' ? 'mp3' : 'best';
  qualitySpec.valueEl.textContent = labelFor(options, qualityValue);
  $('formatFields').style.display = mode === 'auto' ? 'none' : '';
  $('formatRow').style.display = mode === 'audio' ? 'none' : '';
  if (openSelect === qualitySpec) fillSelect(qualitySpec);
}

function renderFormats() {
  formatSpec.valueEl.textContent = labelFor(FORMAT_OPTIONS, formatValue);
  if (openSelect === formatSpec) fillSelect(formatSpec);
}

function createItem() {
  const el = document.createElement('div');
  el.className = 'item';
  el.innerHTML = `
    <div class="item-top">
      <span class="item-title"></span>
      <span class="chip"></span>
    </div>
    <div class="item-meta">
      <span class="meta-text"></span>
      <span class="item-msg" hidden></span>
    </div>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar"></div>
    </div>
    <div class="item-actions"></div>`;
  return el;
}

function makeButton(action, id, label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `mini-btn${action === 'cancel' ? ' danger' : ''}`;
  b.dataset.action = action;
  b.dataset.id = String(id);
  b.textContent = label;
  bindPress(b);
  return b;
}

function ripple(el, e) {
  const r = el.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.setProperty('--rx', `${e.clientX - r.left}px`);
  s.style.setProperty('--ry', `${e.clientY - r.top}px`);
  el.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}

function bindPress(el, lensTarget) {
  el.addEventListener('pointerdown', (e) => {
    ripple(el, e);
    if (lensTarget) lensTarget.classList.add('is-lens');
  });
  const release = () => { if (lensTarget) lensTarget.classList.remove('is-lens'); };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave', release);
}

function updateItem(el, item) {
  el.dataset.id = String(item.id);
  const status = item.status || 'queued';
  const pct = Math.max(0, Math.min(100, Math.round(item.percent || 0)));
  const title = item.title || item.url;

  el.querySelector('.item-title').textContent = title;

  const chip = el.querySelector('.chip');
  chip.textContent = t(`status.${status}`);
  chip.className = `chip ${status.replace(/[^a-z]/g, '')}`;

  const meta = [];
  if (status === 'downloading' || status === 'queued') meta.push(`${pct}%`);
  if (item.speed) meta.push(item.speed);
  if (item.eta) meta.push(t('island.eta', { x: item.eta }));
  if (status === 'done') meta.push(t('status.Finished'));
  if (status === 'canceled') meta.push(t('status.Canceled'));
  el.querySelector('.meta-text').textContent = meta.join('  ·  ');

  const msg = el.querySelector('.item-msg');
  msg.textContent = item.message || '';
  msg.title = item.message || '';
  msg.hidden = !item.message;

  const bar = el.querySelector('.progress-bar');
  bar.style.width = `${pct}%`;
  bar.className = `progress-bar${status === 'done' ? ' done' : status === 'error' ? ' error' : ''}`;

  const progress = el.querySelector('.progress');
  progress.setAttribute('aria-valuenow', String(pct));
  progress.setAttribute('aria-label', `${title}: ${pct}%`);

  const actionKey = `${status}:${item.path ? '1' : '0'}`;
  if (el.dataset.actionKey !== actionKey) {
    el.dataset.actionKey = actionKey;
    const actions = el.querySelector('.item-actions');
    actions.innerHTML = '';
    if (item.path && (status === 'done' || status === 'error')) {
      actions.appendChild(makeButton('open', item.id, t('action.openFile')));
    }
    if (status === 'downloading' || status === 'queued') {
      actions.appendChild(makeButton('cancel', item.id, t('action.cancel')));
    }
  }
}

function updateIsland(items) {
  const island = $('island');
  const active = items.find((i) => i.status === 'downloading') || items.find((i) => i.status === 'queued');
  if (!active) {
    island.hidden = true;
    return;
  }
  island.hidden = false;
  const pct = Math.max(0, Math.min(100, Math.round(active.percent || 0)));
  $('islandTitle').textContent = active.title || active.url;
  $('islandMeta').textContent = active.status === 'queued' ? t('island.queued') : `${pct}%`;
  $('islandBar').style.width = `${pct}%`;
  $('islandSpeed').textContent = active.speed || t('island.waiting');
  $('islandEta').textContent = active.eta ? t('island.eta', { x: active.eta }) : '';
}

function render(items) {
  lastItems = items;
  updateIsland(items);
  const list = $('list');
  $('count').textContent = String(items.length);
  $('empty').style.display = items.length ? 'none' : 'block';
  $('clearBtn').disabled = !items.some((i) => ['done', 'error', 'canceled'].includes(i.status));

  const existing = new Map();
  for (const el of list.children) existing.set(Number(el.dataset.id), el);
  const seen = new Set();

  for (const item of items) {
    seen.add(item.id);
    let el = existing.get(item.id);
    if (!el) {
      el = createItem();
      list.appendChild(el);
    }
    updateItem(el, item);
    const previous = lastStatus.get(item.id);
    if (previous !== item.status && (item.status === 'done' || item.status === 'error')) {
      const needsSignIn = item.status === 'error' && /Video unavailable/i.test(item.message || '');
      toast(
        needsSignIn ? t('toast.signIn') : (item.status === 'done' ? t('toast.finished', { title: item.title }) : t('toast.failed', { title: item.title })),
        item.status === 'error',
        item.status === 'done' ? item.id : null,
        needsSignIn ? t('toast.setCookies') : null,
        needsSignIn ? openSettingsCookies : null
      );
    }
    lastStatus.set(item.id, item.status);
  }
  for (const el of [...list.children]) {
    if (!seen.has(Number(el.dataset.id))) el.remove();
  }
}

async function poll() {
  try {
    const items = await invoke('get_downloads');
    render(Array.isArray(items) ? items : []);
  } catch (e) {
    console.warn('poll failed', e);
  }
}

async function startDownload() {
  const url = $('urlInput').value.trim();
  if (!url) {
    setHint(t('hint.pasteFirst'), true);
    setUrlError(true);
    $('urlInput').focus();
    return;
  }
  setUrlError(false);

  const outDir = $('dirInput').value.trim();
  const quality = qualityValue;
  const format = mode === 'video' ? formatValue : 'auto';
  if (playlistValue && playlistEntries.length && playlistSelected.size === 0) {
    setHint(t('hint.selectPlaylist'), true);
    return;
  }
  const btn = $('downloadBtn');

  btn.disabled = true;
  btn.classList.add('is-loading');
  const common = {
    mode, quality, format,
    bitrate: bitrateValue,
    codec: codecValue,
    filename_style: filenameValue,
    filenameStyle: filenameValue,
    subtitle_lang: subtitleValue,
    subtitleLang: subtitleValue,
    metadata: metadataValue,
    write_thumbnail: writeThumbnailValue,
    writeThumbnail: writeThumbnailValue,
    extra_args: extraArgsValue,
    extraArgs: extraArgsValue,
    out_dir: outDir,
    outDir,
    label: '',
  };
  try {
    let added = 1;
    if (playlistValue && playlistEntries.length) {
      const chosen = playlistEntries.filter((e) => playlistSelected.has(e.index));
      added = chosen.length;
      await Promise.all(chosen.map((entry) => {
        let videoUrl = entry.url || url;
        if (!/^https?:\/\//i.test(videoUrl) && /youtube\.com/i.test(url)) {
          videoUrl = `https://www.youtube.com/watch?v=${videoUrl}`;
        }
        return invoke('start_download', { ...common, url: videoUrl, playlist: false, label: entry.title });
      }));
    } else {
      const previewLabel = $('previewTitle').textContent.trim();
      const label = previewLabel && $('previewTitle').dataset.placeholder !== '1' ? previewLabel : '';
      await invoke('start_download', { ...common, url, playlist: playlistValue, label });
    }
    $('urlInput').value = '';
    $('preview').hidden = true;
    $('playlistPanel').hidden = true;
    playlistEntries = [];
    playlistSelected.clear();
    setHint(added > 1 ? t('hint.added', { n: added }) : t('hint.addedOne'));
    poll();
  } catch (e) {
    setHint(String(e), true);
  } finally {
    btn.classList.remove('is-loading');
    btn.disabled = false;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $('themeToggle');
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

document.querySelectorAll('.primary-btn, .seg, .icon-btn, .island-main, .text-btn, .select-trigger').forEach((el) => {
  const lens = el.classList.contains('seg')
    ? $('segmented')
    : el.classList.contains('island-main') ? $('island') : null;
  bindPress(el, lens);
});

$('islandToggle').addEventListener('click', () => {
  const island = $('island');
  const next = island.dataset.expanded !== 'true';
  island.dataset.expanded = String(next);
  $('islandToggle').setAttribute('aria-expanded', String(next));
  $('islandDetail').setAttribute('aria-hidden', String(!next));
});

$('downloadBtn').addEventListener('click', startDownload);
$('urlInput').addEventListener('input', () => {
  setUrlError(false);
  schedulePreview();
});
$('urlInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startDownload();
});

$('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      $('urlInput').value = text.trim();
      setUrlError(false);
      setHint(t('hint.pasted'));
      schedulePreview();
    }
  } catch (_) {
    setHint(t('hint.clipboard'), true);
    $('urlInput').focus();
  }
});

document.querySelectorAll('.seg').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    document.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
    mode = button.dataset.mode;
    $('segmented').dataset.index = String([...document.querySelectorAll('.seg')].indexOf(button));
    renderQuality();
  });
});

$('list').addEventListener('click', async (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  try {
    if (button.dataset.action === 'cancel') await invoke('cancel_download', { id });
    if (button.dataset.action === 'open') {
      const item = lastItems.find((i) => i.id === id);
      if (item) await invoke('open_path', { path: item.path });
    }
    poll();
  } catch (err) {
    setHint(String(err), true);
  }
});

$('clearBtn').addEventListener('click', async () => {
  try {
    await invoke('clear_finished');
    poll();
  } catch (e) {
    setHint(String(e), true);
  }
});

function toast(message, isError, id, actionLabel, action) {
  const el = document.createElement('div');
  el.className = `toast${isError ? ' error' : ''}`;
  const label = document.createElement('span');
  label.textContent = message;
  el.appendChild(label);
  if (id) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t('action.open');
    btn.addEventListener('click', async () => {
      const item = lastItems.find((i) => i.id === id);
      if (item) await invoke('open_path', { path: item.path });
    });
    el.appendChild(btn);
  }
  if (actionLabel && action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => { action(); el.remove(); });
    el.appendChild(btn);
  }
  $('toasts').appendChild(el);
  window.setTimeout(() => el.remove(), 6000);
}

function openSettingsCookies() {
  $('settingsOverlay').hidden = false;
  const advanced = document.querySelector('.set-nav-item[data-section="advanced"]');
  if (advanced) advanced.click();
  window.setTimeout(() => $('cookiesFile').focus(), 50);
}

function schedulePreview() {
  window.clearTimeout(previewTimer);
  const url = $('urlInput').value.trim();
  const box = $('preview');
  if (!/^https?:\/\//i.test(url)) {
    box.hidden = true;
    $('playlistPanel').hidden = true;
    playlistEntries = [];
    playlistSelected.clear();
    return;
  }
  const isPlaylist = /[?&]list=|\/playlist/i.test(url);
  if (isPlaylist && !playlistValue) {
    playlistValue = true;
    syncPlaylist();
  }
  $('previewTitle').textContent = isPlaylist ? t('playlist.loading') : t('playlist.loadingInfo');
  $('previewMeta').textContent = isPlaylist ? t('playlist.fetchList') : t('playlist.fetchDetails');
  $('previewTitle').dataset.placeholder = '1';
  box.classList.remove('no-thumb');
  box.classList.add('is-loading');
  box.hidden = false;
  previewTimer = window.setTimeout(async () => {
    if (isPlaylist || playlistValue) {
      const entries = await loadPlaylist(url);
      box.classList.remove('is-loading');
      box.classList.add('no-thumb');
      $('previewTitle').textContent = t('form.playlist');
      $('previewMeta').textContent = entries.length ? t('playlist.videos', { n: entries.length }) : t('playlist.none');
      box.hidden = false;
      return;
    }
    try {
      const info = await invoke('preview_link', { url });
      $('previewTitle').textContent = info.title || url;
      $('previewTitle').dataset.placeholder = '';
      $('previewMeta').textContent = [info.uploader, info.duration].filter(Boolean).join(' · ');
      if (info.thumbnail) {
        $('previewThumb').src = info.thumbnail;
        box.classList.remove('no-thumb');
      } else {
        box.classList.add('no-thumb');
      }
      box.classList.remove('is-loading');
      box.hidden = false;
      $('playlistPanel').hidden = true;
      playlistEntries = [];
    } catch (_) {
      box.classList.remove('is-loading');
      box.hidden = true;
      $('playlistPanel').hidden = true;
    }
  }, 600);
}

function renderPlaylist() {
  const rows = $('playlistItems');
  rows.innerHTML = '';
  playlistEntries.forEach((entry) => {
    const row = document.createElement('label');
    row.className = 'playlist-item';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = playlistSelected.has(entry.index);
    check.addEventListener('change', () => {
      if (check.checked) playlistSelected.add(entry.index);
      else playlistSelected.delete(entry.index);
      updatePlaylistCount();
    });
    const thumb = document.createElement('img');
    thumb.className = 'playlist-thumb';
    thumb.alt = '';
    thumb.setAttribute('referrerpolicy', 'no-referrer');
    if (entry.thumbnail) {
      thumb.src = entry.thumbnail;
    } else if (/youtube/i.test(playlistUrl) && entry.url) {
      const id = String(entry.url).match(/[\w-]{11}/);
      if (id) thumb.src = `https://i.ytimg.com/vi/${id[0]}/mqdefault.jpg`;
    }
    const name = document.createElement('span');
    name.className = 'playlist-name';
    name.textContent = entry.title;
    name.title = entry.title;
    const dur = document.createElement('span');
    dur.className = 'playlist-dur';
    dur.textContent = entry.duration;
    row.append(check, thumb, name, dur);
    rows.appendChild(row);
  });
  updatePlaylistCount();
}

function updatePlaylistCount() {
  $('playlistCount').textContent = t('playlist.selected', { a: playlistSelected.size, b: playlistEntries.length });
}

async function loadPlaylist(url) {
  playlistUrl = url;
  const panel = $('playlistPanel');
  $('playlistItems').innerHTML = `<p class="format-empty">${t('playlist.loading')}</p>`;
  panel.hidden = false;
  try {
    const entries = await invoke('list_playlist', { url });
    playlistEntries = entries || [];
    playlistSelected = new Set(playlistEntries.map((e) => e.index));
    renderPlaylist();
    return playlistEntries;
  } catch (e) {
    $('playlistItems').innerHTML = `<p class="format-empty">${String(e)}</p>`;
    $('playlistCount').textContent = t('playlist.unavailable');
    return [];
  }
}

function setChip(group, value) {
  document.querySelectorAll(`.opt-chip[data-group="${group}"]`).forEach((c) => {
    c.classList.toggle('active', c.dataset.value === value);
  });
}

function applyPreset(name) {
  document.querySelectorAll('.preset-chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.preset === name);
  });
  if (name === 'mp3') {
    mode = 'audio';
    qualityValue = 'mp3';
    bitrateValue = '320';
    codecValue = 'auto';
    filenameValue = 'basic';
    metadataValue = true;
  } else if (name === 'video') {
    mode = 'video';
    qualityValue = '1080';
    formatValue = 'mp4';
    bitrateValue = 'best';
    codecValue = 'h264';
    filenameValue = 'basic';
  } else {
    mode = 'auto';
    qualityValue = 'best';
    bitrateValue = 'best';
    codecValue = 'auto';
    filenameValue = 'basic';
  }
  const segs = [...document.querySelectorAll('.seg')];
  segs.forEach((s) => {
    const on = s.dataset.mode === mode;
    s.classList.toggle('active', on);
    s.setAttribute('aria-pressed', String(on));
  });
  $('segmented').dataset.index = String(segs.findIndex((s) => s.dataset.mode === mode));
  renderQuality();
  renderFormats();
}

document.querySelectorAll('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => applyPreset(chip.dataset.preset));
});

function syncPlaylist() {
  $('playlistMain').classList.toggle('active', playlistValue);
  $('playlistMain').setAttribute('aria-pressed', String(playlistValue));
}

$('playlistMain').addEventListener('click', () => {
  playlistValue = !playlistValue;
  syncPlaylist();
  if (!playlistValue) {
    $('playlistPanel').hidden = true;
    playlistEntries = [];
    playlistSelected.clear();
  } else {
    const url = $('urlInput').value.trim();
    if (url) loadPlaylist(url);
  }
});

$('playlistAll').addEventListener('click', () => {
  playlistSelected = new Set(playlistEntries.map((e) => e.index));
  renderPlaylist();
});

$('playlistNone').addEventListener('click', () => {
  playlistSelected.clear();
  renderPlaylist();
});

$('pickFolderBtn').addEventListener('click', async () => {
  try {
    const path = await invoke('pick_folder');
    if (path) $('dirInput').value = path;
  } catch (e) {
    setHint(String(e), true);
  }
});

$('settingsBtn').addEventListener('click', () => {
  const overlay = $('settingsOverlay');
  overlay.hidden = false;
  overlay.classList.add('is-open');
});

$('cancelAllBtn').addEventListener('click', async () => {
  try { await invoke('cancel_all'); poll(); } catch (e) { setHint(String(e), true); }
});

$('formatsBtn').addEventListener('click', async () => {
  const panel = $('formatListPanel');
  if (!panel.hidden) { panel.hidden = true; $('formatsBtn').setAttribute('aria-expanded', 'false'); return; }
  const url = $('urlInput').value.trim();
  if (!url) { setHint('Paste a link first.', true); return; }
  $('formatsBtn').setAttribute('aria-expanded', 'true');
  panel.hidden = false;
  $('formatRows').innerHTML = '<p class="format-empty">Loading formats…</p>';
  try {
    const formats = await invoke('list_formats', { url });
    const rows = $('formatRows');
    rows.innerHTML = '';
    if (!formats.length) {
      rows.innerHTML = '<p class="format-empty">No formats found.</p>';
      return;
    }
    formats.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'format-row';
      const left = document.createElement('span');
      left.className = 'format-title';
      left.appendChild(formatIcon(f.kind));
      const label = document.createElement('span');
      label.textContent = f.kind === 'audio' ? t('format.audio', { ext: f.ext }) : `${f.resolution} · ${f.ext}`;
      left.appendChild(label);
      const right = document.createElement('small');
      const bits = [f.codec];
      if (f.fps) bits.push(`${f.fps}fps`);
      if (f.tbr) bits.push(f.tbr);
      if (f.size) bits.push(f.size);
      right.textContent = bits.filter(Boolean).join(' · ');
      b.append(left, right);
      b.addEventListener('click', () => {
        extraArgsValue = `-f ${f.id}`;
        setHint(t('hint.format', { id: f.id }));
        rows.querySelectorAll('.format-row').forEach((r) => r.classList.remove('active'));
        b.classList.add('active');
      });
      rows.appendChild(b);
    });
  } catch (e) {
    $('formatRows').innerHTML = `<p class="format-empty">${String(e)}</p>`;
  }
});

document.addEventListener('dragover', (e) => { e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const url = e.dataTransfer && e.dataTransfer.getData('text');
  if (url && /^https?:\/\//i.test(url.trim())) {
    $('urlInput').value = url.trim();
    setUrlError(false);
    schedulePreview();
    setHint(t('hint.dropped'));
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    startDownload();
  }
});

$('themeToggle').addEventListener('click', async (e) => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(next);
    localStorage.setItem('infallora-theme', next);
    try {
      const settings = await invoke('get_settings');
      settings.theme = next;
      await invoke('set_settings', { settings });
    } catch (_) { /* settings are optional */ }
    return;
  }
  const r = e.currentTarget.getBoundingClientRect();
  const wave = document.createElement('span');
  wave.className = 'theme-wave';
  wave.style.left = `${r.left + r.width / 2}px`;
  wave.style.top = `${r.top + r.height / 2}px`;
  document.body.appendChild(wave);
  wave.addEventListener('animationend', () => wave.remove(), { once: true });
  window.setTimeout(() => wave.remove(), 700);
  root.classList.add('theme-switching');
  applyTheme(next);
  localStorage.setItem('infallora-theme', next);
  try {
    const settings = await invoke('get_settings');
    settings.theme = next;
    await invoke('set_settings', { settings });
  } catch (_) { /* settings are optional */ }
  window.clearTimeout(themeTimer);
  themeTimer = window.setTimeout(() => root.classList.remove('theme-switching'), 360);
});

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('.glass, .item');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--py', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest && e.target.closest('.glass, .item');
    if (el && !el.contains(e.relatedTarget)) {
      el.style.setProperty('--px', '50%');
      el.style.setProperty('--py', '0%');
    }
  });
}

(async function init() {
  const saved = localStorage.getItem('infallora-theme');
  applyTheme(saved === 'dark' || saved === 'light' ? saved : 'light');
  renderQuality();
  renderFormats();
  try {
    const dir = await invoke('default_dir');
    if (dir) $('dirInput').value = dir;
  } catch (_) {
    setHint(t('hint.dirFail'), true);
  }
  try {
    const s = await invoke('get_settings');
    storedTheme = s && s.theme ? s.theme : null;
    if (s && (s.theme === 'light' || s.theme === 'dark')) applyTheme(s.theme);
    if (s && s.download_dir) $('dirInput').value = s.download_dir;
    if (s && s.quality) { qualityValue = s.quality; $('qualityValue').textContent = labelFor(QUALITY_OPTIONS[mode], qualityValue); }
    if (s && s.format) { formatValue = s.format; $('formatValue').textContent = labelFor(FORMAT_OPTIONS, formatValue); }
    if (s && s.bitrate) bitrateValue = s.bitrate;
    if (s && s.codec) codecValue = s.codec;
    if (s && s.filename_style) filenameValue = s.filename_style;
    if (s) { metadataValue = s.metadata !== false; playlistValue = s.playlist === true; writeThumbnailValue = s.write_thumbnail === true; extraArgsValue = s.extra_args || ''; }
    syncPlaylist();
  } catch (_) { /* settings are optional */ }
  poll();
  setInterval(poll, 400);
  window.setInterval(async () => {
    try {
      const s = await invoke('get_settings');
      if (s && s.theme && s.theme !== storedTheme) {
        storedTheme = s.theme;
        const resolved = s.theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : s.theme;
        applyTheme(resolved);
      }
    } catch (_) { /* settings are optional */ }
  }, 2000);
})();

window.addEventListener('infallora:languagechange', () => {
  qualitySpec.valueEl.textContent = labelFor(QUALITY_OPTIONS[mode], qualityValue);
  formatSpec.valueEl.textContent = labelFor(FORMAT_OPTIONS, formatValue);
  renderQuality();
  renderFormats();
  poll();
});
