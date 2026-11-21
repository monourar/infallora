/* Infallora localization. Exposes window.I18n with t(), apply(), setLanguage(). */
(() => {
  const VERSION = window.INFALLORA_VERSION || '0.4.3';
  const DICT = {
    // app / header
    'app.subtitle': { en: 'Video and audio downloader', ar: 'Ù…ÙØ­Ù…ÙÙ‘Ù„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØ§Ù„ØµÙˆØª' },
    'island.activity': { en: 'Download activity, tap for details', ar: 'Ù†Ø´Ø§Ø· Ø§Ù„ØªÙ†Ø²ÙŠÙ„ØŒ Ø§Ø¶ØºØ· Ù„Ù„ØªÙØ§ØµÙŠÙ„' },
    'island.downloading': { en: 'Downloading', ar: 'Ø¬Ø§Ø±Ù Ø§Ù„ØªÙ†Ø²ÙŠÙ„' },
    'island.queued': { en: 'Queued', ar: 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±' },
    'island.waiting': { en: 'Waiting', ar: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª' },
    'island.eta': { en: 'ETA {x}', ar: 'Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ {x}' },
    'settings.open': { en: 'Open settings', ar: 'ÙØªØ­ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª' },
    'settings.title': { en: 'Settings', ar: 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª' },
    'theme.switch': { en: 'Switch theme', ar: 'ØªØºÙŠÙŠØ± Ø§Ù„Ø³Ù…Ø©' },
    'theme.toDark': { en: 'Switch to dark theme', ar: 'Ø§Ù„ØªØ¨Ø¯ÙŠÙ„ Ø¥Ù„Ù‰ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø¯Ø§ÙƒÙ†' },
    'theme.toLight': { en: 'Switch to light theme', ar: 'Ø§Ù„ØªØ¨Ø¯ÙŠÙ„ Ø¥Ù„Ù‰ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„ÙØ§ØªØ­' },

    // form
    'form.newDownload': { en: 'New download', ar: 'ØªÙ†Ø²ÙŠÙ„ Ø¬Ø¯ÙŠØ¯' },
    'form.subtitle': { en: 'Paste a link, then choose what to save.', ar: 'Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø·Ù‹Ø§ØŒ Ø«Ù… Ø§Ø®ØªØ± Ù…Ø§ ØªØ±ÙŠØ¯ Ø­ÙØ¸Ù‡.' },
    'form.quickStart': { en: 'Quick start', ar: 'Ø¨Ø¯Ø§ÙŠØ© Ø³Ø±ÙŠØ¹Ø©' },
    'form.auto': { en: 'Auto', ar: 'ØªÙ„Ù‚Ø§Ø¦ÙŠ' },
    'form.playlist': { en: 'Playlist', ar: 'Ù‚Ø§Ø¦Ù…Ø© ØªØ´ØºÙŠÙ„' },
    'form.mediaLink': { en: 'Media link', ar: 'Ø±Ø§Ø¨Ø· Ø§Ù„ÙˆØ³Ø§Ø¦Ø·' },
    'form.mediaPlaceholder': { en: 'Paste one link, or several â€” one per line (Ctrl+Enter to download)', ar: 'Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø·Ù‹Ø§ Ø£Ùˆ Ø¹Ø¯Ø© Ø±ÙˆØ§Ø¨Ø· â€” ÙƒÙ„ Ø±Ø§Ø¨Ø· ÙÙŠ Ø³Ø·Ø± (Ctrl+Enter Ù„Ù„ØªÙ†Ø²ÙŠÙ„)' },
    'form.linksCount': { en: '{n} links', ar: '{n} Ø±ÙˆØ§Ø¨Ø·' },
    'form.linkHelp': { en: 'Ctrl+Enter to download Â· Shift+Enter for a new line', ar: 'Ctrl+Enter Ù„Ù„ØªÙ†Ø²ÙŠÙ„ Â· Shift+Enter Ù„Ø³Ø·Ø± Ø¬Ø¯ÙŠØ¯' },
    'form.paste': { en: 'Paste link', ar: 'Ù„ØµÙ‚ Ø§Ù„Ø±Ø§Ø¨Ø·' },
    'form.saveTo': { en: 'Save to', ar: 'Ø­ÙØ¸ Ø¥Ù„Ù‰' },
    'form.chooseFolder': { en: 'Choose folder', ar: 'Ø§Ø®ØªÙŠØ§Ø± Ù…Ø¬Ù„Ø¯' },
    'form.download': { en: 'Download', ar: 'ØªÙ†Ø²ÙŠÙ„' },
    'form.browseFormats': { en: 'Browse formats', ar: 'ØªØµÙØ­ Ø§Ù„ØµÙŠØº' },
    'playlist.search': { en: 'Search videosâ€¦', ar: 'Ø§Ø¨Ø­Ø« ÙÙŠ Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øªâ€¦' },
    'playlist.noResults': { en: 'No matching videos', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø©' },
    'form.hint': { en: 'Works with YouTube and thousands of other sites.', ar: 'ÙŠØ¹Ù…Ù„ Ù…Ø¹ ÙŠÙˆØªÙŠÙˆØ¨ ÙˆØ¢Ù„Ø§Ù Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø§Ù„Ø£Ø®Ø±Ù‰.' },
    'mode.video': { en: 'Video', ar: 'ÙÙŠØ¯ÙŠÙˆ' },
    'mode.audio': { en: 'Audio', ar: 'ØµÙˆØª' },
    'mode.mute': { en: 'Mute', ar: 'Ø¨Ø¯ÙˆÙ† ØµÙˆØª' },
    'quality.label': { en: 'Quality', ar: 'Ø§Ù„Ø¬ÙˆØ¯Ø©' },
    'container.label': { en: 'Container', ar: 'Ø§Ù„Ø­Ø§ÙˆÙŠØ©' },
    'quality.best': { en: 'Best quality', ar: 'Ø£ÙØ¶Ù„ Ø¬ÙˆØ¯Ø©' },
    'quality.worst': { en: 'Smallest file', ar: 'Ø£ØµØºØ± Ø­Ø¬Ù…' },
    'quality.auto': { en: 'Auto quality', ar: 'Ø¬ÙˆØ¯Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ©' },
    'audio.original': { en: 'Original (no conversion)', ar: 'Ø§Ù„Ø£ØµÙ„ÙŠ (Ø¨Ø¯ÙˆÙ† ØªØ­ÙˆÙŠÙ„)' },
    'audio.flac': { en: 'FLAC (lossless)', ar: 'FLAC (Ø¨Ø¯ÙˆÙ† ÙÙ‚Ø¯Ø§Ù†)' },
    'audio.wav': { en: 'WAV (lossless)', ar: 'WAV (Ø¨Ø¯ÙˆÙ† ÙÙ‚Ø¯Ø§Ù†)' },
    'format.auto': { en: 'Auto / source', ar: 'ØªÙ„Ù‚Ø§Ø¦ÙŠ / Ø§Ù„Ù…ØµØ¯Ø±' },

    // playlist
    'playlist.loading': { en: 'Loading playlistâ€¦', ar: 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ØªØ´ØºÙŠÙ„â€¦' },
    'playlist.loadingInfo': { en: 'Loading infoâ€¦', ar: 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øªâ€¦' },
    'playlist.fetchList': { en: 'Fetching video list', ar: 'Ø¬Ø§Ø±Ù Ø¬Ù„Ø¨ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª' },
    'playlist.fetchDetails': { en: 'Fetching media details', ar: 'Ø¬Ø§Ø±Ù Ø¬Ù„Ø¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·' },
    'playlist.videos': { en: '{n} videos', ar: '{n} ÙÙŠØ¯ÙŠÙˆ' },
    'playlist.none': { en: 'No videos found', ar: 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª' },
    'playlist.selected': { en: '{a} / {b} selected', ar: 'ØªÙ… ØªØ­Ø¯ÙŠØ¯ {a} Ù…Ù† {b}' },
    'playlist.unavailable': { en: 'playlist unavailable', ar: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ØªØ´ØºÙŠÙ„ ØºÙŠØ± Ù…ØªØ§Ø­Ø©' },
    'playlist.all': { en: 'all', ar: 'Ø§Ù„ÙƒÙ„' },
    'playlist.noneBtn': { en: 'none', ar: 'Ù„Ø§ Ø´ÙŠØ¡' },

    // activity
    'activity.title': { en: 'Downloads', ar: 'Ø§Ù„ØªÙ†Ø²ÙŠÙ„Ø§Øª' },
    'activity.cancelAll': { en: 'Cancel all', ar: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ÙƒÙ„' },
    'activity.clearFinished': { en: 'Clear finished', ar: 'Ù…Ø³Ø­ Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©' },
    'activity.empty': { en: 'Nothing downloading yet', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ†Ø²ÙŠÙ„Ø§Øª Ø¨Ø¹Ø¯' },
    'activity.emptyHint': { en: 'Paste a link above to get started.', ar: 'Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø·Ù‹Ø§ Ø£Ø¹Ù„Ø§Ù‡ Ù„Ù„Ø¨Ø¯Ø¡.' },
    'status.queued': { en: 'queued', ar: 'ÙÙŠ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±' },
    'status.downloading': { en: 'downloading', ar: 'Ø¬Ø§Ø±Ù Ø§Ù„ØªÙ†Ø²ÙŠÙ„' },
    'status.done': { en: 'done', ar: 'Ù…ÙƒØªÙ…Ù„' },
    'status.error': { en: 'error', ar: 'Ø®Ø·Ø£' },
    'status.canceled': { en: 'canceled', ar: 'Ù…Ù„ØºÙŠ' },
    'status.Finished': { en: 'Finished', ar: 'Ø§ÙƒØªÙ…Ù„' },
    'status.Canceled': { en: 'Canceled', ar: 'Ù…Ù„ØºÙŠ' },
    'action.openFile': { en: 'Open file', ar: 'ÙØªØ­ Ø§Ù„Ù…Ù„Ù' },
    'action.cancel': { en: 'Cancel', ar: 'Ø¥Ù„ØºØ§Ø¡' },
    'action.open': { en: 'Open', ar: 'ÙØªØ­' },
    'action.openFolder': { en: 'Open folder', ar: 'ÙØªØ­ Ø§Ù„Ù…Ø¬Ù„Ø¯' },
    'footer': { en: 'Powered by yt-dlp Â· Local only Â· Built with Rust and Tauri', ar: 'Ù…Ø¯Ø¹ÙˆÙ… Ø¨ÙˆØ§Ø³Ø·Ø© yt-dlp Â· Ù…Ø­Ù„ÙŠ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Â· Ù…Ø¨Ù†ÙŠ Ø¨Ù€ Rust Ùˆ Tauri' },

    // hints / toasts
    'hint.pasteFirst': { en: 'Paste a link first.', ar: 'Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø·Ù‹Ø§ Ø£ÙˆÙ„Ù‹Ø§.' },
    'hint.selectPlaylist': { en: 'Select at least one video from the playlist.', ar: 'Ø§Ø®ØªØ± ÙÙŠØ¯ÙŠÙˆ ÙˆØ§Ø­Ø¯Ù‹Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ù…Ù† Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ØªØ´ØºÙŠÙ„.' },
    'hint.added': { en: '{n} downloads added.', ar: 'ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© {n} ØªÙ†Ø²ÙŠÙ„.' },
    'hint.addedOne': { en: 'Added to downloads.', ar: 'ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø¥Ù„Ù‰ Ø§Ù„ØªÙ†Ø²ÙŠÙ„Ø§Øª.' },
    'hint.pasted': { en: 'Link pasted.', ar: 'ØªÙ… Ù„ØµÙ‚ Ø§Ù„Ø±Ø§Ø¨Ø·.' },
    'hint.clipboard': { en: 'Clipboard blocked. Click the field and press Ctrl+V.', ar: 'ØªÙ… Ø­Ø¸Ø± Ø§Ù„Ø­Ø§ÙØ¸Ø©. Ø§Ù†Ù‚Ø± ÙÙŠ Ø§Ù„Ø­Ù‚Ù„ ÙˆØ§Ø¶ØºØ· Ctrl+V.' },
    'hint.dropped': { en: 'Link dropped.', ar: 'ØªÙ… Ø¥Ø³Ù‚Ø§Ø· Ø§Ù„Ø±Ø§Ø¨Ø·.' },
    'hint.format': { en: 'Format {id} selected.', ar: 'ØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØµÙŠØºØ© {id}.' },
    'hint.dirFail': { en: 'Could not read the default download folder.', ar: 'ØªØ¹Ø°Ù‘Ø± Ù‚Ø±Ø§Ø¡Ø© Ù…Ø¬Ù„Ø¯ Ø§Ù„ØªÙ†Ø²ÙŠÙ„ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ.' },
    'exists.title': { en: 'File already exists', ar: 'Ø§Ù„Ù…Ù„Ù Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„' },
    'exists.overwrite': { en: 'Overwrite', ar: 'Ø§Ø³ØªØ¨Ø¯Ø§Ù„' },
    'exists.copy': { en: 'Download a copy', ar: 'ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø©' },
    'toast.finished': { en: '{title} finished', ar: 'Ø§ÙƒØªÙ…Ù„ ØªÙ†Ø²ÙŠÙ„ {title}' },
    'toast.failed': { en: '{title} failed', ar: 'ÙØ´Ù„ ØªÙ†Ø²ÙŠÙ„ {title}' },
    'toast.signIn': { en: 'This video needs YouTube sign-in', ar: 'Ù‡Ø°Ø§ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙŠØªØ·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ ÙŠÙˆØªÙŠÙˆØ¨' },
    'toast.setCookies': { en: 'Set cookies', ar: 'Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„ÙƒÙˆÙƒÙŠØ²' },
    'format.audio': { en: 'Audio Â· {ext}', ar: 'ØµÙˆØª Â· {ext}' },

    // settings navigation
    'nav.appearance': { en: 'appearance', ar: 'Ø§Ù„Ù…Ø¸Ù‡Ø±' },
    'nav.video': { en: 'video', ar: 'Ø§Ù„ÙÙŠØ¯ÙŠÙˆ' },
    'nav.audio': { en: 'audio', ar: 'Ø§Ù„ØµÙˆØª' },
    'nav.metadata': { en: 'metadata', ar: 'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙˆØµÙÙŠØ©' },
    'nav.privacy': { en: 'privacy', ar: 'Ø§Ù„Ø®ØµÙˆØµÙŠØ©' },
    'nav.advanced': { en: 'advanced', ar: 'Ù…ØªÙ‚Ø¯Ù…' },
    'nav.updates': { en: 'updates', ar: 'Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª' },
    'nav.about': { en: 'about', ar: 'Ø­ÙˆÙ„' },
    'set.version': { en: 'v{v} Â· local', ar: 'v{v} Â· Ù…Ø­Ù„ÙŠ' },
    'set.version-suffix': { en: 'local', ar: 'Ù…Ø­Ù„ÙŠ' },
    'set.language': { en: 'language', ar: 'Ø§Ù„Ù„ØºØ©' },
    'set.system': { en: 'system', ar: 'Ø§Ù„Ù†Ø¸Ø§Ù…' },
    'set.english': { en: 'English', ar: 'Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©' },
    'set.arabic': { en: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©', ar: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' },

    // settings appearance
    'set.theme': { en: 'theme', ar: 'Ø§Ù„Ø³Ù…Ø©' },
    'set.mode': { en: 'mode', ar: 'Ø§Ù„ÙˆØ¶Ø¹' },
    'set.palette': { en: 'color theme', ar: 'Ø³Ù…Ø© Ø§Ù„Ù„ÙˆÙ†' },
    'set.light': { en: 'light', ar: 'ÙØ§ØªØ­' },
    'set.dark': { en: 'dark', ar: 'Ø¯Ø§ÙƒÙ†' },
    'set.reduceMotion': { en: 'reduce motion', ar: 'ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø­Ø±ÙƒØ©' },
    'set.off': { en: 'off', ar: 'Ø¥ÙŠÙ‚Ø§Ù' },
    'set.on': { en: 'on', ar: 'ØªØ´ØºÙŠÙ„' },
    'set.reduceHelp': { en: 'Keeps color and opacity changes, removes travel and ripple effects.', ar: 'ÙŠÙØ¨Ù‚ÙŠ Ø¹Ù„Ù‰ ØªØºÙŠÙ‘Ø±Ø§Øª Ø§Ù„Ù„ÙˆÙ† ÙˆØ§Ù„Ø´ÙØ§ÙÙŠØ© ÙˆÙŠØ²ÙŠÙ„ ØªØ£Ø«ÙŠØ±Ø§Øª Ø§Ù„Ø­Ø±ÙƒØ© ÙˆØ§Ù„ØªÙ…ÙˆØ¬.' },

    // settings video
    'set.videoQuality': { en: 'video quality', ar: 'Ø¬ÙˆØ¯Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆ' },
    'set.qualityHelp': { en: "If the preferred quality isn't available, the next best is picked instead.", ar: 'Ã˜Â¥Ã˜Â°Ã˜Â§ Ã™Æ’Ã˜Â§Ã™â€ Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã™ÂÃ˜Â¶Ã™â€žÃ˜Â© Ã˜ÂºÃ™Å Ã˜Â± Ã™â€¦Ã˜ÂªÃ˜Â§Ã˜Â­Ã˜Â©Ã˜Å’ Ã™Å Ã˜ÂªÃ™â€¦ Ã˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â£Ã™ÂÃ˜Â¶Ã™â€ž Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â§Ã™â€žÃ™Å .' },
    'set.codec': { en: 'preferred video codec', ar: 'Ã˜ÂªÃ˜Â±Ã™â€¦Ã™Å Ã˜Â² Ã˜Â§Ã™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë† Ã˜Â§Ã™â€žÃ™â€¦Ã™ÂÃ˜Â¶Ã™â€ž' },
    'set.codecHelp': { en: 'h264: best compatibility. av1: best quality and efficiency, up to 8K. vp9: similar quality, about 2x bigger, supports 4K and HDR.', ar: 'h264: Ã˜Â£Ã™ÂÃ˜Â¶Ã™â€ž Ã˜ÂªÃ™Ë†Ã˜Â§Ã™ÂÃ™â€š. av1: Ã˜Â£Ã™ÂÃ˜Â¶Ã™â€ž Ã˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© Ã™Ë†Ã™Æ’Ã™ÂÃ˜Â§Ã˜Â¡Ã˜Â©Ã˜Å’ Ã˜Â­Ã˜ÂªÃ™â€° 8K. vp9: Ã˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â¨Ã™â€¡Ã˜Â©Ã˜Å’ Ã˜Â£Ã™Æ’Ã˜Â¨Ã˜Â± Ã˜Â¨Ã˜Â­Ã™Ë†Ã˜Â§Ã™â€žÃ™Å  Ã˜Â¶Ã˜Â¹Ã™ÂÃ™Å Ã™â€ Ã˜Å’ Ã™Å Ã˜Â¯Ã˜Â¹Ã™â€¦ 4K Ã™Ë† HDR.' },
    'set.container': { en: 'video container', ar: 'Ã˜Â­Ã˜Â§Ã™Ë†Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë†' },
    'set.containerHelp': { en: 'Auto picks mp4 for h264 and webm for av1 or vp9.', ar: 'Ã˜Â§Ã™â€žÃ˜Â®Ã™Å Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€žÃ™â€šÃ˜Â§Ã˜Â¦Ã™Å  Ã™Å Ã˜Â®Ã˜ÂªÃ˜Â§Ã˜Â± mp4 Ã™â€žÃ™â‚¬ h264 Ã™Ë† webm Ã™â€žÃ™â‚¬ av1 Ã˜Â£Ã™Ë† vp9.' },
    'set.h265': { en: 'allow h265 for videos', ar: 'Ã˜Â§Ã™â€žÃ˜Â³Ã™â€¦Ã˜Â§Ã˜Â­ Ã˜Â¨Ã™â‚¬ h265 Ã™â€žÃ™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë†' },
    'set.h265Help': { en: 'Allows higher quality from platforms like TikTok at the cost of compatibility.', ar: 'Ã™Å Ã˜Â³Ã™â€¦Ã˜Â­ Ã˜Â¨Ã˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© Ã˜Â£Ã˜Â¹Ã™â€žÃ™â€° Ã™â€¦Ã™â€  Ã™â€¦Ã™â€ Ã˜ÂµÃ˜Â§Ã˜Âª Ã™â€¦Ã˜Â«Ã™â€ž Ã˜ÂªÃ™Å Ã™Æ’ Ã˜ÂªÃ™Ë†Ã™Æ’ Ã˜Â¹Ã™â€žÃ™â€° Ã˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â§Ã™ÂÃ™â€š.' },

    // settings audio
    'set.audioFormat': { en: 'audio format', ar: 'Ã˜ÂµÃ™Å Ã˜ÂºÃ˜Â© Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Âª' },
    'set.bitrate': { en: 'audio bitrate', ar: 'Ã™â€¦Ã˜Â¹Ã˜Â¯Ã™â€ž Ã˜Â¨Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Âª' },
    'set.bitrateHelp': { en: 'Ignored for lossless formats.', ar: 'Ã™Å Ã™ÂÃ˜ÂªÃ˜Â¬Ã˜Â§Ã™â€¡Ã™â€ž Ã™â€žÃ™â€žÃ˜ÂµÃ™Å Ã˜Âº Ã˜Â¨Ã˜Â¯Ã™Ë†Ã™â€  Ã™ÂÃ™â€šÃ˜Â¯Ã˜Â§Ã™â€ .' },

    // settings metadata
    'set.fileNames': { en: 'file names', ar: 'Ã˜Â£Ã˜Â³Ã™â€¦Ã˜Â§Ã˜Â¡ Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™ÂÃ˜Â§Ã˜Âª' },
    'set.filenameStyle': { en: 'filename style', ar: 'Ã™â€ Ã™â€¦Ã˜Â· Ã˜Â§Ã˜Â³Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â' },
    'set.filenamePreview': { en: 'Filename preview', ar: 'Ã™â€¦Ã˜Â¹Ã˜Â§Ã™Å Ã™â€ Ã˜Â© Ã˜Â§Ã˜Â³Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â' },
    'set.basic': { en: 'basic', ar: 'Ã˜Â¨Ã˜Â³Ã™Å Ã˜Â·' },
    'set.pretty': { en: 'pretty', ar: 'Ã˜Â¬Ã™â€¦Ã™Å Ã™â€ž' },
    'set.classic': { en: 'classic', ar: 'Ã™Æ’Ã™â€žÃ˜Â§Ã˜Â³Ã™Å Ã™Æ’Ã™Å ' },
    'set.nerdy': { en: 'nerdy', ar: 'Ã˜ÂªÃ™â€šÃ™â€ Ã™Å ' },
    'set.subtitles': { en: 'subtitles and metadata', ar: 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã˜Â¬Ã™â€¦Ã˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã™â€ Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™Ë†Ã˜ÂµÃ™ÂÃ™Å Ã˜Â©' },
    'set.subtitleLang': { en: 'preferred subtitle language', ar: 'Ã™â€žÃ˜ÂºÃ˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã˜Â¬Ã™â€¦Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã™ÂÃ˜Â¶Ã™â€žÃ˜Â©' },
    'set.iso': { en: 'ISO code', ar: 'Ã˜Â±Ã™â€¦Ã˜Â² ISO' },
    'set.isoPlaceholder': { en: 'or type an ISO code', ar: 'Ã˜Â£Ã™Ë† Ã˜Â§Ã™Æ’Ã˜ÂªÃ˜Â¨ Ã˜Â±Ã™â€¦Ã˜Â² ISO' },
    'set.subtitleHelp': { en: 'Adds subtitles in this language when available. Falls back to any track if the service has no language selection.', ar: 'Ã™Å Ã˜Â¶Ã™Å Ã™Â Ã˜ÂªÃ˜Â±Ã˜Â¬Ã™â€¦Ã˜Â© Ã˜Â¨Ã™â€¡Ã˜Â°Ã™â€¡ Ã˜Â§Ã™â€žÃ™â€žÃ˜ÂºÃ˜Â© Ã˜Â¹Ã™â€ Ã˜Â¯ Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â±Ã™â€¡Ã˜Â§. Ã™Ë†Ã™Å Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ Ã˜Â£Ã™Å  Ã™â€¦Ã˜Â³Ã˜Â§Ã˜Â± Ã™â€¦Ã˜ÂªÃ˜Â§Ã˜Â­ Ã˜Â¥Ã˜Â°Ã˜Â§ Ã™â€žÃ™â€¦ Ã˜ÂªÃ™Ë†Ã™ÂÃ˜Â± Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â¯Ã™â€¦Ã˜Â© Ã˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ™â€žÃ˜ÂºÃ˜Â©.' },
    'set.embedMeta': { en: 'embed file metadata', ar: 'Ã˜ÂªÃ˜Â¶Ã™â€¦Ã™Å Ã™â€  Ã˜Â¨Ã™Å Ã˜Â§Ã™â€ Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â' },
    'set.embedHelp': { en: 'Title, artist and other info will be added to the file.', ar: 'Ã˜Â³Ã™Å Ã˜ÂªÃ™â€¦ Ã˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ˜Â© Ã˜Â§Ã™â€žÃ˜Â¹Ã™â€ Ã™Ë†Ã˜Â§Ã™â€  Ã™Ë†Ã˜Â§Ã™â€žÃ™ÂÃ™â€ Ã˜Â§Ã™â€  Ã™Ë†Ã™â€¦Ã˜Â¹Ã™â€žÃ™Ë†Ã™â€¦Ã˜Â§Ã˜Âª Ã˜Â£Ã˜Â®Ã˜Â±Ã™â€° Ã˜Â¥Ã™â€žÃ™â€° Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â.' },
    'set.thumbnail': { en: 'save thumbnail image', ar: 'Ã˜Â­Ã™ÂÃ˜Â¸ Ã˜ÂµÃ™Ë†Ã˜Â±Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂµÃ˜ÂºÃ™â€˜Ã˜Â±Ã˜Â©' },
    'set.thumbnailHelp': { en: 'Writes the video thumbnail as a .jpg file next to the download.', ar: 'Ã™Å Ã™Æ’Ã˜ÂªÃ˜Â¨ Ã˜ÂµÃ™Ë†Ã˜Â±Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂµÃ˜ÂºÃ™â€˜Ã˜Â±Ã˜Â© Ã™Æ’Ã™â€¦Ã™â€žÃ™Â .jpg Ã˜Â¨Ã˜Â¬Ã™Ë†Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€ž.' },

    // settings privacy / advanced
    'set.localOnly': { en: 'local only', ar: 'Ã™â€¦Ã˜Â­Ã™â€žÃ™Å  Ã˜Â¨Ã˜Â§Ã™â€žÃ™Æ’Ã˜Â§Ã™â€¦Ã™â€ž' },
    'set.privacyHelp': { en: 'Infallora runs yt-dlp and ffmpeg on this PC. Files are written to your chosen folder. No account, no telemetry, no upload, no cache.', ar: 'Ã˜ÂªÃ™ÂÃ˜Â´Ã˜ÂºÃ™â€˜Ã™â€ž Ã˜Â¥Ã™â€ Ã™ÂÃ˜Â§Ã™â€žÃ™Ë†Ã˜Â±Ã˜Â§ yt-dlp Ã™Ë† ffmpeg Ã˜Â¹Ã™â€žÃ™â€° Ã™â€¡Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€¡Ã˜Â§Ã˜Â². Ã˜ÂªÃ™ÂÃ˜Â­Ã™ÂÃ˜Â¸ Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™ÂÃ˜Â§Ã˜Âª Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¬Ã™â€žÃ˜Â¯ Ã˜Â§Ã™â€žÃ˜Â°Ã™Å  Ã˜ÂªÃ˜Â®Ã˜ÂªÃ˜Â§Ã˜Â±Ã™â€¡. Ã™â€žÃ˜Â§ Ã˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨Ã˜Å’ Ã™â€žÃ˜Â§ Ã™â€šÃ™Å Ã˜Â§Ã˜Â³Ã˜Â§Ã˜ÂªÃ˜Å’ Ã™â€žÃ˜Â§ Ã˜Â±Ã™ÂÃ˜Â¹Ã˜Å’ Ã™â€žÃ˜Â§ Ã˜ÂªÃ˜Â®Ã˜Â²Ã™Å Ã™â€  Ã™â€¦Ã˜Â¤Ã™â€šÃ˜Âª.' },
    'set.saving': { en: 'saving method', ar: 'Ã˜Â·Ã˜Â±Ã™Å Ã™â€šÃ˜Â© Ã˜Â§Ã™â€žÃ˜Â­Ã™ÂÃ˜Â¸' },
    'set.ask': { en: 'ask', ar: 'Ã˜Â³Ã˜Â¤Ã˜Â§Ã™â€ž' },
    'set.download': { en: 'download', ar: 'Ã˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€ž Ã™â€¦Ã˜Â¨Ã˜Â§Ã˜Â´Ã˜Â±' },
    'set.savingHelp': { en: 'Download saves directly. Ask shows a confirmation first.', ar: 'Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã˜Â§Ã˜Â´Ã˜Â± Ã™Å Ã˜Â­Ã™ÂÃ˜Â¸ Ã™ÂÃ™Ë†Ã˜Â±Ã™â€¹Ã˜Â§. Ã˜Â®Ã™Å Ã˜Â§Ã˜Â± Ã˜Â³Ã˜Â¤Ã˜Â§Ã™â€ž Ã™Å Ã˜Â¹Ã˜Â±Ã˜Â¶ Ã˜ÂªÃ˜Â£Ã™Æ’Ã™Å Ã˜Â¯Ã™â€¹Ã˜Â§ Ã˜Â£Ã™Ë†Ã™â€žÃ™â€¹Ã˜Â§.' },
    'set.cookies': { en: 'cookies file', ar: 'Ã™â€¦Ã™â€žÃ™Â Ã˜Â§Ã™â€žÃ™Æ’Ã™Ë†Ã™Æ’Ã™Å Ã˜Â²' },
    'set.cookiesPlaceholder': { en: 'cookies.txt from your logged-in browser', ar: 'cookies.txt Ã™â€¦Ã™â€  Ã™â€¦Ã˜ÂªÃ˜ÂµÃ™ÂÃ˜Â­Ã™Æ’ Ã˜Â¨Ã˜Â¹Ã˜Â¯ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â®Ã™Ë†Ã™â€ž' },
    'set.chooseCookies': { en: 'Choose cookies file', ar: 'Ã˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± Ã™â€¦Ã™â€žÃ™Â Ã˜Â§Ã™â€žÃ™Æ’Ã™Ë†Ã™Æ’Ã™Å Ã˜Â²' },
    'set.cookiesHelp': { en: 'For private or members-only videos. Export cookies.txt from your logged-in browser (e.g. "Get cookies.txt LOCALLY" extension) and select it here.', ar: 'Ã™â€žÃ™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë†Ã™â€¡Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜ÂµÃ˜Â© Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â­Ã˜ÂµÃ˜Â±Ã™Å Ã˜Â© Ã™â€žÃ™â€žÃ˜Â£Ã˜Â¹Ã˜Â¶Ã˜Â§Ã˜Â¡. Ã˜ÂµÃ˜Â¯Ã™â€˜Ã˜Â± cookies.txt Ã™â€¦Ã™â€  Ã™â€¦Ã˜ÂªÃ˜ÂµÃ™ÂÃ˜Â­Ã™Æ’ Ã˜Â¨Ã˜Â¹Ã˜Â¯ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â®Ã™Ë†Ã™â€ž (Ã™â€¦Ã˜Â«Ã™â€ž Ã˜Â¥Ã˜Â¶Ã˜Â§Ã™ÂÃ˜Â© "Get cookies.txt LOCALLY") Ã™Ë†Ã˜Â§Ã˜Â®Ã˜ÂªÃ˜Â±Ã™â€¡ Ã™â€¡Ã™â€ Ã˜Â§.' },
    'set.extraArgs': { en: 'custom yt-dlp args', ar: 'Ã™Ë†Ã˜Â³Ã˜Â§Ã˜Â¦Ã˜Â· yt-dlp Ã™â€¦Ã˜Â®Ã˜ÂµÃ˜ÂµÃ˜Â©' },
    'set.speedLimit': { en: 'speed limit', ar: 'Ã˜Â­Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â³Ã˜Â±Ã˜Â¹Ã˜Â©' },
    'set.speedPlaceholder': { en: 'e.g. 5M or 500K', ar: 'Ã™â€¦Ã˜Â«Ã˜Â§Ã™â€ž: 5M Ã˜Â£Ã™Ë† 500K' },
    'set.speedHelp': { en: 'Leave empty for unlimited. Example: 5M = 5 MB/s, 500K = 500 KB/s.', ar: 'Ã˜Â§Ã˜ÂªÃ˜Â±Ã™Æ’Ã™â€¡ Ã™ÂÃ˜Â§Ã˜Â±Ã˜ÂºÃ™â€¹Ã˜Â§ Ã™â€žÃ˜Â¹Ã˜Â¯Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â¯. Ã™â€¦Ã˜Â«Ã˜Â§Ã™â€ž: 5M = 5 Ã™â€¦Ã™Å Ã˜ÂºÃ˜Â§Ã˜Â¨Ã˜Â§Ã™Å Ã˜Âª/Ã˜Â«Ã˜Å’ 500K = 500 Ã™Æ’Ã™Å Ã™â€žÃ™Ë†Ã˜Â¨Ã˜Â§Ã™Å Ã˜Âª/Ã˜Â«.' },
    'set.multiAudio': { en: 'embed all audio tracks', ar: 'Ã˜ÂªÃ˜Â¶Ã™â€¦Ã™Å Ã™â€  Ã™Æ’Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â§Ã˜Â±Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜ÂªÃ™Å Ã˜Â©' },
    'set.multiAudioHelp': { en: 'Keeps every audio language in the file instead of only the default one.', ar: 'Ã™Å Ã˜Â­Ã˜Â§Ã™ÂÃ˜Â¸ Ã˜Â¹Ã™â€žÃ™â€° Ã™Æ’Ã™â€ž Ã™â€žÃ˜ÂºÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Âª Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Â Ã˜Â¨Ã˜Â¯Ã™â€žÃ™â€¹Ã˜Â§ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â§Ã™ÂÃ˜ÂªÃ˜Â±Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â© Ã™ÂÃ™â€šÃ˜Â·.' },
    'search.results': { en: 'Search results', ar: 'Ã™â€ Ã˜ÂªÃ˜Â§Ã˜Â¦Ã˜Â¬ Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â«' },
    'set.concurrent': { en: 'max concurrent downloads', ar: 'Ã˜Â£Ã™â€šÃ˜ÂµÃ™â€° Ã˜Â¹Ã˜Â¯Ã˜Â¯ Ã˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€žÃ˜Â§Ã˜Âª Ã™â€¦Ã˜ÂªÃ˜Â²Ã˜Â§Ã™â€¦Ã™â€ Ã˜Â©' },

    // settings updates
    'set.appUpdates': { en: 'app updates', ar: 'Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â·Ã˜Â¨Ã™Å Ã™â€š' },
    'set.currentVersion': { en: 'Current version: {v}', ar: 'Ã˜Â§Ã™â€žÃ˜Â¥Ã˜ÂµÃ˜Â¯Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å : {v}' },
    'set.checkStartup': { en: 'check on startup', ar: 'Ã˜Â§Ã™â€žÃ™ÂÃ˜Â­Ã˜Âµ Ã˜Â¹Ã™â€ Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â´Ã˜ÂºÃ™Å Ã™â€ž' },
    'set.checkNow': { en: 'check for updates', ar: 'Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â« Ã˜Â¹Ã™â€  Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«Ã˜Â§Ã˜Âª' },
    'set.notChecked': { en: 'Not checked yet.', ar: 'Ã™â€žÃ™â€¦ Ã™Å Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ™ÂÃ˜Â­Ã˜Âµ Ã˜Â¨Ã˜Â¹Ã˜Â¯.' },
    'set.install': { en: 'download & install', ar: 'Ã˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€ž Ã™Ë†Ã˜ÂªÃ˜Â«Ã˜Â¨Ã™Å Ã˜Âª' },

    // settings about / actions
    'set.aboutApp': { en: 'A local video downloader built with Rust, Tauri, yt-dlp and ffmpeg. Version {v}. No account, no telemetry, no cloud.', ar: 'Ã™â€¦Ã™ÂÃ˜Â­Ã™â€¦Ã™ÂÃ™â€˜Ã™â€ž Ã™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë† Ã™â€¦Ã˜Â­Ã™â€žÃ™Å  Ã™â€¦Ã˜Â¨Ã™â€ Ã™Å  Ã˜Â¨Ã™â‚¬ Rust Ã™Ë† Tauri Ã™Ë† yt-dlp Ã™Ë† ffmpeg. Ã˜Â§Ã™â€žÃ˜Â¥Ã˜ÂµÃ˜Â¯Ã˜Â§Ã˜Â± {v}. Ã™â€žÃ˜Â§ Ã˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨Ã˜Å’ Ã™â€žÃ˜Â§ Ã™â€šÃ™Å Ã˜Â§Ã˜Â³Ã˜Â§Ã˜ÂªÃ˜Å’ Ã™â€žÃ˜Â§ Ã˜Â³Ã˜Â­Ã˜Â§Ã˜Â¨Ã˜Â©.' },
    'set.aboutEngine': { en: 'It uses yt-dlp under the hood, so it supports thousands of video and social sites.', ar: 'Ã™Å Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ yt-dlp Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â®Ã™â€žÃ™ÂÃ™Å Ã˜Â©Ã˜Å’ Ã™â€žÃ˜Â°Ã˜Â§ Ã™Å Ã˜Â¯Ã˜Â¹Ã™â€¦ Ã˜Â¢Ã™â€žÃ˜Â§Ã™Â Ã™â€¦Ã™Ë†Ã˜Â§Ã™â€šÃ˜Â¹ Ã˜Â§Ã™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë† Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ™Ë†Ã˜Â§Ã˜ÂµÃ™â€ž Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â¬Ã˜ÂªÃ™â€¦Ã˜Â§Ã˜Â¹Ã™Å .' },
    'set.aboutCookies': { en: 'For private or members-only videos, export cookies.txt from your signed-in browser and place it next to Infallora.exe. Infallora picks it up automatically â€” no setup needed for public videos.', ar: 'Ã™â€žÃ™â€žÃ™ÂÃ™Å Ã˜Â¯Ã™Å Ã™Ë†Ã™â€¡Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜ÂµÃ˜Â© Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â­Ã˜ÂµÃ˜Â±Ã™Å Ã˜Â© Ã™â€žÃ™â€žÃ˜Â£Ã˜Â¹Ã˜Â¶Ã˜Â§Ã˜Â¡Ã˜Å’ Ã˜ÂµÃ˜Â¯Ã™â€˜Ã˜Â± cookies.txt Ã™â€¦Ã™â€  Ã™â€¦Ã˜ÂªÃ˜ÂµÃ™ÂÃ˜Â­Ã™Æ’ Ã˜Â¨Ã˜Â¹Ã˜Â¯ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â®Ã™Ë†Ã™â€ž Ã™Ë†Ã˜Â¶Ã˜Â¹Ã™â€¡ Ã˜Â¨Ã˜Â¬Ã™Ë†Ã˜Â§Ã˜Â± Infallora.exe. Ã˜Â³ØªÙ„ØªÙ‚Ø·Ù‡ Ø¥Ù†ÙØ§Ù„ÙˆØ±Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ â€” Ù„Ø§ Ø¥Ø¹Ø¯Ø§Ø¯ Ù„Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø©' },
    'set.worksWith': { en: 'works with', ar: 'Ã™Å Ã˜Â¹Ã™â€¦Ã™â€ž Ã™â€¦Ã˜Â¹' },
    'set.reset': { en: 'reset', ar: 'Ã˜Â¥Ã˜Â¹Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â¶Ã˜Â¨Ã˜Â·' },
    'set.save': { en: 'save settings', ar: 'Ã˜Â­Ã™ÂÃ˜Â¸ Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¹Ã˜Â¯Ã˜Â§Ã˜Â¯Ã˜Â§Ã˜Âª' },
    'set.saved': { en: 'Saved on this PC.', ar: 'Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ˜Â­Ã™ÂÃ˜Â¸ Ã˜Â¹Ã™â€žÃ™â€° Ã™â€¡Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€¡Ã˜Â§Ã˜Â².' },
    'set.restored': { en: 'Defaults restored. Save to keep.', ar: 'Ã˜ÂªÃ™â€¦Ã˜Âª Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â¹Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¹Ã˜Â¯Ã˜Â§Ã˜Â¯Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â§Ã™ÂÃ˜ÂªÃ˜Â±Ã˜Â§Ã˜Â¶Ã™Å Ã˜Â©. Ã˜Â§Ã˜Â­Ã™ÂÃ˜Â¸ Ã™â€žÃ™â€žÃ˜Â§Ã˜Â­Ã˜ÂªÃ™ÂÃ˜Â§Ã˜Â¸ Ã˜Â¨Ã™â€¡Ã˜Â§.' },

    // engines
    'set.engines': { en: 'engines', ar: 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Âª' },
    'set.engineCurrent': { en: 'yt-dlp: {v}', ar: 'yt-dlp: {v}' },
    'set.engineLatest': { en: 'Latest: {v}', ar: 'Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â­Ã˜Â¯Ã˜Â«: {v}' },
    'set.engineAuto': { en: 'update engines on startup', ar: 'Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â« Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Âª Ã˜Â¹Ã™â€ Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â´Ã˜ÂºÃ™Å Ã™â€ž' },
    'set.updateEngine': { en: 'update yt-dlp', ar: 'Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â« yt-dlp' },
    'set.engineIdle': { en: 'Not checked yet.', ar: 'Ã™â€žÃ™â€¦ Ã™Å Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ™ÂÃ˜Â­Ã˜Âµ Ã˜Â¨Ã˜Â¹Ã˜Â¯.' },
    'set.engineChecking': { en: 'Checkingâ€¦', ar: 'Ø¬Ø§Ø±Ù Ø§Ù„ÙØ­Øµâ€¦' },
    'set.engineUpdated': { en: 'yt-dlp updated to {v}.', ar: 'Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â« yt-dlp Ã˜Â¥Ã™â€žÃ™â€° {v}.' },
    'set.engineCurrentAlready': { en: 'Already up to date.', ar: 'Ã˜Â£Ã™â€ Ã˜Âª Ã˜ÂªÃ˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ Ã˜Â£Ã˜Â­Ã˜Â¯Ã˜Â« Ã˜Â¥Ã˜ÂµÃ˜Â¯Ã˜Â§Ã˜Â±.' },
    'set.engineFailed': { en: 'Update failed: {e}', ar: 'Ã™ÂÃ˜Â´Ã™â€ž Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«: {e}' },
    'set.engineBusy': { en: 'Finish active downloads first.', ar: 'Ã˜Â£Ã™â€ Ã™â€¡Ã™Â Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€ Ã˜Â²Ã™Å Ã™â€žÃ˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€ Ã˜Â´Ã˜Â·Ã˜Â© Ã˜Â£Ã™Ë†Ã™â€žÃ™â€¹Ã˜Â§.' },

    // updater
    'update.checking': { en: 'Checking for updatesâ€¦', ar: 'Ø¬Ø§Ø±Ù Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† ØªØ­Ø¯ÙŠØ«Ø§Øªâ€¦' },
    'update.current': { en: 'You are up to date.', ar: 'Ã˜Â£Ã™â€ Ã˜Âª Ã˜ÂªÃ˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ Ã˜Â£Ã˜Â­Ã˜Â¯Ã˜Â« Ã˜Â¥Ã˜ÂµÃ˜Â¯Ã˜Â§Ã˜Â±.' },
    'update.available': { en: 'Version {v} is available (you have {c}).', ar: 'Ã˜Â§Ã™â€žÃ˜Â¥Ã˜ÂµÃ˜Â¯Ã˜Â§Ã˜Â± {v} Ã™â€¦Ã˜ÂªÃ˜Â§Ã˜Â­ (Ã™â€žÃ˜Â¯Ã™Å Ã™Æ’ {c}).' },
    'update.checkFailed': { en: 'Update check failed: {e}', ar: 'Ã™ÂÃ˜Â´Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â« Ã˜Â¹Ã™â€  Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«Ã˜Â§Ã˜Âª: {e}' },
    'update.downloading': { en: 'Downloading updateâ€¦', ar: 'Ø¬Ø§Ø±Ù ØªÙ†Ø²ÙŠÙ„ Ø§Ù„ØªØ­Ø¯ÙŠØ«â€¦' },
    'update.installing': { en: 'Installingâ€¦', ar: 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ«Ø¨ÙŠØªâ€¦' },
    'update.installed': { en: 'Update installed. Restartingâ€¦', ar: 'ØªÙ… ØªØ«Ø¨ÙŠØª Ø§Ù„ØªØ­Ø¯ÙŠØ«. Ø¬Ø§Ø±Ù Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ´ØºÙŠÙ„â€¦' },
    'update.installFailed': { en: 'Install failed: {e}', ar: 'Ã™ÂÃ˜Â´Ã™â€ž Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â«Ã˜Â¨Ã™Å Ã˜Âª: {e}' },
  };

  const EXTRA = window.INFALLORA_TRANSLATIONS || {};
  for (const [code, table] of Object.entries(EXTRA)) {
    for (const [key, text] of Object.entries(table)) {
      if (DICT[key]) DICT[key][code] = text;
    }
  }

  const REVERSE = {};
  for (const [key, entry] of Object.entries(DICT)) {
    if (!REVERSE[entry.en]) REVERSE[entry.en] = key;
  }

  let lang = localStorage.getItem('infallora-language') || 'system';

  function resolve() {
    if (lang === 'system') {
      const sys = (navigator.language || 'en').toLowerCase();
      for (const code of ['ar', 'fr', 'es', 'de', 'tr', 'pt', 'ru', 'zh']) {
        if (sys.startsWith(code)) return code;
      }
      return 'en';
    }
    return lang;
  }

  function t(key, vars) {
    const entry = DICT[key];
    if (!entry) return key;
    let text = entry[resolve()] || entry.en;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  }

  function apply(root = document) {
    const isRTL = resolve() === 'ar';
    document.documentElement.lang = resolve();
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.dataset.language = lang;

    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const translated = t(el.dataset.i18n, { v: VERSION });
      let replaced = false;
      for (const node of el.childNodes) {
        if (node.nodeType !== 3 || !node.textContent.trim()) continue;
        const lead = (node.textContent.match(/^\s*/) || [''])[0];
        const trail = (node.textContent.match(/\s*$/) || [''])[0];
        node.textContent = lead + translated + trail;
        replaced = true;
        break;
      }
      if (!replaced) el.textContent = translated;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.dataset.i18nTitle));
    });
    document.title = 'Infallora';
  }

  function instrument(root = document) {
    root.querySelectorAll('*').forEach((el) => {
      if (el.dataset.i18n) return;
      for (const node of [...el.childNodes]) {
        if (node.nodeType !== 3) continue;
        const text = node.textContent.trim();
        if (!text) continue;
        const key = REVERSE[text];
        if (key) {
          el.setAttribute('data-i18n', key);
          break;
        }
      }
    });
  }

  function setLanguage(next) {
    lang = next;
    localStorage.setItem('infallora-language', lang);
    apply();
    window.dispatchEvent(new CustomEvent('infallora:languagechange'));
  }

  function getLanguage() { return lang; }

  function translateText(text, fallback) {
    const key = REVERSE[text];
    return key ? t(key) : (fallback !== undefined ? fallback : text);
  }

  window.I18n = { t, apply, instrument, setLanguage, getLanguage, resolve, translateText, DICT };
  instrument();
  apply();
})();
