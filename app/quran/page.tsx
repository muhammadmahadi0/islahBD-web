"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/icons";
import type { QuranChapter } from "../../lib/quran";
import { surahBn, surahBnFull } from "../../lib/surah-names";

// quran.com-style home in app theme: hero search + quick links + surah list
// with ornamented numbers, Arabic names and Makki/Madani meta.
export default function QuranLanding() {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/quran/chapters")
      .then((r) => r.json())
      .then((d) => { if (d.success) setChapters(d.chapters); })
      .catch(() => {});
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return chapters;
    return chapters.filter(
      (c) =>
        c.name_simple.toLowerCase().includes(query) ||
        c.name_arabic.includes(q.trim()) ||
        (c.translated_name?.name || "").includes(q.trim()) ||
        surahBn(c.id).includes(q.trim()) ||
        String(c.id) === query
    );
  }, [chapters, q]);

  const goSearch = () => {
    if (q.trim()) window.location.href = `/quran/search?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="animate-fade-up">
      {/* hero */}
      <div className="page-hero p-6 text-center sm:p-8">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25">
            <Icon name="back" size={14} /> হোম
          </Link>
          <div className="font-arabic mt-3 text-4xl text-gold-100" dir="rtl">ٱقْرَأْ بِٱسْمِ رَبِّكَ</div>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight">আল-কুরআন পড়ুন ও শুনুন</h1>
          <p className="mt-1 text-[13px] text-white/75">৪ বাংলা অনুবাদ • ৩ তাফসীর • শব্দ-শব্দ অর্থ • তিলাওয়াত</p>
          <form
            className="hero-search mx-auto mt-4 flex max-w-md items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lift"
            onSubmit={(e) => { e.preventDefault(); goSearch(); }}
          >
            <span className="pl-2.5 text-ink-faint"><Icon name="search" size={19} /></span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="সূরা, আয়াত বা শব্দ খুঁজুন…"
              className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button className="btn-primary shrink-0 !py-2" type="submit">খুঁজুন</button>
          </form>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[
              { href: "/quran/read", icon: "book", label: "পড়ুন" },
              { href: "/quran/audio", icon: "headphones", label: "শুনুন" },
              { href: "/quran/search", icon: "search", label: "সার্চ" },
            ].map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-white/25 active:scale-95"
              >
                <Icon name={l.icon} size={16} /> {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* surah index */}
      <div className="mb-2 mt-6 flex items-end justify-between px-1">
        <h2 className="text-[18px] font-bold tracking-tight">সূরাসমূহ</h2>
        <span className="text-xs font-bold text-ink-faint">{list.length} / 114</span>
      </div>
      {chapters.length === 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
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
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {list.map((c) => (
            <Link key={c.id} href={`/quran/read?surah=${c.id}`} className="card card-hover flex items-center gap-3 p-3.5">
              <span className="surah-ornament"><span>{c.id}</span></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold">{surahBnFull(c.id)}</span>
                <span className="block truncate text-[11px] font-bold text-ink-faint">
                  অর্থ: {c.translated_name?.name || c.name_simple}
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                  {c.name_simple} • {c.revelation_place === "makkah" ? "মাক্কী" : "মাদানী"} • {c.verses_count} আয়াত
                </span>
              </span>
              <span className="font-arabic shrink-0 text-[22px] text-primary-700">{c.name_arabic}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
