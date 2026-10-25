"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../icons";
import {
  fetchPrayerData,
  formatCountdown,
  formatTime12,
  getCurrentKey,
  getNextPrayer,
  gregorianText,
  hijriText,
  prayerName,
  secsUntil,
  toBn,
  type HijriInfo,
  type PrayerKey,
  type PrayerTimes,
} from "../../lib/prayer";
import { useLang, useNum, useTx } from "../../store/language-store";

// Prayer-aware hero for the Hajj & Umrah hub. Mirrors HajjHeroHeader:
// city toggle (Dhaka / Makkah / Madinah), live clock, next prayer countdown
// and the five daily prayer times. Timings come from the same cached Aladhan
// proxy used by /prayer-times.

const PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

interface HubCity {
  key: string;
  labelBn: string;
  labelEn: string;
  lat: number;
  lng: number;
  tz: string;
  icon: string;
  sourceBn: string;
  sourceEn: string;
}

const HUBS: HubCity[] = [
  {
    key: "dhaka",
    labelBn: "ঢাকা",
    labelEn: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    tz: "Asia/Dhaka",
    icon: "pin",
    sourceBn: "ঢাকার নামাজের সময়সূচী",
    sourceEn: "Dhaka prayer schedule",
  },
  {
    key: "makkah",
    labelBn: "মক্কা",
    labelEn: "Makkah",
    lat: 21.4225,
    lng: 39.8262,
    tz: "Asia/Riyadh",
    icon: "kaaba",
    sourceBn: "মসজিদুল হারামের সময়সূচী",
    sourceEn: "Masjid al-Haram schedule",
  },
  {
    key: "madinah",
    labelBn: "মদিনা",
    labelEn: "Madinah",
    lat: 24.4672,
    lng: 39.6111,
    tz: "Asia/Riyadh",
    icon: "mosque",
    sourceBn: "মসজিদে নববীর সময়সূচী",
    sourceEn: "Masjid an-Nabawi schedule",
  },
];

