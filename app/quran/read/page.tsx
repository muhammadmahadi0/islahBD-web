"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHead, ShareCopy, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";

type Ayah = { number: number; surahNumber: number; surahName: string; surahEnglish: string; numberInSurah: number; text: string; translation: string; page: number; juz: number };

export default function QuranRead() {
  const [db, setDb] = useState<Ayah[]>([]);
  const [surah, setSurah] = useState(1);
  const [q, setQ] = useState("");
  const [marks, setMarks] = useState<number[]>([]);

  useEffect(() => {
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    try { setMarks(JSON.parse(localStorage.getItem("quran_bookmarks") || "[]")); } catch {}
  }, []);

  const surahs = useMemo(() => {
    const m = new Map<number, Ayah>();
    for (const a of db) if (!m.has(a.surahNumber)) m.set(a.surahNumber, a);
    return [...m.values()];
  }, [db]);

  const ayahs = useMemo(() => {
    if (q.trim()) {
      const query = q.trim();
      return db.filter((a) => a.text.includes(query) || a.translation.includes(query)).slice(0, 100);
    }
    return db.filter((a) => a.surahNumber === surah);
  }, [db, surah, q]);

  const toggleMark = (n: number) => {
    const next = marks.includes(n) ? marks.filter((x) => x !== n) : [...marks, n];
    setMarks(next);
    localStorage.setItem("quran_bookmarks", JSON.stringify(next));
  };

  const current = surahs.find((s) => s.surahNumber === surah);

  return (
    <div className="animate-fade-up">
      <PageHead
        title={current ? `${current.surahEnglish}` : "ডিজিটাল কুরআন"}
        subtitle={current ? `${current.surahName} • ${ayahs.length} আয়াত • 🔖 ${marks.length} বুকমার্ক` : "লোড হচ্ছে…"}
        icon="book"
        backHref="/quran"
        action={
          <Link href="/quran/audio" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-ink transition hover:bg-gold-600 hover:text-white active:scale-95">
            <Icon name="headphones" size={14} /> অডিও
          </Link>
        }
      />

      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="আয়াত বা অনুবাদ খুঁজুন…" className="input !pl-11 !shadow-card" />
      </div>

      {!q.trim() && (
        <div className="mt-3 flex gap-2">
          <select value={surah} onChange={(e) => setSurah(Number(e.target.value))} className="input !shadow-card" aria-label="surah">
            {surahs.map((s) => (
              <option key={s.surahNumber} value={s.surahNumber}>
                {s.surahNumber}. {s.surahEnglish}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {ayahs.length === 0 && db.length > 0 && <EmptyState icon="search" title="কিছু পাওয়া যায়নি" />}
        {ayahs.map((a) => (
          <div key={a.number} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="ayah-badge">{a.surahNumber}:{a.numberInSurah}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-ink-faint">পৃষ্ঠা {a.page} • জুজ {a.juz}</span>
                <button
                  onClick={() => toggleMark(a.number)}
                  aria-label="bookmark"
                  className={`rounded-xl p-1.5 transition active:scale-95 ${marks.includes(a.number) ? "bg-gold-light text-gold-600" : "text-ink-faint hover:bg-sand"}`}
                >
                  <Icon name="bookmark" size={17} />
                </button>
              </div>
            </div>
            <div className="font-arabic mt-2 text-[23px]" dir="rtl">{a.text}</div>
            <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a.translation}</div>
            <div className="mt-3"><ShareCopy text={`${a.text}\n${a.translation}\n(সূরা ${a.surahEnglish} ${a.surahNumber}:${a.numberInSurah})`} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
