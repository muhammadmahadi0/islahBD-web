"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHead, EmptyState } from "../../components/ui";
import { Collapse } from "../../components/Collapse";
import { Icon } from "../../components/icons";
import type { QuranChapter } from "../../lib/quran";
import { surahBn, surahBnFull } from "../../lib/surah-names";
import { QURAN_TOPICS } from "../../lib/quran-topics";
import { stripHtml } from "../../lib/quran";
import { getLastRead, resumeHref, type QuranLastRead } from "../../lib/quran-progress";
import { useLang, useNum, useTx } from "../../store/language-store";

// Surah index in the muslimbangla.com/quran layout: title, count, search,
// Surahs/Topics tabs, and cards with number, transliteration, meaning,
// Makki/Madani badge, Arabic name and ayah count — on the app theme.
export default function QuranLanding() {
  const tx = useTx();
  const lang = useLang();
  const num = useNum();
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tab, setTab] = useState<"suras" | "topics">("suras");
  const [lastRead, setLastRead] = useState<QuranLastRead | null>(null);

  useEffect(() => {
    fetch("/api/quran/chapters")
      .then((r) => r.json())
      .then((d) => { if (d.success) setChapters(d.chapters); })
      .catch(() => {});
  }, []);

  // Where the reader left off — shown first, and resumable in one tap.
  useEffect(() => {
    setLastRead(getLastRead());
  }, []);

  const suras = useMemo(() => {
    const query = submitted.trim().toLowerCase();
    if (!query) return chapters;
    return chapters.filter(
      (c) =>
        c.name_simple.toLowerCase().includes(query) ||
        c.name_arabic.includes(submitted.trim()) ||
        (c.translated_name?.name || "").includes(submitted.trim()) ||
        surahBn(c.id).includes(submitted.trim()) ||
        String(c.id) === query
    );
  }, [chapters, submitted]);

  const topics = useMemo(() => {
    const query = submitted.trim().toLowerCase();
    if (!query) return QURAN_TOPICS;
    return QURAN_TOPICS.filter((t) =>
      [t.title, t.desc, t.titleEn, t.descEn, t.titleUr, t.descUr]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [submitted]);

// Topic card with expandable famous verses (Arabic + translation),
// each linking deep into the reader.
function TopicCard({ topic }: { topic: { id: string; title: string; desc: string; titleEn: string; descEn: string; titleUr: string; descUr: string; verses: string[] } }) {
  const lang = useLang();
  const title = lang === "bn" ? topic.title : lang === "ur" ? topic.titleUr : topic.titleEn;
  const desc = lang === "bn" ? topic.desc : lang === "ur" ? topic.descUr : topic.descEn;
  const [open, setOpen] = useState(false);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && verses.length === 0) {
      setLoading(true);
      try {
        const rows = await Promise.all(
          topic.verses.map((key) =>
            fetch(`/api/quran/verse?key=${encodeURIComponent(key)}&translations=161`)
              .then((r) => r.json())
              .then((d) => d.verse || null)
              .catch(() => null)
          )
        );
        setVerses(rows.filter(Boolean));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="card overflow-hidden">
      <button
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`topic-${topic.id}-body`}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="icon-tile bg-primary-50 text-primary-600">
          <Icon name="book" size={20} />
        </span>
        <span className="flex-1">
          <span className="block font-bold">{title}</span>
          <span className="block text-xs text-ink-faint">
            {desc} • {num(topic.verses.length)} {tx("আয়াত")}
          </span>
        </span>
        <span className={`rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform ${open ? "rotate-90" : ""}`}>
          <Icon name="chevron" size={15} />
        </span>
      </button>
      <Collapse open={open} id={`topic-${topic.id}-body`}>
        <div className="space-y-2 border-t border-primary-900/10 bg-sand/60 p-3">
          {loading && (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-sand-dark/60 p-4">
                  <div className="h-4 w-3/4 rounded-full bg-sand-dark" />
                </div>
              ))}
            </div>
          )}
          {verses.map((v: any) => {
            const [s, a] = String(v.verse_key).split(":").map(Number);
            return (
              <Link key={v.verse_key} href={`/quran/read?surah=${s}&ayah=${a}`} className="block rounded-2xl border border-primary-900/10 bg-white p-3.5 transition hover:shadow-card dark:bg-transparent">
                <span className="ayah-badge !h-7 !min-w-7 !text-[11px]">{v.verse_key}</span>
                <span className="font-arabic mt-1.5 block text-[20px]" dir="rtl">
                  {v.text_uthmani || v.text_imlaei}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                  {stripHtml(v.translations?.[0]?.text || "").slice(0, 220)}
                </span>
              </Link>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("কুরআনের সূরা সমূহ")}
        subtitle={`${tx("মোট সূরা")} — ${num(chapters.length || 114)}`}
        icon="book"
      />

      {/* continue where you left off */}
      {lastRead && (
        <Link
          href={resumeHref(lastRead)}
          className="card card-hover mt-3 flex items-center gap-3 border-l-4 !border-l-primary-500 bg-primary-50 p-3.5"
        >
          <span className="surah-ornament shrink-0"><span>{lastRead.surah}</span></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-700">
              {tx("যেখানে থেমেছিলেন")}
            </span>
            <span className="block truncate text-[15px] font-bold">
              {tx("সূরা")}{" "}
              {lang === "bn"
                ? surahBn(lastRead.surah)
                : (lang === "ur"
                    ? chapters.find((c) => c.id === lastRead.surah)?.name_arabic
                    : chapters.find((c) => c.id === lastRead.surah)?.name_simple) || lastRead.surah}
            </span>
            <span className="block truncate text-xs text-ink-faint">
              {tx("আয়াত")} {num(lastRead.ayah)} · {lastRead.mode === "recitation" ? tx("তেলাওয়াত") : tx("অনুবাদ")}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
            <Icon name="playfill" size={12} />
            {tx("চালিয়ে যান")}
          </span>
        </Link>
      )}

      {/* search */}
      <form
        className="relative mt-3"
        onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx("শব্দ দিয়ে অনুসন্ধান…")}
          className="input !pl-11 !shadow-card"
        />
      </form>

      {/* tabs */}
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
        {(["suras", "topics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-[13px] font-bold transition ${
              tab === t ? "bg-primary-600 text-white shadow-card" : "text-ink-faint"
            }`}
          >
            {t === "suras" ? tx("সূরাসমূহ") : tx("বিষয়ভিত্তিক")}
          </button>
        ))}
      </div>

      {/* quick links */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { href: "/quran/read", icon: "book", label: tx("পড়ুন") },
          { href: "/quran/audio", icon: "headphones", label: tx("শুনুন") },
          { href: "/quran/search", icon: "search", label: tx("সার্চ") },
        ].map((l) => (
          <Link key={l.label} href={l.href} className="card card-hover flex items-center justify-center gap-1.5 p-3 text-sm font-bold">
            <Icon name={l.icon} size={17} className="text-primary-600" />
            {l.label}
          </Link>
        ))}
      </div>

      {tab === "suras" ? (
        chapters.length === 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card flex animate-pulse items-center gap-3 p-4">
                <div className="h-11 w-11 rounded-xl bg-sand-dark" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded-full bg-sand-dark" />
                  <div className="h-3 w-1/3 rounded-full bg-sand-dark" />
                </div>
              </div>
            ))}
          </div>
        ) : suras.length === 0 ? (
          <div className="mt-3"><EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} /></div>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {suras.map((c) => {
              const makki = c.revelation_place === "makkah";
              const isLast = c.id === lastRead?.surah;
              return (
                <Link
                  key={c.id}
                  href={
                    isLast && lastRead
                      ? resumeHref(lastRead)
                      : `/quran/read?surah=${c.id}`
                  }
                  className={`card card-hover flex items-center gap-3 p-3.5${
                    isLast ? " ring-2 ring-primary-400" : ""
                  }`}
                >
                  <span className="surah-ornament"><span>{c.id}</span></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">
                      {lang === "bn" ? (surahBn(c.id) || c.name_simple) : lang === "ur" ? (c.name_arabic || c.name_simple) : c.name_simple}
                    </span>
                    {lang === "bn" && (
                      <span className="block truncate text-xs text-ink-faint">{c.translated_name?.name || ""}</span>
                    )}
                    <span className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${makki ? "bg-gold-light text-gold-dark" : "bg-primary-50 text-primary-700"}`}>
                        <Icon name={makki ? "sunrise" : "moon"} size={11} />
                        {makki ? tx("মাক্কী") : tx("মাদানী")}
                      </span>
                      <span className="text-[11px] font-bold text-ink-faint">
                        {num(c.verses_count)} {tx("আয়াত")}
                      </span>
                      {isLast && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          <Icon name="playfill" size={9} />
                          {tx("শেষ পড়া")}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className={lang === "ur" ? "block text-[13px] font-semibold leading-snug text-ink-faint" : "font-arabic block text-[24px] leading-snug text-primary-700"}>
                      {lang === "ur" ? c.name_simple : c.name_arabic}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                      {lang === "bn" ? surahBnFull(c.id) : ""}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {topics.length === 0 && <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} />}
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
