"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NoticePage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("https://api.islahbd.com/api/notices/?ordering=-date").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">📢 নোটিশ বোর্ড</h1>
      <div className="space-y-2 mt-3">
        {items.slice(0, 40).map((n: any, i: number) => (
          <details key={i} className="card p-3.5">
            <summary className="font-bold cursor-pointer">{n.title} <span className="text-xs text-stone-400">• {n.date}</span></summary>
            <div className="text-sm mt-1 whitespace-pre-line">{n.body || n.description}</div>
            <button className="chip mt-2" onClick={() => { navigator.clipboard?.writeText(`${n.title}\n${n.body || ""}`); alert("নোটিশ কপি ✓"); }}>📋 শেয়ার/কপি</button>
          </details>
        ))}
        {items.length === 0 && <div className="card p-4 text-sm">নোটিশ লোড হচ্ছে…</div>}
      </div>
    </div>
  );
}
