export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence
  }
}

export function clearStorageKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export const REVIBE_STORAGE_KEYS = [
  "revibe.appState.v1",
  "revibe.latestAnalysis",
  "revibe.savedProjects",
  "revibe.projectProgressById",
] as const;

export function clearRevibeStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of REVIBE_STORAGE_KEYS) {
    clearStorageKey(key);
  }
}
