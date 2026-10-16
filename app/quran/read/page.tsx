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
import { surahBnFull, surahBn } from "../../../lib/surah-names";
import { storageSetJSON, storageGetJSON } from "../../../lib/storage";
import { bnNum } from "../../../lib/audio";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArNum = (n: number) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);

type Jump = "sura" | "juz";

/** Complete reader (muslimbangla feature set): sura + para modes, up to two
 *  stacked Bengali translations, tafsir, word-by-word, transliteration,
 *  per-ayah + full-surah audio, bookmarks, font size, ayah deep-links and
 *  dedicated tafsir pages — with offline auto-fallback throughout. */
function Reader() {
  const params = useSearchParams();
  const [jump, setJump] = useState<Jump>("sura");
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [surah, setSurah] = useState(Number(params.get("surah")) || 1);
  const [juz, setJuz] = useState(30);
  const [trans1, setTrans1] = useState(161);
  const [trans2, setTrans2] = useState(0);
  const [tafsirId, setTafsirId] = useState(165);
  const [showTafsir, setShowTafsir] = useState(true);
  const [showWbw, setShowWbw] = useState(false);
  const [fontSize, setFontSize] = useState(26);
  const [verses, setVerses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [db, setDb] = useState<any[]>([]);
  const [marks, setMarks] = useState<number[]>([]);
  const [openTafsir, setOpenTafsir] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [surahAudio, setSurahAudio] = useState("");
  const [surahAudioOn, setSurahAudioOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const deepAyah = useRef<string | null>(params.get("ayah"));

  useEffect(() => {
    fetch("/api/quran/chapters").then((r) => r.json()).then((d) => {
      if (d.success) setChapters(d.chapters);
    }).catch(() => {});
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    setMarks(storageGetJSON<number[]>("quran_bookmarks", []));
    audioRef.current = new Audio();
    const el = audioRef.current;
    el.addEventListener("ended", () => setPlayingKey(null));
    return () => el.pause();
  }, []);

  const dbByKey = (s: number, n: number) =>
    db.find((a: any) => a.surahNumber === s && a.numberInSurah === n);

  const transParam = [trans1, trans2].filter((t) => t > 0).join(",") || "161";

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams({
        page: String(p),
        per_page: jump === "sura" ? "20" : "50",
        translations: transParam,
        words: "1",
      });
      if (tafsirId) qp.set("tafsirs", String(tafsirId));
      const url =
        jump === "sura"
          ? `/api/quran/verses?chapter=${surah}&${qp}`
          : `/api/quran/juz?juz=${juz}&${qp}`;
      const res = await fetch(url);
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
  }, [jump, surah, juz, transParam, tafsirId]);

  useEffect(() => {
    setPage(1);
    setSurahAudioOn(false);
    setSurahAudio("");
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump, surah, juz, trans1, trans2, tafsirId]);

  // Deep-link ?surah=N&ayah=M — jump to its page, then scroll + flash it.
  useEffect(() => {
    const target = deepAyah.current;
    if (!target || offline || loading || verses.length === 0 || jump !== "sura") return;
    const n = Number(target);
    if (!n) return;
    const perPage = 20;
    const wantPage = Math.ceil(n / perPage);
    if (wantPage !== page) {
      setPage(wantPage);
      load(wantPage);
      return;
    }
    deepAyah.current = null;
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`ayah-${surah}:${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, loading, offline]);

  const goPage = (p: number) => {
    deepAyah.current = null;
    setPage(p);
    load(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAyah = (key: string) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`ayah-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    });
  };

  // Jump to a specific ayah of the current surah (the ayah scrollbar).
  const jumpToAyah = (n: number) => {
    if (!n) return;
    const key = `${surah}:${n}`;
    if (offline) {
      scrollToAyah(key);
      return;
    }
    const want = Math.ceil(n / 20);
    if (want !== page) {
      deepAyah.current = String(n);
      setPage(want);
      load(want);
    } else {
      deepAyah.current = null;
      scrollToAyah(key);
    }
  };

  const changeSurah = (s: number) => {
    if (s < 1 || s > 114) return;
    deepAyah.current = null;
    setSurah(s);
    window.scrollTo({ top: 0 });
  };

  const playAyah = async (key: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (playingKey === key) {
      if (el.paused) {
        const p = (await import("../../../lib/storage")).tryPlay(el);
        if (p) p.catch(() => setPlayingKey(null));
      } else {
        try {
          el.pause();
        } catch {
          // ignore
        }
      }
      return;
    }
    try {
      setPlayingKey(key);
      const res = await fetch(`/api/quran/chapter-audio?reciter=7&key=${encodeURIComponent(key)}`);
      const data = await res.json();
      const url = data.audio_files?.[0]?.url;
      if (!url) throw new Error();
      el.src = url;
      const { tryPlay } = await import("../../../lib/storage");
      const p = tryPlay(el);
      if (p) await p;
    } catch {
      setPlayingKey(null);
    }
  };

  const toggleMark = (n: number) => {
    const next = marks.includes(n) ? marks.filter((x) => x !== n) : [...marks, n];
    setMarks(next);
    storageSetJSON("quran_bookmarks", next);
  };

  const current = chapters.find((c) => c.id === surah);
  const totalPages = pagination?.total_pages || 1;
  const offlineAyahs = db.filter((a: any) =>
    jump === "sura" ? a.surahNumber === surah : a.juz === juz
  );

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

  // Group juz verses under surah sub-headers (muslimbangla para view).
  const groups: { surah: number; items: any[] }[] = [];
  if (jump === "juz" && !offline) {
    for (const v of verses) {
      const s = Number(String(v.verse_key).split(":")[0]);
      const g = groups[groups.length - 1];
      if (g && g.surah === s) g.items.push(v);
      else groups.push({ surah: s, items: [v] });
    }
  }

  const renderVerse = (v: any) => {
    const [sNum, aNum] = String(v.verse_key || `${surah}:${v.verse_number}`).split(":").map(Number);
    const local = dbByKey(sNum, v.verse_number || aNum);
    const arabic = v.text_uthmani || v.text_imlaei || local?.text || "";
    const trs = (v.translations || [])
      .map((t: any) => stripHtml(t.text || ""))
      .filter(Boolean);
    if (trs.length === 0 && local?.translation) trs.push(local.translation);
    const taf = v.tafsirs?.[0]?.text || "";
    const playing = playingKey === v.verse_key && !(audioRef.current?.paused ?? true);
    const marked = marks.includes(v.id);
    const tafsirOpen = openTafsir === v.verse_key;
    return (
      <article key={v.id || v.verse_key} id={`ayah-${v.verse_key}`} className="card scroll-mt-32 overflow-hidden">
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
                  className={`verse-action ${tafsirOpen ? "on" : ""}`}
                  aria-label="tafsir"
                  onClick={() => setOpenTafsir(tafsirOpen ? null : v.verse_key)}
                >
                  <Icon name="doc" size={16} />
                </button>
              )}
              <Link
                href={`/quran/tafsir?surah=${sNum}&ayah=${v.verse_number || aNum}`}
                className="verse-action"
                aria-label="full tafsir"
              >
                <Icon name="chevron" size={16} />
              </Link>
            </div>
          </div>
          <p className="font-arabic text-right" dir="rtl" style={{ fontSize }}>
            {arabic}
            <span className="ayah-end">{toArNum(v.verse_number || aNum)}</span>
          </p>
          {translitOf(v) && (
            <p className="mt-1.5 text-[14px] font-medium text-ink-soft" dir="ltr">{translitOf(v)}</p>
          )}
          {trs.map((t: string, i: number) => (
            <p key={i} className="mt-2.5 border-l-[3px] border-primary-200 pl-3 text-[15px] leading-relaxed text-ink">
              {t}
            </p>
          ))}
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
        {taf && showTafsir && tafsirOpen && (
          <div className="border-t border-gold/30 bg-gold-light/50 px-4 py-3 sm:px-5">
            <div className="mb-1 text-xs font-bold text-gold-dark">তাফসীর</div>
            <div className="whitespace-pre-line text-[13px] leading-relaxed">{stripHtml(taf).slice(0, 1200)}</div>
            <Link
              href={`/quran/tafsir?surah=${sNum}&ayah=${v.verse_number || aNum}`}
              className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-primary-700"
            >
              সম্পূর্ণ তাফসীর পড়ুন <Icon name="chevron" size={14} />
            </Link>
          </div>
        )}
        <div className="border-t border-primary-900/5 px-4 py-2.5 sm:px-5">
          <ShareCopy text={`${arabic}\n${trs[0] || ""}\n(${v.verse_key})`} />
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
        <span className="text-primary-700">
          {jump === "sura" ? surahBnFull(surah) : `${bnNum(juz)} পারা`}
        </span>
      </div>

      <div className="page-hero p-6 text-center">
        <div className="relative z-10">
          {jump === "sura" ? (
            <>
              <div className="font-arabic text-4xl text-white" dir="rtl">{current?.name_arabic || ""}</div>
              <h1 className="mt-1 text-xl font-bold">
                সূরা {surahBn(surah) || current?.name_simple || surah}
                {current?.name_arabic ? ` (${current.name_arabic})` : ""} | {current?.translated_name?.name || ""}
              </h1>
              <div className="mt-2 flex items-center justify-center gap-2">
                {current && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
                    <Icon name={current.revelation_place === "makkah" ? "sunrise" : "moon"} size={12} />
                    {current.revelation_place === "makkah" ? "মাক্কী" : "মাদানী"}
                  </span>
                )}
                {current && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
                    মোট আয়াতঃ {current.verses_count}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="font-arabic text-4xl text-white" dir="rtl">ٱلْجُزْء</div>
              <h1 className="mt-1 text-xl font-bold">{bnNum(juz)} পারা</h1>
              <p className="mt-0.5 text-xs text-white/75">জুজ অনুযায়ী পড়ুন</p>
            </>
          )}
          {offline && (
            <p className="mx-auto mt-2 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-[#1a1405]">
              অফলাইন ডাটাবেজ দেখানো হচ্ছে
            </p>
          )}
          <button
            className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-[#1a1405] transition hover:brightness-105 active:scale-95"
            onClick={async () => {
              if (surahAudioOn) {
                setSurahAudioOn(false);
                setSurahAudio("");
                return;
              }
              try {
                const res = await fetch(`/api/quran/chapter-audio?reciter=7&chapter=${surah}`);
                const data = await res.json();
                if (data.audio_file?.audio_url) {
                  setSurahAudio(data.audio_file.audio_url);
                  setSurahAudioOn(true);
                }
              } catch {}
            }}
          >
            <Icon name={surahAudioOn ? "pause" : "playfill"} size={14} />
            {surahAudioOn ? "অডিও বন্ধ করুন" : "সম্পূর্ণ সূরার অডিও"}
          </button>
          {surahAudioOn && surahAudio && (
            <audio key={surahAudio} controls autoPlay src={surahAudio} className="mx-auto mt-2 max-w-md" preload="none" />
          )}
          <div className="mx-auto mt-3 flex max-w-md items-center gap-2">
            {jump === "sura" ? (
              <>
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
              </>
            ) : (
              <select value={juz} onChange={(e) => { setJuz(Number(e.target.value)); window.scrollTo({ top: 0 }); }} className="input !border-white/20 !bg-white/10 !text-center !text-white [&>option]:text-ink" aria-label="juz">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>{bnNum(j)} পারা (জুজ {j})</option>
                ))}
              </select>
            )}
          </div>
          {jump === "sura" && (
            <div className="mx-auto mt-2 flex max-w-md items-center gap-2">
              <span className="shrink-0 text-[11px] font-bold text-white/75">আয়াতঃ</span>
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) jumpToAyah(Number(e.target.value)); e.target.value = ""; }}
                className="input !border-white/20 !bg-white/10 !py-2 !text-center !text-[13px] !text-white [&>option]:text-ink"
                aria-label="jump to ayah"
              >
                <option value="">আয়াত বেছে নিন…</option>
                {Array.from({ length: current?.verses_count || 286 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>আয়াত {n}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {jump === "sura" && surah !== 1 && surah !== 9 && (
        <div className="card mt-3 p-5 text-center">
          <div className="font-arabic text-3xl text-primary-700" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
        </div>
      )}

      {/* reading settings */}
      <div className="card mt-3 space-y-2.5 p-3.5">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
          {(["sura", "juz"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setJump(m)}
              className={`rounded-xl py-2 text-[13px] font-bold transition ${jump === m ? "bg-primary-600 text-white shadow-card" : "text-ink-faint"}`}
            >
              {m === "sura" ? "সূরা" : "পারা"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={trans1} onChange={(e) => setTrans1(Number(e.target.value))} className="input !text-[13px]" aria-label="translation 1">
            {BN_TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={trans2} onChange={(e) => setTrans2(Number(e.target.value))} className="input !text-[13px]" aria-label="translation 2">
            <option value={0}>২য় অনুবাদ বন্ধ</option>
            {BN_TRANSLATIONS.filter((t) => t.id !== trans1).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <select
          value={tafsirId}
          onChange={(e) => { setTafsirId(Number(e.target.value)); setShowTafsir(true); }}
          className="input !text-[13px]"
          aria-label="tafsir"
        >
          <option value={0}>তাফসীর ছাড়া</option>
          {BN_TAFSIRS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["wbw", showWbw, setShowWbw, "শব্দ-শব্দ"],
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
          <div className="mt-3 space-y-3">
            {jump === "juz"
              ? groups.map((g) => (
                  <div key={g.surah}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="surah-ornament !h-9 !w-9"><span className="!text-[11px]">{g.surah}</span></span>
                      <span className="text-sm font-bold">{surahBnFull(g.surah)}</span>
                    </div>
                    <div className="space-y-3">{g.items.map(renderVerse)}</div>
                  </div>
                ))
              : verses.map(renderVerse)}
          </div>
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
          {jump === "sura" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button disabled={surah <= 1} onClick={() => changeSurah(surah - 1)} className="btn-ghost disabled:opacity-40">
                <Icon name="back" size={15} /> আগের সূরা
              </button>
              <button disabled={surah >= 114} onClick={() => changeSurah(surah + 1)} className="btn-ghost disabled:opacity-40">
                পরের সূরা <Icon name="chevron" size={15} />
              </button>
            </div>
          )}
        </>
      ) : offlineAyahs.length === 0 ? (
        <div className="mt-3"><EmptyState icon="book" title="ডাটাবেজ লোড হয়নি" /></div>
      ) : (
        <div className="mt-3 space-y-3">
          {offlineAyahs.map((a: any) => (
            <article key={a.number} id={`ayah-${a.surahNumber}:${a.numberInSurah}`} className="card scroll-mt-32 p-4 sm:p-5">
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
