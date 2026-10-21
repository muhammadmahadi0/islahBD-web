"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import {
  BN_TRANSLATIONS, BN_TAFSIRS, stripHtml,
  type QuranChapter,
} from "../../../lib/quran";
import { surahBnFull, surahBn } from "../../../lib/surah-names";
import { storageSetJSON, storageGetJSON, storageSet, storageGet } from "../../../lib/storage";
import { usePlayerStore, type Track } from "../../../store/player-store";
import { bnNum } from "../../../lib/audio";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArNum = (n: number) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
const WBW_BASE = "https://audio.qurancdn.com/";

type Jump = "sura" | "juz";

/** Reader mirroring muslimbangla.com/quran/sura/N pixel-structure:
 *  sidebar (search + sura/para tabs + sura & ayah jump lists), top
 *  অনুবাদ/তেলাওয়াত tabs, settings slide-over, surah header, bismillah
 *  banner, pill action bars, transliteration, translation, always-open
 *  tafsir — on quran.com data + offline fallback, app theme. */
function Reader() {
  const params = useSearchParams();
  const [jump, setJump] = useState<Jump>("sura");
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [surah, setSurah] = useState(Number(params.get("surah")) || 1);
  const [juz, setJuz] = useState(30);
  const [trans1, setTrans1] = useState(161);
  const [trans2, setTrans2] = useState(0);
  const [tafsirId, setTafsirId] = useState(165);
  const [reciters, setReciters] = useState<{ id: number; reciter_name: string; style: string | null }[]>([]);
  const [reciter, setReciter] = useState(7);
  const [showTafsir, setShowTafsir] = useState(true);
  const [showWbw, setShowWbw] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [viewTab, setViewTab] = useState<"translation" | "recitation">("translation");
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const [sideTab, setSideTab] = useState<"sura" | "para">("sura");
  const [sideQuery, setSideQuery] = useState("");
  const [verses, setVerses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [db, setDb] = useState<any[]>([]);
  const [marks, setMarks] = useState<number[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  // Real playback state, driven by the element's own play/pause/ended events.
  // (Deriving this from `audioRef.current.paused` during render left the icon
  // stuck on ▶ while the recitation kept playing in the background.)
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [openTafsir, setOpenTafsir] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [surahLoading, setSurahLoading] = useState(false);
  // Set when a reciter has no per-verse audio and we fall back to the surah.
  const [fallbackNote, setFallbackNote] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  // Last tapped verse — a slower /audio fetch must never win over a newer tap.
  const playSeq = useRef(0);
  const deepAyah = useRef<string | null>(params.get("ayah"));
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const globalPlaying = usePlayerStore((s) => s.isPlaying);
  // The whole surah plays in the app player — the same one as bayan — so it
  // gets the mini-player, seek bar and lock-screen controls.
  const surahTrackId = `quran-surah-${surah}`;
  const surahActive = currentTrack?.id === surahTrackId;
  const surahPlaying = surahActive && globalPlaying;

  useEffect(() => {
    fetch("/api/quran/chapters").then((r) => r.json()).then((d) => {
      if (d.success) setChapters(d.chapters);
    }).catch(() => {});
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    fetch("/api/quran/recitations").then((r) => r.json()).then((d) => {
      if (d.success) setReciters(d.recitations);
    }).catch(() => {});
    setMarks(storageGetJSON<number[]>("quran_bookmarks", []));
    setReciter(Number(storageGet("quran_reciter") || 7));
    audioRef.current = new Audio();
    wordAudioRef.current = new Audio();
    const el = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
      setPlayingKey(null);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      el.pause();
      wordAudioRef.current?.pause();
      el.removeAttribute("src");
    };
  }, []);

  const dbByKey = (s: number, n: number) =>
    db.find((a: any) => a.surahNumber === s && a.numberInSurah === n);

  const transParam = [trans1, trans2].filter((t) => t > 0).join(",") || "161";

  // Sura mode loads the WHOLE surah at once (one page, no splitting).
  // Juz mode keeps pagination (50 per page).
  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const base = {
        translations: transParam,
        words: "1",
      };
      const fetchPage = async (pg: number, per: number) => {
        const qp = new URLSearchParams({
          ...base,
          page: String(pg),
          per_page: String(per),
        });
        if (tafsirId) qp.set("tafsirs", String(tafsirId));
        const url =
          jump === "sura"
            ? `/api/quran/verses?chapter=${surah}&${qp}`
            : `/api/quran/juz?juz=${juz}&${qp}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.error || !data.verses) throw new Error("fail");
        return data;
      };
      if (jump === "sura") {
        const first = await fetchPage(1, 50);
        let all = first.verses;
        const total = first.pagination?.total_pages || 1;
        if (total > 1) {
          const rest = await Promise.all(
            Array.from({ length: total - 1 }, (_, i) => fetchPage(i + 2, 50))
          );
          for (const r of rest) all = all.concat(r.verses);
        }
        setVerses(all);
        setPagination(null);
      } else {
        const data = await fetchPage(p, 50);
        setVerses(data.verses);
        setPagination(data.pagination || null);
      }
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
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump, surah, juz, trans1, trans2, tafsirId]);

  // Moving to another surah/para must never leave the previous recitation
  // running in the background — including the whole-surah track in the app
  // player.
  useEffect(() => {
    audioRef.current?.pause();
    wordAudioRef.current?.pause();
    setPlayingKey(null);
    setIsPlaying(false);
    setLoadingKey(null);
    setFallbackNote(false);
    const store = usePlayerStore.getState();
    if (store.currentTrack?.id?.startsWith("quran-surah-")) store.stop();
  }, [jump, surah, juz]);

  // One recitation at a time: the app-wide mini-player and the Qur'an reader
  // pause each other instead of layering two audios.
  useEffect(() => {
    if (!globalPlaying) return;
    audioRef.current?.pause();
    wordAudioRef.current?.pause();
  }, [globalPlaying]);

  useEffect(() => {
    if (!fallbackNote) return;
    const t = setTimeout(() => setFallbackNote(false), 8000);
    return () => clearTimeout(t);
  }, [fallbackNote]);

  useEffect(() => {
    const target = deepAyah.current;
    if (!target || offline || loading || verses.length === 0 || jump !== "sura") return;
    const n = Number(target);
    if (!n) return;
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

  const changeSurah = (s: number) => {
    if (s < 1 || s > 114) return;
    deepAyah.current = null;
    setSurah(s);
    setJump("sura");
    // NOTE: drawer stays open on mobile so an ayah can be picked next —
    // it closes only after an ayah is selected (see jumpToAyah).
    window.scrollTo({ top: 0 });
  };

  const jumpToAyah = (n: number) => {
    if (!n) return;
    setDrawer(false);
    deepAyah.current = null;
    scrollToKey(`${surah}:${n}`);
  };

  const scrollToKey = (key: string) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`ayah-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    });
  };

  // Only one recitation may sound at a time: pause every other player
  // (verse, word-by-word, app player) before starting one.
  const hushOthers = (except?: "ayah" | "word") => {
    if (except !== "ayah") audioRef.current?.pause();
    if (except !== "word") wordAudioRef.current?.pause();
    const store = usePlayerStore.getState();
    if (store.isPlaying) store.setIsPlaying(false);
  };

  const pickReciter = (id: number) => {
    setReciter(id);
    storageSet("quran_reciter", String(id));
    setPlayingKey(null);
    setIsPlaying(false);
    setLoadingKey(null);
    // Drop the loaded source so the next tap fetches the new reciter
    // (the old one kept playing / the surah player kept its old URL).
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    const store = usePlayerStore.getState();
    if (store.currentTrack?.id?.startsWith("quran-surah-")) store.stop();
  };

  /** Whole-surah recitation goes through the app player (the bayan player),
   *  so it shares the mini-player, seek bar and media session. */
  const playFullSurah = async (chapterNo?: number) => {
    const ch = chapterNo || surah;
    setSurahLoading(true);
    try {
      const res = await fetch(`/api/quran/chapter-audio?reciter=${reciter}&chapter=${ch}`);
      const data = await res.json();
      const url = data.audio_file?.audio_url;
      if (!url) throw new Error();
      hushOthers();
      const reciterName = reciters.find((r) => r.id === reciter)?.reciter_name || "কুরআন তিলাওয়াত";
      const chapterName = chapters.find((c) => c.id === ch)?.name_simple;
      const track: Track = {
        id: `quran-surah-${ch}`,
        title: `সূরা ${surahBn(ch) || chapterName || ch} — সম্পূর্ণ তিলাওয়াত`,
        thumbnail: "",
        duration: 0,
        channelName: reciterName,
        videoId: "",
        audioUrl: url,
        sharePath: `/quran/read?surah=${ch}`,
      };
      usePlayerStore.getState().playTrack(track);
    } catch {
      // leave it idle — the button is still there to retry
    } finally {
      setSurahLoading(false);
    }
  };

  const playAyah = async (key: string) => {
    const el = audioRef.current;
    if (!el) return;

    // Same verse: plain play/pause toggle, no refetch.
    if (playingKey === key && el.src) {
      if (el.paused) {
        hushOthers("ayah");
        const { tryPlay } = await import("../../../lib/storage");
        const p = tryPlay(el);
        if (p) p.catch(() => setIsPlaying(false));
      } else {
        el.pause();
      }
      return;
    }

    const seq = ++playSeq.current;
    hushOthers(); // stop the previous verse / surah / word instantly
    setPlayingKey(key);
    setLoadingKey(key);
    try {
      const res = await fetch(`/api/quran/chapter-audio?reciter=${reciter}&key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (seq !== playSeq.current) return; // a newer verse was tapped
      const url = data.audio_files?.[0]?.url;
      if (!url) throw new Error();
      el.src = url;
      const { tryPlay } = await import("../../../lib/storage");
      const p = tryPlay(el);
      if (p) await p;
    } catch {
      if (seq === playSeq.current) {
        setPlayingKey(null);
        setIsPlaying(false);
        // Not every reciter has verse-by-verse audio (quran.com's by_ayah
        // 404s for them) — fall back to the whole surah in the app player.
        setFallbackNote(true);
        void playFullSurah(Number(key.split(":")[0]) || undefined);
      }
    } finally {
      if (seq === playSeq.current) setLoadingKey(null);
    }
  };

  const playWord = (audioUrl: string) => {
    const el = wordAudioRef.current;
    if (!el || !audioUrl) return;
    hushOthers("word");
    el.src = `${WBW_BASE}${audioUrl}`;
    try {
      el.currentTime = 0;
    } catch {
      // ignore
    }
    el.play().catch(() => {});
  };

  const toggleSurahAudio = () => {
    // Already the loaded track: just pause/resume it in the app player.
    if (surahActive) {
      usePlayerStore.getState().togglePlay();
      return;
    }
    void playFullSurah();
  };

  const shareAyah = (arabic: string, tr: string, key: string) => {
    const text = `${arabic}\n${tr}\n(${key})`;
    if (navigator.share) navigator.share({ title: `আয়াত ${key}`, text }).catch(() => {});
    else navigator.clipboard?.writeText(text);
  };

  const copyAyah = (arabic: string, tr: string, key: string) => {
    navigator.clipboard?.writeText(`${arabic}\n${tr}\n(${key})`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
  };

  const toggleMark = (n: number) => {
    const next = marks.includes(n) ? marks.filter((x) => x !== n) : [...marks, n];
    setMarks(next);
    storageSetJSON("quran_bookmarks", next);
  };

  const current = chapters.find((c) => c.id === surah);
  const totalPages = pagination?.total_pages || 1;
  const chapterOptions = chapters.length
    ? chapters
    : Array.from({ length: 114 }, (_, i) => ({
        id: i + 1, name_arabic: "", name_simple: "", translated_name: { name: "" },
      } as any));
  const offlineAyahs = db.filter((a: any) =>
    jump === "sura" ? a.surahNumber === surah : a.juz === juz
  );

  const sideSuras = chapters.filter((c) => {
    const q = sideQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(sideQuery.trim()) ||
      surahBn(c.id).includes(sideQuery.trim()) ||
      String(c.id) === q
    );
  });

  const ayahCount = current?.verses_count || 286;

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
    const [sNum] = String(v.verse_key || `${surah}:${v.verse_number}`).split(":").map(Number);
    const local = dbByKey(sNum, v.verse_number);
    const arabic = v.text_uthmani || v.text_imlaei || local?.text || "";
    const trs = (v.translations || [])
      .map((t: any) => stripHtml(t.text || ""))
      .filter(Boolean);
    if (trs.length === 0 && local?.translation) trs.push(local.translation);
    const taf = v.tafsirs?.[0]?.text || "";
    const playing = playingKey === v.verse_key && isPlaying;
    const loading = loadingKey === v.verse_key;
    const marked = marks.includes(v.id);
    const recite = viewTab === "recitation";

    return (
      <article
        key={v.id || v.verse_key}
        id={`ayah-${v.verse_key}`}
        className={`scroll-mt-32 overflow-hidden rounded-xl border-b border-primary-900 bg-white transition-colors dark:bg-transparent${recite ? " pb-4" : ""}`}
      >
        {/* centered pill action bar — the audio pill looks the same in both
            translation and recitation modes */}
        <div className="flex justify-center pt-2.5">
          <div className="flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 p-1 dark:bg-transparent">
            {!recite && (
              <>
                {taf && (
                  <Link
                    href={`/quran/tafsir?surah=${sNum}&ayah=${v.verse_number}`}
                    className="flex items-center gap-1 rounded-full bg-white px-2 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-blue-100 dark:bg-transparent"
                  >
                    <Icon name="book" size={14} />
                    তাফসীর
                  </Link>
                )}
                <button
                  onClick={() => copyAyah(arabic, trs[0] || "", v.verse_key)}
                  className="rounded-full bg-white p-1 transition hover:bg-green-50 dark:bg-transparent"
                  aria-label="copy"
                >
                  <Icon
                    name={copiedKey === v.verse_key ? "check" : "copy"}
                    size={13}
                    className={copiedKey === v.verse_key ? "text-primary-600" : "text-ink-soft"}
                  />
                </button>
                <button
                  onClick={() => shareAyah(arabic, trs[0] || "", v.verse_key)}
                  className="rounded-full bg-white p-1 transition hover:bg-green-50 dark:bg-transparent"
                  aria-label="share"
                >
                  <Icon name="share" size={13} className="text-ink-soft" />
                </button>
                <button
                  onClick={() => toggleMark(v.id)}
                  className="rounded-full bg-white p-1 transition hover:bg-purple-50 dark:bg-transparent"
                  aria-label="bookmark"
                >
                  <Icon
                    name="bookmark"
                    size={14}
                    className={marked ? "fill-gold text-gold-600" : "text-ink-faint"}
                  />
                </button>
              </>
            )}
            <button
              onClick={() => playAyah(v.verse_key)}
              disabled={loading}
              aria-pressed={playing}
              className="flex items-center gap-1 rounded-full bg-white px-2 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-blue-100 disabled:opacity-60 dark:bg-transparent"
              aria-label="ayah audio"
            >
              <Icon
                name={playing ? "pause" : "playfill"}
                size={14}
                className={loading ? "animate-pulse" : undefined}
              />
              শুনুন
            </button>
          </div>
        </div>

        {/* arabic — hidden while word-by-word is on (muslimbangla behavior),
            except in recitation mode where it is the whole view */}
        {(!showWbw || recite) && (
          <p className="font-arabic mt-2 px-5 text-right text-[30px] leading-[2.2] md:text-4xl" dir="rtl" style={{ fontSize: viewTab === "recitation" ? undefined : fontSize + 4 }}>
            {arabic}
            <span className="ayah-end">{toArNum(v.verse_number)}</span>
          </p>
        )}

        {!recite && (
          <>
            <div className="space-y-2 px-5 pb-1 pt-2 text-[15px]">
              {trs.map((t: string, i: number) => (
                <div key={i} className="text-justify leading-relaxed text-ink">{t}</div>
              ))}
            </div>
            {showWbw && v.words?.length > 0 && (
              <div className="mx-5 mb-2 flex flex-wrap gap-1.5 rounded-xl border border-primary-900/10 bg-sand/70 p-2.5" dir="rtl">
                {v.words.filter((w: any) => w.char_type_name === "word").map((w: any) => (
                  <button
                    key={w.id}
                    onClick={() => playWord(w.audio_url)}
                    className="inner-box rounded-xl border border-primary-900/10 bg-white px-2.5 py-1.5 text-center transition hover:shadow-card active:scale-95"
                    title="শুনুন"
                  >
                    <span className="font-arabic block text-[18px] leading-snug">{w.text_uthmani}</span>
                    <span className="block text-[11px] text-ink-soft" dir="ltr">{w.translation?.text || ""}</span>
                  </button>
                ))}
              </div>
            )}
            {taf && showTafsir && (
              <div className="mx-5 mb-2 border-t border-primary-900/10 pt-2">
                <button
                  onClick={() => setOpenTafsir(openTafsir === v.verse_key ? null : v.verse_key)}
                  aria-expanded={openTafsir === v.verse_key}
                  className="flex w-full items-center gap-3 rounded-2xl px-1 py-2 text-left transition active:scale-[0.99]"
                >
                  <span className="h-6 w-1 rounded-full bg-gold" />
                  <span className="flex-1 text-lg font-bold">তাফসীরঃ</span>
                  <Icon
                    name="chevron"
                    size={17}
                    className={`shrink-0 text-gold-dark transition-transform ${openTafsir === v.verse_key ? "-rotate-90" : "rotate-90"}`}
                  />
                </button>
              </div>
            )}
            {taf && showTafsir && openTafsir === v.verse_key && (
              <div className="mx-5 mb-2">
                <div className="rounded-xl border border-gold/30 bg-gold-light/50 p-4 text-justify text-sm leading-relaxed">
                  {stripHtml(taf).slice(0, 1500)}
                </div>
                <Link
                  href={`/quran/tafsir?surah=${sNum}&ayah=${v.verse_number}`}
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-primary-700"
                >
                  সম্পূর্ণ তাফসীর <Icon name="chevron" size={14} />
                </Link>
              </div>
            )}
            <div className="px-5 pb-4">
              <div className="text-[11px] font-bold text-ink-faint">
                পৃষ্ঠা {v.page_number || local?.page} • জুজ {v.juz_number || local?.juz}
              </div>
            </div>
          </>
        )}
      </article>
    );
  };

  /* Mushaf-style recitation view (muslimbangla তেলাওয়াত): one continuous,
     justified Arabic flow instead of one card per ayah, with inline
     ayah-number medallions that also play that ayah. */
  const renderRecitationBlock = (items: any[]) => (
    <div className="px-4 pb-7 pt-3 sm:px-5">
      <p
        dir="rtl"
        className="font-arabic text-ink"
        style={{ textAlign: "justify", textAlignLast: "right", fontSize: fontSize, lineHeight: 1.95 }}
      >
        {items.map((v) => {
          const [sNum] = String(v.verse_key || `${surah}:${v.verse_number}`).split(":").map(Number);
          const local = dbByKey(sNum, v.verse_number);
          const arabic = v.text_uthmani || v.text_imlaei || local?.text || "";
          const key = v.verse_key || `${surah}:${v.verse_number}`;
          const playing = playingKey === key && isPlaying;
          const loading = loadingKey === key;
          return (
            <span key={v.id || key} id={`ayah-${key}`} className="scroll-mt-32">
              {arabic}{" "}
              <button
                type="button"
                onClick={() => playAyah(key)}
                disabled={loading}
                aria-pressed={playing}
                aria-label={`আয়াত ${bnNum(v.verse_number)} তেলাওয়াত`}
                className={`ayah-dot${playing ? " is-on" : ""}${loading ? " is-loading" : ""}`}
              >
                <span>{toArNum(v.verse_number)}</span>
              </button>{" "}
            </span>
          );
        })}
      </p>
    </div>
  );

  const sidebarBody = (
    <>
      {/* search */}
      <div className="relative mb-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={sideQuery}
          onChange={(e) => setSideQuery(e.target.value)}
          placeholder="অনুসন্ধান করুন…"
          className="input !pl-11"
        />
      </div>
      {/* sura/para tabs */}
      <div className="mb-2 grid grid-cols-2 text-center text-[15px]">
        {(["sura", "para"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSideTab(t)}
            className={`py-2 transition ${
              (t === "sura") === (sideTab === "sura")
                ? "border-b-2 border-primary-600 bg-primary-50 font-bold text-primary-700"
                : "text-ink hover:bg-primary-50"
            }`}
          >
            {t === "sura" ? "সূরা" : "পারা"}
          </button>
        ))}
      </div>
      {sideTab === "sura" ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="max-h-[50vh] overflow-y-auto border-r border-primary-900/10 pr-1 lg:max-h-[60vh]" style={{ maxHeight: "50dvh" }}>
            {sideSuras.map((c) => (
              <button
                key={c.id}
                onClick={() => changeSurah(c.id)}
                className={`block w-full truncate rounded-xl px-3 py-2 text-left text-sm transition ${
                  c.id === surah && jump === "sura"
                    ? "bg-primary-600 font-bold text-white"
                    : "font-medium hover:bg-primary-50"
                }`}
              >
                {c.id}. {surahBn(c.id) || c.name_simple}
              </button>
            ))}
          </div>
          <div className="max-h-[50vh] overflow-y-auto pl-1 lg:max-h-[60vh]" style={{ maxHeight: "50dvh" }}>
            <div className="mb-1 px-1 text-center text-[11px] font-bold text-ink-faint">আয়াত</div>
            {Array.from({ length: current?.verses_count || 0 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => jumpToAyah(n)}
                className="block w-full rounded-lg px-3 py-1.5 text-center text-[13px] tabular-nums transition hover:bg-primary-50 hover:font-bold"
              >
                {bnNum(n)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-3 gap-1.5 overflow-y-auto lg:max-h-[60vh]" style={{ maxHeight: "50dvh" }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
            <button
              key={j}
              onClick={() => { setJump("juz"); setJuz(j); setDrawer(false); window.scrollTo({ top: 0 }); }}
              className={`rounded-xl px-2 py-2 text-[13px] font-bold tabular-nums transition ${
                j === juz && jump === "juz"
                  ? "bg-primary-600 text-white"
                  : "bg-sand hover:bg-primary-50"
              }`}
            >
              {bnNum(j)}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="animate-fade-up lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-3">
      {/* desktop sidebar */}
      <aside className="card sticky top-24 hidden max-h-[calc(100vh-7rem)] flex-col overflow-hidden p-2 lg:flex" style={{ maxHeight: "calc(100dvh - 7rem)" }}>
        {sidebarBody}
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="card absolute bottom-2 left-2 top-2 flex w-72 max-w-[85vw] flex-col overflow-hidden p-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-sm font-bold">সূরা ও আয়াত</span>
              <button onClick={() => setDrawer(false)} className="rounded-xl p-1.5 text-ink-faint hover:bg-sand" aria-label="close">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{sidebarBody}</div>
          </div>
        </div>
      )}

      {/* settings slide-over */}
      {settings && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSettings(false)} />
          <div className="card absolute bottom-2 right-2 top-2 w-80 max-w-[90vw] space-y-4 overflow-y-auto rounded-l-3xl p-5">
            <div className="flex items-center justify-between border-b border-primary-900/10 pb-3">
              <span className="font-bold">পড়ার সেটিংস</span>
              <button onClick={() => setSettings(false)} className="rounded-xl p-1.5 text-ink-faint hover:bg-sand" aria-label="close">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-ink-faint">নির্বাচিত অনুবাদ</p>
              <select value={trans1} onChange={(e) => setTrans1(Number(e.target.value))} className="input !text-[13px]" aria-label="translation 1">
                {BN_TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={trans2} onChange={(e) => setTrans2(Number(e.target.value))} className="input mt-2 !text-[13px]" aria-label="translation 2">
                <option value={0}>২য় অনুবাদ বন্ধ</option>
                {BN_TRANSLATIONS.filter((t) => t.id !== trans1).map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={tafsirId} onChange={(e) => setTafsirId(Number(e.target.value))} className="input mt-2 !text-[13px]" aria-label="tafsir">
                <option value={0}>তাফসীর বন্ধ</option>
                {BN_TAFSIRS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-ink-faint">ক্বারী (তেলাওয়াত)</p>
              <select value={reciter} onChange={(e) => pickReciter(Number(e.target.value))} className="input !text-[13px]" aria-label="reciter">
                {reciters.length === 0 && <option value={7}>মিশারী রাশিদ আল-আফাসী</option>}
                {reciters.map((r) => (
                  <option key={`${r.id}-${r.style}`} value={r.id}>
                    {r.reciter_name}{r.style ? ` (${r.style})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-ink-faint">পছন্দ সংরক্ষিত থাকে</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-ink-faint">অন্যান্য</p>
              <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm font-medium">
                <input type="checkbox" checked={showWbw} onChange={(e) => setShowWbw(e.target.checked)} className="h-4 w-4 accent-primary-600" />
                শব্দে শব্দে কুরআন (অডিও সহ)
              </label>
              <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm font-medium">
                <input type="checkbox" checked={showTafsir} onChange={(e) => setShowTafsir(e.target.checked)} className="h-4 w-4 accent-primary-600" />
                তাফসীর দেখান
              </label>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-ink-faint">আরবি অক্ষরের সাইজ</p>
              <input type="range" min={20} max={38} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" aria-label="font size" />
            </div>
          </div>
        </div>
      )}

      {/* main column */}
      <div className="min-w-0">
        {/* top tab bar: menu + অনুবাদ | তেলাওয়াত + gear */}
        <div className="card flex items-center !rounded-2xl">
          <button onClick={() => setDrawer(true)} className="p-2.5 text-ink-faint transition hover:text-primary-700 lg:hidden" aria-label="surah menu">
            <Icon name="menu" size={22} />
          </button>
          <div className="grid flex-1 grid-cols-2 text-center text-[15px]">
            {(["translation", "recitation"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setViewTab(t)}
                className={`py-2.5 transition ${
                  viewTab === t
                    ? "border-b-2 border-primary-600 bg-primary-50 font-bold text-primary-700"
                    : "hover:bg-primary-50"
                }`}
              >
                {t === "translation" ? "অনুবাদ" : "তেলাওয়াত"}
              </button>
            ))}
          </div>
          <button onClick={() => setSettings(true)} className="p-2.5 text-primary-600" aria-label="settings">
            <Icon name="gear" size={22} />
          </button>
        </div>

        {/* surah header */}
        <div className="card mt-2 p-5 text-center sm:p-6">
          {jump === "sura" ? (
            <>
              <h1 className="text-[22px] font-bold tracking-wide">
                সূরা {surahBn(surah) || current?.name_simple || surah}{" "}
                <span className="font-arabic font-semibold text-primary-700">({current?.name_arabic || ""})</span>{" "}
                <span className="font-medium text-ink-faint">| {current?.translated_name?.name || ""}</span>
              </h1>
              <div className="mt-2 flex items-center justify-center gap-2 text-[13px]">
                {current && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 font-medium shadow-sm">
                    {current.revelation_place === "makkah" ? "মাক্কী" : "মাদানী"}
                  </span>
                )}
                {current && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 font-medium shadow-sm">
                    মোট আয়াতঃ {bnNum(current.verses_count)}
                  </span>
                )}
                <button
                  onClick={toggleSurahAudio}
                  disabled={surahLoading}
                  aria-pressed={surahPlaying}
                  className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 shadow-sm transition hover:bg-primary-100 active:scale-95 disabled:opacity-60"
                >
                  <Icon
                    name={surahPlaying ? "pause" : "playfill"}
                    size={15}
                    className={`text-primary-700${surahLoading ? " animate-pulse" : ""}`}
                  />
                  <span className="text-[13px] font-medium text-primary-700">অডিও</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[22px] font-bold">{bnNum(juz)} পারা</h1>
              <p className="mt-0.5 text-xs text-ink-faint">জুজ অনুযায়ী পড়ুন</p>
            </>
          )}
          {offline && (
            <p className="mx-auto mt-2 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-[#1a1405]">
              অফলাইন ডাটাবেজ দেখানো হচ্ছে
            </p>
          )}
        </div>

        {fallbackNote && (
          <div className="card mt-2 flex items-start gap-2.5 p-3 text-[12px] leading-relaxed text-ink-soft">
            <Icon name="headphones" size={16} className="mt-0.5 shrink-0 text-primary-600" />
            <span>
              এই ক্বারীর আয়াতভিত্তিক তিলাওয়াত নেই — পুরো সূরার অডিও চালানো হচ্ছে।
            </span>
          </div>
        )}

        {jump === "sura" && surah !== 1 && surah !== 9 && (
          <div className="card mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3">
              <p className="font-arabic text-center text-3xl text-primary-800" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
              <p className="mt-1 text-center font-medium text-ink-soft">পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে</p>
            </div>
          </div>
        )}

        {/* verses */}
        {loading ? (
          <div className="mt-2 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card animate-pulse p-5">
                <div className="ml-auto h-7 w-3/4 rounded-xl bg-sand-dark" />
                <div className="mt-3 h-3 w-full rounded-full bg-sand-dark" />
              </div>
            ))}
          </div>
        ) : !offline ? (
          <>
            <div className="mt-2 space-y-2">
              {jump === "juz"
                ? groups.map((g) => (
                    <div key={g.surah}>
                      <div className="mb-2 flex items-center gap-2 px-1 pt-2">
                        <span className="surah-ornament !h-9 !w-9"><span className="!text-[11px]">{g.surah}</span></span>
                        <span className="text-sm font-bold">{surahBnFull(g.surah)}</span>
                      </div>
                      {viewTab === "recitation" ? (
                        renderRecitationBlock(g.items)
                      ) : (
                        <div className="space-y-2">{g.items.map(renderVerse)}</div>
                      )}
                    </div>
                  ))
                : viewTab === "recitation"
                ? renderRecitationBlock(verses)
                : verses.map(renderVerse)}
            </div>
            {totalPages > 1 && (
              <div className="card mt-2 flex items-center justify-between p-3">
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
          <div className="mt-2"><EmptyState icon="book" title="ডাটাবেজ লোড হয়নি" /></div>
        ) : (
          <div className="mt-2 space-y-2">
            {offlineAyahs.map((a: any) => (
              <article key={a.number} id={`ayah-${a.surahNumber}:${a.numberInSurah}`} className="card scroll-mt-32 overflow-hidden">
                <div className="flex justify-center pt-4">
                  <span className="chip">{a.surahNumber}:{a.numberInSurah}</span>
                </div>
                <p className="font-arabic mt-2 px-5 text-right text-[30px] leading-[2.2]" dir="rtl" style={{ fontSize }}>
                  {a.text}
                  <span className="ayah-end">{toArNum(a.numberInSurah)}</span>
                </p>
                <div className="mx-5 mb-3 rounded-md border border-primary-900/10 bg-sand p-2">
                  <div className="text-justify leading-relaxed">{a.translation}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* floating surah-audio button — hidden while the mini-player is
          active so it never covers content, and in para mode where there
          is no "current surah" to play */}
      {!currentTrack && jump === "sura" && (
        <button
          onClick={toggleSurahAudio}
          aria-label="surah audio"
          className="fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-800 text-white shadow-lift transition hover:scale-105 active:scale-95 md:bottom-6"
        >
          <Icon name="headphones" size={22} />
        </button>
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
