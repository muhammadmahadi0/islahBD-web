import { NextResponse } from "next/server";
import { QURAN_API } from "../../../../lib/quran";

// Full-text search: /api/quran/search?q=mercy&language=bn — cached briefly.
export const revalidate = 600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 100);
  if (!q.trim()) return NextResponse.json({ results: [], total: 0 });
  try {
    const params = new URLSearchParams({ q: q.trim(), size: "20", page: "0", language: "bn" });
    const res = await fetch(`${QURAN_API}/search?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      results: data.search?.results || [],
      total: data.search?.total_results || 0,
    });
  } catch (e) {
    return NextResponse.json({ results: [], total: 0, error: "সার্চ হয়নি।" }, { status: 502 });
  }
}
