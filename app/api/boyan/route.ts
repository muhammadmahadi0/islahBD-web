import { NextResponse } from "next/server";
import { parseBoyanList, parseBoyanCategories } from "../../../lib/audio";

// Mirrors beta src/pages/api/boyan.ts — proxies the keyless IslahBD API
// with ISR caching so the catalog loads fast and fresh.
export const revalidate = 300;

async function fetchJson(url: string, timeoutMs = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  try {
    const [audiosRaw, catsRaw] = await Promise.all([
      fetchJson("https://api.islahbd.com/api/audios/"),
      fetchJson("https://api.islahbd.com/api/categories/").catch(() => []),
    ]);
    return NextResponse.json({
      success: true,
      audios: parseBoyanList(audiosRaw),
      categories: parseBoyanCategories(catsRaw),
      source: "islahbd",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "বয়ান তালিকা লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
