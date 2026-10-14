"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import { Icon } from "./icons";

// Mirrors HomePrayerCard + PrayerTimeService. Next prayer + countdown,
// GPS with Dhaka fallback, Hanafi/Karachi method like the app.
export default function PrayerCard() {
  const [nextName, setNextName] = useState("…");
  const [countdown, setCountdown] = useState("");
  const [times, setTimes] = useState<{ name: string; time: string; next: boolean }[]>([]);
  const [place, setPlace] = useState("ঢাকা");

  useEffect(() => {
    let target: Date | null = null;
    let targetName = "";
    let timer: ReturnType<typeof setInterval>;

    const compute = (lat: number, lng: number, label: string) => {
      const coords = new Coordinates(lat, lng);
      const params = CalculationMethod.Karachi();
      (params as any).madhab = "hanafi";
      const pt = new PrayerTimes(coords, new Date(), params);
      const fmt = (d: Date) => d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });
      const list: [string, Date][] = [
        ["ফজর", pt.fajr],
        ["সূর্যোদয়", pt.sunrise],
        ["যোহর", pt.dhuhr],
        ["আসর", pt.asr],
        ["মাগরিব", pt.maghrib],
        ["ইশা", pt.isha],
      ];
      const now = new Date();
      let idx = list.findIndex(([, d]) => d > now);
      if (idx < 0) {
        const tmr = new PrayerTimes(coords, new Date(Date.now() + 86400000), params);
        target = tmr.fajr;
        targetName = "ফজর";
        idx = 0;
      } else {
        target = list[idx][1];
        targetName = list[idx][0];
      }
      setNextName(targetName);
      setPlace(label);
      setTimes(list.map(([name, d], i) => ({ name, time: fmt(d), next: i === idx })));
    };

    const tick = () => {
      if (!target) return;
      const diff = Math.max(0, target.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const bn = (n: number) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
      setCountdown(h > 0 ? `${bn(h)}ঘ ${bn(m)}ম` : `${bn(m)}ম ${bn(s)}সে`);
    };

    compute(23.8103, 90.4125, "ঢাকা");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => compute(p.coords.latitude, p.coords.longitude, "আপনার অবস্থান"),
        () => {},
        { timeout: 6000 }
      );
    }
    timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card animate-fade-up overflow-hidden">
      <div className="page-hero !rounded-none !shadow-none p-5">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/70">
              <Icon name="pin" size={14} />
              {place}
            </div>
            <div className="mt-1 text-[13px] text-white/75">পরবর্তী নামাজ</div>
            <div className="text-[32px] font-bold leading-tight tracking-tight">{nextName}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold tabular-nums">
              <Icon name="clock" size={14} />
              বাকি {countdown || "…"}
            </div>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10">
            <Icon name="mosque" size={44} className="text-gold-100" strokeWidth={1.4} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {times.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-2.5 text-center transition ${
              t.next
                ? "border-gold bg-gold-light shadow-card"
                : "border-primary-900/10 bg-sand"
            }`}
          >
            <div className={`text-[12px] font-bold ${t.next ? "text-gold-dark" : "text-ink-soft"}`}>{t.name}</div>
            <div className="text-sm font-bold tabular-nums">{t.time}</div>
          </div>
        ))}
      </div>
      <Link
        href="/prayer-times"
        className="mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-2xl bg-primary-50 py-2.5 text-[13px] font-bold text-primary-700 transition hover:bg-primary-100 active:scale-[0.99]"
      >
        <Icon name="clock" size={16} />
        পূর্ণ সময়সূচি ও অ্যালার্ম
      </Link>
    </div>
  );
}
