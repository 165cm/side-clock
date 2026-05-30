'use strict';

const CACHE_KEY = 'sc_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const DEFAULT_SETTINGS = {
  mode: 'fullscreen',
  position: 'bottom-left',
  weather: true,
  unit: 'C',
  hour12: false,
  enabled: true,
  weatherCountry: 'JP', // ISO country code for postal-code lookup
  weatherPostal:  '',   // registered postal code
  weatherLat:     null, // resolved coordinates (null = no location registered)
  weatherLon:     null,
  weatherPlace:   ''     // human-readable label for the registered place
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(null);
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...existing });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_WEATHER') {
    handleWeatherRequest().then(sendResponse).catch(() => sendResponse(null));
    return true; // async
  }
});

async function handleWeatherRequest() {
  // 1. Read the location registered by the user in settings (no geolocation)
  const cfg = await chrome.storage.sync.get(['weatherLat', 'weatherLon']);
  const lat = cfg.weatherLat;
  const lon = cfg.weatherLon;
  if (lat == null || lon == null) return { weather: null }; // no location registered yet

  // 2. Check session cache (valid only for the same coordinates)
  const cache = await chrome.storage.session.get(CACHE_KEY).catch(() => ({}));
  const cached = cache[CACHE_KEY];
  if (cached && cached.lat === lat && cached.lon === lon &&
      Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { weather: cached };
  }

  // 3. Fetch from Open-Meteo (no API key required)
  let json;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
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
    lat, lon,
    fetchedAt:   Date.now()
  };

  // 4. Cache in session storage
  await chrome.storage.session.set({ [CACHE_KEY]: weather }).catch(() => {});

  return { weather };
}
