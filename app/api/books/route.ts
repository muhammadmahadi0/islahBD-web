import { NextResponse } from "next/server";

// IslahBD book catalog proxy (same pattern as /api/boyan).
export const revalidate = 300;

export async function GET() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch("https://api.islahbd.com/api/books/", {
        signal: ctl.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : raw.results || [];
      const books = list.map((b: any) => ({
        id: String(b.id ?? ""),
        title: String(b.title || "শিরোনামহীন বই"),
        author: String(b.author || ""),
        category: "",
        cover: String(b.coverUrl || ""),
        pdf: String(b.pdfUrl || b.pdf || ""),
        source: "islahbd",
      }));
      return NextResponse.json({ success: true, books });
    } finally {
      clearTimeout(t);
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "বই তালিকা লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
