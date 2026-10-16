"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { CITIES } from "../../lib/prayer";
import { toBn } from "../../lib/prayer";

const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Great-circle bearing from user to Kaaba (degrees from North). */
function kaabaBearing(lat: number, lng: number): number {
  const la1 = (lat * Math.PI) / 180;
  const lo1 = (lng * Math.PI) / 180;
  const la2 = (KAABA.lat * Math.PI) / 180;
  const lo2 = (KAABA.lng * Math.PI) / 180;
  const y = Math.sin(lo2 - lo1);
  const x = Math.cos(la1) * Math.tan(la2) - Math.sin(la1) * Math.cos(lo2 - lo1);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function cardinal(deg: number): string {
  const dirs = ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"];
  return dirs[Math.round(deg / 45) % 8];
}

type SensorState = "idle" | "need-permission" | "active" | "unsupported";

export default function QiblaPage() {
  const [heading, setHeading] = useState<number | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [place, setPlace] = useState("ঢাকা");
  const [sensor, setSensor] = useState<SensorState>("idle");
  const [note, setNote] = useState("");
  const started = useRef(false);

  const locate = useCallback((lat: number, lng: number, label: string) => {
    setQibla(kaabaBearing(lat, lng));
    setPlace(label);
  }, []);

  const locateGps = useCallback(() => {
    if (!navigator.geolocation) {
      setNote("এই ডিভাইসে GPS নেই — নিচ থেকে শহর বেছে নিন।");
      return;
    }
    setNote("লোকেশন নেওয়া হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        locate(p.coords.latitude, p.coords.longitude, "আপনার অবস্থান");
        setNote("");
      },
      () => setNote("লোকেশন পাওয়া যায়নি — নিচ থেকে শহর বেছে নিন।"),
      { timeout: 10000, maximumAge: 600000 }
    );
  }, [locate]);

  useEffect(() => {
    const dhaka = CITIES[0];
    locate(dhaka.lat, dhaka.lng, dhaka.nameBn);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => locate(p.coords.latitude, p.coords.longitude, "আপনার অবস্থান"),
        () => {},
        { timeout: 8000, maximumAge: 600000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOrientation = useCallback((e: any) => {
    // iOS gives webkitCompassHeading (0=N, clockwise); others give alpha
    // (0=N but counter-clockwise from device top) — normalize to heading.
    let h: number | null = null;
    if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) {
      h = e.webkitCompassHeading;
    } else if (typeof e.alpha === "number" && e.alpha !== null) {
      h = (360 - e.alpha) % 360;
    }
    if (h !== null && !isNaN(h)) {
      setHeading(h);
      setSensor("active");
    }
  }, []);

  const startCompass = useCallback(async () => {
    if (started.current) return;
    const DOE = (window as any).DeviceOrientationEvent;
    try {
      // iOS 13+: explicit permission inside the tap gesture.
      if (DOE && typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setSensor("need-permission");
          setNote("কম্পাসের অনুমতি দিন — সেটিংসে Motion & Fitness চালু করুন।");
          return;
        }
      }
    } catch {
      // continue anyway — event may still fire
    }
    started.current = true;
    window.addEventListener("deviceorientationabsolute", onOrientation as any, true);
    window.addEventListener("deviceorientation", onOrientation as any, true);
    // If nothing arrives in 3s, sensors are unavailable here.
    setTimeout(() => {
      setSensor((s) => {
        if (s === "idle" || s === "need-permission") {
          setNote("এই ব্রাউজারে কম্পাস সেন্সর পাওয়া যায়নি — নিচের ডিগ্রি দেখে মিলিয়ে নিন।");
          return "unsupported";
        }
        return s;
      });
    }, 3000);
  }, [onOrientation]);

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation as any, true);
      window.removeEventListener("deviceorientation", onOrientation as any, true);
    };
  }, [onOrientation]);

  const delta = heading !== null && qibla !== null ? ((qibla - heading) % 360 + 360) % 360 : null;
  const aligned = delta !== null && (delta < 6 || delta > 354);

  return (
    <div className="animate-fade-up">
      <PageHead title="কিবলা কম্পাস" subtitle="কাবার দিক নির্ণয়" icon="compass" />

      <div className="card mt-3 p-5 text-center sm:p-6">
        {/* dial */}
        <div className="relative mx-auto h-60 w-60 rounded-full border-[10px] border-primary-50 bg-sand shadow-card">
          {/* rotating rose */}
          <div
            className="absolute inset-2 transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${-((heading ?? 0) - 0)}deg)` }}
          >
            <div className="absolute left-1/2 top-1 -translate-x-1/2 text-sm font-extrabold text-red-500">N</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-bold text-ink-faint">S</div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[11px] font-bold text-ink-faint">W</div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[11px] font-bold text-ink-faint">E</div>
          </div>
          {/* kaaba needle */}
          <div
            className="absolute left-1/2 top-1/2 h-[104px] w-2 origin-bottom rounded-full bg-gradient-to-t from-gold-600 to-gold transition-transform duration-200 ease-out"
            style={{ transform: `translate(-50%,-100%) rotate(${delta ?? 0}deg)` }}
          />
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl shadow-card">
            🕋
          </div>
        </div>

        {/* readout */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="rounded-2xl bg-primary-50 px-4 py-2 text-lg font-bold tabular-nums text-primary-700">
            {qibla !== null ? `${toBn(Math.round(qibla))}°` : "…"}
          </span>
          <span className="text-sm font-bold text-ink-soft">
            {qibla !== null ? `উত্তর থেকে ${cardinal(qibla)} দিকে` : ""}
          </span>
        </div>

        <div
          className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
            aligned ? "bg-primary-600 text-white" : "bg-sand text-ink-soft"
          }`}
        >
          <Icon name={aligned ? "check" : "compass"} size={16} />
          {sensor !== "active"
            ? "কম্পাস চালু করুন"
            : aligned
              ? "কিবলার দিকে মুখ করে আছেন ✓"
              : heading !== null
                ? `ঘুরুন — লক্ষ্য ${toBn(Math.round(delta || 0))}°`
                : "কম্পাস পড়া হচ্ছে…"}
        </div>

        {sensor !== "active" && (
          <button onClick={startCompass} className="btn-primary mt-4 w-full">
            <Icon name="compass" size={18} /> কম্পাস চালু করুন
          </button>
        )}
        {note && <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-ink-faint">{note}</p>}
        <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-ink-faint">
          সঠিক দিকের জন্য ফোন সমতলে রেখে 8-আকৃতিতে কয়েকবার ঘুরিয়ে ক্যালিব্রেট করুন। চুম্বক/মেটাল কভার দূরে রাখুন।
        </p>
      </div>

      {/* location */}
      <div className="card mt-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold">অবস্থান: {place}</span>
          <button onClick={locateGps} className="btn-ghost !py-1.5 !text-xs">
            <Icon name="pin" size={14} /> GPS
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c.key}
              onClick={() => locate(c.lat, c.lng, c.nameBn)}
              className={`chip !px-3 !py-1.5 ${place === c.nameBn ? "chip-active" : ""}`}
            >
              {c.nameBn}
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
            <Icon name="globe" size={15} /> ম্যাপে কাবা দেখুন
          </a>
        )}
      </div>
    </div>
  );
}
