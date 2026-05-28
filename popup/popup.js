'use strict';

const DEFAULT_SETTINGS = {
  enabled:       true,
  weather:       false, // off by default — no geolocation prompt on install
  unit:          'C',
  hour12:        false,
  siteBlocklist: [],
};

let currentHost = '';

let S = { ...DEFAULT_SETTINGS };

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll('[data-i18n-btn]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18nBtn);
    if (msg) el.textContent = msg;
  });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (s) => {
  S = s;
  applyI18n();
  loadCurrentTab(() => render(s));
});

function loadCurrentTab(done) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs && tabs[0] && tabs[0].url;
    try {
      const u = url ? new URL(url) : null;
      // Only http(s) hosts are toggleable — chrome://, file://, etc. are skipped
      currentHost = (u && /^https?:$/.test(u.protocol)) ? u.hostname : '';
    } catch (e) { currentHost = ''; }
    done && done();
  });
}

function render(s) {
  document.getElementById('enabled').checked = s.enabled;
  document.body.classList.toggle('sc-disabled', !s.enabled);

  // Per-site toggle
  const hostEl   = document.getElementById('current-host');
  const siteTog  = document.getElementById('site-toggle');
  const list     = Array.isArray(s.siteBlocklist) ? s.siteBlocklist : [];
  const blocked  = list.includes(currentHost);
  if (currentHost) {
    hostEl.textContent = currentHost;
    hostEl.title       = `${currentHost}\n(非表示サイト: ${list.length}件)`;
    siteTog.checked    = !blocked;
    siteTog.disabled   = false;
  } else {
    hostEl.textContent = '— (システムページ)';
    hostEl.title       = 'このページでは設定できません';
    siteTog.checked    = true;
    siteTog.disabled   = true;
  }

  document.getElementById('weather').checked = s.weather;
  document.getElementById('unit-row').style.display = s.weather ? '' : 'none';

  document.querySelectorAll('#unit-seg button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === s.unit);
  });

  document.querySelectorAll('#hour12-seg button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.h12 === String(s.hour12));
  });
}

function save(patch) {
  Object.assign(S, patch);
  chrome.storage.sync.set(patch);
}

document.getElementById('enabled').addEventListener('change', (e) => {
  save({ enabled: e.target.checked });
  document.body.classList.toggle('sc-disabled', !e.target.checked);
});

// Per-site show/hide toggle
document.getElementById('site-toggle').addEventListener('change', (e) => {
  if (!currentHost) return;
  const show = e.target.checked;
  const list = Array.isArray(S.siteBlocklist) ? [...S.siteBlocklist] : [];
  const i = list.indexOf(currentHost);
  if (show && i >= 0) list.splice(i, 1);   // remove from blocklist
  if (!show && i < 0) list.push(currentHost); // add to blocklist
  save({ siteBlocklist: list });
});

document.getElementById('weather').addEventListener('change', (e) => {
  save({ weather: e.target.checked });
  document.getElementById('unit-row').style.display = e.target.checked ? '' : 'none';
});

document.querySelectorAll('#unit-seg button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#unit-seg button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    save({ unit: btn.dataset.unit });
  });
});

document.querySelectorAll('#hour12-seg button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#hour12-seg button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    save({ hour12: btn.dataset.h12 === 'true' });
  });
});
