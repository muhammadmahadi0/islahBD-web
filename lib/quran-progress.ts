// "Where did the user leave off?" memory for the Qur'an section.
// The reader saves the verse at the top of the screen (and every verse the
// user starts listening to); the landing page surfaces it as a continue card
// and the reader resumes from it when no explicit surah/ayah is in the URL.

import { storageGetJSON, storageSetJSON } from "./storage";

export type QuranViewMode = "translation" | "recitation";

export type QuranLastRead = {
  surah: number;
  ayah: number;
  /** Which tab the reader was on — translation (পড়া) or recitation (শোনা). */
  mode: QuranViewMode;
  /** Epoch ms, used to detect stale/garbage entries. */
  at: number;
};

const KEY = "quran_last_read";

export function getLastRead(): QuranLastRead | null {
  const v = storageGetJSON<QuranLastRead | null>(KEY, null);
  if (!v || typeof v.surah !== "number" || typeof v.ayah !== "number") return null;
  if (v.surah < 1 || v.surah > 114 || v.ayah < 1) return null;
  return {
    surah: v.surah,
    ayah: v.ayah,
    mode: v.mode === "recitation" ? "recitation" : "translation",
    at: Number(v.at) || 0,
  };
}

export function saveLastRead(pos: { surah: number; ayah: number; mode: QuranViewMode }): void {
  if (!pos.surah || !pos.ayah) return;
  storageSetJSON(KEY, {
    surah: pos.surah,
    ayah: pos.ayah,
    mode: pos.mode === "recitation" ? "recitation" : "translation",
    at: Date.now(),
  } satisfies QuranLastRead);
}

/** Builds the reader URL that jumps straight back to a saved position. */
export function resumeHref(pos: QuranLastRead): string {
  return `/quran/read?surah=${pos.surah}&ayah=${pos.ayah}&view=${pos.mode}`;
}
