import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Chapter-level streaming audio: /api/quran/chapter-audio?reciter=7&chapter=1
// Per-ayah audio: /api/quran/chapter-audio?reciter=7&key=1:5
export const revalidate = 86400;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reciter = Math.max(1, Number(searchParams.get("reciter")) || 7);
  const chapter = searchParams.get("chapter");
  const key = searchParams.get("key");
  try {
    const url = key
      ? `${QURAN_API}/recitations/${reciter}/by_ayah/${encodeURIComponent(key)}`
      : `${QURAN_API}/chapter_recitations/${reciter}/${chapter || 1}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: "অডিও লোড হয়নি।" }, { status: 502 });
  }
}
