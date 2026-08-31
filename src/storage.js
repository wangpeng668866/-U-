export const STORAGE_KEY = "pengcheng-video-agent-state-v1";

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function readSnapshot(storage, key = STORAGE_KEY) {
  if (!storage) return {};

  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeSnapshot(storage, snapshot, key = STORAGE_KEY) {
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function restoreList(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value : clone(fallback);
}

export function buildSnapshot({ projects, assets, historyItems, settings, ui }) {
  return {
    projects: restoreList(projects, []),
    assets: restoreList(assets, []),
    historyItems: restoreList(historyItems, []),
    settings: { ...(settings || {}) },
    ui: { ...(ui || {}) },
    savedAt: new Date().toISOString()
  };
}

export function createMemoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    dump() {
      return Object.fromEntries(data);
    }
  };
}
