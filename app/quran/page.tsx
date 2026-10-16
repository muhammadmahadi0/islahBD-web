"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import type { QuranChapter } from "../../lib/quran";
import { surahBn, surahBnFull } from "../../lib/surah-names";
import { QURAN_TOPICS } from "../../lib/quran-topics";
import { bnNum } from "../../lib/audio";

// Surah index in the muslimbangla.com/quran layout: title, count, search,
// Surahs/Topics tabs, and cards with number, transliteration, meaning,
// Makki/Madani badge, Arabic name and ayah count — on the app theme.
export default function QuranLanding() {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tab, setTab] = useState<"suras" | "topics">("suras");

  useEffect(() => {
    fetch("/api/quran/chapters")
      .then((r) => r.json())
      .then((d) => { if (d.success) setChapters(d.chapters); })
      .catch(() => {});
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
    const query = submitted.trim();
    if (!query) return QURAN_TOPICS;
    return QURAN_TOPICS.filter((t) => t.title.includes(query) || t.desc.includes(query));
  }, [submitted]);

  return (
    <div className="animate-fade-up">
      <PageHead
        title="কুরআনের সূরা সমূহ"
        subtitle={`মোট সূরা — ${bnNum(chapters.length || 114)} টি`}
        icon="book"
      />

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
          placeholder="শব্দ দিয়ে অনুসন্ধান…"
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
            {t === "suras" ? "সূরাসমূহ" : "বিষয়ভিত্তিক"}
          </button>
        ))}
      </div>

      {/* quick links */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { href: "/quran/read", icon: "book", label: "পড়ুন" },
          { href: "/quran/audio", icon: "headphones", label: "শুনুন" },
          { href: "/quran/search", icon: "search", label: "সার্চ" },
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
          <div className="mt-3"><EmptyState icon="search" title="কিছু পাওয়া যায়নি" /></div>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {suras.map((c) => {
              const makki = c.revelation_place === "makkah";
              return (
                <Link
                  key={c.id}
                  href={`/quran/read?surah=${c.id}`}
                  className="card card-hover flex items-center gap-3 p-3.5"
                >
                  <span className="surah-ornament"><span>{c.id}</span></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">
                      {surahBn(c.id) || c.name_simple}
                    </span>
                    <span className="block truncate text-xs text-ink-faint">
                      {c.translated_name?.name || ""}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${makki ? "bg-gold-light text-gold-dark" : "bg-primary-50 text-primary-700"}`}>
                        <Icon name={makki ? "sunrise" : "moon"} size={11} />
                        {makki ? "মাক্কী" : "মাদানী"}
                      </span>
                      <span className="text-[11px] font-bold text-ink-faint">
                        {bnNum(c.verses_count)} আয়াত
                      </span>
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="font-arabic block text-[24px] leading-snug text-primary-700">
                      {c.name_arabic}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                      {surahBnFull(c.id)}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {topics.length === 0 && <EmptyState icon="search" title="কিছু পাওয়া যায়নি" />}
          {topics.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="font-bold">{t.title}</div>
              <div className="text-xs text-ink-faint">{t.desc}</div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {t.surahs.map((id) => (
                  <Link key={id} href={`/quran/read?surah=${id}`} className="chip">
                    {id}. {surahBn(id)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
