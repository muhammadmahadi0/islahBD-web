"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { CITIES, toBn } from "../../lib/prayer";
import { KAABA, kaabaBearing, norm } from "../../lib/qibla";
import { useLang, useTx } from "../../store/language-store";

function cardinal(deg: number): string {
  const dirs = ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"];
  return dirs[Math.round(norm(deg) / 45) % 8];
}

type SensorState = "idle" | "need-permission" | "starting" | "active" | "unsupported";
type CompassEvent = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean };

export default function QiblaPage() {
  const tx = useTx();
  const lang = useLang();
  const [heading, setHeading] = useState<number | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [place, setPlace] = useState("ঢাকা");
  const [sensor, setSensor] = useState<SensorState>("idle");
  const [note, setNote] = useState("");
  const [gpsBusy, setGpsBusy] = useState(false);
  const started = useRef(false);
  const headingRef = useRef<number | null>(null);

  const locate = useCallback((lat: number, lng: number, label: string) => {
    setQibla(kaabaBearing(lat, lng));
    setPlace(label);
  }, []);

  const requestGps = useCallback(
    (silent = false) => {
      if (!navigator.geolocation) {
        if (!silent) setNote("এই ডিভাইসে GPS নেই — নিচ থেকে শহর বেছে নিন।");
        return;
      }
      setGpsBusy(true);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          locate(p.coords.latitude, p.coords.longitude, tx("আপনার অবস্থান"));
          setGpsBusy(false);
          if (!silent) setNote("");
        },
        () => {
          setGpsBusy(false);
          if (!silent) setNote("লোকেশন পাওয়া যায়নি — নিচ থেকে শহর বেছে নিন।");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },
    [locate]
  );

  /**
   * Only trust a real compass heading:
   *  - iOS: `webkitCompassHeading` (clockwise magnetic degrees)
   *  - others: `deviceorientationabsolute` alpha, where heading = 360 - alpha
   * Relative `deviceorientation` alpha is ignored — it is not north-based
   * and was previously overwriting the genuine heading on Android.
   */
  const onOrientation = useCallback((event: Event) => {
    const e = event as CompassEvent;
    let raw: number | null = null;
    if (typeof e.webkitCompassHeading === "number" && Number.isFinite(e.webkitCompassHeading)) {
      raw = e.webkitCompassHeading;
    } else if (e.absolute === true && typeof e.alpha === "number" && Number.isFinite(e.alpha)) {
      raw = 360 - e.alpha;
    }
    if (raw === null) return;

    raw = norm(raw);
    const previous = headingRef.current;
    // Keep a continuous angle so the rose/needle take the short way around
    // instead of spinning a full turn when heading crosses 0°/360°.
    let next = raw;
    if (previous !== null) {
      const shortest = ((raw - norm(previous) + 540) % 360) - 180;
      next = previous + shortest;
    }
    headingRef.current = next;
    setHeading(next);
    setSensor("active");
    setNote("");
  }, []);

  const attach = useCallback(() => {
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
  }, [onOrientation]);

  const startCompass = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    const DOE = (window as unknown as { DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (!DOE) {
      setSensor("unsupported");
      setNote("এই ব্রাউজারে কম্পাস সেন্সর সাপোর্ট করে না — নিচের ডিগ্রি দেখে কাবার দিক মিলিয়ে নিন।");
      return;
    }

    // iOS 13+ needs an explicit permission call inside a user gesture.
    if (typeof DOE.requestPermission === "function") {
      setSensor("starting");
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          started.current = false;
          setSensor("need-permission");
          setNote("কম্পাসের অনুমতি দিন — iOS সেটিংসে Motion & Fitness চালু থাকতে হবে।");
          return;
        }
      } catch {
        started.current = false;
        setSensor("need-permission");
        setNote("কম্পাসের অনুমতি নেওয়া যায়নি — আবার চেষ্টা করুন।");
        return;
      }
    }

    setSensor((current) => (current === "active" ? current : "starting"));
    window.setTimeout(() => {
      if (headingRef.current === null) {
        setSensor("unsupported");
        setNote("কম্পাস রিডিং পাওয়া যাচ্ছে না — ফোন সমতলে রেখে ৮-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন, অথবা নিচের ডিগ্রি দেখে কাবার দিক মিলিয়ে নিন।");
      }
    }, 2800);
  }, []);

  useEffect(() => {
    const dhaka = CITIES[0];
    locate(dhaka.lat, dhaka.lng, dhaka.nameBn);
    requestGps(true);

    const DOE = (window as unknown as { DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    const touch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
    if (!DOE) {
      setSensor("unsupported");
      setNote("এই ব্রাউজারে কম্পাস সেন্সর নেই — GPS বা শহর বেছে কাবার দিক দেখুন।");
      return;
    }

    // Listeners are harmless before iOS permission is granted; the events
    // simply start flowing once the user allows them.
    attach();
    if (typeof DOE.requestPermission === "function") {
      setSensor("need-permission");
    } else if (touch) {
      // Android/other touch browsers expose the compass without a prompt.
      startCompass();
    }

    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation, true);
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [locate, requestGps, startCompass, attach, onOrientation]);

  const delta = heading !== null && qibla !== null ? norm(qibla - heading) : null;
  const aligned = delta !== null && (delta < 6 || delta > 354);
  const roseAngle = -(heading ?? 0);
  const needleAngle = qibla === null ? 0 : qibla - (heading ?? 0);
  const showStart = sensor !== "active";

  const statusText = (() => {
    if (sensor === "active") {
      if (aligned) return tx("কিবলার দিকে মুখ করে আছেন ✓");
      if (delta !== null) {
        const signed = delta > 180 ? delta - 360 : delta;
        return lang === "bn" ? `${signed >= 0 ? tx("ডানে") : tx("বামে")} ঘুরুন — ${toBn(Math.round(Math.abs(signed)))}°` : lang === "ur" ? `${signed >= 0 ? "دائیں" : "بائیں"} مڑیں — ${Math.round(Math.abs(signed))}°` : `Turn ${signed >= 0 ? "right" : "left"} — ${Math.round(Math.abs(signed))}°`;
      }
      return tx("কম্পাস পড়া হচ্ছে…");
    }
    if (sensor === "need-permission") return tx("কম্পাসের অনুমতি দিন");
    if (sensor === "starting") return tx("কম্পাস চালু হচ্ছে…");
    return tx("কম্পাস চালু করুন");
  })();

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("কিবলা কম্পাস")} subtitle={tx("কাবার দিক নির্ণয়")} icon="compass" />

      <div className="card mt-3 p-5 text-center sm:p-6">
        {/* dial */}
        <div
          className={`relative mx-auto aspect-square w-full max-w-[264px] rounded-full border-[10px] transition-colors duration-300 ${
            aligned
              ? "border-primary-500/70 bg-primary-50/70 dark:bg-primary-900/25"
              : "border-primary-50 bg-sand dark:border-white/10"
          }`}
        >
          {/* rotating rose: ticks + cardinal points */}
          <div
            className="absolute inset-2 text-ink-faint transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${roseAngle}deg)` }}
          >
            <svg viewBox="0 0 240 240" className="h-full w-full">
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = (i * 5 * Math.PI) / 180;
                const major = i % 18 === 0;
                const medium = i % 6 === 0;
                const inner = major ? 94 : medium ? 101 : 106;
                const outer = 114;
                return (
                  <line
                    key={i}
                    x1={120 + inner * Math.sin(angle)}
                    y1={120 - inner * Math.cos(angle)}
                    x2={120 + outer * Math.sin(angle)}
                    y2={120 - outer * Math.cos(angle)}
                    stroke="currentColor"
                    strokeWidth={major ? 2.4 : medium ? 1.6 : 1}
                    strokeLinecap="round"
                    opacity={major ? 0.9 : medium ? 0.5 : 0.28}
                  />
                );
              })}
              <text x="120" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill="#dc2626">N</text>
              <text x="120" y="228" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">S</text>
              <text x="222" y="125" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">E</text>
              <text x="18" y="125" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">W</text>
            </svg>
          </div>

          {/* Kaaba needle */}
          <div
            className="absolute left-1/2 top-1/2 w-[6px] origin-bottom transition-transform duration-200 ease-out"
            style={{ height: 94, transform: `translate(-50%,-100%) rotate(${needleAngle}deg)` }}
          >
            <span className="block h-full w-full rounded-full bg-gradient-to-t from-gold-600 to-gold shadow-card" />
          </div>

          {/* hub */}
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary-900/10 bg-white text-3xl shadow-card dark:border-white/10 dark:bg-slate-800">
            🕋
          </div>
        </div>

        {/* readout */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-2xl bg-primary-50 px-4 py-2 text-lg font-bold tabular-nums text-primary-700 dark:bg-white/5">
            {qibla !== null ? `${lang === "bn" ? toBn(Math.round(qibla)) : Math.round(qibla)}°` : "…"}
          </span>
          <span className="text-sm font-bold text-ink-soft">
            {qibla !== null ? (lang === "bn" ? `উত্তর থেকে ${tx(cardinal(qibla))} দিকে` : lang === "ur" ? `شمال سے ${tx(cardinal(qibla))} کی طرف` : `${tx(cardinal(qibla))} from north`) : ""}
          </span>
        </div>
        {heading !== null && (
          <p className="mt-1 text-[11px] font-medium text-ink-faint">
            {tx("ফোনের মুখ:")} {lang === "bn" ? toBn(Math.round(norm(heading))) : Math.round(norm(heading))}°
          </p>
        )}

        <div
          className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            aligned ? "bg-primary-600 text-white" : "bg-sand text-ink-soft"
          }`}
        >
          <Icon name={aligned ? "check" : "compass"} size={16} />
          {statusText}
        </div>

        {showStart && (
          <button onClick={startCompass} className="btn-primary mt-4 w-full" disabled={sensor === "starting"}>
            <Icon name="compass" size={18} /> {sensor === "need-permission" ? tx("অনুমতি দিয়ে চালু করুন") : tx("কম্পাস চালু করুন")}
          </button>
        )}
        {note && <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-ink-faint">{tx(note)}</p>}
        <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-ink-faint">
          {tx("সঠিক দিকের জন্য ফোন সমতলে রেখে ৮-আকৃতিতে কয়েকবার ঘুরিয়ে ক্যালিব্রেট করুন। চুম্বক/মেটাল কভার দূরে রাখুন।")}
        </p>
      </div>

      {/* location */}
      <div className="card mt-2 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-bold">{tx("অবস্থান:")} {tx(place)}</span>
          <button
            onClick={() => requestGps(false)}
            disabled={gpsBusy}
            className="btn-ghost shrink-0 !py-1.5 !text-xs disabled:opacity-60"
          >
            <Icon name="pin" size={14} /> {gpsBusy ? tx("খোঁজা হচ্ছে…") : "GPS"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c.key}
              onClick={() => locate(c.lat, c.lng, c.nameBn)}
              className={`chip !px-3 !py-1.5 ${place === c.nameBn ? "chip-active" : ""}`}
            >
              {tx(c.nameBn)}
            </button>
          ))}
        </div>
        {qibla !== null && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${KAABA.lat},${KAABA.lng}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline mt-3 w-full !py-2 text-[13px]"
          >
            <Icon name="globe" size={15} /> {tx("ম্যাপে কাবা দেখুন")}
          </a>
        )}
      </div>
    </div>
  );
}
