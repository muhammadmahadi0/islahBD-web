"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import type { QuranChapter, QuranReciter } from "../../../lib/quran";
import { storageSetJSON, storageGetJSON } from "../../../lib/storage";
import { surahBnFull } from "../../../lib/surah-names";
import { useLang, useTx } from "../../../store/language-store";

// Audio Quran — reciters + chapter streaming from quran.com API.
export default function QuranAudio() {
  const tx = useTx();
  const lang = useLang();
  const [reciters, setReciters] = useState<QuranReciter[]>([]);
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [reciter, setReciter] = useState(7);
  const [surah, setSurah] = useState(1);
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/quran/recitations").then((r) => r.json()).then((d) => {
      if (d.success) setReciters(d.recitations);
    }).catch(() => {});
    fetch("/api/quran/chapters").then((r) => r.json()).then((d) => {
      if (d.success) setChapters(d.chapters);
    }).catch(() => {});
    try { setSaved(storageGetJSON<number[]>("quran_audio_saved", [])); } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quran/chapter-audio?reciter=${reciter}&chapter=${surah}`)
      .then((r) => r.json())
      .then((d) => setSrc(d.audio_file?.audio_url || ""))
      .catch(() => setSrc(""))
      .finally(() => setLoading(false));
  }, [reciter, surah]);

  const save = (s: number) => {
    const next = saved.includes(s) ? saved : [...saved, s];
    setSaved(next);
    storageSetJSON("quran_audio_saved", next);
  };

  const current = chapters.find((c) => c.id === surah);
  const reciterName = reciters.find((r) => r.id === reciter)?.reciter_name || "";
  const surahLabel = (id: number) => {
    if (lang === "bn") return surahBnFull(id);
    const chapter = chapters.find((c) => c.id === id);
    return chapter
      ? (lang === "ur" ? chapter.name_arabic : chapter.name_simple)
      : `${tx("সূরা")} ${id}`;
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("অডিও কুরআন")}
        subtitle={current ? `${current.name_arabic} • ${reciterName}` : tx("quran.com তিলাওয়াত")}
        icon="headphones"
        backHref="/quran"
      />
      <div className="card mt-3 space-y-3 p-4">
        <label className="block text-sm font-bold">
          {tx("ক্বারী")} ({reciters.length})
          <select value={reciter} onChange={(e) => setReciter(Number(e.target.value))} className="input mt-1.5">
            {reciters.map((r) => (
              <option key={`${r.id}-${r.style}`} value={r.id}>
                {r.reciter_name}{r.style ? ` (${r.style})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          {tx("সূরা")}
          <select value={surah} onChange={(e) => setSurah(Number(e.target.value))} className="input mt-1.5">
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}. {surahLabel(c.id)}
              </option>
            ))}
          </select>
        </label>
        {loading ? (
          <div className="h-12 animate-pulse rounded-2xl bg-sand" />
        ) : src ? (
          <audio key={src} controls src={src} className="w-full" preload="none" />
        ) : (
          <EmptyState icon="headphones" title={tx("অডিও পাওয়া যায়নি")} />
        )}
        <div className="flex gap-2">
          {src && (
            <a href={src} download className="btn-primary flex-1">
              <Icon name="download" size={16} /> {tx("ডাউনলোড")}
            </a>
          )}
          <button className="btn-gold flex-1" onClick={() => save(surah)}>
            <Icon name="plus" size={16} /> {tx("সংগ্রহে রাখুন")}
          </button>
        </div>
      </div>
      {saved.length > 0 && (
        <div className="card mt-2 p-4">
          <div className="mb-2 text-sm font-bold">{tx("আমার সংগ্রহ")} ({saved.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {saved.map((s) => (
              <button key={s} onClick={() => setSurah(s)} className="chip">{surahLabel(s)}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