/** A Date whose local components match the wall clock in `tz`. */
function cityNow(tz: string, at: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  const hour = get("hour") % 24;
  return new Date(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
}

function clockParts(tz: string, at: Date) {
  const c = cityNow(tz, at);
  const h24 = c.getHours();
  return {
    h12: h24 % 12 || 12,
    minute: c.getMinutes(),
    second: c.getSeconds(),
    pm: h24 >= 12,
    date: c,
  };
}

export function HajjHero() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();

  const [cityKey, setCityKey] = useState("dhaka");
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<HijriInfo | null>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const city = HUBS.find((c) => c.key === cityKey) || HUBS[0];

  const load = useCallback(async (hub: HubCity, force = false) => {
    const id = ++requestId.current;
    if (force) setRefreshing(true);
    else setLoading(true);
    const data = await fetchPrayerData(hub.lat, hub.lng, force);
    if (id !== requestId.current) return;
    setTimes(data.times);
    setHijri(data.hijri);
    setOffline(data.offline);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    load(city);
  }, [city, load]);

  const cNow = cityNow(city.tz, now);
  const clock = clockParts(city.tz, now);
  const next = times ? getNextPrayer(times, cNow) : null;
  const current = times ? getCurrentKey(times, cNow) : null;
  const remain = next ? secsUntil(next.time, cNow, next.isTomorrow) : 0;
  const countdown = formatCountdown(
    Math.floor(remain / 3600),
    Math.floor((remain % 3600) / 60),
    remain % 60,
    lang
  );
  const amPm = clock.pm
    ? lang === "bn"
      ? "অপরাহ্ন"
      : lang === "ur"
        ? "شام"
        : "PM"
    : lang === "bn"
      ? "পূর্বাহ্ন"
      : lang === "ur"
        ? "صبح"
        : "AM";
  const pad = (n: number) => String(n).padStart(2, "0");
  const clockText = `${lang === "bn" ? toBn(clock.h12) : clock.h12}:${lang === "bn" ? toBn(pad(clock.minute)) : pad(clock.minute)}`;
  const seconds = lang === "bn" ? toBn(pad(clock.second)) : pad(clock.second);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3D2C] via-[#0E7C5B] to-[#083B2A] p-4 text-white shadow-lift sm:p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(230,202,101,0.35),transparent_65%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)]"
      />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-gold-100 ring-1 ring-inset ring-white/15">
            <Icon name="mosque" size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-extrabold tracking-tight">
              {tx("হজ ও ওমরা গাইড")}
            </h1>
            <p className="truncate text-[10.5px] font-semibold text-white/65">
              {tx("নামাজের সময় ও দিনভিত্তিক আমল")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(city, true)}
            disabled={refreshing}
            aria-label={tx("সময়সূচী রিফ্রেশ করুন")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-inset ring-white/15 transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
          >
            <Icon name="refresh" size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* city toggle */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-inset ring-white/10">
          {HUBS.map((hub) => {
            const active = hub.key === cityKey;
            return (
              <button
                key={hub.key}
                type="button"
                onClick={() => setCityKey(hub.key)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11.5px] font-bold transition ${
                  active
                    ? "bg-white/25 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white/90"
                }`}
              >
                <Icon name={hub.icon} size={13} className={active ? "text-gold-100" : ""} />
                {lang === "bn" ? hub.labelBn : hub.labelEn}
              </button>
            );
          })}
        </div>

        {/* clock card */}
        <div className="mt-2.5 rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[30px] font-black leading-none tracking-tight tabular-nums sm:text-[34px]">
                  {mounted ? clockText : "--:--"}
                </span>
                <span className="text-[13px] font-bold tabular-nums text-white/55">
                  :{mounted ? seconds : "--"}
                </span>
                <span className="ms-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white/80">
                  {amPm}
                </span>
              </div>
              <p className="mt-1 text-[10.5px] font-medium text-white/60">
                {mounted ? gregorianText(lang, clock.date) : tx("তারিখ লোড হচ্ছে…")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10.5px] font-bold text-gold-100/90">
                {hijriText(hijri, lang) || "—"}
              </p>
              {offline && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-100">
                  {tx("অফলাইন সময়সূচী")}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-white/70">
              <Icon name="sunrise" size={12} className="text-gold-100" />
              {tx("পরবর্তী")}:
            </span>
            {loading || !next ? (
              <span className="text-[11px] font-semibold text-white/50">
                {tx("সময়সূচী লোড হচ্ছে…")}
              </span>
            ) : (
              <>
                <span className="text-[11.5px] font-extrabold text-white">
                  {prayerName(next.key, lang)}
                  {next.isTomorrow ? ` (${tx("আগামীকাল")})` : ""}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10.5px] font-black tabular-nums text-emerald-50 ring-1 ring-inset ring-emerald-300/20">
                  <Icon name="clock" size={10} />
                  {countdown}
                </span>
                <span className="ms-auto text-[10.5px] font-bold tabular-nums text-white/65">
                  {formatTime12(next.time, lang)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* five prayers */}
        <div className="mt-2 grid grid-cols-5 gap-1">
          {PRAYERS.map((key) => {
            const active = current === key;
            return (
              <div
                key={key}
                className={`rounded-xl px-1 py-1.5 text-center ring-1 ring-inset transition ${
                  active
                    ? "bg-white/20 ring-white/25"
                    : "bg-white/[0.06] ring-white/10"
                }`}
              >
                <p
                  className={`text-[9.5px] font-bold ${
                    active ? "text-gold-100" : "text-white/55"
                  }`}
                >
                  {prayerName(key, lang)}
                </p>
                <p
                  className={`mt-0.5 text-[10.5px] font-extrabold tabular-nums ${
                    active ? "text-white" : "text-white/80"
                  }`}
                >
                  {times ? formatTime12(times[key], lang) : "--:--"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-[9.5px] font-semibold text-white/45">
          <span className="truncate">
            {lang === "bn" ? city.sourceBn : city.sourceEn}
          </span>
          <span className="shrink-0 tabular-nums">{tx("আলাদান · করাচি পদ্ধতি")}</span>
        </div>
      </div>
    </section>
  );
}
