'use strict';

if (typeof globalThis.scExt === 'undefined' && typeof importScripts === 'function') {
  importScripts('extension-api.js');
}

const CACHE_KEY = 'sc_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const DEFAULT_SETTINGS = {
  mode: 'fullscreen',
  position: 'bottom-left',
  weather: true,
  unit: 'C',
  hour12: false,
  enabled: true
};

scExt.raw.runtime.onInstalled.addListener(async () => {
  const existing = await scExt.getStorage('sync', null);
  await scExt.setStorage('sync', { ...DEFAULT_SETTINGS, ...existing });
});

scExt.raw.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_WEATHER') {
    handleWeatherRequest(sender.tab?.id).then(sendResponse).catch(() => sendResponse(null));
    return true; // async
  }
});

async function handleWeatherRequest(tabId) {
  // 1. Check session cache
  const cache = await scExt.getStorage('session', CACHE_KEY).catch(() => ({}));
  const cached = cache[CACHE_KEY];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { weather: cached };
  }

  // 2. Get coordinates from the content script (service workers can't use geolocation)
  if (!tabId) return { weather: null };

  let coords = null;
  try {
    coords = await scExt.sendTabMessage(tabId, { type: 'GET_COORDS' });
  } catch (_) {
    return { weather: null };
  }
  if (!coords) return { weather: null };

  // 3. Fetch from Open-Meteo (no API key required)
  let json;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${coords.lat}&longitude=${coords.lon}` +
      `&current_weather=true`;
    const res = await fetch(url);
    json = await res.json();
  } catch (_) {
    return { weather: null };
  }

  const cw = json.current_weather;
  if (!cw) return { weather: null };

  const weather = {
    temperature: cw.temperature,
    weathercode: cw.weathercode,
    windspeed:   cw.windspeed,
    fetchedAt:   Date.now()
  };

  // 4. Cache in session storage
  await scExt.setStorage('session', { [CACHE_KEY]: weather }).catch(() => {});

  return { weather };
}
