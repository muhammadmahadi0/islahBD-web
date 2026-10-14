import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Verses passthrough: /api/quran/verses?chapter=1&translations=161&tafsirs=165&words=1&page=1&per_page=20
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapter = Math.min(114, Math.max(1, Number(searchParams.get("chapter")) || 1));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(5, Number(searchParams.get("per_page")) || 20));
  const translations = (searchParams.get("translations") || "161").replace(/[^0-9,]/g, "");
  const tafsirs = (searchParams.get("tafsirs") || "").replace(/[^0-9,]/g, "");
  const words = searchParams.get("words") !== "0";

  const params = new URLSearchParams({
    language: "bn",
    translations,
    translation_fields: "resource_id,language_id,text",
    page: String(page),
    per_page: String(perPage),
    // NOTE: api.quran.com no longer includes verse text by default —
    // it must be requested explicitly or text_uthmani comes back empty.
    fields: "text_uthmani,text_imlaei",
  });
  if (tafsirs) {
    params.set("tafsirs", tafsirs);
    params.set("tafsir_fields", "resource_id,language_id,text");
  }
  if (words) {
    params.set("words", "true");
    params.set("word_fields", "verse_key,position,text_uthmani,transliteration");
  }

  try {
    const res = await fetch(`${QURAN_API}/verses/by_chapter/${chapter}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: "আয়াত লোড হয়নি।" }, { status: 502 });
  }
}
