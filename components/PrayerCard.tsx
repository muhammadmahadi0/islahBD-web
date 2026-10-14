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

// Golden prayer card — rich gold in BOTH modes: location + dual date,
// circular countdown gauge, active-prayer badge with start/end pills,
// 5-prayer grid with sun/moon icons.
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
      <div className="prayer-gold animate-pulse p-5">
        <div className="mx-auto h-36 w-36 rounded-full bg-black/10" />
        <div className="mt-3 h-5 rounded-full bg-black/10" />
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

  const R = 64;
  const CIRC = 2 * Math.PI * R;

  const rh = Math.floor(remainSec / 3600);
  const rm = Math.floor((remainSec % 3600) / 60);
  const remainBn = rh > 0 ? `${toBn(rh)} ঘণ্টা ${toBn(rm)} মি.` : `${toBn(rm)} মি. ${toBn(remainSec % 60)} সে.`;

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return toBn(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }))
      .replace("AM", "এ এম").replace("PM", "পি এম");
  };

  const gregEn = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="prayer-gold animate-fade-up p-5">
      <div className="relative z-10">
        {/* location + dates */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0b1120] px-3 py-1 text-[11px] font-bold text-[#e6ca65]">
            <Icon name="pin" size={13} />
            {place}
          </span>
          <span className="text-right text-[11px] font-bold leading-tight text-[#1a1405]/80">
            <span className="block">{gregEn}</span>
            <span className="block">{hijriText(hijri, "bn")}</span>
          </span>
        </div>

        {/* gauge */}
        <div className="relative mx-auto mt-2 h-44 w-44">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(11,17,32,0.18)" strokeWidth="11" />
            <circle
              cx="80" cy="80" r={R} fill="none"
              stroke="#0b1120" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - done)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-[11px] font-bold text-[#1a1405]/70">এখন</div>
            <div className="text-lg font-bold leading-tight tabular-nums">{remainBn} বাকি</div>
          </div>
        </div>

        {/* active badge + start/end pills */}
        <div className="mt-1 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1120] px-4 py-1.5 text-sm font-bold text-[#e6ca65]">
            <Icon name="moon" size={15} />
            এখন {prayerName(cur, "bn")}
          </span>
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-black/15 px-3 py-1 tabular-nums">শুরু {fmt(times[cur])}</span>
            <span className="rounded-full bg-black/15 px-3 py-1 tabular-nums">শেষ {fmt(next.time)}</span>
          </div>
        </div>

        {/* 5-prayer grid */}
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {GRID.map(({ key, icon }) => {
            const active = key === cur;
            return (
              <div
                key={key}
                className={`rounded-2xl p-2 text-center transition ${
                  active ? "bg-[#0b1120] text-[#e6ca65] shadow-lift" : "bg-black/10"
                }`}
              >
                <Icon name={icon} size={17} className="mx-auto" />
                <div className="mt-1 text-[11px] font-bold">{prayerName(key, "bn")}</div>
                <div className="text-[10px] font-bold tabular-nums opacity-80">{fmt(times[key])}</div>
              </div>
            );
          })}
        </div>

        <Link
          href="/prayer-times"
          className="relative z-10 mx-auto mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0b1120]/90 py-2.5 text-[13px] font-bold text-[#e6ca65] transition hover:bg-[#0b1120] active:scale-[0.99]"
        >
          <Icon name="clock" size={16} />
          পূর্ণ সময়সূচি দেখুন
        </Link>
      </div>
    </div>
  );
}
