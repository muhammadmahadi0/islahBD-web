import { NextResponse } from "next/server";
import type { Lang } from "../../../lib/i18n";
import { translateMany } from "../../../lib/server-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Runtime translation for upstream content (not the app's static text).
// Quran translations/tafsir are never routed through this endpoint.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lang: Lang = body?.lang === "en" ? "en" : body?.lang === "ur" ? "ur" : "bn";
    const texts: unknown = body?.texts;
    if (!Array.isArray(texts) || texts.length > 120 || texts.some((t) => typeof t !== "string")) {
      return NextResponse.json({ error: "invalid texts" }, { status: 400 });
    }
    if (texts.reduce((n, t) => n + (t as string).length, 0) > 16000) {
      return NextResponse.json({ error: "too much text" }, { status: 413 });
    }
    if (lang === "bn") return NextResponse.json({ translations: texts });
    const translations = await translateMany(texts as string[], lang);
    return NextResponse.json({ translations }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "translation failed" }, { status: 500 });
  }
}
