"use client";
import { useState } from "react";
import { PageHead } from "../../components/ui";

export default function QiblaPage() {
  const [deg, setDeg] = useState(0);
  const [qibla, setQibla] = useState(244);
  const [on, setOn] = useState(false);

  const start = () => {
    setOn(true);
    navigator.geolocation?.getCurrentPosition((p) => {
      const la1 = (p.coords.latitude * Math.PI) / 180;
      const lo1 = (p.coords.longitude * Math.PI) / 180;
      const la2 = (21.4225 * Math.PI) / 180;
      const lo2 = (39.8262 * Math.PI) / 180;
      const y = Math.sin(lo2 - lo1);
      const x = Math.cos(la1) * Math.tan(la2) - Math.sin(la1) * Math.cos(lo2 - lo1);
      setQibla((Math.atan2(y, x) * 180) / Math.PI + 180);
    });
    const handler = (e: any) => {
      const h = e.webkitCompassHeading ?? (360 - e.alpha);
      if (h != null) setDeg(h);
    };
    (window as any).DeviceOrientationEvent?.requestPermission?.().catch(() => {});
    window.addEventListener("deviceorientationabsolute", handler as any, true);
    window.addEventListener("deviceorientation", handler as any, true);
  };

  const delta = ((qibla - deg) % 360 + 360) % 360;
  const aligned = delta < 8 || delta > 352;

  return (
    <div className="animate-fade-up">
      <PageHead title="কিবলা কম্পাস" subtitle="কাবার দিক নির্ণয়" icon="compass" />
      <div className="card mt-3 p-6 text-center">
        <div className="relative mx-auto h-60 w-60 rounded-full border-[10px] border-primary-50 bg-sand shadow-card">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full bg-sand shadow-card transition-transform duration-300"
              style={{ transform: `rotate(${-deg}deg)` }}
            >
              <span className="text-5xl">🕋</span>
            </div>
          </div>
          <div
            className="absolute left-1/2 top-1/2 h-24 w-1.5 origin-bottom rounded-full bg-gold transition-transform duration-300"
            style={{ transform: `translate(-50%,-100%) rotate(${delta}deg)` }}
          />
          <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-bold text-ink-faint">N</div>
        </div>
        <div className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${aligned ? "bg-primary-50 text-primary-700" : "bg-sand text-ink-soft"}`}>
          {aligned ? "কিবলার দিকে মুখ করে আছেন" : `হেডিং ${Math.round(deg)}° • কিবলা ${qibla.toFixed(0)}°`}
        </div>
        {!on && (
          <button onClick={start} className="btn-primary mt-4 w-full">
            কম্পাস চালু করুন
          </button>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          ফোন সমতলে রেখে 8-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন। ওয়েবে সেন্সর সীমিত হতে পারে।
        </p>
      </div>
    </div>
  );
}
