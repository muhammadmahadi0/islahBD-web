"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShareCopy } from "../../../components/ui";

type Ayah = { number: number; surahNumber: number; surahName: string; surahEnglish: string; numberInSurah: number; text: string; translation: string; page: number; juz: number };

export default function QuranRead() {
  const [db, setDb] = useState<Ayah[]>([]);
  const [surah, setSurah] = useState(1);
  const [q, setQ] = useState("");
  const [marks, setMarks] = useState<number[]>([]);

  useEffect(() => {
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    setMarks(JSON.parse(localStorage.getItem("quran_bookmarks") || "[]"));
  }, []);

  const surahs = useMemo(() => {
    const m = new Map<number, Ayah>();
    for (const a of db) if (!m.has(a.surahNumber)) m.set(a.surahNumber, a);
    return [...m.values()];
  }, [db]);

  const ayahs = useMemo(() => {
    let list = db.filter((a) => a.surahNumber === surah);
    if (q.trim()) list = db.filter((a) => a.text.includes(q) || a.translation.includes(q)).slice(0, 100);
    return list;
  }, [db, surah, q]);

  const toggleMark = (n: number) => {
    const next = marks.includes(n) ? marks.filter((x) => x !== n) : [...marks, n];
    setMarks(next);
    localStorage.setItem("quran_bookmarks", JSON.stringify(next));
  };

  return (
    <div>
      <Link href="/quran" className="text-primary text-sm font-semibold">← কুরআন হোম</Link>
      <h1 className="text-2xl font-bold mt-1">ডিজিটাল কুরআন + হাফেজি মুসহাফ</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 আয়াত / অনুবাদ খুঁজুন…" className="input mt-3" />
      <div className="flex gap-2 mt-3">
        <select value={surah} onChange={(e) => setSurah(Number(e.target.value))} className="input">
          {surahs.map((s) => (
            <option key={s.surahNumber} value={s.surahNumber}>
              {s.surahNumber}. {s.surahEnglish}
            </option>
          ))}
        </select>
        <Link href="/quran/audio" className="btn-primary whitespace-nowrap">🎧 অডিও</Link>
      </div>
      <div className="text-xs text-stone-400 mt-2">🔖 বুকমার্ক: {marks.length} • পৃষ্ঠা/জুজ তথ্যসহ • {ayahs.length} আয়াত</div>
      <div className="space-y-2 mt-2">
        {ayahs.map((a) => (
          <div key={a.number} className="card p-3.5">
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>{a.surahNumber}:{a.numberInSurah} • পৃষ্ঠা {a.page} • জুজ {a.juz}</span>
              <button onClick={() => toggleMark(a.number)}>{marks.includes(a.number) ? "🔖" : "📑"}</button>
            </div>
            <div className="font-arabic text-[22px] leading-[2.2]" dir="rtl">{a.text}</div>
            <div className="text-sm text-stone-600 mt-1">{a.translation}</div>
            <div className="mt-2"><ShareCopy text={`${a.text}\n${a.translation}\n(সূরা ${a.surahEnglish} ${a.surahNumber}:${a.numberInSurah})`} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
