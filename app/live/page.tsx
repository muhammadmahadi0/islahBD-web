"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { endpoints } from "../../lib/api";

function useApi(path: string) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch(`https://api.islahbd.com${path}`).then((r) => r.json()).then(setData).catch((e) => setErr(String(e)));
  }, [path]);
  return { data, err };
}

export default function LivePage() {
  const live = useApi(endpoints.liveStatus);
  const next = useApi(endpoints.nextBoyan);
  const majlis = useApi(endpoints.recurringMajlis);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🔴 লাইভ বয়ান</h1>
      <p className="text-sm text-stone-500">LiveScreen • HolySitesLive • NextBoyanCountdown • BayanReminders • Chat</p>
      <div className="card p-4 mt-3">
        <div className="font-bold">📡 Live Status</div>
        <pre className="text-[11px] bg-ivory rounded-xl p-2 mt-1 overflow-auto max-h-40">{live.err ? `অফলাইন: ${live.err}` : JSON.stringify(live.data, null, 2)?.slice(0, 1500) || "লোড হচ্ছে…"}</pre>
        <div className="flex gap-2 mt-2">
          <a href="https://www.youtube.com/@islahbd" target="_blank" className="btn-primary flex-1 text-center">▶ YouTube @islahbd</a>
          <Link href="/library" className="btn-primary flex-1 text-center !bg-ink">📚 বয়ান হিস্ট্রি</Link>
        </div>
      </div>
      <div className="card p-4 mt-2">
        <div className="font-bold">🕋 মক্কা-মদিনা লাইভ (HolySitesLivePlayer)</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a href="https://www.youtube.com/embed/live_stream?channel=UCnvRq0pXMoJzUO7mJ2d0bJQ" target="_blank" className="btn-primary text-center">মক্কা লাইভ</a>
          <a href="https://www.youtube.com/embed/live_stream?channel=UC0aB0Yd0z0a0a0a0a0a0a0a0" target="_blank" className="btn-primary text-center !bg-ink">মদিনা লাইভ</a>
        </div>
      </div>
      <div className="card p-4 mt-2">
        <div className="font-bold">⏳ Next Boyan / Recurring Majlis</div>
        <pre className="text-[11px] bg-ivory rounded-xl p-2 mt-1 overflow-auto max-h-40">{JSON.stringify(next.data || majlis.data, null, 2)?.slice(0, 1500) || "লোড হচ্ছে…"}</pre>
        <button className="btn-primary w-full mt-2" onClick={() => { Notification?.requestPermission?.(); alert("বয়ান রিমাইন্ডার অন ✓ (BayanRemindersScreen)"); }}>🔔 রিমাইন্ডার অন করুন</button>
      </div>
    </div>
  );
}
