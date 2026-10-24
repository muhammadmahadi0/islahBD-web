"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import {
  detectLocation, fetchPrayerData,
  toMinutes, getNextPrayer, getCurrentKey, getSpecialPeriod, getNaflWindows, secsUntil,
  prayerName, toBn, hijriText,
  type PrayerTimes,
} from "../lib/prayer";
import { useLang, useTx } from "../store/language-store";
import { CITIES } from "../lib/prayer";

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
  const tx = useTx();
  const lang = useLang();
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<any>(null);
  const [place, setPlace] = useState("ঢাকা");
  const [locating, setLocating] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const loadFor = async (lat: number, lng: number, label: string) => {
    const d = await fetchPrayerData(lat, lng);
    setPlace(label);
    setTimes(d.times);
    setHijri(d.hijri);
  };

  // Tap the location badge for an exact GPS fix with Bengali locality name.
  const refreshGps = () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const { latitude: lat, longitude: lng } = p.coords;
        let label = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        try {
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 8000);
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=bn`,
            { signal: ctl.signal }
          );
          clearTimeout(t);
          if (r.ok) {
            const j = await r.json();
            label = j.city || j.locality || label;
          }
        } catch {
          // keep coords label
        }
        await loadFor(lat, lng, label);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 600000 }
    );
  };

  useEffect(() => {
    let dead = false;
    (async () => {
      const loc = await detectLocation();
      if (dead) return;
      // Show the actual detected name (same as the full prayer page),
      // not the matched city label.
      await loadFor(loc.lat, loc.lng, loc.city);
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
  // Match the dedicated prayer page: during the sunrise prohibition, Ishraq
  // or Chasht, the hero shows that period's name and its remaining time.
  const special = getSpecialPeriod(times, now);
  const remainSec = special ? special.remainSec : secsUntil(next.time, now, next.isTomorrow);
  const win = getNaflWindows(times);
  const specialStart =
    special && special.type === "prohibited"
      ? times.sunrise
      : special && special.type === "ishraq"
        ? win?.ishraqStart
        : special && special.type === "chasht"
          ? win?.chashtStart
          : null;
  const displayName = special
    ? special.type === "prohibited"
      ? prayerName("sunrise", lang)
      : lang === "bn" ? special.labelBn : lang === "ur" ? special.labelUr : special.labelEn
    : prayerName(cur, lang);

  const curStart = toMinutes(specialStart || times[cur]) * 60;
  let winStart = new Date(now);
  winStart.setHours(Math.floor(curStart / 3600), Math.floor((curStart % 3600) / 60), 0, 0);
  if (winStart.getTime() > now.getTime()) winStart.setDate(winStart.getDate() - 1);
  const total = Math.max(1, (now.getTime() - winStart.getTime()) / 1000 + remainSec);
  const done = Math.min(1, Math.max(0, 1 - remainSec / total));

  const R = 15.9155;
  // Leading edge of the progress arc — a small dot makes the start/end
  // of the countdown readable at a glance.
  const markerA = (done * 360 * Math.PI) / 180;
  const markerX = 18 + R * Math.sin(markerA);
  const markerY = 18 - R * Math.cos(markerA);

  const rh = Math.floor(remainSec / 3600);
  const rm = Math.floor((remainSec % 3600) / 60);
  const remainLabel = lang === "bn"
    ? (rh > 0 ? `${toBn(rh)} ঘণ্টা ${toBn(rm)} মি.` : `${toBn(rm)} মি. ${toBn(remainSec % 60)} সে.`)
    : lang === "ur"
      ? (rh > 0 ? `${rh} گھنٹے ${rm} منٹ` : `${rm} منٹ`)
      : (rh > 0 ? `${rh}h ${rm}m` : `${rm}m`);

  const timeLocale = lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-US";
  const fmtDate12 = (d: Date) => {
    let out = d.toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit", hour12: true });
    if (lang === "bn") out = out.replace("AM", tx("এ এম")).replace("PM", tx("পি এম"));
    return out;
  };
  const fmt12 = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return fmtDate12(d);
  };
  const endTime = special
    ? fmtDate12(new Date(now.getTime() + remainSec * 1000))
    : fmt12(next.time);

  const gregText = now.toLocaleDateString(
    lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-GB",
    { weekday: "short", day: "numeric", month: "short" }
  );

  return (
    <div className="page-hero mx-1 my-2 p-4 text-white shadow-xl">
      <div className="relative">
        {/* location + date pills */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <button
            onClick={refreshGps}
            title={tx("GPS দিয়ে সঠিক লোকেশন নিন")}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md transition hover:bg-white/25 active:scale-95"
          >
            <Icon name={locating ? "clock" : "pin"} size={14} className="text-gold-100" />
            <span className="font-medium text-white">{locating ? tx("খোঁজা হচ্ছে…") : (() => {
              const c = CITIES.find((x) => x.name === place || x.nameBn === place);
              return c ? (lang === "bn" ? c.nameBn : lang === "ur" ? tx(c.nameBn) : c.name) : tx(place);
            })()}</span>
          </button>
          <Link
            href="/calendar"
            title={tx("ইসলামিক ক্যালেন্ডার দেখুন")}
            aria-label={tx("ইসলামিক ক্যালেন্ডার দেখুন")}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-right backdrop-blur-md transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="calendar" size={14} className="text-gold-100" />
            <span className="text-xs leading-tight">
              <span className="block font-semibold text-white">{gregText}</span>
              <span className="block text-[11px] text-white/75">{hijriText(hijri, lang)}</span>
            </span>
          </Link>
        </div>

        {/* gauge + current prayer */}
        <div className="my-3 flex items-center justify-between rounded-2xl bg-white/10 p-3.5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path className="text-white/20" strokeWidth="3.5" stroke="currentColor" fill="none" d={`M18 2.0845 a ${R} ${R} 0 0 1 0 31.831 a ${R} ${R} 0 0 1 0 -31.831`} />
              <path
                className="text-gold-100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none"
                strokeDasharray={`${(done * 100).toFixed(1)}, 100`}
                d={`M18 2.0845 a ${R} ${R} 0 0 1 0 31.831 a ${R} ${R} 0 0 1 0 -31.831`}
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="2.2"
                className="fill-gold-100 stroke-white"
                strokeWidth="0.7"
              />
            </svg>
            <div className="absolute px-1 text-center">
              <p className="text-[11px] text-white/75">{tx("এখন")}</p>
              <p className="text-[11px] font-bold leading-tight">{remainLabel}</p>
              <p className="text-[10px] text-white/70">{tx("বাকি")}</p>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-gold px-2 py-0.5 text-xs font-bold text-[#1a1405]">{tx("এখন")}</span>
              <span className="text-2xl font-bold tracking-wide text-white">{displayName}</span>
            </div>
            <div className="flex gap-3 text-xs text-white/80">
              <div>
                <span className="block text-[11px] opacity-75">{tx("শুরু")}</span>
                <span className="font-semibold tabular-nums text-white">{fmt12(specialStart || times[cur])}</span>
              </div>
              <div className="border-l border-white/20 pl-3">
                <span className="block text-[11px] opacity-75">{tx("শেষ")}</span>
                <span className="font-semibold tabular-nums text-white">{endTime}</span>
              </div>
            </div>
            <Link href="/prayer-times" className="mt-2 inline-block text-xs font-bold text-gold-100 underline-offset-2 hover:underline">
              {tx("পূর্ণ সময়সূচি →")}
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
                <p className="mb-1 text-xs">{prayerName(key, lang)}</p>
                <p className="text-[11px] font-semibold tabular-nums">{fmt12(times[key])}</p>
                <Icon name={icon} size={13} className="mx-auto mt-1 opacity-80" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
