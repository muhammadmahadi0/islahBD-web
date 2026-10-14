"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import {
  CITIES, detectLocation, matchCity, fetchPrayerData,
  toMinutes, getNextPrayer, getCurrentKey, secsUntil,
  prayerName, toBn, hijriText,
  type PrayerTimes,
} from "../lib/prayer";

// Compact prayer card: current prayer + times on the left (golden text),
// circular countdown gauge on the right. Theme-aware surface.
const GRID: { key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; icon: string }[] = [
  { key: "fajr", icon: "moon" },
  { key: "dhuhr", icon: "sun" },
  { key: "asr", icon: "sun" },
  { key: "maghrib", icon: "sunset" },
  { key: "isha", icon: "moon" },
];

export default function PrayerCard() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<any>(null);
  const [place, setPlace] = useState("Dhaka");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let dead = false;
    (async () => {
      const savedCity = localStorage.getItem("praybd-city");
      if (savedCity) {
        const c = CITIES.find((x) => x.key === savedCity);
        if (c) {
          const d = await fetchPrayerData(c.lat, c.lng);
          if (!dead) {
            setPlace(c.name);
            setTimes(d.times);
            setHijri(d.hijri);
          }
          return;
        }
      }
      const loc = await detectLocation();
      if (dead) return;
      const m = CITIES.find((x) => x.key === matchCity(loc.city));
      setPlace(m ? m.name : loc.city);
      const d = await fetchPrayerData(loc.lat, loc.lng);
      if (!dead) {
        setTimes(d.times);
        setHijri(d.hijri);
      }
    })();
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => { dead = true; clearInterval(tick); };
  }, []);

  if (!times) {
    return (
      <div className="card flex animate-pulse items-center gap-4 p-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded-full bg-sand-dark" />
          <div className="h-4 w-1/2 rounded-full bg-sand-dark" />
        </div>
        <div className="h-20 w-20 rounded-full bg-sand-dark" />
      </div>
    );
  }

  const next = getNextPrayer(times, now);
  const cur = getCurrentKey(times, now);
  const remainSec = secsUntil(next.time, now, next.isTomorrow);

  // Gauge progress: elapsed share of the current prayer window
  const curStart = toMinutes(times[cur]) * 60;
  let winStart = new Date(now);
  winStart.setHours(Math.floor(curStart / 3600), Math.floor((curStart % 3600) / 60), 0, 0);
  if (winStart.getTime() > now.getTime()) winStart.setDate(winStart.getDate() - 1);
  const total = Math.max(1, (now.getTime() - winStart.getTime()) / 1000 + remainSec);
  const done = Math.min(1, Math.max(0, 1 - remainSec / total));

  const R = 30;
  const CIRC = 2 * Math.PI * R;

  const rh = Math.floor(remainSec / 3600);
  const rm = Math.floor((remainSec % 3600) / 60);
  const rs = remainSec % 60;
  const remainBn = rh > 0 ? `${toBn(rh)}ঘ ${toBn(rm)}ম` : `${toBn(rm)}ম ${toBn(rs)}সে`;

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return toBn(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }))
      .replace("AM", "এ এম").replace("PM", "পি এম");
  };

  const gregEn = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="card animate-fade-up p-4">
      {/* location + dates */}
      <div className="flex items-center justify-between gap-2">
        <span className="chip">
          <Icon name="pin" size={13} />
          {place}
        </span>
        <span className="text-right text-[11px] font-bold leading-tight text-ink-faint">
          <span className="block">{gregEn}</span>
          <span className="block">{hijriText(hijri, "bn")}</span>
        </span>
      </div>

      {/* left: current prayer + times | right: gauge */}
      <div className="mt-1 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-ink-faint">এখন চলছে</div>
          <div className="gold-text text-[26px] font-bold leading-tight">
            {prayerName(cur, "bn")}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold tabular-nums">
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-primary-700">
              শুরু {fmt(times[cur])}
            </span>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-primary-700">
              শেষ {fmt(next.time)}
            </span>
          </div>
          <div className="gold-text mt-1 text-sm font-bold tabular-nums">
            বাকি {remainBn}
          </div>
        </div>
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="currentColor" strokeWidth="8" className="text-primary-50" opacity={0.5} />
            <circle
              cx="40" cy="40" r={R} fill="none"
              stroke="url(#homeGauge)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - done)}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="homeGauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E6CA65" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon name="clock" size={15} className="text-gold-600" />
            <div className="text-[11px] font-bold tabular-nums">{remainBn}</div>
          </div>
        </div>
      </div>

      {/* 5-prayer grid */}
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {GRID.map(({ key, icon }) => {
          const active = key === cur;
          return (
            <div
              key={key}
              className={`rounded-2xl p-2 text-center transition ${
                active ? "bg-primary-600 text-white shadow-card" : "bg-sand"
              }`}
            >
              <Icon name={icon} size={15} className="mx-auto" />
              <div className="mt-0.5 text-[10px] font-bold">{prayerName(key, "bn")}</div>
              <div className="text-[10px] font-bold tabular-nums opacity-80">{fmt(times[key])}</div>
            </div>
          );
        })}
      </div>

      <Link
        href="/prayer-times"
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-2xl bg-primary-50 py-2 text-[12px] font-bold text-primary-700 transition hover:bg-primary-100 active:scale-[0.99]"
      >
        <Icon name="clock" size={15} />
        পূর্ণ সময়সূচি দেখুন
      </Link>
    </div>
  );
}
