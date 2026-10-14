"use client";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
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
  const [label, setLabel] = useState("ঢাকা");
  const [rows, setRows] = useState<{ n: string; t: string }[]>([]);
  const [mode, setMode] = useState<"gps" | "manual">("gps");

  const compute = (la: number, ln: number, lb: string) => {
    const params = CalculationMethod.Karachi();
    (params as any).madhab = "hanafi";
    const pt = new PrayerTimes(new Coordinates(la, ln), new Date(), params);
    setRows(NAMES.map(([n, f]) => ({ n, t: f(pt).toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }) })));
    setLabel(lb);
  };

  useEffect(() => { compute(lat, lng, "ঢাকা"); }, []);

  return (
    <div className="animate-fade-up">
      <PageHead title="নামাজের সময়" subtitle={`${label} • হানাফি • করাচি পদ্ধতি`} icon="clock" />
      <div className="card mt-3 p-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-sand p-1">
          {(["gps", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl py-2 text-[13px] font-bold transition ${mode === m ? "bg-white text-primary-700 shadow-card" : "text-ink-faint"}`}
            >
              {m === "gps" ? "GPS অটো" : "ম্যানুয়াল"}
            </button>
          ))}
        </div>
        {mode === "gps" ? (
          <button
            className="btn-primary mt-3 w-full"
            onClick={() => navigator.geolocation?.getCurrentPosition(
              (p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); compute(p.coords.latitude, p.coords.longitude, "আপনার অবস্থান"); },
              () => compute(23.8103, 90.4125, "ঢাকা")
            )}
          >
            <Icon name="pin" size={16} /> লোকেশন নিন
          </button>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input type="number" step="any" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="input" aria-label="latitude" />
            <input type="number" step="any" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="input" aria-label="longitude" />
            <button className="btn-primary col-span-2" onClick={() => compute(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)}`)}>
              <Icon name="check" size={16} /> সেট করুন
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {rows.map((r, i) => (
          <div key={r.n} className="card flex items-center gap-3 p-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${i === 0 ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-700"}`}>
              {i + 1}
            </span>
            <span className="flex-1 font-bold">{r.n}</span>
            <span className="font-bold tabular-nums text-primary-700">{r.t}</span>
            <button
              aria-label="alarm"
              className="rounded-xl p-2 text-ink-faint transition hover:bg-gold-light hover:text-gold-600 active:scale-95"
              onClick={() => { (Notification as any)?.requestPermission?.(); }}
            >
              <Icon name="bell" size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
