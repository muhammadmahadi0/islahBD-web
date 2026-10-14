"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MediaPage() {
  const [tab, setTab] = useState<"videos" | "clips" | "audios" | "nasheeds">("videos");
  const [items, setItems] = useState<any[]>([]);
  const urls: Record<string, string> = {
    videos: "https://api.islahbd.com/api/videos/?ordering=-createdAt",
    clips: "https://api.islahbd.com/api/clips/?ordering=-createdAt",
    audios: "https://api.islahbd.com/api/audios/?limit=20&ordering=-uploadDate",
    nasheeds: "https://api.islahbd.com/api/nasheeds/?ordering=-createdAt",
  };
  useEffect(() => {
    fetch(urls[tab]).then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : d.results || [])).catch(() => setItems([]));
  }, [tab]);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🎬 ভিডিও • ক্লিপ • অডিও • নাশীদ</h1>
      <div className="flex gap-2 mt-2 overflow-x-auto">
        {(Object.keys(urls) as any[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "btn-primary whitespace-nowrap" : "chip !py-2 whitespace-nowrap"}>{t}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {items.slice(0, 40).map((v: any, i: number) => (
          <div key={i} className="card p-3.5">
            <div className="font-bold text-sm">{v.title || v.name || `${tab} ${i + 1}`}</div>
            {v.youtubeId || v.videoId ? <a className="text-primary text-sm font-bold" target="_blank" href={`https://www.youtube.com/watch?v=${v.youtubeId || v.videoId}`}>▶ YouTube-এ দেখুন</a> : null}
            {v.audio || v.file ? <audio controls src={v.audio || v.file} className="w-full mt-2" preload="none" /> : null}
            <div className="text-[11px] text-stone-400 mt-1">{v.createdAt || v.uploadDate || ""}</div>
          </div>
        ))}
        {items.length === 0 && <div className="card p-4 text-sm text-stone-500">লোড হচ্ছে… (VideoScreen • ShortClips • NasheedScreen • AudioCard)</div>}
      </div>
    </div>
  );
}
