import { NextResponse } from "next/server";
import { QURAN_API, fixWordAudio } from "../../../../lib/quran";

// Para (Juz) reading: /api/quran/juz?juz=30&translations=161,163&tafsirs=165&page=1&per_page=50
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const juz = Math.min(30, Math.max(1, Number(searchParams.get("juz")) || 30));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(5, Number(searchParams.get("per_page")) || 50));
  const translations = (searchParams.get("translations") || "161").replace(/[^0-9,]/g, "");
  const tafsirs = (searchParams.get("tafsirs") || "").replace(/[^0-9,]/g, "");

  const params = new URLSearchParams({
    language: "bn",
    translations,
    translation_fields: "resource_id,language_id,text",
    page: String(page),
    per_page: String(perPage),
    fields: "text_uthmani,text_imlaei",
    words: "true",
    word_fields: "verse_key,position,text_uthmani,transliteration",
  });
  if (tafsirs) {
    params.set("tafsirs", tafsirs);
    params.set("tafsir_fields", "resource_id,language_id,text");
  }

  try {
    const res = await fetch(`${QURAN_API}/verses/by_juz/${juz}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.verses)) data.verses = data.verses.map(fixWordAudio);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "পারা লোড হয়নি।" }, { status: 502 });
  }
}
