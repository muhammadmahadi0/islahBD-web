"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuranSearch() {
  const [q, setQ] = useState("");
  const [db, setDb] = useState<any[]>([]);
  const [irab, setIrab] = useState<any>(null);
  const [hits, setHits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    fetch("/data/quran_irab.json").then((r) => r.json()).then(setIrab).catch(() => {});
  }, []);

  useEffect(() => {
    if (!q.trim()) return setHits([]);
    const query = q.trim();
    setHits(db.filter((a: any) => a.text.includes(query) || a.translation.includes(query)).slice(0, 60));
  }, [q, db]);

  return (
    <div>
      <Link href="/quran" className="text-primary text-sm font-semibold">← কুরআন হোম</Link>
      <h1 className="text-2xl font-bold mt-1">সার্চ • WBW • ইরাব</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="আরবি বা বাংলা লিখুন…" className="input mt-3" />
      <div className="text-xs text-stone-400 mt-2">{hits.length} ফলাফল {irab ? "• ইরাব ডাটাবেজ লোডেড ✓" : ""}</div>
      <div className="space-y-2 mt-2">
        {hits.map((a: any) => (
          <div key={a.number} className="card p-3.5">
            <div className="text-[11px] text-stone-400">সূরা {a.surahEnglish} {a.surahNumber}:{a.numberInSurah}</div>
            <div className="font-arabic text-xl leading-loose" dir="rtl">{a.text}</div>
            <div className="text-sm">{a.translation}</div>
            {irab?.[String(a.surahNumber)]?.[String(a.numberInSurah)] && (
              <details className="mt-2 text-xs bg-ivory rounded-xl p-2.5">
                <summary className="font-bold cursor-pointer">📘 ইরাব (ব্যাকরণ)</summary>
                <p className="whitespace-pre-line mt-1" dir="rtl">{irab[String(a.surahNumber)][String(a.numberInSurah)]}</p>
              </details>
            )}
            <a className="text-primary text-xs font-bold" target="_blank" href={`https://api.quran.com/api/v4/verses/by_key/${a.surahNumber}:${a.numberInSurah}?words=true&word_fields=text_uthmani,audio_url&translation_fields=text&language=bn`}>
              WBW JSON (quran.com) ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
