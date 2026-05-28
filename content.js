(function SideClock() {
  'use strict';

  const DEFAULT_SETTINGS = {
    mode:          'always',
    position:      'top-right',
    weather:       false,  // off by default — avoids geolocation prompt on first install
    unit:          'C',
    hour12:        false,
    enabled:       true,
    autoFit:       true,
    overlayWidth:  260,
    customLeft:    -1,
    customTop:     -1,
    siteBlocklist: []      // hostnames where the overlay is hidden
  };

  const POSITION_MAP = {
    'bottom-left':  { bottom: '24px', left: '24px',  top: '',    right: '' },
    'bottom-right': { bottom: '24px', right: '24px', top: '',    left: '' },
    'top-left':     { top:    '24px', left: '24px',  bottom: '', right: '' },
    'top-right':    { top:    '24px', right: '24px', bottom: '', left: '' }
  };

  const SNAP_MARGIN    = 24;
  const SNAP_THRESHOLD = 32;
  const RING_RADIUS    = 12;
  const PADDING_H      = 18;  // horizontal padding each side

  let overlayEl    = null;
  let clockInterval = null;
  let currentParent = null;
  let settings      = { ...DEFAULT_SETTINGS };
  let weatherTimer  = null;
  let isF11         = false;
  let measureCanvas = null;

  // drag
  let isDragging = false;
  let dragMX = 0, dragMY = 0, dragL = 0, dragT = 0;
  let guidesEl = null;

  // ── Init ────────────────────────────────────────────────────────────────────

  async function init() {
    settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    if (!settings.overlayWidth || settings.overlayWidth < 200) settings.overlayWidth = 300;
    attachListeners();
    if (isSiteBlocked()) return; // hidden on this site
    if (settings.mode === 'always' && settings.enabled) mountOverlay(document.body);
    else { const t = getFullscreenTarget(); if (t && settings.enabled) mountOverlay(t); }
  }

  function isSiteBlocked() {
    const list = settings.siteBlocklist;
    return Array.isArray(list) && list.includes(location.hostname);
  }

  // ── Fullscreen ──────────────────────────────────────────────────────────────

  function getFullscreenTarget() {
    if (document.fullscreenElement)       return document.fullscreenElement;
    if (document.webkitFullscreenElement) return document.webkitFullscreenElement;
    const sh = screen.availHeight || screen.height;
    if ((window.innerHeight >= sh || window.innerHeight >= screen.height) && window.outerWidth >= screen.width) {
      isF11 = true; return document.body;
    }
    isF11 = false; return null;
  }

  function onFullscreenChange() {
    if (!settings.enabled) return;
    const t = getFullscreenTarget();
    if (t) mountOverlay(t);
    else if (settings.mode === 'fullscreen') unmountOverlay();
    else mountOverlay(document.body);
  }

  // ── Overlay lifecycle ───────────────────────────────────────────────────────

  function createOverlay() {
    const el = document.createElement('div');
    el.className = 'sc-overlay';
    // SVG ring first (below content in stacking order)
    el.innerHTML = `
      <svg class="sc-ring" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path class="sc-ring-track"/>
        <path class="sc-ring-prog"/>
      </svg>
      <div class="sc-grip" title="drag to move">⠿ ⠿</div>
      <div class="sc-time"></div>
      <div class="sc-meta-row">
        <span class="sc-date"></span>
        <div class="sc-weather" style="display:none">
          <span class="sc-weather-icon"></span>
          <span class="sc-weather-temp"></span>
        </div>
      </div>
      <div class="sc-corner-nav">
        <button class="sc-cnav" data-pos="top-left"     aria-label="Move to top-left"></button>
        <button class="sc-cnav" data-pos="top-right"    aria-label="Move to top-right"></button>
        <button class="sc-cnav" data-pos="bottom-left"  aria-label="Move to bottom-left"></button>
        <button class="sc-cnav" data-pos="bottom-right" aria-label="Move to bottom-right"></button>
      </div>
    `;
    return el;
  }

  function mountOverlay(target) {
    const isNew = !overlayEl;
    if (isNew) overlayEl = createOverlay();

    if (currentParent !== target) {
      if (overlayEl.parentElement) overlayEl.parentElement.removeChild(overlayEl);
      target.appendChild(overlayEl);
      currentParent = target;
    }

    syncPositionMode(target);
    applyOverlayWidth();
    applyPosition();

    requestAnimationFrame(() => requestAnimationFrame(() => overlayEl.classList.add('sc-visible')));

    if (isNew) { makeDraggable(); setupCornerNav(); }
    startClock();
    if (settings.weather) scheduleWeather();
    else overlayEl.querySelector('.sc-weather').style.display = 'none';
  }

  function unmountOverlay() {
    if (!overlayEl) return;
    stopClock(); clearTimeout(weatherTimer);
    overlayEl.classList.remove('sc-visible');
    const done = () => {
      if (overlayEl && overlayEl.parentElement) overlayEl.parentElement.removeChild(overlayEl);
      currentParent = null;
    };
    overlayEl.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 600);
  }

  function syncPositionMode(target) {
    if (!overlayEl) return;
    if (target === document.body || isF11) {
      overlayEl.style.position = 'fixed';
    } else {
      overlayEl.style.position = 'absolute';
      if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    }
  }

  function applyOverlayWidth() {
    if (!overlayEl) return;
    overlayEl.style.width = (settings.overlayWidth || 300) + 'px';
  }

  function applyPosition() {
    if (!overlayEl) return;
    if (settings.customLeft >= 0 && settings.customTop >= 0) {
      Object.assign(overlayEl.style, { top: settings.customTop+'px', left: settings.customLeft+'px', bottom:'', right:'' });
      return;
    }
    const c = POSITION_MAP[settings.position] || POSITION_MAP['bottom-left'];
    Object.assign(overlayEl.style, { bottom: c.bottom||'', top: c.top||'', left: c.left||'', right: c.right||'' });
  }

  // ── Ring (60-second border animation) ───────────────────────────────────────

  function makeRRPath(w, h, r) {
    // Path 1px inset from overlay edges; stroke-width 2 centers on this path
    const x1 = 1, y1 = 1, x2 = w - 1, y2 = h - 1;
    const ri = r - 1, cx = (x1 + x2) / 2;
    return [
      `M${cx},${y1}`,
      `L${x2-ri},${y1}`, `A${ri},${ri} 0 0 1 ${x2},${y1+ri}`,
      `L${x2},${y2-ri}`, `A${ri},${ri} 0 0 1 ${x2-ri},${y2}`,
      `L${x1+ri},${y2}`, `A${ri},${ri} 0 0 1 ${x1},${y2-ri}`,
      `L${x1},${y1+ri}`, `A${ri},${ri} 0 0 1 ${x1+ri},${y1}`,
      `L${cx},${y1}`
    ].join(' ');
  }

  function rrPerimeter(w, h, r) {
    const ri = r - 1;
    return 2 * (w - 2 - 2*ri) + 2 * (h - 2 - 2*ri) + 2 * Math.PI * ri;
  }

  function updateRing() {
    if (!overlayEl) return;
    const svgEl = overlayEl.querySelector('.sc-ring');
    if (!svgEl) return;

    const w = overlayEl.offsetWidth;
    const h = overlayEl.offsetHeight;
    if (w < 4 || h < 4) return;

    const path = makeRRPath(w, h, RING_RADIUS);
    const pm   = rrPerimeter(w, h, RING_RADIUS);

    svgEl.querySelector('.sc-ring-track').setAttribute('d', path);

    const prog = svgEl.querySelector('.sc-ring-prog');
    prog.setAttribute('d', path);

    const sec  = new Date().getSeconds();
    if (sec === 0) {
      prog.setAttribute('stroke-dasharray', '0 9999');
    } else {
      const dash = pm * (sec / 60);
      prog.setAttribute('stroke-dasharray', `${dash} ${pm + 20}`);
    }
  }

  // ── Clock ───────────────────────────────────────────────────────────────────

  function startClock() {
    if (clockInterval) return;
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  function stopClock() { clearInterval(clockInterval); clockInterval = null; }

  function updateClock() {
    if (!overlayEl) return;
    const now = new Date();

    const timeEl = overlayEl.querySelector('.sc-time');
    // HH:MM only — no seconds
    timeEl.textContent = now.toLocaleTimeString('en', {
      hour: '2-digit', minute: '2-digit', hour12: settings.hour12
    });

    // Short date, English, no year (compact for 1-line meta row)
    overlayEl.querySelector('.sc-date').textContent = now.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });

    applyFontSizes(timeEl);
    updateRing();
  }

  // ── Font sizes (stable reference: overlayWidth) ─────────────────────────────

  function applyFontSizes(timeElArg) {
    if (!overlayEl) return;
    const timeEl = timeElArg || overlayEl.querySelector('.sc-time');
    if (!timeEl) return;

    const ow      = settings.overlayWidth || 260;
    // 4px extra safety buffer on top of padding so rendered text never clips
    const targetW = ow - PADDING_H * 2 - 4;

    // Always measure the hard cap — letter-spacing accounted for inside
    const maxFit = measureFitSize(timeEl.textContent, targetW);

    let baseSize;
    if (settings.autoFit) {
      baseSize = maxFit;
    } else {
      // User preference, but never allowed to exceed what physically fits
      baseSize = Math.min(Math.max(settings.fontSize || 42, 12), maxFit);
    }

    timeEl.style.fontSize = baseSize + 'px';

    // Meta row — proportional to time font
    const metaSize = Math.max(Math.round(baseSize * 0.26), 10);
    const metaRow  = overlayEl.querySelector('.sc-meta-row');
    if (metaRow) metaRow.style.fontSize = metaSize + 'px';
  }

  function measureFitSize(text, targetWidth) {
    if (!text || targetWidth <= 0) return 12;
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    let lo = 12, hi = 180;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      // Match the CSS font exactly so canvas measurement equals rendered width.
      // Monospace font — no letter-spacing correction needed.
      ctx.font = `700 ${mid}px ui-monospace,'SF Mono','Cascadia Mono','Consolas','Menlo',monospace`;
      if (ctx.measureText(text).width <= targetWidth) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  // ── Weather ─────────────────────────────────────────────────────────────────

  function scheduleWeather() {
    fetchWeather();
    clearTimeout(weatherTimer);
    weatherTimer = setTimeout(scheduleWeather, 15 * 60 * 1000);
  }

  async function fetchWeather() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_WEATHER' });
      if (res && res.weather) renderWeather(res.weather);
    } catch (_) {}
  }

  function renderWeather(data) {
    if (!overlayEl || !settings.weather) return;
    const row    = overlayEl.querySelector('.sc-weather');
    const iconEl = overlayEl.querySelector('.sc-weather-icon');
    const tempEl = overlayEl.querySelector('.sc-weather-temp');
    iconEl.textContent = wmoEmoji(data.weathercode);
    tempEl.textContent = settings.unit === 'F'
      ? Math.round(data.temperature * 9 / 5 + 32) + ' °F'
      : Math.round(data.temperature) + ' °C';
    row.style.display = 'flex';
    applyFontSizes();
  }

  function wmoEmoji(c) {
    if (c === 0)  return '☀️';  if (c <= 2)  return '🌤️';
    if (c === 3)  return '☁️';  if (c <= 49) return '🌫️';
    if (c <= 59)  return '🌦️';  if (c <= 69) return '🌧️';
    if (c <= 79)  return '🌨️';  if (c <= 82) return '🌧️';
    if (c <= 86)  return '❄️';  if (c <= 99) return '⛈️';
    return '🌡️';
  }

  // ── Corner navigation ───────────────────────────────────────────────────────

  function setupCornerNav() {
    updateCornerMarker();
    overlayEl.querySelectorAll('.sc-cnav').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (btn.classList.contains('sc-cnav-cur')) return;
        moveToCorner(btn.dataset.pos);
      });
    });
  }

  function updateCornerMarker() {
    if (!overlayEl) return;
    const cur = settings.customLeft >= 0 ? null : settings.position;
    overlayEl.querySelectorAll('.sc-cnav').forEach(btn => {
      btn.classList.toggle('sc-cnav-cur', btn.dataset.pos === cur);
    });
  }

  function moveToCorner(pos) {
    // FLIP animation: First, Last, Invert, Play — GPU-accelerated, no layout thrash
    const first = overlayEl.getBoundingClientRect();

    settings.position   = pos;
    settings.customLeft = -1;
    settings.customTop  = -1;
    chrome.storage.sync.set({ position: pos, customLeft: -1, customTop: -1 });

    // LAST: instantly snap to destination via corner CSS (no transition)
    overlayEl.style.transition = 'none';
    overlayEl.style.transform  = 'none';
    applyPosition();

    // Measure where the overlay actually ended up
    const last = overlayEl.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top  - last.top;

    if (dx === 0 && dy === 0) {
      updateCornerMarker();
      return;
    }

    // INVERT: pre-translate so it visually starts at the original position
    overlayEl.style.willChange = 'transform';
    overlayEl.style.transform  = `translate3d(${dx}px, ${dy}px, 0)`;
    // Force the inverted state to commit before starting the transition
    overlayEl.offsetWidth;

    // PLAY: animate transform back to zero — composited on GPU
    overlayEl.style.transition = 'transform 0.42s cubic-bezier(.22, 1, .36, 1)';
    overlayEl.style.transform  = 'translate3d(0, 0, 0)';

    const cleanup = () => {
      if (!overlayEl) return;
      overlayEl.style.transition = '';
      overlayEl.style.transform  = '';
      overlayEl.style.willChange = '';
      updateCornerMarker();
    };
    setTimeout(cleanup, 460);
  }

  // ── Drag ────────────────────────────────────────────────────────────────────

  function makeDraggable() {
    overlayEl.querySelector('.sc-grip').addEventListener('mousedown', startDrag);
  }

  function startDrag(e) {
    e.preventDefault(); e.stopPropagation();
    const rect = overlayEl.getBoundingClientRect();
    Object.assign(overlayEl.style, { top: rect.top+'px', left: rect.left+'px', bottom:'', right:'' });
    isDragging = true; dragMX = e.clientX; dragMY = e.clientY;
    dragL = rect.left; dragT = rect.top;
    overlayEl.classList.add('sc-dragging');
    createGuides();
    document.addEventListener('mousemove', onDrag,   { capture: true });
    document.addEventListener('mouseup',   stopDrag, { capture: true, once: true });
  }

  function onDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const ow = overlayEl.offsetWidth, oh = overlayEl.offsetHeight;
    const vw = window.innerWidth,     vh = window.innerHeight;
    let nl = Math.max(0, Math.min(vw - ow, dragL + (e.clientX - dragMX)));
    let nt = Math.max(0, Math.min(vh - oh, dragT + (e.clientY - dragMY)));
    const snap = computeSnap(nl, nt, ow, oh, vw, vh);
    overlayEl.style.left = snap.left + 'px';
    overlayEl.style.top  = snap.top  + 'px';
    updateGuides(snap);
  }

  function stopDrag() {
    isDragging = false;
    overlayEl.classList.remove('sc-dragging');
    document.removeEventListener('mousemove', onDrag, { capture: true });
    removeGuides();
    const left = parseFloat(overlayEl.style.left) || 0;
    const top  = parseFloat(overlayEl.style.top)  || 0;
    settings.customLeft = left; settings.customTop = top;
    chrome.storage.sync.set({ customLeft: left, customTop: top });
    updateCornerMarker(); // drag = no corner active → all 4 buttons lit
  }

  function computeSnap(l, t, ow, oh, vw, vh) {
    const sx = [{ val: SNAP_MARGIN, guide: SNAP_MARGIN }, { val: vw-ow-SNAP_MARGIN, guide: vw-SNAP_MARGIN }, { val: (vw-ow)/2, guide: vw/2 }];
    const sy = [{ val: SNAP_MARGIN, guide: SNAP_MARGIN }, { val: vh-oh-SNAP_MARGIN, guide: vh-SNAP_MARGIN }, { val: (vh-oh)/2, guide: vh/2 }];
    let guideX = null, guideY = null;
    for (const p of sx) { if (Math.abs(l - p.val) < SNAP_THRESHOLD) { l = p.val; guideX = p.guide; break; } }
    for (const p of sy) { if (Math.abs(t - p.val) < SNAP_THRESHOLD) { t = p.val; guideY = p.guide; break; } }
    return { left: l, top: t, guideX, guideY };
  }

  function createGuides() {
    if (guidesEl) return;
    guidesEl = document.createElement('div');
    guidesEl.className = 'sc-guides';
    guidesEl.style.position = overlayEl.style.position || 'fixed';
    guidesEl.innerHTML = `<div class="sc-guide-h"></div><div class="sc-guide-v"></div>`;
    (overlayEl.parentElement || document.body).appendChild(guidesEl);
  }

  function updateGuides({ guideX, guideY }) {
    if (!guidesEl) return;
    const h = guidesEl.querySelector('.sc-guide-h');
    const v = guidesEl.querySelector('.sc-guide-v');
    if (guideY !== null) { h.style.top  = guideY+'px'; h.classList.add('sc-snap'); }
    else h.classList.remove('sc-snap');
    if (guideX !== null) { v.style.left = guideX+'px'; v.classList.add('sc-snap'); }
    else v.classList.remove('sc-snap');
  }

  function removeGuides() {
    if (guidesEl && guidesEl.parentElement) guidesEl.parentElement.removeChild(guidesEl);
    guidesEl = null;
  }

  // ── Listeners ───────────────────────────────────────────────────────────────

  function attachListeners() {
    document.addEventListener('fullscreenchange',       onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    window.addEventListener('resize', debounce(onFullscreenChange, 200));

    chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
      if (msg.type === 'GET_COORDS') {
        navigator.geolocation.getCurrentPosition(
          p => sendResponse({ lat: p.coords.latitude, lon: p.coords.longitude }),
          () => sendResponse(null),
          { maximumAge: 30 * 60 * 1000, timeout: 8000 }
        );
        return true;
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      for (const [k, { newValue }] of Object.entries(changes)) settings[k] = newValue;
      onSettingsChanged();
    });
  }

  function onSettingsChanged() {
    if (!settings.enabled || isSiteBlocked()) { unmountOverlay(); return; }
    const target  = getFullscreenTarget();
    const visible = settings.mode === 'always' || target !== null;
    if (visible) {
      if (!overlayEl || !overlayEl.parentElement) {
        mountOverlay(target || document.body);
      } else {
        applyPosition(); applyOverlayWidth(); applyFontSizes();
        if (settings.weather) scheduleWeather();
        else { clearTimeout(weatherTimer); overlayEl.querySelector('.sc-weather').style.display = 'none'; }
      }
    } else { unmountOverlay(); }
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  init();
})();
