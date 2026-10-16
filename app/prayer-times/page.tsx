"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import {
  CITIES, PRAYER_ORDER, detectLocation, matchCity, fetchPrayerData,
  toMinutes, formatTime12, formatCountdown, getSpecialPeriod,
  getNextPrayer, getCurrentKey, secsUntil, hijriText, gregorianText,
  prayerName, toBn,
  type DetectedLocation, type PrayerTimes, type Lang,
} from "../../lib/prayer";
import { storageGet, storageSet, safeStringStorage } from "../../lib/storage";

// Prayer Times — ported from pray-bd (Aladhan Karachi/Hanafi, IP detect,
// 8 cities, countdown with prohibited/Ishraq/Chasht, Hijri, BN/EN),
// restyled to the Islah design system.
const PRAYER_ICONS: Record<string, string> = {
  fajr: "sunrise", sunrise: "sun", dhuhr: "sun", asr: "sun",
  maghrib: "sunset", isha: "moon",
};

export default function PrayerTimesPage() {
  const [lang, setLang] = useState<Lang>("bn");
  const [city, setCity] = useState("dhaka");
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [auto, setAuto] = useState(true);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLang((storageGet("praybd-lang") as Lang) || "bn");
  }, []);

  const load = useCallback(async (lat: number, lng: number) => {
    const d = await fetchPrayerData(lat, lng);
    setTimes(d.times);
    setHijri(d.hijri);
    setOffline(d.offline);
    setUpdatedAt(new Date());
  }, []);

  // init: detect location → match city → load
  useEffect(() => {
    let dead = false;
    (async () => {
      const savedCity = storageGet("praybd-city");
      const detected = await detectLocation();
      if (dead) return;
      setLoc(detected);
      if (savedCity && CITIES.some((c) => c.key === savedCity)) {
        setCity(savedCity);
        const c = CITIES.find((x) => x.key === savedCity)!;
        setAuto(false);
        load(c.lat, c.lng);
      } else {
        const m = matchCity(detected.city);
        setCity(m);
        setAuto(true);
        load(detected.lat, detected.lng);
      }
    })();
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => { dead = true; clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // midnight auto-refresh
  useEffect(() => {
    if (midnightTimer.current) clearTimeout(midnightTimer.current);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    tmr.setHours(0, 0, 5, 0);
    midnightTimer.current = setTimeout(() => {
      const c = CITIES.find((x) => x.key === city);
      if (auto && loc) load(loc.lat, loc.lng);
      else if (c) load(c.lat, c.lng);
    }, tmr.getTime() - Date.now());
    return () => { if (midnightTimer.current) clearTimeout(midnightTimer.current); };
  }, [city, auto, loc, load]);

  const pickCity = (key: string) => {
    const c = CITIES.find((x) => x.key === key);
    if (!c) return;
    setCity(key);
    setAuto(false);
    storageSet("praybd-city", key);
    load(c.lat, c.lng);
  };

  const useGps = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setAuto(false);
        safeStringStorage.removeItem("praybd-city");
        setLoc({ city: "GPS", lat: p.coords.latitude, lng: p.coords.longitude, country: "BD", timezone: "Asia/Dhaka", ip: null, detectedAt: Date.now() });
        load(p.coords.latitude, p.coords.longitude);
      },
      () => {},
      { timeout: 8000 }
    );
  };

  const useAuto = () => {
    safeStringStorage.removeItem("praybd-city");
    setAuto(true);
    if (loc) {
      setCity(matchCity(loc.city));
      load(loc.lat, loc.lng);
    }
  };

  const toggleLang = () => {
    const next: Lang = lang === "bn" ? "en" : "bn";
    setLang(next);
    storageSet("praybd-lang", next);
  };

  const cityObj = CITIES.find((c) => c.key === city);
  const special = times ? getSpecialPeriod(times, now) : null;
  const next = times ? getNextPrayer(times, now) : null;
  const curKey = times ? getCurrentKey(times, now) : null;

  let cdH = 0, cdM = 0, cdS = 0, cdLabel = "", cdRed = false;
  if (times) {
    if (special) {
      cdH = Math.floor(special.remainSec / 3600);
      cdM = Math.floor((special.remainSec % 3600) / 60);
      cdS = special.remainSec % 60;
      cdLabel = lang === "bn" ? special.labelBn : special.labelEn;
      cdRed = special.isRed;
    } else if (next && curKey) {
      // Countdown shows the REMAINING time of the current prayer window.
      const s = secsUntil(next.time, now, next.isTomorrow);
      cdH = Math.floor(s / 3600);
      cdM = Math.floor((s % 3600) / 60);
      cdS = s % 60;
      cdLabel = `${prayerName(curKey, lang)} ${lang === "bn" ? "চলছে" : "in progress"}`;
    }
  }

  const clock = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const clockBn = lang === "bn"
    ? toBn(clock).replace("AM", "এ এম").replace("PM", "পি এম")
    : clock;

  return (
    <div className="animate-fade-up">
      <PageHead
        title={lang === "bn" ? "নামাজের সময়" : "Prayer Times"}
        subtitle={cityObj ? `${lang === "bn" ? cityObj.nameBn : cityObj.name}${auto ? (lang === "bn" ? " • অটো" : " • Auto") : ""}` : ""}
        icon="clock"
        action={
          <button
            onClick={toggleLang}
            className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            {lang === "bn" ? "EN" : "বাং"}
          </button>
        }
      />

      {/* countdown hero */}
      <div className="card mt-3 p-6 text-center sm:p-8">
        <p className={`text-[15px] font-bold ${cdRed ? "text-red-500" : "text-gold-600"}`}>
          {cdLabel || (lang === "bn" ? "লোড হচ্ছে…" : "Loading…")}
        </p>
        <div
          className={`mt-1 text-5xl font-bold tabular-nums tracking-tight sm:text-6xl ${cdRed ? "text-red-500" : "text-primary-700"}`}
        >
          {times ? formatCountdown(cdH, cdM, cdS, lang) : "--:--:--"}
        </div>
        <p className="mt-2 text-[13px] font-bold tabular-nums text-ink-faint">{clockBn}</p>
        {offline && (
          <p className="mx-auto mt-2 inline-block rounded-full bg-gold-light px-3 py-1 text-[11px] font-bold text-gold-dark">
            {lang === "bn" ? "অফলাইন সময় — কিছুটা ভিন্ন হতে পারে" : "Offline times — may differ slightly"}
          </p>
        )}
      </div>

      {/* date + location */}
      <div className="card mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 p-3.5 text-[13px] font-bold">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="calendar" size={16} className="text-gold-600" />
          {gregorianText(lang, now)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="moon" size={16} className="text-gold-600" />
          {hijriText(hijri, lang) || "…"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-primary-700">
          <Icon name="pin" size={16} />
          {auto && loc ? `${loc.city}` : cityObj ? (lang === "bn" ? cityObj.nameBn : cityObj.name) : ""}
        </span>
      </div>

      {/* city select */}
      <div className="card mt-2 p-3.5">
        <div className="mb-2 text-xs font-bold text-ink-faint">
          {lang === "bn" ? "শহর বেছে নিন (৮টি)" : "Choose city (8)"}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c.key}
              onClick={() => pickCity(c.key)}
              className={`chip !px-3.5 !py-2 ${!auto && city === c.key ? "chip-active" : ""}`}
            >
              {lang === "bn" ? c.nameBn : c.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={useAuto} className={`btn-ghost flex-1 !py-2 text-[13px] ${auto ? "!bg-primary-600 !text-white" : ""}`}>
            <Icon name="globe" size={15} /> {lang === "bn" ? "অটো লোকেশন" : "Auto"}
          </button>
          <button onClick={useGps} className="btn-ghost flex-1 !py-2 text-[13px]">
            <Icon name="pin" size={15} /> GPS
          </button>
        </div>
      </div>

      {/* prayer grid */}
      <div className="mb-2 mt-5 text-[15px] font-bold">
        {lang === "bn" ? "আজকের সময়সূচি" : "Today's schedule"}
      </div>
      {!times ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRAYER_ORDER.map((k) => (
            <div key={k} className="card animate-pulse p-4">
              <div className="h-4 w-16 rounded-full bg-sand-dark" />
              <div className="mt-2 h-7 w-24 rounded-xl bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRAYER_ORDER.map((k) => {
            const isCur = k === curKey;
            const isNextReal = !!next && k === next.key && !special;
            const remain = isNextReal
              ? (() => {
                  const s = secsUntil(next.time, now, next.isTomorrow);
                  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
                  return lang === "bn" ? `${toBn(h)}ঘ ${toBn(m)}ম বাকি` : `${h}h ${m}m left`;
                })()
              : "";
            return (
              <div
                key={k}
                className={`card card-hover relative overflow-hidden p-4 ${isCur ? "!border-primary-600/40 !bg-primary-50" : ""} ${isNextReal ? "!border-gold/60 !bg-gold-light/50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 text-[13px] font-bold ${isCur || isNextReal ? "text-primary-700" : "text-ink-soft"}`}>
                    <Icon name={PRAYER_ICONS[k]} size={16} className={isNextReal ? "text-gold-600" : "text-primary-600"} />
                    {prayerName(k, lang)}
                  </span>
                  {isCur && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">{lang === "bn" ? "চলছে" : "Now"}</span>}
                  {isNextReal && !isCur && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#1a1405]">{lang === "bn" ? "পরবর্তী" : "Next"}</span>}
                </div>
                <div className={`mt-1 text-[22px] font-bold tabular-nums ${isNextReal ? "text-gold-dark" : isCur ? "text-primary-700" : ""}`}>
                  {formatTime12(times[k], lang)}
                </div>
                {remain && <div className="mt-0.5 text-[11px] font-bold text-ink-faint">{remain}</div>}
                {k === "sunrise" && (
                  <div className="mt-0.5 text-[11px] font-bold text-ink-faint">
                    {lang === "bn" ? `সূর্যাস্ত ${formatTime12((times as any).sunset || "", lang)}` : `Sunset ${formatTime12((times as any).sunset || "", lang)}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {updatedAt && (
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          {lang === "bn" ? "আপডেট" : "Updated"}: {updatedAt.toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: "numeric", minute: "2-digit" })}
          {" • "}Aladhan (Karachi/Hanafi)
        </p>
      )}
    </div>
  );
}
