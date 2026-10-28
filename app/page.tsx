"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrayerCard from "../components/PrayerCard";
import { Icon } from "../components/icons";
import { boyanToTrack, BOYAN_REFRESH_MS } from "../lib/audio";
import type { BoyanAudio } from "../lib/audio";
import { LIVE_POLL_MS } from "../lib/live";
import { usePlayerStore } from "../store/player-store";
import { useLang, useNum, useTimeAgo, useTx } from "../store/language-store";
import { useLocalizedData } from "../lib/content-translate";

const card =
  "bg-white dark:bg-[rgba(30,41,59,0.65)] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm hover:border-amber-400/50 transition cursor-pointer";

// Staggered rise-in used across the home sections. 17 steps × 28ms + 380ms
// keeps the whole sequence just under a second.
const RISE_STEP = 0.028;
const rise = (n: number) => ({ animationDelay: `${(n * RISE_STEP).toFixed(3)}s` });

function Heading({ t, sub, link }: { t: string; sub?: string; link?: string }) {
  const tx = useTx();
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
          {tx("সব দেখুন")}
        </Link>
      )}
    </div>
  );
}

function DesktopHeading({ title, sub, link }: { title: string; sub?: string; link?: string }) {
  const tx = useTx();
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-tight text-ink">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary-500 to-gold-500" />
          {title}
        </h2>
        {sub && <p className="ms-3.5 mt-1 text-[12px] font-medium text-ink-faint">{sub}</p>}
      </div>
      {link && (
        <Link
          href={link}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-3.5 py-2 text-[12px] font-bold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300"
        >
          {tx("সব দেখুন")}
          <Icon name="chevron" size={14} />
        </Link>
      )}
    </div>
  );
}

const SERVICES: { route: string; bn: string; icon: string }[] = [
  { route: "/quran", bn: "কুরআন", icon: "openbook" },
  { route: "/live", bn: "লাইভ", icon: "radio" },
  { route: "/dua", bn: "দোআ", icon: "hands" },
  { route: "/wazifa", bn: "ওয়াজিফা ও দরূদ", icon: "sparkle" },
  { route: "/boyan", bn: "বয়ান", icon: "mic" },
  { route: "/member", bn: "আজীবন সদস্য সম্মেলন", icon: "star" },
  { route: "/hajj-umrah", bn: "হজ ও ওমরাহ", icon: "kaaba" },
  { route: "/sunnat", bn: "সুন্নাত ও আদব", icon: "leaf" },
];

const MEDIA = [
  { route: "/boyan", bn: "বয়ান", d: "বয়ানের অডিও", icon: "mic" },
  { route: "/media", bn: "সংক্ষিপ্ত ক্লিপস", d: "হাইলাইটস", icon: "play" },
  { route: "/hamdnaat", bn: "হামদ-নাত", d: "ইসলামিক গজল", icon: "music" },
  { route: "/library", bn: "বই", d: "ইসলামিক বই", icon: "library" },
];

