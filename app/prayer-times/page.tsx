"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import {
  CITIES, PRAYER_ORDER, detectLocation, matchCity, fetchPrayerData,
  toMinutes, formatTime12, formatCountdown, getSpecialPeriod,
  getNextPrayer, getCurrentKey, secsUntil, hijriText, gregorianText,
  prayerName, toBn, getNaflWindows,
  type DetectedLocation, type PrayerTimes,
} from "../../lib/prayer";
import { useLang, useTx } from "../../store/language-store";

// Prayer Times — ported from pray-bd (Aladhan Karachi/Hanafi, IP detect,
// 8 cities, countdown with prohibited/Ishraq/Chasht, Hijri, BN/UR/EN),
// restyled to the Islah design system.
const PRAYER_ICONS: Record<string, string> = {
  fajr: "sunrise", sunrise: "sun", dhuhr: "sun", asr: "sun",
  maghrib: "sunset", isha: "moon",
};

export default function PrayerTimesPage() {
  const tx = useTx();
  const lang = useLang();
  const L = (bn: string, en: string, ur: string) => (lang === "bn" ? bn : lang === "ur" ? ur : en);
  const [city, setCity] = useState("dhaka");
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [hijri, setHijri] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (lat: number, lng: number, force = false) => {
    const d = await fetchPrayerData(lat, lng, force);
    setTimes(d.times);
    setHijri(d.hijri);
    setOffline(d.offline);
    setUpdatedAt(new Date());
  }, []);

  // Avoid SSR/client clock mismatch: render time-dependent text after mount.
  useEffect(() => setMounted(true), []);

  // init: auto-detect location → load (no manual selection)
  useEffect(() => {
    let dead = false;
    (async () => {
      const detected = await detectLocation();
      if (dead) return;
      setLoc(detected);
      setCity(matchCity(detected.city));
      load(detected.lat, detected.lng);
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
      if (loc) load(loc.lat, loc.lng);
    }, tmr.getTime() - Date.now());
    return () => { if (midnightTimer.current) clearTimeout(midnightTimer.current); };
  }, [loc, load]);

  const [refreshing, setRefreshing] = useState(false);

  // Re-detect location on demand and force fresh times.
  const refreshLocation = async () => {
    setRefreshing(true);
    try {
      const detected = await detectLocation();
      setLoc(detected);
      setCity(matchCity(detected.city));
      await load(detected.lat, detected.lng, true);
    } finally {
      setRefreshing(false);
    }
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
      cdLabel = lang === "bn" ? special.labelBn : lang === "ur" ? special.labelUr : special.labelEn;
      cdRed = special.isRed;
    } else if (next && curKey) {
      // Countdown shows the REMAINING time of the current prayer window.
      const s = secsUntil(next.time, now, next.isTomorrow);
      cdH = Math.floor(s / 3600);
      cdM = Math.floor((s % 3600) / 60);
      cdS = s % 60;
      cdLabel =
        L(
          `${prayerName(curKey, lang)} চলছে · বাকি ${cdH > 0 ? `${toBn(cdH)}ঘ ` : ""}${toBn(cdM)}ম`,
          `${prayerName(curKey, lang)} in progress · ${cdH > 0 ? `${cdH}h ` : ""}${cdM}m remaining`,
          `${prayerName(curKey, lang)} جاری ہے · باقی ${cdH > 0 ? `${cdH} گھنٹے ` : ""}${cdM} منٹ`
        );
    }
  }

  const clock = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const clockBn = lang === "bn"
    ? toBn(clock).replace("AM", tx("এ এম")).replace("PM", tx("পি এম"))
    : clock;

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("নামাজের সময়")}
        subtitle={cityObj ? `${lang === "bn" ? cityObj.nameBn : lang === "ur" ? tx(cityObj.nameBn) : cityObj.name} • ${L("অটো", "Auto", "خودکار")}` : ""}
        icon="clock"
      />

      {/* countdown hero */}
      <div className="card mt-3 p-6 text-center sm:p-8">
        <p className={`text-[15px] font-bold ${cdRed ? "text-red-500" : "text-gold-600"}`}>
          {cdLabel || tx("লোড হচ্ছে…")}
        </p>
        <div
          className={`mt-1 text-5xl font-bold tabular-nums tracking-tight sm:text-6xl ${cdRed ? "text-red-500" : "text-primary-700"}`}
        >
          {times ? formatCountdown(cdH, cdM, cdS, lang) : "--:--:--"}
        </div>
        <p className="mt-2 text-[13px] font-bold tabular-nums text-ink-faint">{mounted ? clockBn : "--:--:--"}</p>
        {offline && (
          <p className="mx-auto mt-2 inline-block rounded-full bg-gold-light px-3 py-1 text-[11px] font-bold text-gold-dark">
            {tx("অফলাইন সময় — কিছুটা ভিন্ন হতে পারে")}
          </p>
        )}
      </div>

      {/* dates */}
      <div className="card mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 p-3.5 text-[13px] font-bold">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="calendar" size={16} className="text-gold-600" />
          {mounted ? gregorianText(lang, now) : "—"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="moon" size={16} className="text-gold-600" />
          {mounted ? hijriText(hijri, lang) || "…" : "…"}
        </span>
      </div>

      {/* auto location + refresh */}
      <div className="card mt-2 flex items-center gap-2.5 p-3.5">
        <span className="icon-tile !h-10 !w-10 shrink-0 bg-primary-50 text-primary-600">
          <Icon name="globe" size={20} />
        </span>
        <span className="flex-1 text-[13px]">
          <span className="block font-bold">{tx("অটো লোকেশন")}</span>
          <span className="block text-xs text-ink-faint">
            {loc
              ? `${cityObj ? (lang === "bn" ? cityObj.nameBn : lang === "ur" ? tx(cityObj.nameBn) : cityObj.name) : tx(loc.city)}${loc.country && loc.country !== "BD" ? `, ${loc.country}` : ""}`
              : tx("খোঁজা হচ্ছে…")}
          </span>
        </span>
        <button onClick={refreshLocation} disabled={refreshing} className="btn-ghost shrink-0 !py-2 text-[13px] disabled:opacity-60">
          <Icon name={refreshing ? "clock" : "pin"} size={15} />
          {refreshing ? tx("খোঁজা হচ্ছে…") : tx("রিফ্রেশ")}
        </button>
      </div>

      {/* prayer grid */}
      <div className="mb-2 mt-5 text-[15px] font-bold">
        {tx("আজকের সময়সূচি")}
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
            // Remaining time of the ongoing window (shown on the current card).
            const remainSecs = isCur && next ? secsUntil(next.time, now, next.isTomorrow) : 0;
            const remainCur = isCur
              ? (() => {
                  const h = Math.floor(remainSecs / 3600), m = Math.floor((remainSecs % 3600) / 60);
                  return L(`${h > 0 ? `${toBn(h)}ঘ ` : ""}${toBn(m)}ম বাকি`, `${h > 0 ? `${h}h ` : ""}${m}m left`, `${h > 0 ? `${h} گھنٹے ` : ""}${m} منٹ باقی`);
                })()
              : "";
            const remain = isNextReal
              ? (() => {
                  const s = secsUntil(next.time, now, next.isTomorrow);
                  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
                  return L(`${h > 0 ? `${toBn(h)}ঘ ` : ""}${toBn(m)}ম বাকি`, `${h > 0 ? `${h}h ` : ""}${m}m left`, `${h > 0 ? `${h} گھنٹے ` : ""}${m} منٹ باقی`);
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
                  {isCur && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">{remainCur}</span>}
                  {isNextReal && !isCur && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#1a1405]">{tx("পরবর্তী")}</span>}
                </div>
                <div className={`mt-1 text-[22px] font-bold tabular-nums ${isNextReal ? "text-gold-dark" : isCur ? "text-primary-700" : ""}`}>
                  {formatTime12(times[k], lang)}
                </div>
                {remain && <div className="mt-0.5 text-[11px] font-bold text-ink-faint">{remain}</div>}
                {k === "sunrise" && (
                  <div className="mt-0.5 text-[11px] font-bold text-ink-faint">
                    {L(`সূর্যাস্ত ${formatTime12((times as any).sunset || "", lang)}`, `Sunset ${formatTime12((times as any).sunset || "", lang)}`, `غروب ${formatTime12((times as any).sunset || "", lang)}`)}
                  </div>
                )}
              </div>
            );
          })}
          {(() => {
            const w = times ? getNaflWindows(times) : null;
            if (!w) return null;
            const rows = [
              { name: tx("ইশরাক"), icon: "sunrise", from: w.ishraqStart, to: w.ishraqEnd },
              { name: tx("চাশত"), icon: "sun", from: w.chashtStart, to: w.chashtEnd },
            ];
            return rows.map((r) => (
              <div key={r.name} className="card card-hover relative overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink-soft">
                    <Icon name={r.icon} size={16} className="text-gold-600" />
                    {r.name}
                  </span>
                  <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                    {tx("নফল")}
                  </span>
                </div>
                <div className="mt-1 text-[22px] font-bold tabular-nums">
                  {formatTime12(r.from, lang)}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-ink-faint">
                  {L(`থেকে ${formatTime12(r.to, lang)} পর্যন্ত`, `until ${formatTime12(r.to, lang)}`, `سے ${formatTime12(r.to, lang)} تک`)}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {updatedAt && (
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          {tx("আপডেট")}: {updatedAt.toLocaleTimeString(lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-US", { hour: "numeric", minute: "2-digit" })}
          {" • "}Aladhan (Karachi/Hanafi)
        </p>
      )}
    </div>
  );
}
