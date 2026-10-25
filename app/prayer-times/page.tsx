"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import {
  CITIES,
  addMinutes,
  detectLocation,
  fetchPrayerData,
  formatCountdown,
  formatTime12,
  getNaflWindows,
  gregorianText,
  hijriText,
  matchCity,
  prayerName,
  toMinutes,
  type DetectedLocation,
  type HijriInfo,
  type Lang,
  type PrayerTimes,
} from "../../lib/prayer";
import { banglaFromDate, banglaText } from "../../lib/hijri";
import { kaabaBearing, kaabaDistanceKm, norm } from "../../lib/qibla";
import { useLang, useNum, useTx } from "../../store/language-store";

// Full prayer-times page — Aladhan Karachi/Hanafi timings, live countdown,
// Hijri/Gregorian/Bangla dates, the whole day's prayer + nafl timeline, and
// a compact Qibla panel. The hero stays deep emerald/navy in both themes;
// every surrounding surface follows the app's light/dark tokens.

type PeriodKind = "fard" | "nafl" | "prohibited";

interface Period {
  key: string;
  name: string;
  kind: PeriodKind;
  icon: string;
  start: string;
  end: string;
  endTomorrow?: boolean;
  note?: string;
}

const CARDINALS = [
  "উত্তর",
  "উত্তর-পূর্ব",
  "পূর্ব",
  "দক্ষিণ-পূর্ব",
  "দক্ষিণ",
  "দক্ষিণ-পশ্চিম",
  "পশ্চিম",
  "উত্তর-পশ্চিম",
];

function cardinal(deg: number): string {
  return CARDINALS[Math.round(norm(deg) / 45) % 8];
}

function periodRange(start: string, end: string) {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 1440;
  return { start: s, end: e };
}

function buildTimeline(
  times: PrayerTimes,
  lang: Lang,
  tx: (bn: string) => string
): Period[] {
  const nafl = getNaflWindows(times);
  const sunset = times.sunset;
  const asrEnd = sunset && sunset !== times.maghrib ? sunset : times.maghrib;
  const rows: Period[] = [
    {
      key: "fajr",
      name: prayerName("fajr", lang),
      kind: "fard",
      icon: "sunrise",
      start: times.fajr,
      end: times.sunrise,
    },
    {
      key: "sunrise",
      name: prayerName("sunrise", lang),
      kind: "prohibited",
      icon: "sun",
      start: times.sunrise,
      end: addMinutes(times.sunrise, 15),
    },
  ];

  if (nafl) {
    rows.push(
      {
        key: "ishraq",
        name: tx("ইশরাক"),
        kind: "nafl",
        icon: "sunrise",
        start: nafl.ishraqStart,
        end: nafl.ishraqEnd,
      },
      {
        key: "chasht",
        name: tx("চাশত"),
        kind: "nafl",
        icon: "sun",
        start: nafl.chashtStart,
        end: nafl.chashtEnd,
      }
    );
  }

  rows.push(
    {
      key: "zawal",
      name: tx("যাওয়াল"),
      kind: "prohibited",
      icon: "sun",
      start: addMinutes(times.dhuhr, -10),
      end: times.dhuhr,
    },
    {
      key: "dhuhr",
      name: prayerName("dhuhr", lang),
      kind: "fard",
      icon: "sun",
      start: times.dhuhr,
      end: times.asr,
    },
    {
      key: "asr",
      name: prayerName("asr", lang),
      kind: "fard",
      icon: "sun",
      start: times.asr,
      end: asrEnd,
    }
  );

  if (sunset && sunset !== times.maghrib) {
    rows.push({
      key: "sunset",
      name: tx("সূর্যাস্ত"),
      kind: "prohibited",
      icon: "sunset",
      start: sunset,
      end: times.maghrib,
    });
  }

  rows.push(
    {
      key: "maghrib",
      name: prayerName("maghrib", lang),
      kind: "fard",
      icon: "sunset",
      start: times.maghrib,
      end: times.isha,
    },
    {
      key: "awwabin",
      name: tx("আউওয়াবীন"),
      kind: "nafl",
      icon: "star",
      start: addMinutes(times.maghrib, 10),
      end: times.isha,
    },
    {
      key: "isha",
      name: prayerName("isha", lang),
      kind: "fard",
      icon: "moon",
      start: times.isha,
      end: times.fajr,
      endTomorrow: true,
    },
    {
      key: "tahajjud",
      name: tx("তাহাজ্জুদ"),
      kind: "nafl",
      icon: "moon",
      start: times.isha,
      end: times.fajr,
      endTomorrow: true,
      note: tx("বাদ এশা থেকে ফজর পর্যন্ত"),
    }
  );

  return rows.filter((row) => toMinutes(row.end) !== toMinutes(row.start));
}

