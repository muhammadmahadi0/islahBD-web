"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./icons";
import { openIslahBDApp } from "../lib/open-app";
import { usePlayerStore, type Track } from "../store/player-store";
import { LIVE_POLL_MS, type LiveStatus } from "../lib/live";

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
      };
    } else if (live.recording?.audioUrl) {
      track = {
        id: "live-recording", title: live.recording.title || "সর্বশেষ বয়ান", thumbnail: "",
        duration: live.recording.durationSeconds || 0,
        channelName: live.recording.speaker || "ইসলাহ", videoId: "",
        audioUrl: live.recording.audioUrl, location: live.recording.location || "",
      };
    }
    if (track) playTrack(track, [track], 0);
  }, [live, isLiveTrackActive, isPlaying, setIsPlaying, playTrack]);

  const moreActive = MORE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const liveReady = !!live && (live.isLive || !!live.recording?.audioUrl);

  const tabCls = (active: boolean) =>
    `flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-bold transition-all active:scale-95 ${
      active ? "bg-primary-600 text-white shadow-card" : "text-ink-faint hover:bg-primary-50 hover:text-primary-700"
    }`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
      <header className="app-header sticky top-0 z-40 border-b border-white/10 bg-gradient-to-l from-primary-800 via-primary-700 to-primary-800 text-white shadow-lift">
        <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-card">
            <img src="/images/logo.png" alt="Islah" className="h-full w-full object-cover" />
          </Link>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[17px] font-bold tracking-tight">ইসলাহ</div>
            <div className="text-[11px] font-medium text-white/70">দ্বীন জীবনের সঙ্গী</div>
          </div>
          {/* Top app-open button — beta #islahbd-btn: opens the installed
              IslahBD app, otherwise the right store for the device. */}
          <button
            onClick={openIslahBDApp}
            aria-label="Open IslahBD app"
            title="Open IslahBD app"
            className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-br from-[#cba135] via-[#e8c96c] to-[#a07e28] px-3 text-xs font-bold text-[#1a1405] shadow-card transition-all hover:brightness-105 active:scale-95 sm:px-4 sm:text-[13px]"
          >
            <Icon name="external" size={15} strokeWidth={2.2} />
            অ্যাপ খুলুন
          </button>
          <Link
            href="/notifications"
            aria-label="notifications"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <Icon name="bell" size={20} />
          </Link>
          <Link
            href="/settings"
            aria-label="settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <Icon name="gear" size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-3 pb-28 pt-4 sm:px-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5">
        <div className="bottom-nav mx-auto grid max-w-5xl grid-cols-5 gap-1 rounded-3xl border border-primary-900/10 bg-white/90 p-1.5 shadow-lift backdrop-blur-xl">
          {/* Home */}
          <Link href="/" className={tabCls(path === "/")}>
            <Icon name="home" size={21} />
            হোম
          </Link>
          {/* Live — plays the broadcast / last recording straight from the bar */}
          <button
            onClick={handleLive}
            disabled={!liveReady}
            aria-label="লাইভ"
            className={`${tabCls(isLiveTrackActive)} relative disabled:opacity-40`}
          >
            <span className="relative">
              {live?.isLive ? (
                <span className="relative flex h-[21px] w-[21px] items-center justify-center">
                  <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-red-500 opacity-60" />
                  <Icon name="radio" size={20} className={isLiveTrackActive ? "" : "text-red-500"} />
                </span>
              ) : (
                <Icon name="radio" size={21} />
              )}
            </span>
            লাইভ
          </button>
          {/* Boyan */}
          <Link href="/boyan" className={tabCls(path === "/boyan")}>
            <Icon name="mic" size={21} />
            বয়ান
          </Link>
          {/* Family */}
          <Link href="/paribar" className={tabCls(path === "/paribar" || path.startsWith("/paribar/"))}>
            <Icon name="heart" size={21} />
            পরিবার
          </Link>
          {/* More */}
          <Link href="/others" className={tabCls(moreActive)}>
            <Icon name="grid" size={21} />
            আরও
          </Link>
        </div>
      </nav>
    </div>
  );
}
