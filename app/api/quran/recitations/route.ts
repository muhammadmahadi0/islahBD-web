import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Reciter list for audio. Static — cache long.
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(`${QURAN_API}/resources/recitations`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, recitations: data.recitations || [] });
  } catch (e) {
    return NextResponse.json({ success: false, error: "ক্বারী তালিকা লোড হয়নি।" }, { status: 502 });
  }
}
