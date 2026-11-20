/* Infallora localization. Exposes window.I18n with t(), apply(), setLanguage(). */
(() => {
  const VERSION = window.INFALLORA_VERSION || '0.2.4';
  const DICT = {
    // app / header
    'app.subtitle': { en: 'Video and audio downloader', ar: 'مُحمِّل الفيديو والصوت' },
    'island.activity': { en: 'Download activity, tap for details', ar: 'نشاط التنزيل، اضغط للتفاصيل' },
    'island.downloading': { en: 'Downloading', ar: 'جارٍ التنزيل' },
    'island.queued': { en: 'Queued', ar: 'في الانتظار' },
    'island.waiting': { en: 'Waiting', ar: 'بانتظار البيانات' },
    'island.eta': { en: 'ETA {x}', ar: 'الوقت المتبقي {x}' },
    'settings.open': { en: 'Open settings', ar: 'فتح الإعدادات' },
    'settings.title': { en: 'Settings', ar: 'الإعدادات' },
    'theme.switch': { en: 'Switch theme', ar: 'تغيير السمة' },
    'theme.toDark': { en: 'Switch to dark theme', ar: 'التبديل إلى الوضع الداكن' },
    'theme.toLight': { en: 'Switch to light theme', ar: 'التبديل إلى الوضع الفاتح' },

    // form
    'form.newDownload': { en: 'New download', ar: 'تنزيل جديد' },
    'form.subtitle': { en: 'Paste a link, then choose what to save.', ar: 'الصق رابطًا، ثم اختر ما تريد حفظه.' },
    'form.quickStart': { en: 'Quick start', ar: 'بداية سريعة' },
    'form.auto': { en: 'Auto', ar: 'تلقائي' },
    'form.playlist': { en: 'Playlist', ar: 'قائمة تشغيل' },
    'form.mediaLink': { en: 'Media link', ar: 'رابط الوسائط' },
    'form.paste': { en: 'Paste link', ar: 'لصق الرابط' },
    'form.saveTo': { en: 'Save to', ar: 'حفظ إلى' },
    'form.chooseFolder': { en: 'Choose folder', ar: 'اختيار مجلد' },
    'form.download': { en: 'Download', ar: 'تنزيل' },
    'form.browseFormats': { en: 'Browse formats', ar: 'تصفح الصيغ' },
    'form.hint': { en: 'Works with YouTube and thousands of other sites.', ar: 'يعمل مع يوتيوب وآلاف المواقع الأخرى.' },
    'mode.video': { en: 'Video', ar: 'فيديو' },
    'mode.audio': { en: 'Audio', ar: 'صوت' },
    'mode.mute': { en: 'Mute', ar: 'بدون صوت' },
    'quality.label': { en: 'Quality', ar: 'الجودة' },
    'container.label': { en: 'Container', ar: 'الحاوية' },
    'quality.best': { en: 'Best quality', ar: 'أفضل جودة' },
    'quality.worst': { en: 'Smallest file', ar: 'أصغر حجم' },
    'quality.auto': { en: 'Auto quality', ar: 'جودة تلقائية' },
    'audio.original': { en: 'Original (no conversion)', ar: 'الأصلي (بدون تحويل)' },
    'audio.flac': { en: 'FLAC (lossless)', ar: 'FLAC (بدون فقدان)' },
    'audio.wav': { en: 'WAV (lossless)', ar: 'WAV (بدون فقدان)' },
    'format.auto': { en: 'Auto / source', ar: 'تلقائي / المصدر' },

    // playlist
    'playlist.loading': { en: 'Loading playlist…', ar: 'جارٍ تحميل قائمة التشغيل…' },
    'playlist.loadingInfo': { en: 'Loading info…', ar: 'جارٍ تحميل المعلومات…' },
    'playlist.fetchList': { en: 'Fetching video list', ar: 'جارٍ جلب قائمة الفيديوهات' },
    'playlist.fetchDetails': { en: 'Fetching media details', ar: 'جارٍ جلب تفاصيل الوسائط' },
    'playlist.videos': { en: '{n} videos', ar: '{n} فيديو' },
    'playlist.none': { en: 'No videos found', ar: 'لم يتم العثور على فيديوهات' },
    'playlist.selected': { en: '{a} / {b} selected', ar: 'تم تحديد {a} من {b}' },
    'playlist.unavailable': { en: 'playlist unavailable', ar: 'قائمة التشغيل غير متاحة' },
    'playlist.all': { en: 'all', ar: 'الكل' },
    'playlist.noneBtn': { en: 'none', ar: 'لا شيء' },

    // activity
    'activity.title': { en: 'Downloads', ar: 'التنزيلات' },
    'activity.cancelAll': { en: 'Cancel all', ar: 'إلغاء الكل' },
    'activity.clearFinished': { en: 'Clear finished', ar: 'مسح المكتملة' },
    'activity.empty': { en: 'Nothing downloading yet', ar: 'لا توجد تنزيلات بعد' },
    'activity.emptyHint': { en: 'Paste a link above to get started.', ar: 'الصق رابطًا أعلاه للبدء.' },
    'status.queued': { en: 'queued', ar: 'في الانتظار' },
    'status.downloading': { en: 'downloading', ar: 'جارٍ التنزيل' },
    'status.done': { en: 'done', ar: 'مكتمل' },
    'status.error': { en: 'error', ar: 'خطأ' },
    'status.canceled': { en: 'canceled', ar: 'ملغي' },
    'status.Finished': { en: 'Finished', ar: 'اكتمل' },
    'status.Canceled': { en: 'Canceled', ar: 'ملغي' },
    'action.openFile': { en: 'Open file', ar: 'فتح الملف' },
    'action.cancel': { en: 'Cancel', ar: 'إلغاء' },
    'action.open': { en: 'Open', ar: 'فتح' },
    'footer': { en: 'Powered by yt-dlp · Local only · Built with Rust and Tauri', ar: 'مدعوم بواسطة yt-dlp · محلي بالكامل · مبني بـ Rust و Tauri' },

    // hints / toasts
    'hint.pasteFirst': { en: 'Paste a link first.', ar: 'الصق رابطًا أولًا.' },
    'hint.selectPlaylist': { en: 'Select at least one video from the playlist.', ar: 'اختر فيديو واحدًا على الأقل من قائمة التشغيل.' },
    'hint.added': { en: '{n} downloads added.', ar: 'تمت إضافة {n} تنزيل.' },
    'hint.addedOne': { en: 'Added to downloads.', ar: 'تمت الإضافة إلى التنزيلات.' },
    'hint.pasted': { en: 'Link pasted.', ar: 'تم لصق الرابط.' },
    'hint.clipboard': { en: 'Clipboard blocked. Click the field and press Ctrl+V.', ar: 'تم حظر الحافظة. انقر في الحقل واضغط Ctrl+V.' },
    'hint.dropped': { en: 'Link dropped.', ar: 'تم إسقاط الرابط.' },
    'hint.format': { en: 'Format {id} selected.', ar: 'تم اختيار الصيغة {id}.' },
    'hint.dirFail': { en: 'Could not read the default download folder.', ar: 'تعذّر قراءة مجلد التنزيل الافتراضي.' },
    'toast.finished': { en: '{title} finished', ar: 'اكتمل تنزيل {title}' },
    'toast.failed': { en: '{title} failed', ar: 'فشل تنزيل {title}' },
    'toast.signIn': { en: 'This video needs YouTube sign-in', ar: 'هذا الفيديو يتطلب تسجيل الدخول إلى يوتيوب' },
    'toast.setCookies': { en: 'Set cookies', ar: 'إعداد الكوكيز' },
    'format.audio': { en: 'Audio · {ext}', ar: 'صوت · {ext}' },

    // settings navigation
    'nav.appearance': { en: 'appearance', ar: 'المظهر' },
    'nav.video': { en: 'video', ar: 'الفيديو' },
    'nav.audio': { en: 'audio', ar: 'الصوت' },
    'nav.metadata': { en: 'metadata', ar: 'البيانات الوصفية' },
    'nav.privacy': { en: 'privacy', ar: 'الخصوصية' },
    'nav.advanced': { en: 'advanced', ar: 'متقدم' },
    'nav.updates': { en: 'updates', ar: 'التحديثات' },
    'nav.about': { en: 'about', ar: 'حول' },
    'set.version': { en: 'v{v} · local', ar: 'v{v} · محلي' },
    'set.version-suffix': { en: 'local', ar: 'محلي' },
    'set.language': { en: 'language', ar: 'اللغة' },
    'set.system': { en: 'system', ar: 'النظام' },
    'set.english': { en: 'English', ar: 'الإنجليزية' },
    'set.arabic': { en: 'العربية', ar: 'العربية' },

    // settings appearance
    'set.theme': { en: 'theme', ar: 'السمة' },
    'set.light': { en: 'light', ar: 'فاتح' },
    'set.dark': { en: 'dark', ar: 'داكن' },
    'set.reduceMotion': { en: 'reduce motion', ar: 'تقليل الحركة' },
    'set.off': { en: 'off', ar: 'إيقاف' },
    'set.on': { en: 'on', ar: 'تشغيل' },
    'set.reduceHelp': { en: 'Keeps color and opacity changes, removes travel and ripple effects.', ar: 'يُبقي على تغيّرات اللون والشفافية ويزيل تأثيرات الحركة والتموج.' },

    // settings video
    'set.videoQuality': { en: 'video quality', ar: 'جودة الفيديو' },
    'set.qualityHelp': { en: "If the preferred quality isn't available, the next best is picked instead.", ar: 'إذا كانت الجودة المفضلة غير متاحة، يتم اختيار الأفضل التالي.' },
    'set.codec': { en: 'preferred video codec', ar: 'ترميز الفيديو المفضل' },
    'set.codecHelp': { en: 'h264: best compatibility. av1: best quality and efficiency, up to 8K. vp9: similar quality, about 2x bigger, supports 4K and HDR.', ar: 'h264: أفضل توافق. av1: أفضل جودة وكفاءة، حتى 8K. vp9: جودة مشابهة، أكبر بحوالي ضعفين، يدعم 4K و HDR.' },
    'set.container': { en: 'video container', ar: 'حاوية الفيديو' },
    'set.containerHelp': { en: 'Auto picks mp4 for h264 and webm for av1 or vp9.', ar: 'الخيار التلقائي يختار mp4 لـ h264 و webm لـ av1 أو vp9.' },
    'set.h265': { en: 'allow h265 for videos', ar: 'السماح بـ h265 للفيديو' },
    'set.h265Help': { en: 'Allows higher quality from platforms like TikTok at the cost of compatibility.', ar: 'يسمح بجودة أعلى من منصات مثل تيك توك على حساب التوافق.' },

    // settings audio
    'set.audioFormat': { en: 'audio format', ar: 'صيغة الصوت' },
    'set.bitrate': { en: 'audio bitrate', ar: 'معدل بت الصوت' },
    'set.bitrateHelp': { en: 'Ignored for lossless formats.', ar: 'يُتجاهل للصيغ بدون فقدان.' },

    // settings metadata
    'set.fileNames': { en: 'file names', ar: 'أسماء الملفات' },
    'set.filenameStyle': { en: 'filename style', ar: 'نمط اسم الملف' },
    'set.filenamePreview': { en: 'Filename preview', ar: 'معاينة اسم الملف' },
    'set.basic': { en: 'basic', ar: 'بسيط' },
    'set.pretty': { en: 'pretty', ar: 'جميل' },
    'set.classic': { en: 'classic', ar: 'كلاسيكي' },
    'set.nerdy': { en: 'nerdy', ar: 'تقني' },
    'set.subtitles': { en: 'subtitles and metadata', ar: 'الترجمة والبيانات الوصفية' },
    'set.subtitleLang': { en: 'preferred subtitle language', ar: 'لغة الترجمة المفضلة' },
    'set.iso': { en: 'ISO code', ar: 'رمز ISO' },
    'set.isoPlaceholder': { en: 'or type an ISO code', ar: 'أو اكتب رمز ISO' },
    'set.subtitleHelp': { en: 'Adds subtitles in this language when available. Falls back to any track if the service has no language selection.', ar: 'يضيف ترجمة بهذه اللغة عند توفرها. ويستخدم أي مسار متاح إذا لم توفر الخدمة اختيار اللغة.' },
    'set.embedMeta': { en: 'embed file metadata', ar: 'تضمين بيانات الملف' },
    'set.embedHelp': { en: 'Title, artist and other info will be added to the file.', ar: 'سيتم إضافة العنوان والفنان ومعلومات أخرى إلى الملف.' },
    'set.thumbnail': { en: 'save thumbnail image', ar: 'حفظ صورة المصغّرة' },
    'set.thumbnailHelp': { en: 'Writes the video thumbnail as a .jpg file next to the download.', ar: 'يكتب صورة المصغّرة كملف .jpg بجوار التنزيل.' },

    // settings privacy / advanced
    'set.localOnly': { en: 'local only', ar: 'محلي بالكامل' },
    'set.privacyHelp': { en: 'Infallora runs yt-dlp and ffmpeg on this PC. Files are written to your chosen folder. No account, no telemetry, no upload, no cache.', ar: 'تُشغّل إنفالورا yt-dlp و ffmpeg على هذا الجهاز. تُحفظ الملفات في المجلد الذي تختاره. لا حساب، لا قياسات، لا رفع، لا تخزين مؤقت.' },
    'set.saving': { en: 'saving method', ar: 'طريقة الحفظ' },
    'set.ask': { en: 'ask', ar: 'سؤال' },
    'set.download': { en: 'download', ar: 'تنزيل مباشر' },
    'set.savingHelp': { en: 'Download saves directly. Ask shows a confirmation first.', ar: 'التنزيل المباشر يحفظ فورًا. خيار سؤال يعرض تأكيدًا أولًا.' },
    'set.cookies': { en: 'cookies file', ar: 'ملف الكوكيز' },
    'set.cookiesPlaceholder': { en: 'cookies.txt from your logged-in browser', ar: 'cookies.txt من متصفحك بعد تسجيل الدخول' },
    'set.chooseCookies': { en: 'Choose cookies file', ar: 'اختيار ملف الكوكيز' },
    'set.cookiesHelp': { en: 'For private or members-only videos. Export cookies.txt from your logged-in browser (e.g. "Get cookies.txt LOCALLY" extension) and select it here.', ar: 'للفيديوهات الخاصة أو الحصرية للأعضاء. صدّر cookies.txt من متصفحك بعد تسجيل الدخول (مثل إضافة "Get cookies.txt LOCALLY") واختره هنا.' },
    'set.extraArgs': { en: 'custom yt-dlp args', ar: 'وسائط yt-dlp مخصصة' },
    'set.concurrent': { en: 'max concurrent downloads', ar: 'أقصى عدد تنزيلات متزامنة' },

    // settings updates
    'set.appUpdates': { en: 'app updates', ar: 'تحديثات التطبيق' },
    'set.currentVersion': { en: 'Current version: {v}', ar: 'الإصدار الحالي: {v}' },
    'set.checkStartup': { en: 'check on startup', ar: 'الفحص عند التشغيل' },
    'set.checkNow': { en: 'check for updates', ar: 'البحث عن تحديثات' },
    'set.notChecked': { en: 'Not checked yet.', ar: 'لم يتم الفحص بعد.' },
    'set.install': { en: 'download & install', ar: 'تنزيل وتثبيت' },

    // settings about / actions
    'set.aboutApp': { en: 'A local video downloader built with Rust, Tauri, yt-dlp and ffmpeg. Version {v}. No account, no telemetry, no cloud.', ar: 'مُحمِّل فيديو محلي مبني بـ Rust و Tauri و yt-dlp و ffmpeg. الإصدار {v}. لا حساب، لا قياسات، لا سحابة.' },
    'set.aboutEngine': { en: 'It uses yt-dlp under the hood, so it supports thousands of video and social sites.', ar: 'يستخدم yt-dlp في الخلفية، لذا يدعم آلاف مواقع الفيديو والتواصل الاجتماعي.' },
    'set.aboutCookies': { en: 'For private or members-only videos, export cookies.txt from your signed-in browser and place it next to Infallora.exe. Infallora picks it up automatically — no setup needed for public videos.', ar: 'للفيديوهات الخاصة أو الحصرية للأعضاء، صدّر cookies.txt من متصفحك بعد تسجيل الدخول وضعه بجوار Infallora.exe. ستلتقطه إنفالورا تلقائيًا — لا إعداد مطلوب للفيديوهات العامة.' },
    'set.worksWith': { en: 'works with', ar: 'يعمل مع' },
    'set.reset': { en: 'reset', ar: 'إعادة ضبط' },
    'set.save': { en: 'save settings', ar: 'حفظ الإعدادات' },
    'set.saved': { en: 'Saved on this PC.', ar: 'تم الحفظ على هذا الجهاز.' },
    'set.restored': { en: 'Defaults restored. Save to keep.', ar: 'تمت استعادة الإعدادات الافتراضية. احفظ للاحتفاظ بها.' },

    // updater
    'update.checking': { en: 'Checking for updates…', ar: 'جارٍ البحث عن تحديثات…' },
    'update.current': { en: 'You are up to date.', ar: 'أنت تستخدم أحدث إصدار.' },
    'update.available': { en: 'Version {v} is available (you have {c}).', ar: 'الإصدار {v} متاح (لديك {c}).' },
    'update.checkFailed': { en: 'Update check failed: {e}', ar: 'فشل البحث عن التحديثات: {e}' },
    'update.downloading': { en: 'Downloading update…', ar: 'جارٍ تنزيل التحديث…' },
    'update.installing': { en: 'Installing…', ar: 'جارٍ التثبيت…' },
    'update.installed': { en: 'Update installed. Restarting…', ar: 'تم تثبيت التحديث. جارٍ إعادة التشغيل…' },
    'update.installFailed': { en: 'Install failed: {e}', ar: 'فشل التثبيت: {e}' },
  };

  const REVERSE = {};
  for (const [key, entry] of Object.entries(DICT)) {
    if (!REVERSE[entry.en]) REVERSE[entry.en] = key;
  }

  let lang = localStorage.getItem('infallora-language') || 'system';

  function resolve() {
    if (lang === 'system') {
      return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
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
