"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareCopy } from "../../components/ui";

export default function MalfuzatPage() {
  const [items, setItems] = useState<any[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  useEffect(() => {
    fetch("https://api.islahbd.com/api/malfuzat/?ordering=-createdAt").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    setSaved(JSON.parse(localStorage.getItem("malfuzat_bookmarks") || "[]"));
  }, []);
  const toggle = (i: number) => {
    const n = saved.includes(i) ? saved.filter((x) => x !== i) : [...saved, i];
    setSaved(n);
    localStorage.setItem("malfuzat_bookmarks", JSON.stringify(n));
  };
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">মালফুযাত</h1>
      <p className="text-sm text-stone-500">Malfuzat • DailyDialog • Bookmarks • Reactions ({saved.length} সেভড)</p>
      <div className="space-y-2 mt-3">
        {items.slice(0, 50).map((m: any, i: number) => (
          <div key={i} className="card p-3.5">
            <div className="text-sm whitespace-pre-line">{m.text || m.content || m.title}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => toggle(i)} className="chip">{saved.includes(i) ? "🔖 সেভড" : "📑 সেভ"}</button>
              <button onClick={() => alert("❤️ রিঅ্যাকশন পাঠানো ✓")} className="chip">❤️</button>
            </div>
            <div className="mt-2"><ShareCopy text={m.text || m.content || m.title || ""} /></div>
          </div>
        ))}
        {items.length === 0 && <div className="card p-4 text-sm">অনলাইন মালফুযাত লোড হচ্ছে…</div>}
      </div>
    </div>
  );
}
