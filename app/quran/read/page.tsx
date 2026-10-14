"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHead, ShareCopy, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import {
  BN_TRANSLATIONS, BN_TAFSIRS, stripHtml,
  type QuranChapter,
} from "../../../lib/quran";
import { surahBnFull } from "../../../lib/surah-names";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArNum = (n: number) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);

/** Unified reader: quran.com first, local database fills gaps and takes
 *  over seamlessly when offline — no mode switching needed. */
function Reader() {
  const params = useSearchParams();
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [surah, setSurah] = useState(Number(params.get("surah")) || 1);
  const [transId, setTransId] = useState(161);
  const [tafsirId, setTafsirId] = useState(165);
  const [showTafsir, setShowTafsir] = useState(true);
  const [showWbw, setShowWbw] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [fontSize, setFontSize] = useState(26);
  const [verses, setVerses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [db, setDb] = useState<any[]>([]);
  const [marks, setMarks] = useState<number[]>([]);
  const [openTafsir, setOpenTafsir] = useState<number | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/quran/chapters").then((r) => r.json()).then((d) => {
      if (d.success) setChapters(d.chapters);
    }).catch(() => {});
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    try { setMarks(JSON.parse(localStorage.getItem("quran_bookmarks") || "[]")); } catch {}
    audioRef.current = new Audio();
    const el = audioRef.current;
    el.addEventListener("ended", () => setPlayingKey(null));
    return () => el.pause();
  }, []);

  // Local ayahs keyed by "surah:ayah" for gap-filling + offline mode
  const dbByKey = (s: number, n: number) =>
    db.find((a: any) => a.surahNumber === s && a.numberInSurah === n);

  const loadVerses = useCallback(async (s: number, p: number, t: number, taf: number) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams({
        chapter: String(s), page: String(p), per_page: "20",
        translations: String(t), words: "1",
      });
      if (taf) qp.set("tafsirs", String(taf));
      const res = await fetch(`/api/quran/verses?${qp}`);
      const data = await res.json();
      if (data.error || !data.verses) throw new Error("fail");
      setVerses(data.verses);
      setPagination(data.pagination || null);
      setOffline(false);
    } catch {
      setVerses([]);
      setPagination(null);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadVerses(surah, 1, transId, tafsirId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah, transId, tafsirId]);

  const goPage = (p: number) => {
    setPage(p);
    loadVerses(surah, p, transId, tafsirId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeSurah = (s: number) => {
    if (s < 1 || s > 114) return;
    setSurah(s);
    window.scrollTo({ top: 0 });
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
  const offlineAyahs = db.filter((a: any) => a.surahNumber === surah);

  const translitOf = (v: any) =>
    (v.words || [])
      .filter((w: any) => w.char_type_name === "word" && w.transliteration?.text)
      .map((w: any) => w.transliteration.text)
      .join(" ");

  const chapterOptions = chapters.length
    ? chapters
    : Array.from({ length: 114 }, (_, i) => ({
        id: i + 1, name_arabic: "", name_simple: "", translated_name: { name: "" },
      } as any));

  const renderVerse = (v: any) => {
    // Gap-fill: missing online translation/page/juz falls back to local DB.
    // Verse text prefers Uthmani, then Imlaei, then the offline database —
    // so the Arabic line can never come back blank again.
    const local = dbByKey(surah, v.verse_number);
    const arabic = v.text_uthmani || v.text_imlaei || local?.text || "";
    const tr = stripHtml(v.translations?.[0]?.text || "") || local?.translation || "";
    const taf = v.tafsirs?.[0]?.text || "";
    const playing = playingKey === v.verse_key && !(audioRef.current?.paused ?? true);
    const marked = marks.includes(v.id);
    return (
      <article key={v.id} className="card overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="chip">{v.verse_key}</span>
            <div className="flex items-center gap-0.5">
              <button className={`verse-action ${playing ? "on" : ""}`} aria-label="play" onClick={() => playAyah(v.verse_key)}>
                <Icon name={playing ? "pause" : "playfill"} size={16} />
              </button>
              <button className={`verse-action ${marked ? "on !bg-gold !text-white" : ""}`} aria-label="bookmark" onClick={() => toggleMark(v.id)}>
                <Icon name="bookmark" size={16} />
              </button>
              {taf && showTafsir && (
                <button
                  className={`verse-action ${openTafsir === v.id ? "on" : ""}`}
                  aria-label="tafsir"
                  onClick={() => setOpenTafsir(openTafsir === v.id ? null : v.id)}
                >
                  <Icon name="doc" size={16} />
                </button>
              )}
            </div>
          </div>
          <p className="font-arabic text-right" dir="rtl" style={{ fontSize }}>
            {arabic}
            <span className="ayah-end">{toArNum(v.verse_number)}</span>
          </p>
          {showTranslit && translitOf(v) && (
            <p className="mt-1.5 text-[13px] italic text-ink-faint" dir="ltr">{translitOf(v)}</p>
          )}
          {tr && (
            <p className="mt-2.5 border-l-[3px] border-primary-200 pl-3 text-[15px] leading-relaxed text-ink">{tr}</p>
          )}
          {(v.page_number || local) && (
            <p className="mt-1.5 text-[11px] font-bold text-ink-faint">
              পৃষ্ঠা {v.page_number || local?.page} • জুজ {v.juz_number || local?.juz}
            </p>
          )}
        </div>
        {showWbw && v.words?.length > 0 && (
          <div className="border-t border-primary-900/10 bg-sand/70 px-4 py-3">
            <div className="flex flex-wrap gap-1.5" dir="rtl">
              {v.words.filter((w: any) => w.char_type_name === "word").map((w: any) => (
                <span key={w.id} className="inner-box rounded-xl border border-primary-900/10 bg-white px-2.5 py-1.5 text-center">
                  <span className="font-arabic block text-[18px] leading-snug">{w.text_uthmani}</span>
                  <span className="block text-[10px] font-bold text-primary-700" dir="ltr">{w.transliteration?.text || ""}</span>
                  <span className="block text-[10px] text-ink-faint" dir="ltr">{w.translation?.text || ""}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {taf && showTafsir && openTafsir === v.id && (
          <div className="border-t border-gold/30 bg-gold-light/50 px-4 py-3 sm:px-5">
            <div className="mb-1 text-xs font-bold text-gold-dark">তাফসীর</div>
            <div className="whitespace-pre-line text-[13px] leading-relaxed">{stripHtml(taf).slice(0, 3000)}</div>
          </div>
        )}
        <div className="border-t border-primary-900/5 px-4 py-2.5 sm:px-5">
          <ShareCopy text={`${arabic}\n${tr}\n(${v.verse_key})`} />
        </div>
      </article>
    );
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-ink-faint">
        <Link href="/" className="hover:text-primary-700">হোম</Link>
        <Icon name="chevron" size={12} />
        <Link href="/quran" className="hover:text-primary-700">কুরআন</Link>
        <Icon name="chevron" size={12} />
        <span className="text-primary-700">{surahBnFull(surah)}</span>
      </div>

      <div className="page-hero p-6 text-center">
        <div className="relative z-10">
          <div className="font-arabic text-4xl text-white" dir="rtl">{current?.name_arabic || ""}</div>
          <h1 className="mt-1 text-xl font-bold">{surahBnFull(surah)}</h1>
          <p className="mt-0.5 text-xs text-white/75">
            অর্থ: {current?.translated_name?.name || current?.name_simple || ""}
            {current ? ` • ${current.name_simple} • ${current.revelation_place === "makkah" ? "মাক্কী" : "মাদানী"} • ${current.verses_count} আয়াত` : ""}
          </p>
          {offline && (
            <p className="mx-auto mt-2 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-[#1a1405]">
              অফলাইন ডাটাবেজ দেখানো হচ্ছে
            </p>
          )}
          <div className="mx-auto mt-3 flex max-w-md items-center gap-2">
            <button
              onClick={() => changeSurah(surah - 1)} disabled={surah <= 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-30"
              aria-label="previous surah"
            >
              <Icon name="back" size={17} />
            </button>
            <select value={surah} onChange={(e) => changeSurah(Number(e.target.value))} className="input !border-white/20 !bg-white/10 !text-center !text-white [&>option]:text-ink" aria-label="surah">
              {chapterOptions.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.id}. {surahBnFull(c.id)}{c.translated_name?.name ? ` — ${c.translated_name.name}` : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => changeSurah(surah + 1)} disabled={surah >= 114}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-30"
              aria-label="next surah"
            >
              <Icon name="chevron" size={17} />
            </button>
          </div>
        </div>
      </div>

      {surah !== 1 && surah !== 9 && (
        <div className="card mt-3 p-5 text-center">
          <div className="font-arabic text-3xl text-primary-700" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
        </div>
      )}

      {/* reading settings */}
      <div className="card mt-3 space-y-2.5 p-3.5">
        <div className="grid grid-cols-2 gap-2">
          <select value={transId} onChange={(e) => setTransId(Number(e.target.value))} className="input !text-[13px]" aria-label="translation">
            {BN_TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select
            value={tafsirId}
            onChange={(e) => { setTafsirId(Number(e.target.value)); setShowTafsir(true); }}
            className="input !text-[13px]"
            aria-label="tafsir"
          >
            <option value={0}>তাফসীর ছাড়া</option>
            {BN_TAFSIRS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["wbw", showWbw, setShowWbw, "শব্দ-শব্দ"],
              ["tr", showTranslit, setShowTranslit, "উচ্চারণ"],
              ["tf", showTafsir, setShowTafsir, "তাফসীর"],
            ] as const
          ).map(([id, on, set, label]) => (
            <button key={id} onClick={() => set(!on)} className={`chip !px-3.5 !py-2 ${on ? "chip-active" : ""}`}>
              {on && <Icon name="check" size={13} />}
              {label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1">
            <button className="verse-action !h-8 !w-8" aria-label="smaller" onClick={() => setFontSize((f) => Math.max(20, f - 2))}>−</button>
            <span className="text-[11px] font-bold text-ink-faint">অক্ষর</span>
            <button className="verse-action !h-8 !w-8" aria-label="bigger" onClick={() => setFontSize((f) => Math.min(36, f + 2))}>+</button>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-5">
              <div className="ml-auto h-7 w-3/4 rounded-xl bg-sand-dark" />
              <div className="mt-3 h-3 w-full rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : !offline ? (
        <>
          <div className="mt-3 space-y-3">{verses.map(renderVerse)}</div>
          {totalPages > 1 && (
            <div className="card mt-3 flex items-center justify-between p-3">
              <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="btn-outline disabled:opacity-40">
                <Icon name="back" size={15} /> আগে
              </button>
              <span className="text-xs font-bold tabular-nums text-ink-faint">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="btn-outline disabled:opacity-40">
                পরে <Icon name="chevron" size={15} />
              </button>
            </div>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button disabled={surah <= 1} onClick={() => changeSurah(surah - 1)} className="btn-ghost disabled:opacity-40">
              <Icon name="back" size={15} /> আগের সূরা
            </button>
            <button disabled={surah >= 114} onClick={() => changeSurah(surah + 1)} className="btn-ghost disabled:opacity-40">
              পরের সূরা <Icon name="chevron" size={15} />
            </button>
          </div>
        </>
      ) : offlineAyahs.length === 0 ? (
        <div className="mt-3"><EmptyState icon="book" title="ডাটাবেজ লোড হয়নি" /></div>
      ) : (
        <div className="mt-3 space-y-3">
          {offlineAyahs.map((a: any) => (
            <article key={a.number} className="card p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="chip">{a.surahNumber}:{a.numberInSurah}</span>
                <span className="text-[11px] font-bold text-ink-faint">পৃষ্ঠা {a.page} • জুজ {a.juz}</span>
              </div>
              <p className="font-arabic text-right" dir="rtl" style={{ fontSize }}>
                {a.text}
                <span className="ayah-end">{toArNum(a.numberInSurah)}</span>
              </p>
              <p className="mt-2.5 border-l-[3px] border-primary-200 pl-3 text-[15px] leading-relaxed">{a.translation}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuranReadPage() {
  return (
    <Suspense>
      <Reader />
    </Suspense>
  );
}
