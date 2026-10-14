"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrayerCard from "../components/PrayerCard";
import { Icon } from "../components/icons";
import { timeAgoBn, bnNum } from "../lib/audio";
import type { BoyanAudio } from "../lib/audio";

const card =
  "bg-white dark:bg-[rgba(30,41,59,0.65)] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm hover:border-amber-400/50 transition cursor-pointer";

function Heading({ t, sub, link }: { t: string; sub?: string; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary-500" />
          {t}
        </h3>
        {sub && <p className="ml-6 text-[10px] text-ink-faint">{sub}</p>}
      </div>
      {link && (
        <Link
          href={link}
          className="rounded-full bg-slate-200/50 px-2.5 py-1 text-xs text-ink-soft transition hover:bg-slate-300 dark:bg-slate-800/50 dark:text-slate-400"
        >
          সব দেখুন
        </Link>
      )}
    </div>
  );
}

const SERVICES: { route: string; bn: string; icon: string }[] = [
  { route: "/quran", bn: "কুরআন", icon: "book" },
  { route: "/live", bn: "লাইভ", icon: "radio" },
  { route: "/qibla", bn: "কিবলা", icon: "compass" },
  { route: "/malfuzat", bn: "মালফুজাত", icon: "chat" },
  { route: "/boyan", bn: "আকাবিরদের বয়ান সংকলন", icon: "users" },
  { route: "/library", bn: "বই", icon: "library" },
  { route: "/paribar", bn: "মাদ্রাসা", icon: "mosque" },
  { route: "/tasbeeh", bn: "তাসবিহ", icon: "beads" },
];

const MEDIA = [
  { route: "/boyan", bn: "বয়ান", d: "বয়ানের অডিও", icon: "mic" },
  { route: "/media", bn: "সংক্ষিপ্ত ক্লিপস", d: "হাইলাইটস", icon: "play" },
  { route: "/hamdnaat", bn: "হামদ-নাত", d: "ইসলামিক গজল", icon: "music" },
  { route: "/library", bn: "বই", d: "ইসলামিক বই", icon: "book" },
];

export default function HomePage() {
  const [recent, setRecent] = useState<BoyanAudio[]>([]);

  useEffect(() => {
    fetch("/api/boyan")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRecent(d.audios.slice(0, 4)); })
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-up">
      <PrayerCard />

      {/* Live promo */}
      <section className="my-4">
        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-primary-600/20 bg-gradient-to-r from-primary-600/10 to-primary-800/5 p-4 dark:from-primary-600/20 dark:to-slate-800/40">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-500/20 blur-xl" />
          <div className="relative">
            <p className="mb-0.5 text-[10px] font-semibold text-primary-700">লাইভ বয়ান</p>
            <h3 className="text-sm font-bold text-ink">সরাসরি বয়ান শুনুন</h3>
            <p className="mt-0.5 text-[10px] text-ink-faint">নতুন বয়ানের নোটিফিকেশন পান</p>
          </div>
          <Link
            href="/live"
            className="btn-gold relative flex items-center gap-1 !rounded-full px-4 py-2 text-xs shadow"
          >
            <Icon name="radio" size={14} />
            শুনুন
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="my-6">
        <div className="mb-3">
          <Heading t="প্রয়োজনীয় সেবা" link="/others" />
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {SERVICES.map((s) => (
            <Link
              key={s.bn}
              href={s.route}
              className={`${card} group flex flex-col items-center justify-center p-3 text-center`}
            >
              <span className="rounded-xl bg-emerald-50 p-2.5 text-primary-600 transition group-hover:scale-110">
                <Icon name={s.icon} size={20} />
              </span>
              <span className="mt-2 line-clamp-1 w-full text-[11px] font-medium text-ink-soft">{s.bn}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Media */}
      <section className="my-6">
        <div className="mb-3">
          <Heading t="মিডিয়া" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MEDIA.map((m) => (
            <Link key={m.bn} href={m.route} className={`${card} flex items-center gap-3 p-4`}>
              <span className="rounded-xl bg-emerald-50 p-3 text-primary-600">
                <Icon name={m.icon} size={24} />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{m.bn}</span>
                <span className="mt-0.5 block text-[10px] text-ink-faint">{m.d}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent boyan */}
      {recent.length > 0 && (
        <section className="my-6">
          <div className="mb-3">
            <Heading t="সাম্প্রতিক বয়ান" sub="নতুন আপলোড" link="/boyan" />
          </div>
          <div className="space-y-2.5">
            {recent.map((b, i) => (
              <Link key={b.id} href="/boyan" className={`${card} relative flex items-center gap-3.5 p-3.5`}>
                {i === 0 && (
                  <span className="absolute -top-2 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                    NEW
                  </span>
                )}
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary-600">
                  <Icon name="mic" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-ink">{b.title}</span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-ink-faint">
                    <Icon name="calendar" size={12} className="text-primary-600" />
                    {timeAgoBn(b.uploadDate) || `বয়ান ${bnNum(b.id)}`}
                  </span>
                  {b.location && (
                    <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-ink-faint">
                      <Icon name="pin" size={12} className="shrink-0 text-primary-600" />
                      <span className="truncate">{b.location}</span>
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-center text-[11px] text-ink-faint">
        ইসলাহ • দ্বীন জীবনের সঙ্গী
      </p>
    </div>
  );
}
