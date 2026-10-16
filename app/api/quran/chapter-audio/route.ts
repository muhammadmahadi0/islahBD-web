import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Chapter-level streaming audio: /api/quran/chapter-audio?reciter=7&chapter=1
// Per-ayah audio: /api/quran/chapter-audio?reciter=7&key=1:5
//
// NOTE: the by_ayah endpoint returns RELATIVE paths
// ("Alafasy/mp3/001005.mp3") — absolutized here to the verse audio CDN,
// otherwise <audio> resolves them against this site and 404s.
export const revalidate = 86400;

const VERSE_CDN = "https://audio.qurancdn.com/";

function absolutize(files: any[]): any[] {
  if (!Array.isArray(files)) return files;
  return files.map((f) =>
    f && typeof f.url === "string" && !/^https?:\/\//i.test(f.url)
      ? { ...f, url: VERSE_CDN + f.url.replace(/^\/+/, "") }
      : f
  );
}

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
    const data = await res.json();
    if (Array.isArray((data as any).audio_files)) {
      (data as any).audio_files = absolutize((data as any).audio_files);
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "অডিও লোড হয়নি।" }, { status: 502 });
  }
}
