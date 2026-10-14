import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Chapter metadata (114 surahs, Bengali names). Changes never — cache long.
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(`${QURAN_API}/chapters?language=bn`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, chapters: data.chapters || [] });
  } catch (e) {
    return NextResponse.json({ success: false, error: "সূরার তালিকা লোড হয়নি।" }, { status: 502 });
  }
}
