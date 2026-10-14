"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch("https://api.islahbd.com/api/books/").then((r) => r.json()).then((d) => setBooks(Array.isArray(d) ? d : d.results || [])).catch(() => setBooks([]));
  }, []);
  const list = books.filter((b: any) => !q.trim() || JSON.stringify(b).toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">📚 লাইব্রেরি + বুকশপ</h1>
      <p className="text-sm text-stone-500">Library • BookDetail • BookReader • PdfViewer • Bookshop • BayanHistory</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 বই খুঁজুন…" className="input mt-3" />
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {list.length === 0 && <div className="card p-4 text-sm text-stone-500">অনলাইন বই লোড হচ্ছে / অফলাইন হলে islahbd.com দেখুন। <a className="text-primary font-bold" href="https://islahbd.com" target="_blank">islahbd.com ↗</a></div>}
        {list.map((b: any, i: number) => (
          <div key={i} className="card p-3.5">
            <div className="font-bold">{b.title || b.name || `বই ${i + 1}`}</div>
            <div className="text-xs text-stone-500">{b.author || b.category || ""}</div>
            <div className="flex gap-2 mt-2">
              {b.pdf && <a href={b.pdf} target="_blank" className="btn-primary flex-1 text-center !py-1.5 text-sm">📖 পড়ুন</a>}
              {b.pdf && <a href={b.pdf} download className="chip flex-1 text-center !py-2">⬇ PDF</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