/** Decorative day arc with a sun/moon marker at the current period's progress. */
function SunArc({ progress, night }: { progress: number; night: boolean }) {
  const t = Math.min(1, Math.max(0, progress));
  const x = (1 - t) * (1 - t) * 28 + 2 * (1 - t) * t * 250 + t * t * 472;
  const y = (1 - t) * (1 - t) * 122 + 2 * (1 - t) * t * -22 + t * t * 122;

  return (
    <svg viewBox="0 0 500 150" className="mt-1 h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="prayer-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <g fill="#e2e8f0" opacity="0.55">
        <circle cx="86" cy="55" r="1.3" />
        <circle cx="205" cy="22" r="1.6" />
        <circle cx="135" cy="92" r="1" />
        <circle cx="408" cy="54" r="1.4" />
        <circle cx="350" cy="20" r="1" />
        <circle cx="456" cy="96" r="1.2" />
      </g>
      <path
        d="M28 122 Q250 -22 472 122"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="2"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <path
        d="M28 122 Q250 -22 472 122"
        fill="none"
        stroke="url(#prayer-arc)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${t * 100} 100`}
      />
      <circle cx="28" cy="122" r="4" fill="#93c5fd" />
      <circle cx="472" cy="122" r="4" fill="rgba(255,255,255,0.35)" />
      <circle cx={x} cy={y} r="10" fill={night ? "#c7d2fe" : "#fcd34d"} />
      {night ? (
        <path
          d={`M${x + 3} ${y - 6}a7 7 0 1 0 0 12 6 6 0 0 1 0-12z`}
          fill="#1e293b"
        />
      ) : (
        <>
          <circle cx={x} cy={y} r="4" fill="#b45309" />
          <path
            d={`M${x} ${y - 15}v3M${x} ${y + 12}v3M${x - 15} ${y}h3M${x + 12} ${y}h3M${x - 10} ${y - 10}l2 2M${x + 8} ${y + 8}l2 2M${x + 10} ${y - 10}l-2 2M${x - 8} ${y + 8}l-2 2`}
            stroke="#fcd34d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function PrayerTimesPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();

  const [city, setCity] = useState("dhaka");
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [manual, setManual] = useState(false);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<HijriInfo | null>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (lat: number, lng: number, force = false) => {
    const data = await fetchPrayerData(lat, lng, force);
    setTimes(data.times);
    setHijri(data.hijri);
    setOffline(data.offline);
    setUpdatedAt(new Date());
  }, []);

  // Avoid SSR/client clock mismatch: time-dependent text renders after mount.
  useEffect(() => setMounted(true), []);

  // Lock the page behind the city sheet and let Escape dismiss it.
  useEffect(() => {
    if (!pickerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  // Initial auto-location + live clock.
  useEffect(() => {
    let dead = false;
    (async () => {
      const detected = await detectLocation();
      if (dead) return;
      setLoc(detected);
      setCity(matchCity(detected.city));
      setManual(false);
      await load(detected.lat, detected.lng);
    })();
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      dead = true;
      clearInterval(tick);
    };
  }, [load]);

  // Refresh after midnight so the next day's timings load automatically.
  useEffect(() => {
    if (midnightTimer.current) clearTimeout(midnightTimer.current);
    const nextMidnight = new Date();
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 5, 0);
    midnightTimer.current = setTimeout(() => {
      if (loc) load(loc.lat, loc.lng);
    }, nextMidnight.getTime() - Date.now());
    return () => {
      if (midnightTimer.current) clearTimeout(midnightTimer.current);
    };
  }, [loc, load]);

  const refreshLocation = async () => {
    setRefreshing(true);
    try {
      const detected = await detectLocation();
      setLoc(detected);
      setCity(matchCity(detected.city));
      setManual(false);
      await load(detected.lat, detected.lng, true);
    } finally {
      setRefreshing(false);
      setPickerOpen(false);
    }
  };

  const selectCity = async (key: string) => {
    const selected = CITIES.find((c) => c.key === key);
    if (!selected) return;
    setRefreshing(true);
    try {
      setCity(key);
      setManual(true);
      setLoc({
        city: selected.name,
        lat: selected.lat,
        lng: selected.lng,
        country: "BD",
        timezone: "Asia/Dhaka",
        ip: null,
        detectedAt: Date.now(),
      });
      setPickerOpen(false);
      await load(selected.lat, selected.lng, true);
    } finally {
      setRefreshing(false);
    }
  };

  const cityObj = CITIES.find((c) => c.key === city) ?? null;
  const localizedCity = (c: (typeof CITIES)[number]) =>
    lang === "bn" ? c.nameBn : lang === "ur" ? tx(c.nameBn) : c.name;
  // Detected coordinates may be outside the eight supported cities, so prefer
  // the provider's city name unless it maps cleanly to a known one.
  const detectedCity = loc
    ? CITIES.find(
        (c) =>
          c.name.toLowerCase() === loc.city.toLowerCase() ||
          c.nameBn === loc.city ||
          (c.key === "chittagong" && /chattogram|chittagong/i.test(loc.city))
      ) ?? null
    : null;
  const cityLabel = manual && cityObj
    ? localizedCity(cityObj)
    : loc
      ? detectedCity
        ? localizedCity(detectedCity)
        : loc.city
      : cityObj
        ? localizedCity(cityObj)
        : tx("খোঁজা হচ্ছে…");

  const countryLabel = loc
    ? loc.country === "BD"
      ? tx("বাংলাদেশ")
      : (() => {
          try {
            return (
              new Intl.DisplayNames([lang], { type: "region" }).of(loc.country) ||
              loc.country
            );
          } catch {
            return loc.country;
          }
        })()
    : "";
  const locationSource = manual ? tx("নির্বাচিত") : tx("অটো");

  const timeline = times ? buildTimeline(times, lang, tx) : [];
  const nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  let current: Period | null = null;
  for (const period of timeline) {
    const range = periodRange(period.start, period.end);
    if (
      (nowM >= range.start && nowM < range.end) ||
      (nowM + 1440 >= range.start && nowM + 1440 < range.end)
    ) {
      current = period;
      break;
    }
  }

  let next: Period | null = null;
  let nextStart = Number.POSITIVE_INFINITY;
  for (const period of timeline) {
    const start = toMinutes(period.start);
    const occurrence = start <= nowM ? start + 1440 : start;
    if (occurrence < nextStart) {
      nextStart = occurrence;
      next = period;
    }
  }

  const currentRange = current ? periodRange(current.start, current.end) : null;
  const currentNow =
    currentRange && nowM < currentRange.start ? nowM + 1440 : nowM;
  const remainingSec = currentRange
    ? Math.max(0, (currentRange.end - currentNow) * 60)
    : 0;
  const currentProgress = currentRange
    ? Math.min(
        1,
        Math.max(
          0,
          (currentNow - currentRange.start) /
            (currentRange.end - currentRange.start)
        )
      )
    : 0.5;
  const cdH = Math.floor(remainingSec / 3600);
  const cdM = Math.floor((remainingSec % 3600) / 60);
  const cdS = remainingSec % 60;
  const countdown = current ? formatCountdown(cdH, cdM, cdS, lang) : "--:--:--";
  const night = current
    ? current.key === "maghrib" ||
      current.key === "awwabin" ||
      current.key === "isha" ||
      current.key === "tahajjud" ||
      nowM < toMinutes(times?.fajr ?? "05:00")
    : false;

  const hijriLabel = mounted ? hijriText(hijri, lang) || "…" : "…";
  const gregorianLabel = mounted ? gregorianText(lang, now) : "…";
  const banglaLabel = mounted
    ? `${banglaText(banglaFromDate(now), lang)} ${tx("বঙ্গাব্দ")}`
    : "…";

  const qiblaAngle = loc ? kaabaBearing(loc.lat, loc.lng) : null;
  const qiblaKm = loc ? kaabaDistanceKm(loc.lat, loc.lng) : null;
  const qiblaCardinal = qiblaAngle !== null ? tx(cardinal(qiblaAngle)) : "";
  const currentEndTomorrow =
    !!current?.endTomorrow ||
    (current ? toMinutes(current.end) <= toMinutes(current.start) : false);

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("নামাজের সময়")}
        subtitle={`${cityLabel} • ${tx("আজকের সময়সূচি")}`}
        icon="clock"
      />

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-start">
        {/* ---------- hero ---------- */}
        <section className="relative overflow-hidden rounded-[28px] border border-primary-900/10 bg-gradient-to-br from-[#0d5a43] via-primary-700 to-[#063522] text-white shadow-lift dark:border-gold/25 dark:from-[#1b2940] dark:via-[#0f1b2d] dark:to-[#0b1120] lg:col-start-1 lg:row-start-1">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-primary-400/20 blur-3xl" />

          <div className="relative p-4 sm:p-5">
            <div className="flex items-center gap-3 border-b border-white/15 pb-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-gold-100">
                <Icon name="pin" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[17px] font-bold leading-tight">{cityLabel}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/65">
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                  {countryLabel}
                  {countryLabel ? " · " : ""}
                  {locationSource}
                </p>
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                <Icon name="globe" size={12} />
                {tx("পরিবর্তন")}
              </button>
            </div>

            <div className="border-b border-white/15 py-3">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-gold-100">
                <Icon name="moon" size={14} />
                {hijriLabel}
              </p>
              <p className="mt-1 pl-5 text-[10.5px] leading-relaxed text-white/65">
                {gregorianLabel}
                <span className="px-1 text-white/30">·</span>
                {banglaLabel}
              </p>
            </div>

            <div className="pt-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        current?.kind === "prohibited" ? "bg-rose-300" : "bg-sky-300"
                      } ${current ? "animate-pulse" : ""}`}
                    />
                    {tx("এখন চলছে")}
                  </p>
                  <h2 className="mt-0.5 truncate text-[27px] font-bold leading-tight sm:text-[34px]">
                    {current?.name ?? tx("লোড হচ্ছে…")}
                  </h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold text-white/60">{tx("বাকি আছে")}</p>
                  <p
                    className={`mt-0.5 text-[16px] font-bold tabular-nums sm:text-[21px] ${
                      current?.kind === "prohibited" ? "text-rose-200" : "text-gold-100"
                    }`}
                  >
                    {countdown}
                  </p>
                </div>
              </div>

              <SunArc progress={currentProgress} night={night} />

              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-1.5 py-2 text-center backdrop-blur-sm sm:px-2">
                  <p className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white/60 sm:text-[9.5px]">
                    <Icon name="clock" size={11} />
                    {tx("শুরু")}
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[12.5px] font-bold tabular-nums sm:text-[14px]">
                    {current ? formatTime12(current.start, lang) : "--:--"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-1.5 py-2 text-center backdrop-blur-sm sm:px-2">
                  <p className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white/60 sm:text-[9.5px]">
                    <Icon name="clock" size={11} />
                    {tx("শেষ")}
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[12.5px] font-bold tabular-nums sm:text-[14px]">
                    {current ? formatTime12(current.end, lang) : "--:--"}
                  </p>
                  {currentEndTomorrow && (
                    <p className="text-[8px] font-semibold text-white/50">{tx("পরদিন")}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-1.5 py-2 text-center backdrop-blur-sm sm:px-2">
                  <p className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white/60 sm:text-[9.5px]">
                    <Icon name="moon" size={11} />
                    {tx("পরবর্তী")}
                  </p>
                  <p className="mt-1 truncate text-[11.5px] font-bold leading-tight sm:text-[12px]">
                    {next?.name ?? "—"}
                  </p>
                  <p className="text-[9.5px] font-semibold tabular-nums text-white/60">
                    {next ? formatTime12(next.start, lang) : ""}
                  </p>
                </div>
              </div>

              {offline && (
                <p className="mt-2 rounded-xl bg-gold/15 px-2.5 py-1.5 text-center text-[10px] font-semibold text-gold-100">
                  {tx("অফলাইন সময় — কিছুটা ভিন্ন হতে পারে")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ---------- timeline ---------- */}
        <section className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-bold">{tx("আজকের সময়রেখা")}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-ink-faint">
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-primary-600" />
                {tx("ফরজ")}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-sky-500" />
                {tx("নফল")}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-rose-500" />
                {tx("নিষিদ্ধ")}
              </span>
            </div>
          </div>

          {!times ? (
            <div className="mt-2 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="card flex animate-pulse items-center gap-3 p-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-sand-dark" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 rounded-full bg-sand-dark" />
                    <div className="h-2.5 w-3/4 rounded-full bg-sand-dark" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {timeline.map((period) => {
                const isCurrent = current?.key === period.key;
                const isNext = !isCurrent && next?.key === period.key;
                const badge = isCurrent
                  ? tx("এখন চলছে")
                  : isNext
                    ? tx("পরবর্তী")
                    : period.kind === "fard"
                      ? tx("ফরজ")
                      : period.kind === "nafl"
                        ? tx("নফল")
                        : tx("নিষিদ্ধ");

                const rowClass = isCurrent
                  ? "border-transparent bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lift"
                  : isNext
                    ? "border-gold/50 bg-gold-light/60 shadow-card dark:border-gold/30 dark:bg-gold/10"
                    : "border-primary-900/10 bg-white shadow-card dark:border-white/10 dark:bg-white/[0.04]";

                const iconClass = isCurrent
                  ? "bg-white/20 text-white"
                  : period.kind === "fard"
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                    : period.kind === "nafl"
                      ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300";

                const badgeClass = isCurrent
                  ? "bg-white/20 text-white"
                  : period.kind === "fard"
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                    : period.kind === "nafl"
                      ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300";

                const mutedClass = isCurrent
                  ? "text-white/75"
                  : isNext
                    ? "text-gold-dark dark:text-gold-100/80"
                    : "text-ink-faint";

                return (
                  <div
                    key={period.key}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${rowClass}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon name={period.icon} size={19} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[14px] font-bold leading-snug ${
                            isCurrent ? "text-white" : "text-ink"
                          }`}
                        >
                          {period.name}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${badgeClass}`}
                        >
                          {badge}
                        </span>
                      </div>
                      <p className={`mt-0.5 text-[10.5px] leading-snug ${mutedClass}`}>
                        {tx("শুরু")}{" "}
                        <span className="font-semibold tabular-nums">
                          {formatTime12(period.start, lang)}
                        </span>
                      </p>
                      {period.note && (
                        <p className={`mt-0.5 text-[9.5px] ${mutedClass}`}>{period.note}</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className={`text-[8.5px] font-semibold ${mutedClass}`}>
                        {tx("শেষ")}
                      </p>
                      <p
                        className={`text-[15px] font-bold tabular-nums ${
                          isCurrent
                            ? "text-white"
                            : isNext
                              ? "text-gold-dark dark:text-gold-100"
                              : "text-ink"
                        }`}
                      >
                        {formatTime12(period.end, lang)}
                      </p>
                      {period.endTomorrow && (
                        <p className={`text-[8px] ${mutedClass}`}>{tx("পরদিন")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {updatedAt && (
            <p className="mt-3 text-center text-[10px] text-ink-faint">
              {tx("আপডেট")}:{" "}
              {updatedAt.toLocaleTimeString(
                lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-US",
                { hour: "numeric", minute: "2-digit" }
              )}
              {" • "}Aladhan (Karachi/Hanafi)
            </p>
          )}
        </section>

        {/* ---------- qibla ---------- */}
        <section className="card p-4 lg:sticky lg:top-4 lg:col-start-1 lg:row-start-2">
          <div className="flex items-center gap-3">
            <span className="icon-tile bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
              <Icon name="compass" size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold">{tx("কিবলা")}</h2>
              <p className="text-[11px] text-ink-faint">{tx("কাবার দিক ও দূরত্ব")}</p>
            </div>
            <div className="relative h-[60px] w-[60px] shrink-0 rounded-full border-2 border-primary-600/20 bg-sand dark:border-white/10 dark:bg-white/5">
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{ transform: `rotate(${qiblaAngle ?? 0}deg)` }}
              >
                <span className="absolute left-1/2 top-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-full rounded-full bg-gold" />
                <span className="absolute left-1/2 top-[6px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold" />
              </div>
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600 ring-2 ring-white/70 dark:ring-[#16202f]" />
              <span className="absolute left-1/2 top-0.5 -translate-x-1/2 text-[8px] font-bold text-primary-700 dark:text-primary-200">
                N
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-sand/80 p-3 dark:bg-white/5">
              <p className="text-[10px] font-semibold text-ink-faint">
                {tx("কাবার দূরত্ব")}
              </p>
              <p className="mt-0.5 text-[16px] font-bold tabular-nums">
                {qiblaKm !== null
                  ? `${num(Math.round(qiblaKm))} ${tx("কি.মি.")}`
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-sand/80 p-3 dark:bg-white/5">
              <p className="text-[10px] font-semibold text-ink-faint">
                {tx("কিবলার অভিমুখ")}
              </p>
              <p className="mt-0.5 text-[16px] font-bold tabular-nums">
                {qiblaAngle !== null ? `${num(Math.round(qiblaAngle))}°` : "—"}
              </p>
              <p className="text-[10px] text-ink-faint">{qiblaCardinal}</p>
            </div>
          </div>

          <Link
            href="/qibla"
            className="btn-primary mt-3 w-full !py-2.5 text-[13px]"
          >
            <Icon name="compass" size={16} />
            {tx("কিবলা কম্পাস বিস্তারিত")}
          </Link>
        </section>
      </div>

      {/* ---------- city picker ---------- */}
      {pickerOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-center"
            onClick={() => setPickerOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={tx("শহর বেছে নিন")}
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-primary-900/10 bg-white p-4 shadow-lift dark:border-white/10 dark:bg-[#16202f]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{tx("শহর বেছে নিন")}</h2>
                <button
                  onClick={() => setPickerOpen(false)}
                  aria-label={tx("বন্ধ করুন")}
                  className="rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 dark:hover:bg-white/5"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <button
                onClick={refreshLocation}
                disabled={refreshing}
                className={`btn-ghost mt-3 w-full !py-2.5 text-[13px] disabled:opacity-60 ${
                  !manual ? "ring-2 ring-primary-500/40" : ""
                }`}
              >
                <Icon name={refreshing ? "clock" : !manual ? "check" : "pin"} size={16} />
                {refreshing ? tx("খোঁজা হচ্ছে…") : tx("অটো লোকেশন")}
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {CITIES.map((c) => {
                  const label =
                    lang === "bn" ? c.nameBn : lang === "ur" ? tx(c.nameBn) : c.name;
                  const active = manual && city === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => selectCity(c.key)}
                      className={`rounded-xl border px-3 py-2 text-left text-[12px] font-bold transition active:scale-[0.98] ${
                        active
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-primary-900/10 bg-sand/60 text-ink hover:border-primary-500/40 dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