export default function HomePage() {
  const tx = useTx();
  const num = useNum();
  const timeAgo = useTimeAgo();
  const lang = useLang();
  const [recent, setRecent] = useState<BoyanAudio[]>([]);
  const [isLive, setIsLive] = useState(false);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/api/boyan", { cache: "no-store" });
        if (!res.ok) return;
        const d = await res.json();
        if (!dead && d.success && Array.isArray(d.audios)) {
          setRecent(d.audios.slice(0, 4));
        }
      } catch {
        // Keep the last known uploads; the next refresh can recover.
      }
    };
    load();
    const id = setInterval(load, BOYAN_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", load);
    window.addEventListener("online", load);
    return () => {
      dead = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", load);
      window.removeEventListener("online", load);
    };
  }, []);

  // Match the live page's status poll so the Listen button flickers only
  // while a broadcast is actually on air.
  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const data = await res.json();
        if (!dead && data.success) setIsLive(!!data.live?.isLive);
      } catch {
        // Keep the last known state; the next poll can recover.
      }
    };
    load();
    const id = setInterval(load, LIVE_POLL_MS);
    return () => { dead = true; clearInterval(id); };
  }, []);

  const recentL = useLocalizedData(recent, lang);
  const recentTracks = recentL.map(boyanToTrack);

  return (
    <>
      {/* Desktop home — wide, reference-style layout. Hidden below lg so the
          original mobile screen stays exactly as it was. */}
      <div className="hidden lg:block">
        <section className="home-rise relative" style={rise(0)}>
          <div className="scholar-banner scholar-hero relative overflow-hidden text-center">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="home-art home-art-nabawi">
                <img
                  src="/images/hero/masjid-nabawi.jpg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="home-art-img home-art-img-light"
                />
                <img
                  src="/images/hero/masjid-nabawi-dark.jpg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="home-art-img home-art-img-dark"
                />
              </div>
              <div className="home-art home-art-kaaba">
                <img
                  src="/images/hero/kaaba-sharif.jpg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="home-art-img home-art-img-light"
                />
                <img
                  src="/images/hero/kaaba-sharif-dark.jpg"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="home-art-img home-art-img-dark"
                />
              </div>
            </div>
            <div className="relative z-10 pt-28">
              <div className="mx-auto flex max-w-3xl items-center justify-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-600/35" />
                <p className="hero-lineage text-[12.5px] font-medium leading-relaxed text-ink-soft">
                  {tx("তারজুমান-এ-আকাবির আরিফ বিল্লাহ হযরত মাওলানা শাহ আব্দুল মতিন বিন হুসাইন সাহেব-এর খলিফা হযরত")}
                </p>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-600/35" />
              </div>
              <h1 className="gold-text mt-3 font-extrabold leading-tight tracking-wide">
                {tx("মাওলানা তৈয়্যেব আশরাফ সাহেব")}
              </h1>
              <p className="mt-2 text-[12.5px] font-semibold tracking-wide text-gold-600">
                {tx("দামাত বারাকাতুহুম")}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link href="/boyan" className="btn-primary !rounded-full px-7 py-3 text-sm shadow-lift">
                  <Icon name="mic" size={16} />
                  {tx("বয়ান শুনুন")}
                  <Icon name="chevron" size={15} />
                </Link>
                <Link href="/paribar" className="btn-outline !rounded-full px-7 py-3 text-sm">
                  <Icon name="users" size={16} />
                  {tx("হযরত সম্পর্কে জানুন")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start gap-5">
          <div className="min-w-0">
            <PrayerCard />
          </div>

          <div className="min-w-0 space-y-4">
            <section className="home-rise" style={rise(1)}>
              <div className="relative flex items-center justify-between overflow-hidden rounded-3xl border border-primary-600/20 bg-gradient-to-r from-primary-600/10 to-primary-800/5 p-5 dark:from-primary-600/20 dark:to-slate-800/40">
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary-500/20 blur-xl" />
                <div className="relative">
                  <p className="mb-1 text-[11px] font-bold text-primary-700 dark:text-primary-300">
                    {tx("লাইভ বয়ান")}
                  </p>
                  <h3 className="text-base font-extrabold text-ink">{tx("সরাসরি বয়ান শুনুন")}</h3>
                  <p className="mt-1 text-[11.5px] text-ink-faint">
                    {tx("নতুন বয়ানের নোটিফিকেশন পান")}
                  </p>
                </div>
                <Link
                  href="/live"
                  className={`btn-gold relative flex items-center gap-1.5 !rounded-full px-5 py-2.5 text-sm shadow ${
                    isLive ? "live-flicker" : ""
                  }`}
                >
                  <Icon name="radio" size={15} />
                  {tx("শুনুন")}
                </Link>
              </div>
            </section>

            <section className="home-rise" style={rise(2)}>
              <DesktopHeading title={tx("মিডিয়া")} sub={tx("দেখুন ও শুনুন")} />
              <div className="grid grid-cols-2 gap-3">
                {MEDIA.map((m, i) => (
                  <Link
                    key={m.bn}
                    href={m.route}
                    className={`${card} home-rise flex items-center gap-3 p-4`}
                    style={rise(3 + i)}
                  >
                    <span className="rounded-2xl bg-emerald-50 p-3 text-primary-600 dark:bg-primary-500/10">
                      <Icon name={m.icon} size={24} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{tx(m.bn)}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-faint">{tx(m.d)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="mt-7">
          <div className="home-rise" style={rise(7)}>
            <DesktopHeading
              title={tx("প্রয়োজনীয় সেবা")}
              sub={tx("এক ট্যাপে প্রয়োজনীয় সবকিছু")}
              link="/others"
            />
          </div>
          <div className="grid grid-cols-8 gap-3">
            {SERVICES.map((s, i) => (
              <Link
                key={s.bn}
                href={s.route}
                className={`${card} home-rise group flex flex-col items-center justify-center p-4 text-center`}
                style={rise(8 + i)}
              >
                <span className="rounded-2xl bg-emerald-50 p-3 text-primary-600 transition group-hover:scale-110 dark:bg-primary-500/10">
                  <Icon name={s.icon} size={24} />
                </span>
                <span className="mt-2.5 w-full text-[12px] font-semibold leading-tight text-ink-soft">
                  {tx(s.bn)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {recentL.length > 0 && (
          <section className="mt-7">
            <div className="home-rise" style={rise(0)}>
              <DesktopHeading
                title={tx("সাম্প্রতিক বয়ান")}
                sub={tx("নতুন আপলোড")}
                link="/boyan"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {recentL.map((b, i) => {
                const track = recentTracks[i];
                const active = currentTrack?.id === track.id;
                const playing = active && isPlaying;
                return (
                  <div
                    key={b.id}
                    className={`${card} home-rise relative flex items-center gap-3.5 p-3.5`}
                    style={rise(1 + i)}
                  >
                    {i === 0 && (
                      <span className="absolute -top-2 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        NEW
                      </span>
                    )}
                    <button
                      onClick={() => (active ? togglePlay() : playTrack(track, recentTracks, i))}
                      aria-label={`${b.title} — ${playing ? tx("বিরতি") : tx("চালান")}`}
                      aria-pressed={playing}
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                        playing
                          ? "bg-primary-600 text-white shadow-md"
                          : "bg-emerald-50 text-primary-600 hover:bg-emerald-100 dark:bg-primary-500/10"
                      }`}
                    >
                      <Icon name={playing ? "pause" : "playfill"} size={20} />
                    </button>
                    <Link href="/boyan" className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{b.title}</span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-ink-faint">
                        <Icon name="calendar" size={12} className="text-primary-600" />
                        {timeAgo(b.uploadDate) || `${tx("বয়ান")} ${num(b.id)}`}
                      </span>
                      {b.location && (
                        <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-ink-faint">
                          <Icon name="pin" size={12} className="shrink-0 text-primary-600" />
                          <span className="truncate">{b.location}</span>
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Mobile home — unchanged. */}
      <div className="lg:hidden">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-4">
          {/* Right rail on desktop (prayer first on mobile) */}
          <aside className="home-rise order-first min-w-0 lg:order-2 lg:sticky lg:top-24" style={rise(0)}>
            <PrayerCard />
          </aside>

          <div className="min-w-0 lg:order-1">
          {/* Live promo */}
          <section className="home-rise my-4" style={rise(1)}>
            <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-primary-600/20 bg-gradient-to-r from-primary-600/10 to-primary-800/5 p-4 dark:from-primary-600/20 dark:to-slate-800/40">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-500/20 blur-xl" />
              <div className="relative">
                <p className="mb-0.5 text-[10px] font-semibold text-primary-700">{tx("লাইভ বয়ান")}</p>
                <h3 className="text-sm font-bold text-ink">{tx("সরাসরি বয়ান শুনুন")}</h3>
                <p className="mt-0.5 text-[10px] text-ink-faint">{tx("নতুন বয়ানের নোটিফিকেশন পান")}</p>
              </div>
              <Link
                href="/live"
                className={`btn-gold relative flex items-center gap-1 !rounded-full px-4 py-2 text-xs shadow ${
                  isLive ? "live-flicker" : ""
                }`}
              >
                <Icon name="radio" size={14} />
                {tx("শুনুন")}
              </Link>
            </div>
          </section>

          {/* Services */}
          <section className="my-6">
            <div className="home-rise mb-3" style={rise(2)}>
              <Heading t={tx("প্রয়োজনীয় সেবা")} link="/others" />
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {SERVICES.map((s, i) => (
                <Link
                  key={s.bn}
                  href={s.route}
                  className={`${card} home-rise group flex flex-col items-center justify-center p-3 text-center`}
                  style={rise(3 + i)}
                >
                  <span className="rounded-xl bg-emerald-50 p-2.5 text-primary-600 transition group-hover:scale-110">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="mt-2 line-clamp-3 w-full text-[11px] font-medium leading-tight text-ink-soft">{tx(s.bn)}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Media */}
          <section className="my-6">
            <div className="home-rise mb-3" style={rise(11)}>
              <Heading t={tx("মিডিয়া")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MEDIA.map((m, i) => (
                <Link
                  key={m.bn}
                  href={m.route}
                  className={`${card} home-rise flex items-center gap-3 p-4`}
                  style={rise(12 + i)}
                >
                  <span className="rounded-xl bg-emerald-50 p-3 text-primary-600">
                    <Icon name={m.icon} size={24} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{tx(m.bn)}</span>
                    <span className="mt-0.5 block text-[10px] text-ink-faint">{tx(m.d)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent boyan */}
          {recentL.length > 0 && (
            <section className="my-6">
              {/* Loaded after the API call, so this group restarts its own
                  short stagger instead of inheriting the page-level delays. */}
              <div className="home-rise mb-3" style={rise(0)}>
                <Heading t={tx("সাম্প্রতিক বয়ান")} sub={tx("নতুন আপলোড")} link="/boyan" />
              </div>
              <div className="space-y-2.5">
                {recentL.map((b, i) => {
                  const track = recentTracks[i];
                  const active = currentTrack?.id === track.id;
                  const playing = active && isPlaying;
                  return (
                    <div
                      key={b.id}
                      className={`${card} home-rise relative flex items-center gap-3.5 p-3.5`}
                      style={rise(1 + i)}
                    >
                      {i === 0 && (
                        <span className="absolute -top-2 left-3 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                          NEW
                        </span>
                      )}
                      <button
                        onClick={() => (active ? togglePlay() : playTrack(track, recentTracks, i))}
                        aria-label={`${b.title} — ${playing ? tx("বিরতি") : tx("চালান")}`}
                        aria-pressed={playing}
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                          playing
                            ? "bg-primary-600 text-white shadow-md"
                            : "bg-emerald-50 text-primary-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Icon name={playing ? "pause" : "playfill"} size={20} />
                      </button>
                      <Link href="/boyan" className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-ink">{b.title}</span>
                        <span className="mt-1 flex items-center gap-1 text-[10px] text-ink-faint">
                          <Icon name="calendar" size={12} className="text-primary-600" />
                          {timeAgo(b.uploadDate) || `${tx("বয়ান")} ${num(b.id)}`}
                        </span>
                        {b.location && (
                          <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-ink-faint">
                            <Icon name="pin" size={12} className="shrink-0 text-primary-600" />
                            <span className="truncate">{b.location}</span>
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <p className="home-rise mt-8 text-center text-[11px] text-ink-faint" style={rise(16)}>
            {tx("ইসলাহ • দ্বীনি জীবনের সাথী")}
          </p>
          </div>
        </div>
      </div>
    </>
  );
}
