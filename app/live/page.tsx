"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { endpoints } from "../../lib/api";

function useApi(path: string) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`https://api.islahbd.com${path}`).then((r) => r.json()).then(setData).catch(() => setData(null));
  }, [path]);
  return data;
}

export default function LivePage() {
  const live = useApi(endpoints.liveStatus);
  const next = useApi(endpoints.nextBoyan);
  const isLive = !!(live && (live.is_live || live.live || live.status === "live"));

  return (
    <div className="animate-fade-up">
      <PageHead
        title="লাইভ"
        subtitle="সরাসরি বয়ান ও হারামাইন"
        icon="radio"
        action={
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isLive ? "bg-red-500 text-white" : "bg-white/15 text-white"}`}>
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-white animate-pulsedot" : "bg-white/50"}`} />
            {isLive ? "লাইভ চলছে" : "অফলাইন"}
          </span>
        }
      />

      <div className="card mt-3 overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-l from-red-600 to-red-500 p-4 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Icon name="radio" size={24} />
          </span>
          <div className="flex-1">
            <div className="font-bold">লাইভ বয়ান</div>
            <div className="text-xs text-white/80">সরাসরি সম্প্রচার দেখুন</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          <a href="https://www.youtube.com/@islahbd" target="_blank" rel="noreferrer" className="btn-primary !py-2.5 text-[13px]">
            <Icon name="playfill" size={15} /> YouTube
          </a>
          <Link href="/boyan" className="btn-ghost !py-2.5 text-[13px]">
            <Icon name="mic" size={15} /> অডিও বয়ান
          </Link>
        </div>
      </div>

      <div className="card mt-2 p-4">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile bg-primary-50 text-primary-600">
            <Icon name="kaaba" size={24} />
          </span>
          <div>
            <div className="font-bold">মক্কা ও মদিনা লাইভ</div>
            <div className="text-xs text-ink-faint">হারামাইন সরাসরি</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="https://www.youtube.com/results?search_query=makkah+live" target="_blank" rel="noreferrer" className="btn-outline !py-2 text-[13px]">মক্কা</a>
          <a href="https://www.youtube.com/results?search_query=madinah+live" target="_blank" rel="noreferrer" className="btn-outline !py-2 text-[13px]">মদিনা</a>
        </div>
      </div>

      <div className="card mt-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile bg-amber-50 text-gold-600">
              <Icon name="bell" size={24} />
            </span>
            <div>
              <div className="font-bold">পরবর্তী বয়ান</div>
              <div className="text-xs text-ink-faint">{next ? JSON.stringify(next).slice(0, 80) : "লোড হচ্ছে…"}</div>
            </div>
          </div>
        </div>
        <button className="btn-gold mt-3 w-full" onClick={() => { (Notification as any)?.requestPermission?.(); }}>
          <Icon name="bell" size={16} /> রিমাইন্ডার অন করুন
        </button>
      </div>
    </div>
  );
}
