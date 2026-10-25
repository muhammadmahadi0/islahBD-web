import { NextResponse } from "next/server";
import { parseBoyanList, parseBoyanCategories } from "../../../lib/audio";

// The catalog changes as soon as a new bayan is uploaded, so this proxy must
// never be held by the ISR/CDN cache. A normal browser refresh should always
// see the upstream list immediately.
export const dynamic = "force-dynamic";

async function fetchJson(url: string, timeoutMs = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
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
    return NextResponse.json(
      {
        success: true,
        audios: parseBoyanList(audiosRaw),
        categories: parseBoyanCategories(catsRaw),
        source: "islahbd",
      },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "বয়ান তালিকা লোড করা যাচ্ছে না।" },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  }
}
