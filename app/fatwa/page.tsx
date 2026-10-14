"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function FatwaPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [qs, setQs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch("https://api.islahbd.com/api/fatwa-categories/").then((r) => r.json()).then((d) => setCats(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    fetch("https://api.islahbd.com/api/fatwa/").then((r) => r.json()).then((d) => setQs(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);
  const list = qs.filter((x: any) => !q.trim() || JSON.stringify(x).includes(q.trim())).slice(0, 40);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">❓ শরঈ জিজ্ঞাসা (Fatwa)</h1>
      <div className="flex gap-2 overflow-x-auto py-2">{cats.slice(0, 20).map((c: any, i: number) => <span key={i} className="chip whitespace-nowrap">{c.title || c.name}</span>)}</div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 প্রশ্ন খুঁজুন…" className="input" />
      <details className="card p-4 mt-2">
        <summary className="font-bold cursor-pointer">➕ নতুন প্রশ্ন করুন (AskQuestionModal)</summary>
        <form className="space-y-2 mt-2" onSubmit={(e) => { e.preventDefault(); alert("প্রশ্ন জমা হয়েছে ✓ (ডেমো)"); }}>
          <input required placeholder="আপনার নাম" className="input" />
          <textarea required placeholder="প্রশ্ন লিখুন…" className="input" />
          <button className="btn-primary w-full">পাঠান (/api/fatwa/ask/)</button>
        </form>
      </details>
      <div className="space-y-2 mt-2">
        {list.map((x: any, i: number) => (
          <details key={i} className="card p-3.5">
            <summary className="font-bold cursor-pointer text-sm">{x.question || x.title || `প্রশ্ন ${i + 1}`}</summary>
            <div className="text-sm mt-1 whitespace-pre-line">{x.answer || x.fatwa || "উত্তর শীঘ্রই…"}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
