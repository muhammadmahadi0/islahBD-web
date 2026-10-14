"use client";
import { useEffect, useState } from "react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

// Mirrors HomePrayerCard + PrayerTimeService + LocationSetupScreen
export default function PrayerCard() {
  const [info, setInfo] = useState<string>("লোকেশন নেওয়া হচ্ছে…");
  const [times, setTimes] = useState<{ name: string; time: string; next: boolean }[]>([]);
  const [nextName, setNextName] = useState("");

  useEffect(() => {
    const fallback = { lat: 23.8103, lng: 90.4125 }; // Dhaka
    const compute = (lat: number, lng: number) => {
      const coords = new Coordinates(lat, lng);
      const params = CalculationMethod.Karachi();
      params.madhab = "hanafi" as any;
      const date = new Date();
      const pt = new PrayerTimes(coords, date, params);
      const fmt = (d: Date) =>
        d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });
      const list: [string, Date][] = [
        ["ফজর", pt.fajr],
        ["সূর্যোদয়", pt.sunrise],
        ["যোহর", pt.dhuhr],
        ["আসর", pt.asr],
        ["মাগরিব", pt.maghrib],
        ["ইশা", pt.isha],
      ];
      const now = new Date();
      let nextIdx = list.findIndex(([, d]) => d > now);
      if (nextIdx < 0) nextIdx = 0;
      setNextName(list[nextIdx][0]);
      setTimes(list.map(([name, d], i) => ({ name, time: fmt(d), next: i === nextIdx })));
      setInfo(`📍 ${lat.toFixed(2)}, ${lng.toFixed(2)} • হানাফি • করাচি পদ্ধতি`);
    };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => compute(p.coords.latitude, p.coords.longitude),
        () => compute(fallback.lat, fallback.lng),
        { timeout: 5000 }
      );
    } else compute(fallback.lat, fallback.lng);
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="bg-primary text-white p-4 flex items-center gap-3">
        <img src="/images/kaaba.png" alt="kaaba" className="w-12 h-12 rounded-xl bg-white/10 object-contain p-1" />
        <div className="flex-1">
          <div className="text-sm opacity-80">পরবর্তী নামাজ</div>
          <div className="text-2xl font-bold">{nextName || "…"}</div>
          <div className="text-[11px] opacity-75">{info}</div>
        </div>
        <a href="/prayer-times" className="bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold">বিস্তারিত →</a>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {times.map((t) => (
          <div key={t.name} className={`rounded-xl p-2 text-center border ${t.next ? "bg-gold-light border-gold" : "bg-ivory border-emerald-900/10"}`}>
            <div className="text-[12px] font-semibold">{t.name}</div>
            <div className="text-sm font-bold">{t.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
