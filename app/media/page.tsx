"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";

// Video / Short clips — YouTube-backed series from api.islahbd.com
export default function MediaPage() {
  const [tab, setTab] = useState<"videos" | "clips">("videos");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const urls: Record<string, string> = {
    videos: "https://api.islahbd.com/api/videos/?ordering=-createdAt",
    clips: "https://api.islahbd.com/api/clips/?ordering=-createdAt",
  };

  useEffect(() => {
    setLoading(true);
    fetch(urls[tab])
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="animate-fade-up">
      <PageHead title="ভিডিও" subtitle="বয়ান ও শর্ট ক্লিপ" icon="play" />

      <div className="card mt-3 grid grid-cols-2 gap-2 p-3">
        <Link href="/boyan" className="flex items-center gap-3 rounded-2xl bg-primary-50 p-3 transition hover:bg-primary-100">
          <span className="icon-tile !h-10 !w-10 bg-primary-600 text-white">
            <Icon name="mic" size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold text-primary-700">বয়ান (MP3)</span>
            <span className="block text-[11px] text-ink-faint">শুনুন ও ডাউনলোড</span>
          </span>
        </Link>
        <Link href="/hamdnaat" className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 transition hover:bg-amber-100">
          <span className="icon-tile !h-10 !w-10 bg-gold text-white">
            <Icon name="music" size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold text-gold-dark">হামদ-নাত</span>
            <span className="block text-[11px] text-ink-faint">অডিও ও ভিডিও</span>
          </span>
        </Link>
      </div>

      <div className="flex gap-2 py-3">
        {(["videos", "clips"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip !px-4 !py-2 ${tab === t ? "chip-active" : ""}`}
          >
            {t === "videos" ? "ভিডিও সিরিজ" : "শর্ট ক্লিপ"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-3/4 rounded-full bg-sand-dark" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="play" title="এখনো কিছু নেই" hint="পরে আবার দেখুন" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.slice(0, 40).map((v: any, i: number) => {
            const vid = v.youtubeId || v.videoId;
            return (
              <div key={i} className="card card-hover p-4">
                <div className="text-sm font-bold leading-snug">{v.title || v.name || `ভিডিও ${i + 1}`}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">{v.createdAt || v.uploadDate || ""}</div>
                {vid ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${vid}`}
                    target="_blank" rel="noreferrer"
                    className="btn-primary mt-3 w-full !py-2 text-[13px]"
                  >
                    <Icon name="playfill" size={15} /> দেখুন
                  </a>
                ) : (v.video || v.file) ? (
                  <video controls src={v.video || v.file} className="mt-3 w-full rounded-2xl" preload="none" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
