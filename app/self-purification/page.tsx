"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PurificationPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("https://api.islahbd.com/api/self-purification/").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🤍 আত্মশুদ্ধি (Self Purification)</h1>
      <div className="space-y-2 mt-3">
        {items.slice(0, 40).map((p: any, i: number) => (
          <details key={i} className="card p-3.5">
            <summary className="font-bold cursor-pointer">{p.title || `ধাপ ${i + 1}`}</summary>
            <div className="text-sm mt-1 whitespace-pre-line">{p.content || p.description}</div>
          </details>
        ))}
        {items.length === 0 && <div className="card p-4 text-sm">কনটেন্ট লোড হচ্ছে… শরঈ purification গাইড শীঘ্রই।</div>}
      </div>
    </div>
  );
}
