"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareCopy } from "../../components/ui";

export default function PoemPage() {
  const [tab, setTab] = useState<"cats" | "hakim">("cats");
  const [cats, setCats] = useState<any[]>([]);
  const [poems, setPoems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/data/spiritual_poetry.json").then((r) => r.json()).then((d) => setCats(d.categories || [])).catch(() => {});
    fetch("/data/hakim_akhtar.json").then((r) => r.json()).then((d) => setPoems(d.poems || [])).catch(() => {});
  }, []);

  const list = poems.filter((p: any) => !q.trim() || JSON.stringify(p).includes(q.trim())).slice(0, 80);

  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">আধ্যাত্মিক কবিতা</h1>
      <div className="flex gap-2 mt-2">
        <button onClick={() => setTab("cats")} className={tab === "cats" ? "btn-primary" : "chip !py-2"}>কবিগণ</button>
        <button onClick={() => setTab("hakim")} className={tab === "hakim" ? "btn-primary" : "chip !py-2"}>হাকীম আখতার (২৬৯)</button>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 কবিতা খুঁজুন…" className="input mt-3" />
      {tab === "cats" ? (
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          {cats.map((c: any) => (
            <div key={c.id} className="card p-4">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-stone-500">{c.title} • {c.era}</div>
              <div className="text-xs mt-1">{c.books_summary}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 mt-3">
          {list.map((p: any) => (
            <details key={p.id} className="card p-3.5">
              <summary className="font-bold cursor-pointer">{p.title} <span className="text-xs text-stone-400">• {p.book_source}</span></summary>
              {p.original_text && <div className="mt-2 whitespace-pre-line font-arabic text-lg" dir="auto">{p.original_text}</div>}
              {p.bangla_translation && <div className="mt-1 text-sm whitespace-pre-line">{p.bangla_translation}</div>}
              {p.sharh && <div className="mt-1 text-xs text-stone-500 whitespace-pre-line">{p.sharh}</div>}
              <div className="mt-2"><ShareCopy text={`${p.title}\n${p.original_text || ""}\n${p.bangla_translation || ""}`} /></div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
