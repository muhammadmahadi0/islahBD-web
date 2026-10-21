import { NextResponse } from "next/server";
import { QURAN_API, fixWordAudio } from "../../../../lib/quran";

// Single verse with translation + tafsir + words:
// /api/quran/verse?key=112:1&translations=161&tafsirs=165
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "";
  if (!/^\d{1,3}:\d{1,3}$/.test(key)) {
    return NextResponse.json({ error: "ভুল আয়াত।" }, { status: 400 });
  }
  const translations = (searchParams.get("translations") || "161").replace(/[^0-9,]/g, "");
  const tafsirs = (searchParams.get("tafsirs") || "165").replace(/[^0-9,]/g, "");

  const params = new URLSearchParams({
    language: "bn",
    translations,
    translation_fields: "resource_id,language_id,text",
    fields: "text_uthmani,text_imlaei",
    words: "true",
    word_fields: "verse_key,position,text_uthmani,transliteration",
  });
  if (tafsirs) {
    params.set("tafsirs", tafsirs);
    params.set("tafsir_fields", "resource_id,language_id,text");
  }

  try {
    const res = await fetch(`${QURAN_API}/verses/by_key/${encodeURIComponent(key)}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.verse) data.verse = fixWordAudio(data.verse);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "আয়াত লোড হয়নি।" }, { status: 502 });
  }
}
