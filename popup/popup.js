'use strict';

const DEFAULT_SETTINGS = {
  enabled:        true,
  weather:        false, // off by default
  unit:           'C',
  hour12:         false,
  siteBlocklist:  [],
  weatherCountry: 'JP',  // ISO country code for the registered postal code
  weatherPostal:  '',    // registered postal code
  weatherLat:     null,  // resolved coordinates (null = no location registered)
  weatherLon:     null,
  weatherPlace:   '',     // human-readable label for the registered place
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
  document.getElementById('weather-config').style.display = s.weather ? '' : 'none';

  const country = s.weatherCountry || 'JP';
  document.getElementById('weather-country').value = country;
  setPostalInputs(country, s.weatherPostal || '');
  updatePostalMode(country);
  renderWeatherStatus(s);

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
  document.getElementById('weather-config').style.display = e.target.checked ? '' : 'none';
});

// ── Weather location (postal code → coordinates) ──────────────────────────────

function setStatus(text, kind) {
  const el = document.getElementById('weather-status');
  el.textContent = text || '';
  el.className = 'weather-status' + (kind ? ' ' + kind : '');
}

// Show the registered place, or a call-to-action prompting the user to register.
function renderWeatherStatus(s) {
  if (s.weatherLat != null && s.weatherLon != null && s.weatherPlace) {
    setStatus('✓ ' + chrome.i18n.getMessage('weatherRegistered') + ' ' + s.weatherPlace, 'ok');
  } else {
    setStatus(chrome.i18n.getMessage('weatherCtaHint'), 'hint');
  }
}

// Japan uses split 3+4 boxes (no hyphen typing needed); others use one box.
function updatePostalMode(country) {
  const isJP = country === 'JP';
  document.getElementById('postal-row-jp').style.display      = isJP ? '' : 'none';
  document.getElementById('postal-row-default').style.display = isJP ? 'none' : '';
}

// Read the postal code from whichever input layout is active, normalized for the API.
function getPostal(country) {
  if (country === 'JP') {
    const a = (document.getElementById('postal-jp1').value || '').replace(/\D/g, '');
    const b = (document.getElementById('postal-jp2').value || '').replace(/\D/g, '');
    if (!a && !b) return '';
    return b ? `${a}-${b}` : a;
  }
  return (document.getElementById('weather-postal').value || '').trim();
}

// Fill the input layout from a stored postal code (e.g. "100-0001").
function setPostalInputs(country, postal) {
  if (country === 'JP') {
    const digits = (postal || '').replace(/\D/g, '');
    document.getElementById('postal-jp1').value = digits.slice(0, 3);
    document.getElementById('postal-jp2').value = digits.slice(3, 7);
  } else {
    document.getElementById('weather-postal').value = postal || '';
  }
}

document.getElementById('weather-country').addEventListener('change', (e) => {
  const country = e.target.value;
  updatePostalMode(country);
  save({ weatherCountry: country });
});

// Auto-advance from the 3-digit box to the 4-digit box for Japanese codes.
const jp1 = document.getElementById('postal-jp1');
jp1.addEventListener('input', () => {
  if (jp1.value.length >= 3) document.getElementById('postal-jp2').focus();
});

['weather-postal', 'postal-jp1', 'postal-jp2'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') registerLocation(); });
});

document.getElementById('weather-register').addEventListener('click', registerLocation);

async function registerLocation() {
  const country = (document.getElementById('weather-country').value || '').trim();
  const postal  = getPostal(country);
  if (!postal) { setStatus(chrome.i18n.getMessage('weatherError'), 'err'); return; }

  setStatus(chrome.i18n.getMessage('weatherSearching'), 'hint');

  try {
    // Zippopotam.us resolves a country + postal code to coordinates — no API key.
    const url = `https://api.zippopotam.us/${encodeURIComponent(country.toLowerCase())}/` +
                `${encodeURIComponent(postal.toUpperCase())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('not found');
    const json = await res.json();
    const place = json.places && json.places[0];
    if (!place) throw new Error('not found');

    const lat = parseFloat(place.latitude);
    const lon = parseFloat(place.longitude);
    if (!isFinite(lat) || !isFinite(lon)) throw new Error('bad coords');

    const label = [place['place name'], place['state abbreviation'] || place.state]
      .filter(Boolean).join(', ') + ` (${country.toUpperCase()})`;

    save({
      weatherCountry: country,
      weatherPostal:  postal,
      weatherLat:     lat,
      weatherLon:     lon,
      weatherPlace:   label,
    });
    setStatus('✓ ' + chrome.i18n.getMessage('weatherRegistered') + ' ' + label, 'ok');
  } catch (_) {
    save({ weatherLat: null, weatherLon: null, weatherPlace: '' });
    setStatus(chrome.i18n.getMessage('weatherError'), 'err');
  }
}

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
