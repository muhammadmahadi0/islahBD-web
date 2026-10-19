"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./icons";
import { openIslahBDApp } from "../lib/open-app";
import { usePlayerStore, type Track } from "../store/player-store";
import { LIVE_POLL_MS, type LiveStatus } from "../lib/live";
import { bnNum } from "../lib/audio";
import { NOTIF_READ_EVENT, parseNotifications, unreadCount } from "../lib/notifications";

// Paths belonging to the More hub — the More tab stays highlighted there.
const MORE_PREFIXES = [
  "/others", "/quran", "/library", "/hamdnaat", "/media", "/nasheed",
  "/gallery", "/wallpaper", "/amal", "/dua", "/wazifa", "/calendar",
  "/poem", "/malfuzat", "/self-purification", "/fatwa", "/notice",
  "/notifications", "/donate", "/support", "/settings", "/member",
  "/munajate", "/prayer-times", "/qibla", "/tasbeeh", "/nearby-mosque",
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [unread, setUnread] = useState(0);

  // Unread notification badge. Re-read when the feed marks items read.
  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!dead && data.success) setUnread(unreadCount(parseNotifications(data.notifications)));
      } catch {
        // keep the current badge
      }
    };
    load();
    window.addEventListener(NOTIF_READ_EVENT, load);
    return () => {
      dead = true;
      window.removeEventListener(NOTIF_READ_EVENT, load);
    };
  }, []);

  // Live status (same source as the Live page) — the Live tab plays
  // the broadcast / last recording straight from the bar, like beta.
  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const data = await res.json();
        if (!dead && data.success) setLive(data.live);
      } catch {
        // ignore — the Live button simply stays idle
      }
    };
    load();
    const id = setInterval(load, LIVE_POLL_MS);
    return () => { dead = true; clearInterval(id); };
  }, []);

  const isLiveTrackActive =
    !!currentTrack && (currentTrack.id === "live" || currentTrack.id === "live-recording");

  const handleLive = useCallback(() => {
    if (!live) return;
    if (isLiveTrackActive) {
      setIsPlaying(!isPlaying);
      return;
    }
    let track: Track | null = null;
    if (live.isLive && live.streamUrl) {
      track = {
        id: "live", title: live.title || "সরাসরি বয়ান", thumbnail: "",
        duration: 0, channelName: live.speaker || "ইসলাহ লাইভ", videoId: "",
        hlsUrl: live.streamUrl, audioUrl: live.streamUrl,
        isLive: true, location: live.location || "",
        sharePath: "/live?play=live",
      };
    } else if (live.recording?.audioUrl) {
      track = {
        id: "live-recording", title: live.recording.title || "সর্বশেষ বয়ান", thumbnail: "",
        duration: live.recording.durationSeconds || 0,
        channelName: live.recording.speaker || "ইসলাহ", videoId: "",
        audioUrl: live.recording.audioUrl, location: live.recording.location || "",
        sharePath: "/live?play=live-recording",
      };
    }
    if (track) playTrack(track, [track], 0);
  }, [live, isLiveTrackActive, isPlaying, setIsPlaying, playTrack]);

  const moreActive = MORE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const liveReady = !!live && (live.isLive || !!live.recording?.audioUrl);
  const isHome = path === "/";

  const circleBtn =
    "p-2.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-amber-100/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition active:scale-95";

  const tabCls = (active: boolean) => `nav-tab${active ? " nav-tab-active" : ""}`;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md border-x border-slate-200 lg:max-w-5xl dark:border-slate-800/50">
      <header className="app-header px-4 pb-2 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md">
              <img src="/images/logo.png" alt="Islah" className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="block text-xl font-bold leading-none tracking-wide">islah</span>
              <span className="block text-[11px] font-medium text-ink-faint">দ্বীনি জীবনের সাথী</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={openIslahBDApp}
              aria-label="Open IslahBD app"
              title="অ্যাপ খুলুন"
              className="prayer-gold flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap !rounded-full px-3 text-xs font-bold text-white shadow-md"
            >
              <Icon name="external" size={14} strokeWidth={2.2} />
              অ্যাপ খুলুন
            </button>
            <Link href="/notifications" aria-label="notifications" className={`${circleBtn} relative`}>
              <Icon name="bell" size={16} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
                  {unread > 9 ? "৯+" : bnNum(unread)}
                </span>
              )}
            </Link>
          </div>
        </div>
        {/* Honorific sub-header — home only */}
        {isHome && (
          <Link href="/paribar" className="scholar-banner block transition hover:brightness-[1.02] active:scale-[0.99]">
            <p className="mx-auto max-w-sm text-[12px] font-medium leading-relaxed text-ink-soft">
              তারজুমান-এ-আকাবির আরিফ বিল্লাহ হযরত মাওলানা শাহ আব্দুল মতিন বিন
              হুসাইন সাহেব-এর খলিফা হযরত মাওলানা
            </p>
            <h1 className="gold-text mt-1 text-[28px] font-extrabold leading-tight tracking-wide">
              তৈয়্যেব আশরাফ সাহেব
            </h1>
          </Link>
        )}
      </header>

      <main className="px-3 pb-28 sm:px-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 lg:max-w-5xl" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <div className="bottom-nav flex items-center justify-between rounded-full px-4 py-2.5 backdrop-blur-lg">
          <Link href="/" className={tabCls(path === "/")}>
            <Icon name="home" size={20} />
            <span className="text-[10px]">হোম</span>
          </Link>
          <button
            onClick={handleLive}
            disabled={!liveReady}
            aria-label="লাইভ"
            className={`${tabCls(isLiveTrackActive)} relative disabled:opacity-40`}
          >
            <span className="relative">
              {live?.isLive ? (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-red-600 opacity-60" />
                  <Icon name="radio" size={20} />
                </span>
              ) : (
                <Icon name="radio" size={20} />
              )}
            </span>
            <span className="text-[10px]">লাইভ</span>
          </button>
          <Link href="/boyan" className={tabCls(path === "/boyan")}>
            <Icon name="mic" size={20} />
            <span className="text-[10px]">বয়ান</span>
          </Link>
          <Link href="/paribar" className={tabCls(path === "/paribar" || path.startsWith("/paribar/"))}>
            <Icon name="heart" size={20} />
            <span className="text-[10px]">পরিবার</span>
          </Link>
          <Link href="/others" className={tabCls(moreActive)}>
            <Icon name="grid" size={20} />
            <span className="text-[10px]">অন্যান্য</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
