import type { Lang } from "./i18n";

// Bengali → English/Urdu content translation for upstream catalog data
// (bayan titles, notifications, gallery captions, ...). The app's static
// translation packs are produced ahead of time; this route is only used for
// content that arrives at runtime. If the public endpoint is unavailable we
// gracefully return the source text instead of hiding the content.

const BN = /[\u0980-\u09FF]/;
const cache = new Map<string, string>();
const MAX_CACHE = 6000;
let active = 0;
let nextStart = 0;
const waiters: (() => void)[] = [];
const MAX_CONCURRENT = 3;

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active += 1;
  try {
    // Space out request starts without making one long page translation
    // monopolise the shared endpoint.
    const now = Date.now();
    const wait = Math.max(0, nextStart - now);
    nextStart = Math.max(now, nextStart) + 250;
    if (wait) await new Promise((r) => setTimeout(r, wait));
    return await task();
  } finally {
    active -= 1;
    waiters.shift()?.();
  }
}

function remember(src: string, lang: Lang, out: string) {
  cache.set(lang + "\0" + src, out);
  if (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
}

function postProcess(src: string, out: string, lang: Lang) {
  if (lang === "en") {
    if (src.includes("ছালেক")) {
      out = out.replace(/\bKhalekin\b/gi, "Salikin").replace(/\bChalekin\b/gi, "Salikin");
      out = out.replace(/\bChalek\b/gi, "Salik");
    }
    if (src.includes("দরূদ") || src.includes("দরুদ")) {
      out = out.replace(/\bDarood\b/gi, "Durood").replace(/\bGreetings\b/gi, "Durood");
    }
    if (src.includes("এখলাছ") || src.includes("ইখলাছ")) out = out.replace(/\bEkhlach\b/gi, "Ikhlas");
    if (src.includes("নাছ")) out = out.replace(/\bNach\b/g, "Nas");
    if (src.includes("ছাল্লাল্লাহু")) out = out.replace(/Sallallahu Alaihi Wasallam/gi, "ﷺ");
    if (src.includes("এজতেমা")) out = out.replace(/\b(?:Menstrual|Periodic|Monthly) eczema\b/gi, "Monthly Ijtema");
    if (src.includes("কাকরাইল")) out = out.replace(/\bcockerel\b/gi, "Kakrail");
    if (src.includes("জাহেরি")) {
      out = out.replace(/Zaheri Elem/gi, "Zahiri Ilm").replace(/Haqbiki Elem/gi, "Haqiqi Ilm");
    }
    return out;
  }
  if (src.includes("ছালেক")) {
    out = out.replace(/خلیقین/g, "سالکین").replace(/چالیکن/g, "سالکین").replace(/چالاک/g, "سالک");
  }
  if (src.includes("নাছ")) out = out.replace(/\bنچ\b/g, "ناس");
  if (src.includes("এজতেমা")) out = out.replace(/ماہواری\s+(?:کا|کی)\s+(?:ایکزیما|ایگزیما|ایزیمہ)/g, "ماہانہ اجتماع");
  return out;
}

function chunks(text: string, limit = 1200): string[] {
  if (text.length <= limit) return [text];
  const parts = text.split(/(?<=[।.!?])\s+|\n+/);
  const out: string[] = [];
  let cur = "";
  for (const part of parts) {
    if (!part) continue;
    if (part.length > limit) {
      if (cur) { out.push(cur); cur = ""; }
      for (let i = 0; i < part.length; i += limit) out.push(part.slice(i, i + limit));
    } else if ((cur + " " + part).length > limit && cur) {
      out.push(cur);
      cur = part;
    } else {
      cur = cur ? `${cur} ${part}` : part;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [text];
}

async function google(texts: string[], lang: Lang): Promise<string[]> {
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl: "bn", tl: lang });
  for (const text of texts) params.append("q", text);
  const url = `https://clients5.google.com/translate_a/t?${params.toString()}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const arr = typeof data === "string" ? [data] : data;
    if (!Array.isArray(arr) || arr.length !== texts.length) throw new Error("translation shape mismatch");
    return arr.map(String);
  } finally {
    clearTimeout(timer);
  }
}

async function translateBatchUncached(texts: string[], lang: Lang): Promise<string[]> {
  return withSlot(async () => {
    try {
      const out = await google(texts, lang);
      // Some bursts come back untranslated without an HTTP error. Retry the
      // whole batch once when every item is unchanged.
      if (out.length > 1 && out.every((value, i) => value === texts[i] && BN.test(texts[i]))) {
        await new Promise((r) => setTimeout(r, 900));
        return await google(texts, lang);
      }
      return out;
    } catch {
      // One paced retry — public endpoint occasionally rate-limits bursts.
      await new Promise((r) => setTimeout(r, 1200));
      try {
        return await google(texts, lang);
      } catch {
        return texts;
      }
    }
  });
}

async function translateLong(text: string, lang: Lang): Promise<string> {
  const parts = chunks(text, 1000);
  const out: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const group = parts.slice(i, i + 2);
    let translated = await translateBatchUncached(group, lang);
    // A burst can leave individual paragraphs in the source language even
    // when the rest of the batch succeeds. Retry those alone at a smaller
    // payload size before accepting the fallback.
    for (let j = 0; j < translated.length; j++) {
      if (BN.test(translated[j]) && BN.test(group[j])) {
        await new Promise((r) => setTimeout(r, 500));
        const [retry] = await translateBatchUncached([group[j]], lang);
        if (!BN.test(retry)) translated[j] = retry;
      }
    }
    out.push(...translated);
  }
  return postProcess(text, out.join(" "), lang);
}

export async function translateMany(texts: string[], lang: Lang): Promise<string[]> {
  if (lang === "bn" || !texts.length) return texts;
  const result = [...texts];
  const missing: { text: string; indexes: number[] }[] = [];
  const byValue = new Map<string, number[]>();
  texts.forEach((text, i) => {
    if (typeof text !== "string" || !BN.test(text)) return;
    const hit = cache.get(lang + "\0" + text);
    if (hit !== undefined) {
      result[i] = hit;
      return;
    }
    const indexes = byValue.get(text) || [];
    indexes.push(i);
    byValue.set(text, indexes);
  });
  for (const [text, indexes] of byValue) missing.push({ text, indexes });

  // Batch short strings by encoded payload size; translate long bodies alone.
  let batch: { text: string; indexes: number[] }[] = [];
  let chars = 0;
  const flush = async () => {
    if (!batch.length) return;
    const values = batch.map((b) => b.text);
    const outs = await translateBatchUncached(values, lang);
    for (let i = 0; i < outs.length; i++) {
      let out = outs[i];
      // Retry lone untranslated strings before accepting the source fallback.
      if (BN.test(out) && BN.test(values[i])) {
        await new Promise((r) => setTimeout(r, 450));
        const [retry] = await translateBatchUncached([values[i]], lang);
        if (!BN.test(retry)) out = retry;
      }
      const value = postProcess(values[i], out || values[i], lang);
      if (!BN.test(value)) remember(values[i], lang, value);
      for (const index of batch[i].indexes) result[index] = value;
    }
    batch = [];
    chars = 0;
  };
  for (const item of missing) {
    if (item.text.length > 1200) {
      await flush();
      const value = await translateLong(item.text, lang);
      if (!BN.test(value)) remember(item.text, lang, value);
      for (const index of item.indexes) result[index] = value;
      continue;
    }
    if (batch.length >= 30 || chars + item.text.length > 3000) await flush();
    batch.push(item);
    chars += item.text.length;
  }
  await flush();
  return result;
}
