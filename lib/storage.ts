// Crash-safe browser APIs. Safari private mode and locked-down
// Firefox/Safari profiles throw on localStorage writes, and legacy
// WebKit returns undefined (not a Promise) from HTMLMediaElement.play() —
// both used to surface as white-screen client exceptions on tap.

/** Raw string storage that never throws (for zustand createJSONStorage). */
export const safeStringStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Quota/private-mode — app keeps running in memory.
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export function storageGet(key: string): string | null {
  return safeStringStorage.getItem(key);
}

export function storageSet(key: string, value: string): void {
  safeStringStorage.setItem(key, value);
}

export function storageGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = safeStringStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSetJSON(key: string, value: unknown): void {
  try {
    safeStringStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — memory-only
  }
}

/**
 * play() that never throws: legacy WebKit returns undefined instead of a
 * Promise, so `.catch` on its result crashes. Returns the promise when
 * there is one (callers attach rejection handlers), undefined otherwise.
 */
export function tryPlay(audio: HTMLAudioElement | null): Promise<void> | undefined {
  if (!audio) return undefined;
  try {
    const p = audio.play() as unknown;
    if (p && typeof (p as Promise<void>).catch === "function") {
      return p as Promise<void>;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
