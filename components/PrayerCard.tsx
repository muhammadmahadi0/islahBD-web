"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import {
  CITIES, detectLocation, matchCity, fetchPrayerData,
  getNextPrayer, getCurrentKey, secsUntil, prayerName, toBn,
  type PrayerTimes,
} from "../lib/prayer";

// Home prayer card — same pray-bd engine (Aladhan Karachi/Hanafi,
// auto location, 24h cache) in compact card form.
const ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

export default function PrayerCard() {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [place, setPlace] = useState("ঢাকা");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let dead = false;
    (async () => {
      const savedCity = localStorage.getItem("praybd-city");
      if (savedCity) {
        const c = CITIES.find((x) => x.key === savedCity);
        if (c) {
          if (!dead) {
            setPlace(c.nameBn);
            setTimes((await fetchPrayerData(c.lat, c.lng)).times);
          }
          return;
        }
      }
      const loc = await detectLocation();
      if (dead) return;
      const m = CITIES.find((x) => x.key === matchCity(loc.city));
      setPlace(m ? m.nameBn : loc.city);
      setTimes((await fetchPrayerData(loc.lat, loc.lng)).times);
    })();
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => { dead = true; clearInterval(tick); };
  }, []);

  if (!times) {
    return (
      <div className="card animate-pulse overflow-hidden">
        <div className="h-36 bg-sand-dark/60" />
        <div className="grid grid-cols-3 gap-2 p-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-sand-dark/60" />
          ))}
        </div>
      </div>
    );
  }

  const next = getNextPrayer(times, now);
  const cur = getCurrentKey(times, now);
  const s = secsUntil(next.time, now, next.isTomorrow);
  const cd = `${toBn(Math.floor(s / 3600))}ঘ ${toBn(Math.floor((s % 3600) / 60))}ম`;

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return toBn(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }))
      .replace("AM", "এ এম").replace("PM", "পি এম");
  };

  return (
    <div className="card animate-fade-up overflow-hidden">
      <div className="page-hero !rounded-none !shadow-none p-5">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/70">
              <Icon name="pin" size={14} />
              {place}
            </div>
            <div className="mt-1 text-[13px] text-white/75">এখন চলছে</div>
            <div className="text-[32px] font-bold leading-tight tracking-tight">
              {prayerName(cur, "bn")}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold tabular-nums">
              <Icon name="clock" size={14} />
              বাকি {cd}
            </div>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10">
            <Icon name="mosque" size={44} className="text-gold-100" strokeWidth={1.4} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {ORDER.map((k) => {
          const isCur = k === cur;
          return (
            <div
              key={k}
              className={`rounded-2xl border p-2.5 text-center transition ${
                isCur ? "border-gold bg-gold-light shadow-card" : "border-primary-900/10 bg-sand"
              }`}
            >
              <div className={`text-[12px] font-bold ${isCur ? "text-gold-dark" : "text-ink-soft"}`}>
                {prayerName(k, "bn")}
              </div>
              <div className="text-[13px] font-bold tabular-nums">{fmt(times[k])}</div>
            </div>
          );
        })}
      </div>
      <Link
        href="/prayer-times"
        className="mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-2xl bg-primary-50 py-2.5 text-[13px] font-bold text-primary-700 transition hover:bg-primary-100 active:scale-[0.99]"
      >
        <Icon name="clock" size={16} />
        পূর্ণ সময়সূচি ও কাউন্টডাউন
      </Link>
    </div>
  );
}
