'use strict';

const DEFAULT_SETTINGS = {
  enabled: true,
  weather: true,
  unit:    'C',
  hour12:  false,
};

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
  render(s);
});

function render(s) {
  document.getElementById('enabled').checked = s.enabled;
  document.body.classList.toggle('sc-disabled', !s.enabled);

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
