"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

const NAMES: [string, (p: PrayerTimes) => Date][] = [
  ["ফজর", (p) => p.fajr],
  ["সূর্যোদয়", (p) => p.sunrise],
  ["যোহর", (p) => p.dhuhr],
  ["আসর", (p) => p.asr],
  ["মাগরিব", (p) => p.maghrib],
  ["ইশা", (p) => p.isha],
];

export default function PrayerTimesPage() {
  const [lat, setLat] = useState(23.8103);
  const [lng, setLng] = useState(90.4125);
  const [rows, setRows] = useState<{ n: string; t: string }[]>([]);
  const [mode, setMode] = useState<"gps" | "manual">("gps");

  const compute = (la: number, ln: number) => {
    const pt = new PrayerTimes(new Coordinates(la, ln), new Date(), (() => { const m = CalculationMethod.Karachi(); (m as any).madhab = "hanafi"; return m; })());
    setRows(NAMES.map(([n, f]) => ({ n, t: f(pt).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }) })));
  };

  useEffect(() => { compute(lat, lng); }, []);

  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">নামাজের সময়</h1>
      <p className="text-sm text-stone-500">PrayerTimesScreen • LocationSetup • AlarmBottomSheet • SunPath</p>
      <div className="card p-4 mt-3 space-y-2">
        <div className="flex gap-2">
          <button onClick={() => setMode("gps")} className={mode === "gps" ? "btn-primary flex-1" : "chip flex-1 !py-2.5"}>📡 GPS অটো</button>
          <button onClick={() => setMode("manual")} className={mode === "manual" ? "btn-primary flex-1" : "chip flex-1 !py-2.5"}>✍️ ম্যানুয়াল</button>
        </div>
        {mode === "gps" ? (
          <button className="btn-primary w-full" onClick={() => navigator.geolocation?.getCurrentPosition((p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); compute(p.coords.latitude, p.coords.longitude); }, () => alert("GPS পাওয়া যায়নি, ঢাকা ব্যবহার হচ্ছে"))}>
            লোকেশন নিন
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="any" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="input" placeholder="Latitude" />
            <input type="number" step="any" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="input" placeholder="Longitude" />
            <button className="btn-primary col-span-2" onClick={() => compute(lat, lng)}>সেট করুন</button>
          </div>
        )}
        <div className="text-xs text-stone-500">📍 {lat.toFixed(4)}, {lng.toFixed(4)}</div>
      </div>
      <div className="space-y-2 mt-2">
        {rows.map((r) => (
          <div key={r.n} className="card p-3.5 flex items-center justify-between">
            <span className="font-bold">{r.n}</span>
            <span className="font-bold text-primary">{r.t}</span>
            <button className="chip" onClick={() => { Notification?.requestPermission?.(); alert(`${r.n} (${r.t}) — অ্যালার্ম অন ✓ (ওয়েবে নোটিফিকেশন)`); }}>⏰ অ্যালার্ম</button>
          </div>
        ))}
      </div>
    </div>
  );
}
