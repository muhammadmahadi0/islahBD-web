"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function QiblaPage() {
  const [deg, setDeg] = useState(0);
  const [qibla, setQibla] = useState(244);
  const [note, setNote] = useState("কম্পাস চালু করতে নিচের বাটন চাপুন");

  const start = () => {
    navigator.geolocation?.getCurrentPosition((p) => {
      const la1 = (p.coords.latitude * Math.PI) / 180;
      const lo1 = (p.coords.longitude * Math.PI) / 180;
      const la2 = (21.4225 * Math.PI) / 180;
      const lo2 = (39.8262 * Math.PI) / 180;
      const y = Math.sin(lo2 - lo1);
      const x = Math.cos(la1) * Math.tan(la2) - Math.sin(la1) * Math.cos(lo2 - lo1);
      setQibla((Math.atan2(y, x) * 180) / Math.PI + 180);
      setNote("ফোন সমতলে রেখে 8-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন");
    });
    const handler = (e: any) => {
      const h = e.webkitCompassHeading ?? (360 - e.alpha);
      if (h != null) setDeg(h);
    };
    (window as any).DeviceOrientationEvent?.requestPermission?.().catch(() => {});
    window.addEventListener("deviceorientationabsolute", handler as any, true);
    window.addEventListener("deviceorientation", handler as any, true);
  };

  return (
    <div className="text-center">
      <div className="text-left"><Link href="/" className="text-primary text-sm font-semibold">← হোম</Link></div>
      <h1 className="text-2xl font-bold mt-1">কিবলা কম্পাস</h1>
      <p className="text-sm text-stone-500">QiblaScreen • {note}</p>
      <div className="card p-6 mt-3">
        <div className="relative w-56 h-56 mx-auto rounded-full border-8 border-primary-light">
          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ transform: `rotate(${-deg}deg)` }}>🕋</div>
          <div className="absolute left-1/2 top-1/2 w-1 h-24 bg-gold origin-bottom" style={{ transform: `translate(-50%,-100%) rotate(${qibla - deg}deg)` }} />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 font-bold">N</div>
        </div>
        <div className="mt-3 font-bold">হেডিং: {deg.toFixed(0)}° • কিবলা: {qibla.toFixed(1)}°</div>
        <button onClick={start} className="btn-primary w-full mt-3">🧭 কম্পাস চালু করুন</button>
        <p className="text-[11px] text-stone-400 mt-2">ওয়েবে সেন্সর সীমিত হতে পারে — এটি অ্যাপের QiblaScreen-এর ওয়েব সংস্করণ।</p>
      </div>
    </div>
  );
}
