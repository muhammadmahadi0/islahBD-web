"use client";

import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

// Runtime localization for content that comes from the IslahBD API, YouTube,
// or other upstream feeds. Static app data is shipped as pre-built .en/.ur
// packs (see public/data/*.en.json), so this only handles live catalog text.
// Quran translations/tafsir never flow through this helper.

const BN = /[\u0980-\u09FF]/;
const SKIP = new Set([
  "id", "slug", "url", "src", "href", "cover", "pdf", "image", "icon", "color", "key",
  "audio", "video", "link", "type", "category_id", "poet_id", "source", "app_version",
  "order", "serial", "total_poems", "createdAt", "updatedAt", "file", "filename", "path",
  "thumb", "thumbnail", "poster", "avatar", "photo", "photos", "coverUrl", "wallpaper",
  "background", "bg", "page", "index", "ayah", "surah", "juz", "para", "verse",
  "hadith_number", "arabic", "arabic_text", "original", "html", "body_html",
]);
const STORE_PREFIX = "islah-content-i18n-v1:";
const MAX_ENTRIES = 5000;
const mem = new Map<string, Map<string, string>>();
const inflight = new Map<string, Promise<string>>();

function store(lang: Lang): Map<string, string> {
  const existing = mem.get(lang);
  if (existing) return existing;
  const map = new Map<string, string>();
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORE_PREFIX + lang);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        for (const [k, v] of Object.entries(parsed)) if (typeof v === "string") map.set(k, v);
      }
    } catch {}
  }
  mem.set(lang, map);
  return map;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist(lang: Lang) {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const map = store(lang);
      let entries = [...map.entries()];
      if (entries.length > MAX_ENTRIES) entries = entries.slice(entries.length - MAX_ENTRIES);
      window.localStorage.setItem(STORE_PREFIX + lang, JSON.stringify(Object.fromEntries(entries)));
    } catch {}
  }, 700);
}

function needs(text: string) {
  return BN.test(text);
}

function collect(value: unknown, key: string | undefined, out: Set<string>) {
  if (typeof value === "string") {
    if (!SKIP.has(key || "") && needs(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, key, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collect(v, k, out);
  }
}

function apply(value: unknown, map: Map<string, string>, key?: string): unknown {
  if (typeof value === "string") {
    if (SKIP.has(key || "")) return value;
    return map.get(value) ?? value;
  }
  if (Array.isArray(value)) return value.map((v) => apply(v, map, key));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = apply(v, map, k);
    return out;
  }
  return value;
}

async function requestBatch(texts: string[], lang: Lang): Promise<string[]> {
  const dedup = [...new Set(texts)];
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texts: dedup, lang }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data?.translations) || data.translations.length !== dedup.length) {
      throw new Error("bad translation payload");
    }
    const map = new Map<string, string>();
    dedup.forEach((src, i) => map.set(src, String(data.translations[i] || src)));
    for (const src of texts) {
      const hit = map.get(src);
      // A same-string result means the upstream translator was unavailable;
      // leave it uncached so a later navigation can retry.
      if (hit && (hit !== src || !BN.test(src))) {
        store(lang).set(src, hit);
      }
    }
    persist(lang);
    return texts.map((t) => map.get(t) || t);
  } finally {
    clearTimeout(timer);
  }
}

async function translateMissing(missing: string[], lang: Lang): Promise<void> {
  // Keep requests small enough for the serverless URL/timeout budget.
  const batches: string[][] = [];
  let batch: string[] = [];
  let chars = 0;
  for (const text of missing) {
    if (batch.length >= 24 || chars + text.length > 5000) {
      batches.push(batch);
      batch = [];
      chars = 0;
    }
    batch.push(text);
    chars += text.length;
  }
  if (batch.length) batches.push(batch);
  const queue = [...batches];
  const worker = async () => {
    while (queue.length) {
      const group = queue.shift();
      if (!group) return;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const out = await requestBatch(group, lang);
          if (!out.some((text) => BN.test(text))) break;
        } catch {
          // Leave this batch in Bengali; a later navigation can retry.
        }
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}

export async function translateDeep<T>(value: T, lang: Lang): Promise<T> {
  if (!value || lang === "bn") return value;
  const strings = new Set<string>();
  collect(value, undefined, strings);
  if (!strings.size) return value;
  const map = store(lang);
  const missing = [...strings].filter((s) => !map.has(s));
  if (missing.length) await translateMissing(missing, lang);
  return apply(value, map) as T;
}

export async function translateText(text: string, lang: Lang): Promise<string> {
  if (!text || lang === "bn" || !needs(text)) return text;
  const map = store(lang);
  if (map.has(text)) return map.get(text)!;
  let task = inflight.get(lang + "\0" + text);
  if (!task) {
    task = requestBatch([text], lang).then((out) => out[0] || text);
    inflight.set(lang + "\0" + text, task);
    task.finally(() => inflight.delete(lang + "\0" + text));
  }
  return task;
}

/** Returns a localized clone once runtime translations arrive. */
export function useLocalizedData<T>(value: T, lang: Lang): T {
  const [out, setOut] = useState<T>(value);
  useEffect(() => {
    let live = true;
    if (!value || lang === "bn") {
      setOut(value);
      return;
    }
    // Show the upstream copy immediately, then swap in translations when
    // they arrive (often from the local cache, so this is one frame).
    setOut(value);
    translateDeep(value, lang)
      .then((next) => {
        if (live) setOut(next);
      })
      .catch(() => {
        if (live) setOut(value);
      });
    return () => {
      live = false;
    };
  }, [value, lang]);
  return out;
}

/** Translate one visible string (used for small labels from upstream data). */
export function useLocalizedText(text: string, lang: Lang): string {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let live = true;
    setOut(text);
    translateText(text, lang).then((next) => {
      if (live) setOut(next);
    });
    return () => {
      live = false;
    };
  }, [text, lang]);
  return out;
}
