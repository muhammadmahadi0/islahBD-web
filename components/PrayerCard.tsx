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

// Prayer card in the islah.html layout: gold gradient, dotted texture,
// location/date pills, gauge LEFT with remaining, current prayer RIGHT
// with start/end, 5-prayer grid with highlighted active tile.
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
      <div className="prayer-gold mx-1 my-2 animate-pulse p-4">
        <div className="flex items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-black/10" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 rounded-full bg-black/10" />
            <div className="h-4 w-1/2 rounded-full bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  const next = getNextPrayer(times, now);
  const cur = getCurrentKey(times, now);
  const remainSec = secsUntil(next.time, now, next.isTomorrow);

  const curStart = toMinutes(times[cur]) * 60;
  let winStart = new Date(now);
  winStart.setHours(Math.floor(curStart / 3600), Math.floor((curStart % 3600) / 60), 0, 0);
  if (winStart.getTime() > now.getTime()) winStart.setDate(winStart.getDate() - 1);
  const total = Math.max(1, (now.getTime() - winStart.getTime()) / 1000 + remainSec);
  const done = Math.min(1, Math.max(0, 1 - remainSec / total));

  const R = 15.9155;
  const CIRC = 2 * Math.PI * R;

  const rh = Math.floor(remainSec / 3600);
  const rm = Math.floor((remainSec % 3600) / 60);
  const remainBn = rh > 0 ? `${toBn(rh)} ঘণ্টা ${toBn(rm)} মি.` : `${toBn(rm)} মি. ${toBn(remainSec % 60)} সে.`;

  const fmt12 = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const gregEn = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="page-hero mx-1 my-2 p-4 text-white shadow-xl">
      <div className="relative">
        {/* location + date pills */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
            <Icon name="pin" size={14} className="text-gold-100" />
            <span className="font-medium text-white">{place}</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-right backdrop-blur-md">
            <Icon name="calendar" size={14} className="text-gold-100" />
            <span className="text-[11px] leading-tight">
              <span className="block font-semibold text-white">{gregEn}</span>
              <span className="block text-[10px] text-white/75">{hijriText(hijri, "bn")}</span>
            </span>
          </span>
        </div>

        {/* gauge + current prayer */}
        <div className="my-3 flex items-center justify-between rounded-2xl bg-white/10 p-3.5">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-white/20" strokeWidth="3.5" stroke="currentColor" fill="none" d={`M18 2.0845 a ${R} ${R} 0 0 1 0 31.831 a ${R} ${R} 0 0 1 0 -31.831`} />
              <path
                className="text-gold-100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none"
                strokeDasharray={`${(done * 100).toFixed(1)}, 100`}
                d={`M18 2.0845 a ${R} ${R} 0 0 1 0 31.831 a ${R} ${R} 0 0 1 0 -31.831`}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-[10px] text-white/75">এখন</p>
              <p className="text-[10px] font-bold leading-tight">{remainBn}</p>
              <p className="text-[9px] text-white/70">বাকি</p>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-gold px-2 py-0.5 text-xs font-bold text-[#1a1405]">এখন</span>
              <span className="text-2xl font-bold tracking-wide text-white">{prayerName(cur, "bn")}</span>
            </div>
            <div className="flex gap-3 text-[11px] text-white/80">
              <div>
                <span className="block text-[10px] opacity-75">শুরু</span>
                <span className="font-semibold tabular-nums text-white">{fmt12(times[cur])}</span>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="block text-[10px] opacity-75">শেষ</span>
                <span className="font-semibold tabular-nums text-white">{fmt12(next.time)}</span>
              </div>
            </div>
            <Link href="/prayer-times" className="mt-2 inline-block text-[11px] font-bold text-gold-100 underline-offset-2 hover:underline">
              পূর্ণ সময়সূচি →
            </Link>
          </div>
        </div>

        {/* 5-grid */}
        <div className="relative mt-3 grid grid-cols-5 gap-1.5 pt-2">
          {GRID.map(({ key, icon }) => {
            const active = key === cur;
            return (
              <div
                key={key}
                className={`rounded-xl p-2 text-center transition-all ${
                  active
                    ? "scale-105 bg-gold font-bold text-[#1a1405] shadow-lg"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                <p className="mb-1 text-[11px]">{prayerName(key, "bn")}</p>
                <p className="text-[10px] font-semibold tabular-nums">{fmt12(times[key])}</p>
                <Icon name={icon} size={12} className="mx-auto mt-1 opacity-80" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
