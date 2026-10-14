import { NextResponse } from "next/server";
import { parseHamdNaatList } from "../../../lib/audio";

// Mirrors beta src/pages/api/hamdnaat.ts
export const revalidate = 300;

export async function GET() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch("https://api.islahbd.com/api/nasheeds/", {
        signal: ctl.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      return NextResponse.json({ success: true, items: parseHamdNaatList(raw), source: "islahbd" });
    } finally {
      clearTimeout(t);
    }
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "হামদ-নাত তালিকা লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
