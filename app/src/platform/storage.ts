/**
 * Saved data (settings, the game in progress). Wraps localStorage so the rest of the app
 * never touches it, and so storage being unavailable (private mode, blocked) never breaks play.
 */

const PREFIX = 'wordrush:v1:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the game still works, it just won't be remembered.
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to do.
  }
}
