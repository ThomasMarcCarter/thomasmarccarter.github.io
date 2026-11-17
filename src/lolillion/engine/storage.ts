// localStorage can be missing or throw (private mode, blocked site data); the game must work without it.
const PREFIX = 'lolillion:';

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readJson<T>(key: string, fallback: T, storage: Storage | undefined = defaultStorage()): T {
  try {
    const raw = storage?.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, storage: Storage | undefined = defaultStorage()): void {
  try {
    storage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Not remembered this time; play carries on.
  }
}
