'use strict';

(function initSideClockExtensionApi(globalScope) {
  const api = globalScope.browser || globalScope.chrome;
  const prefersPromises = !!globalScope.browser;

  function callbackCall(fn, context, args) {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (result) => {
        const lastError = globalScope.chrome && globalScope.chrome.runtime && globalScope.chrome.runtime.lastError;
        if (lastError) reject(new Error(lastError.message));
        else resolve(result);
      });
    });
  }

  function call(fn, context, ...args) {
    if (prefersPromises) return fn.call(context, ...args);
    return callbackCall(fn, context, args);
  }

  function storageArea(name) {
    const storage = api && api.storage;
    if (!storage) return null;
    return storage[name] || null;
  }

  const storageFallback = new Map();

  async function getStorage(areaName, keys) {
    const area = storageArea(areaName);
    if (area) return call(area.get, area, keys);

    if (keys === null || typeof keys === 'undefined') {
      return Object.fromEntries(storageFallback.entries());
    }

    if (typeof keys === 'string') return { [keys]: storageFallback.get(keys) };
    if (Array.isArray(keys)) {
      return Object.fromEntries(keys.map((key) => [key, storageFallback.get(key)]));
    }

    return Object.fromEntries(
      Object.entries(keys).map(([key, defaultValue]) => [
        key,
        storageFallback.has(key) ? storageFallback.get(key) : defaultValue
      ])
    );
  }

  async function setStorage(areaName, values) {
    const area = storageArea(areaName);
    if (area) return call(area.set, area, values);
    Object.entries(values).forEach(([key, value]) => storageFallback.set(key, value));
    return undefined;
  }

  function sendRuntimeMessage(message) {
    return call(api.runtime.sendMessage, api.runtime, message);
  }

  function sendTabMessage(tabId, message) {
    return call(api.tabs.sendMessage, api.tabs, tabId, message);
  }

  function queryTabs(queryInfo) {
    return call(api.tabs.query, api.tabs, queryInfo);
  }

  globalScope.scExt = {
    raw: api,
    getStorage,
    setStorage,
    sendRuntimeMessage,
    sendTabMessage,
    queryTabs,
    i18nGetMessage: (key) => api.i18n.getMessage(key)
  };
})(globalThis);
