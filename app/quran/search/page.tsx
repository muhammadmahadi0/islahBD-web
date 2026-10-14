"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";

export default function QuranSearch() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [db, setDb] = useState<any[]>([]);
  const [irab, setIrab] = useState<any>(null);
  const [hits, setHits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    fetch("/data/quran_irab.json").then((r) => r.json()).then(setIrab).catch(() => {});
  }, []);

  useEffect(() => {
    if (!submitted.trim()) return setHits([]);
    const query = submitted.trim();
    setHits(db.filter((a: any) => a.text.includes(query) || a.translation.includes(query)).slice(0, 60));
  }, [submitted, db]);

  return (
    <div className="animate-fade-up">
      <PageHead title="সার্চ ও ইরাব" subtitle={`শব্দ-শব্দ অর্থ • ব্যাকরণ${irab ? " ✓" : ""}`} icon="search" backHref="/quran" />
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="আরবি বা বাংলা লিখুন…" className="input !pl-11 !shadow-card" />
      </form>
      {submitted.trim() !== "" && (
        <div className="mb-2 mt-3 text-xs font-bold text-ink-faint">{hits.length}টি ফলাফল</div>
      )}
      <div className="space-y-2.5">
        {hits.map((a: any) => (
          <div key={a.number} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="ayah-badge">{a.surahNumber}:{a.numberInSurah}</span>
              <span className="text-[11px] font-bold text-ink-faint">{a.surahEnglish}</span>
            </div>
            <div className="font-arabic mt-2 text-[22px]" dir="rtl">{a.text}</div>
            <div className="mt-1 text-sm text-ink-soft">{a.translation}</div>
            {irab?.[String(a.surahNumber)]?.[String(a.numberInSurah)] && (
              <details className="mt-2.5 rounded-2xl bg-sand p-3 text-[13px]">
                <summary className="cursor-pointer font-bold text-primary-700">ইরাব (ব্যাকরণ) দেখুন</summary>
                <p className="font-arabic mt-1.5 whitespace-pre-line text-[16px]" dir="rtl">
                  {irab[String(a.surahNumber)][String(a.numberInSurah)]}
                </p>
              </details>
            )}
            <a
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700"
              target="_blank" rel="noreferrer"
              href={`https://api.quran.com/api/v4/verses/by_key/${a.surahNumber}:${a.numberInSurah}?words=true&word_fields=text_uthmani,audio_url&translation_fields=text&language=bn`}
            >
              <Icon name="globe" size={14} /> শব্দ-শব্দ JSON দেখুন
            </a>
          </div>
        ))}
        {submitted.trim() !== "" && hits.length === 0 && (
          <EmptyState icon="search" title="কিছু পাওয়া যায়নি" />
        )}
      </div>
    </div>
  );
}
