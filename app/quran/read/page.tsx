"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHead, ShareCopy, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import {
  BN_TRANSLATIONS, BN_TAFSIRS, stripHtml,
  type QuranChapter,
} from "../../../lib/quran";

type AyahLocal = { number: number; surahNumber: number; surahName: string; surahEnglish: string; numberInSurah: number; text: string; translation: string; page: number; juz: number };

// Reader: quran.com API (translations + tafsir + word-by-word + ayah audio)
// with the bundled offline database as fallback.
export default function QuranRead() {
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [surah, setSurah] = useState(1);
  const [transId, setTransId] = useState(161);
  const [tafsirId, setTafsirId] = useState(0);
  const [verses, setVerses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onlineFail, setOnlineFail] = useState(false);

  // offline fallback
  const [db, setDb] = useState<AyahLocal[]>([]);
  const [q, setQ] = useState("");
  const [marks, setMarks] = useState<number[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/quran/chapters").then((r) => r.json()).then((d) => {
      if (d.success) setChapters(d.chapters);
    }).catch(() => {});
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    try { setMarks(JSON.parse(localStorage.getItem("quran_bookmarks") || "[]")); } catch {}
    audioRef.current = new Audio();
    return () => audioRef.current?.pause();
  }, []);

  const loadVerses = useCallback(async (s: number, p: number, t: number, taf: number) => {
    setLoading(true);
    setOnlineFail(false);
    try {
      const params = new URLSearchParams({
        chapter: String(s), page: String(p), per_page: "20",
        translations: String(t), words: "1",
      });
      if (taf) params.set("tafsirs", String(taf));
      const res = await fetch(`/api/quran/verses?${params}`);
      const data = await res.json();
      if (data.error || !data.verses) throw new Error("fail");
      setVerses(data.verses);
      setPagination(data.pagination || null);
    } catch {
      setOnlineFail(true);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "online") {
      setPage(1);
      loadVerses(surah, 1, transId, tafsirId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, surah, transId, tafsirId]);

  const goPage = (p: number) => {
    setPage(p);
    loadVerses(surah, p, transId, tafsirId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const playAyah = async (key: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (playingKey === key) {
      el.paused ? el.play().catch(() => {}) : el.pause();
      return;
    }
    try {
      setPlayingKey(key);
      const res = await fetch(`/api/quran/chapter-audio?reciter=7&key=${encodeURIComponent(key)}`);
      const data = await res.json();
      const url = data.audio_files?.[0]?.url;
      if (!url) throw new Error();
      el.src = url;
      await el.play();
      el.onended = () => setPlayingKey(null);
    } catch {
      setPlayingKey(null);
    }
  };

  const toggleMark = (n: number) => {
    const next = marks.includes(n) ? marks.filter((x) => x !== n) : [...marks, n];
    setMarks(next);
    localStorage.setItem("quran_bookmarks", JSON.stringify(next));
  };

  const current = chapters.find((c) => c.id === surah);
  const totalPages = pagination?.total_pages || 1;

  const offlineAyahs = useMemo(() => {
    if (q.trim()) {
      const query = q.trim();
      return db.filter((a) => a.text.includes(query) || a.translation.includes(query)).slice(0, 100);
    }
    return db.filter((a) => a.surahNumber === surah);
  }, [db, surah, q]);

  const surahOptions = chapters.length
    ? chapters
    : db.length
      ? [...new Map(db.map((a) => [a.surahNumber, { id: a.surahNumber, name_simple: a.surahEnglish, name_arabic: a.surahName, translated_name: { name: "" } }])).values()]
      : [];

  return (
    <div className="animate-fade-up">
      <PageHead
        title={current ? current.name_arabic : "ডিজিটাল কুরআন"}
        subtitle={current ? `${current.translated_name?.name || current.name_simple} • ${current.verses_count} আয়াত • quran.com` : "quran.com + অফলাইন"}
        icon="book"
        backHref="/quran"
        action={
          <Link href="/quran/audio" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-ink transition hover:bg-gold-600 hover:text-white active:scale-95">
            <Icon name="headphones" size={14} /> অডিও
          </Link>
        }
      />

      {/* source + chapter */}
      <div className="card mt-3 space-y-2.5 p-3.5">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
          {(["online", "offline"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl py-2 text-[13px] font-bold transition ${mode === m ? "bg-primary-600 text-white shadow-card" : "text-ink-faint"}`}
            >
              {m === "online" ? "quran.com" : "অফলাইন"}
            </button>
          ))}
        </div>
        <select value={surah} onChange={(e) => setSurah(Number(e.target.value))} className="input" aria-label="surah">
          {surahOptions.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.name_arabic} — {s.translated_name?.name || s.name_simple}
            </option>
          ))}
        </select>
        {mode === "online" && (
          <div className="grid grid-cols-2 gap-2">
            <select value={transId} onChange={(e) => setTransId(Number(e.target.value))} className="input !text-[13px]" aria-label="translation">
              {BN_TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={tafsirId} onChange={(e) => setTafsirId(Number(e.target.value))} className="input !text-[13px]" aria-label="tafsir">
              <option value={0}>তাফসীর ছাড়া</option>
              {BN_TAFSIRS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {mode === "offline" && (
        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
            <Icon name="search" size={18} />
          </span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="আয়াত বা অনুবাদ খুঁজুন…" className="input !pl-11 !shadow-card" />
        </div>
      )}

      {/* online verses */}
      {mode === "online" && (
        <>
          {loading ? (
            <div className="mt-3 space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card animate-pulse p-4">
                  <div className="h-6 w-full rounded-xl bg-sand-dark" />
                  <div className="mt-2 h-3 w-3/4 rounded-full bg-sand-dark" />
                </div>
              ))}
            </div>
          ) : onlineFail ? (
            <div className="mt-3">
              <EmptyState icon="book" title="অনলাইন লোড হয়নি" hint="অফলাইন মোডে পড়ুন" />
              <button onClick={() => setMode("offline")} className="btn-primary mt-2 w-full">অফলাইনে পড়ুন</button>
            </div>
          ) : (
            <>
              <div className="mt-3 space-y-2.5">
                {verses.map((v: any) => {
                  const tr = v.translations?.[0]?.text || "";
                  const taf = v.tafsirs?.[0]?.text || "";
                  const isPlaying = playingKey === v.verse_key && !(audioRef.current?.paused ?? true);
                  return (
                    <div key={v.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <span className="ayah-badge">{v.verse_key}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => playAyah(v.verse_key)}
                            aria-label="play ayah"
                            className={`rounded-xl p-2 transition active:scale-95 ${playingKey === v.verse_key ? "bg-primary-600 text-white" : "text-primary-700 hover:bg-primary-50"}`}
                          >
                            <Icon name={isPlaying ? "pause" : "playfill"} size={16} />
                          </button>
                          <button
                            onClick={() => toggleMark(v.id)}
                            aria-label="bookmark"
                            className={`rounded-xl p-2 transition active:scale-95 ${marks.includes(v.id) ? "bg-gold-light text-gold-600" : "text-ink-faint hover:bg-sand"}`}
                          >
                            <Icon name="bookmark" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="font-arabic mt-2 text-[24px]" dir="rtl">{v.text_uthmani}</div>
                      {tr && <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{stripHtml(tr)}</div>}
                      {v.words?.length > 0 && (
                        <details className="mt-2.5 rounded-2xl bg-sand p-3">
                          <summary className="cursor-pointer text-[13px] font-bold text-primary-700">
                            শব্দ-শব্দ অর্থ ({v.words.length})
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-1.5" dir="rtl">
                            {v.words.filter((w: any) => w.char_type_name === "word").map((w: any) => (
                              <span key={w.id} className="rounded-xl border border-primary-900/10 bg-white px-2.5 py-1.5 text-center">
                                <span className="font-arabic block text-[17px] leading-snug">{w.text_uthmani}</span>
                                <span className="block text-[10px] text-ink-faint" dir="ltr">{w.transliteration?.text || w.translation?.text || ""}</span>
                              </span>
                            ))}
                          </div>
                        </details>
                      )}
                      {taf && (
                        <details className="mt-2 rounded-2xl bg-gold-light/60 p-3">
                          <summary className="cursor-pointer text-[13px] font-bold text-gold-dark">তাফসীর পড়ুন</summary>
                          <div className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed">{stripHtml(taf).slice(0, 2000)}</div>
                        </details>
                      )}
                      <div className="mt-3">
                        <ShareCopy text={`${v.text_uthmani}\n${stripHtml(tr)}\n(${v.verse_key})`} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="btn-outline disabled:opacity-40">
                    <Icon name="back" size={15} /> আগে
                  </button>
                  <span className="text-xs font-bold tabular-nums text-ink-faint">পৃষ্ঠা {page} / {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="btn-outline disabled:opacity-40">
                    পরে <Icon name="chevron" size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* offline verses */}
      {mode === "offline" && (
        <div className="mt-3 space-y-2.5">
          {offlineAyahs.map((a) => (
            <div key={a.number} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="ayah-badge">{a.surahNumber}:{a.numberInSurah}</span>
                <span className="text-[11px] font-bold text-ink-faint">পৃষ্ঠা {a.page} • জুজ {a.juz}</span>
              </div>
              <div className="font-arabic mt-2 text-[23px]" dir="rtl">{a.text}</div>
              <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a.translation}</div>
              <div className="mt-3"><ShareCopy text={`${a.text}\n${a.translation}\n(সূরা ${a.surahEnglish} ${a.surahNumber}:${a.numberInSurah})`} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
