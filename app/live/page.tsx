"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { usePlayerStore, type Track } from "../../store/player-store";
import { LIVE_POLL_MS, type LiveStatus } from "../../lib/live";
import { bnNum } from "../../lib/audio";
import { useLang, useNum, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

// Live broadcast — beta live behavior: status polling, in-app HLS playback
// with recording fallback (handled by AudioPlayer), listener count.
function liveToTrack(live: LiveStatus, lang: "bn" | "ur" | "en"): Track | null {
  const fallbackLive = lang === "bn" ? "সরাসরি বয়ান" : lang === "ur" ? "براہ راست بیان" : "Live bayan";
  const fallbackRec = lang === "bn" ? "সর্বশেষ বয়ান" : lang === "ur" ? "تازہ ترین بیان" : "Latest bayan";
  if (live.isLive && live.streamUrl) {
    return {
      id: "live",
      title: live.title || fallbackLive,
      thumbnail: "",
      duration: 0,
      channelName: [live.speaker, live.location].filter(Boolean).join(" • "),
      videoId: "",
      hlsUrl: live.streamUrl,
      audioUrl: live.streamUrl,
      isLive: true,
      location: live.location,
      sharePath: "/live?play=live",
    };
  }
  const rec = live.recording;
  if (rec?.audioUrl) {
    return {
      id: `live-recording`,
      title: rec.title || fallbackRec,
      thumbnail: "",
      duration: rec.durationSeconds || 0,
      channelName: [rec.speaker, rec.location].filter(Boolean).join(" • "),
      videoId: "",
      audioUrl: rec.audioUrl,
      location: rec.location,
      sharePath: "/live?play=live-recording",
    };
  }
  return null;
}

export default function LivePage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/live");
      const data = await res.json();
      if (data.success) setLive(data.live);
    } catch {
      // keep last known status
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), LIVE_POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const liveL = useLocalizedData(live, lang);
  const isLive = !!liveL?.isLive;
  const playingLive = currentTrack?.id === "live" || currentTrack?.id === "live-recording";

  const playLive = () => {
    if (!liveL) return;
    // Tapping while this broadcast plays toggles pause — otherwise start it.
    if (playingLive) {
      setIsPlaying(!isPlaying);
      return;
    }
    const track = liveToTrack(liveL, lang);
    if (track) playTrack(track);
  };

  // Shared link (/live?play=live) auto-plays the broadcast/recording once.
  const autoPlayed = useRef(false);
  useEffect(() => {
    if (autoPlayed.current || !liveL) return;
    const shared = new URLSearchParams(window.location.search).get("play");
    if (shared !== "live" && shared !== "live-recording") return;
    const track = liveToTrack(liveL, lang);
    if (!track) return;
    autoPlayed.current = true;
    playTrack(track);
  }, [liveL, playTrack]);

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("লাইভ")}
        subtitle={tx("সরাসরি বয়ান ও হারামাইন")}
        icon="radio"
        action={
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isLive ? "bg-red-500 text-white" : "bg-white/15 text-white"}`}>
            <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulsedot bg-white" : "bg-white/50"}`} />
            {isLive ? tx("লাইভ চলছে") : tx("অফলাইন")}
          </span>
        }
      />

      {loading && !liveL ? (
        <div className="card mt-3 animate-pulse p-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-sand-dark" />
          <div className="mx-auto mt-3 h-4 w-2/3 rounded-full bg-sand-dark" />
        </div>
      ) : !liveL ? (
        <div className="mt-3"><EmptyState icon="radio" title={tx("লাইভ তথ্য পাওয়া যাচ্ছে না")} /></div>
      ) : (
        <div className="card mt-3 overflow-hidden">
          <div className="page-hero !rounded-none p-6 text-center text-white">
            {isLive && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(248,113,113,0.32),transparent_68%)]"
              />
            )}
            <div className="relative z-10">
              {isLive ? (
                <span className="live-orb mx-auto" aria-hidden="true">
                  <span className="live-orb-ring" />
                  <span className="live-orb-ring" />
                  <span className="live-orb-core" />
                </span>
              ) : (
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                  <Icon name="radio" size={30} />
                </span>
              )}
              <h2 className="mt-3 text-xl font-bold leading-snug">
                {liveL.title || (isLive ? tx("সরাসরি বয়ান চলছে") : tx("সর্বশেষ বয়ান"))}
              </h2>
              {(liveL.speaker || liveL.location) && (
                <p className="mt-1 text-sm text-white/80">
                  {[liveL.speaker, liveL.location].filter(Boolean).join(" • ")}
                </p>
              )}
              {isLive && liveL.listeners > 0 && (
                <p className="mt-1 text-xs font-bold tabular-nums text-white/80">
                  {num(liveL.listeners)}{tx("জন শুনছেন")}
                </p>
              )}
              <button
                onClick={playLive}
                className="btn-white mx-auto mt-4 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow-lift transition hover:scale-105 active:scale-95"
              >
                {playingLive && isPlaying ? (
                  <><Icon name="pause" size={17} /> {tx("থামান")}</>
                ) : (
                  <><Icon name="playfill" size={17} /> {isLive ? tx("লাইভ শুনুন") : tx("রেকর্ডিং শুনুন")}</>
                )}
              </button>
              {!isLive && liveL.recording && (
                <p className="mt-2 text-[11px] text-white/70">{tx("এখন লাইভ বন্ধ — সর্বশেষ রেকর্ডিং বাজবে")}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            <Link2 href="https://www.youtube.com/@islahbd" icon="play" label={tx("YouTube চ্যানেল")} />
            <Link2 href="/boyan" icon="mic" label={tx("অডিও বয়ান")} internal />
          </div>
        </div>
      )}

      <div className="card mt-2 p-4">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile bg-primary-50 text-primary-600">
            <Icon name="kaaba" size={24} />
          </span>
          <div>
            <div className="font-bold">{tx("মক্কা ও মদিনা লাইভ")}</div>
            <div className="text-xs text-ink-faint">{tx("হারামাইন সরাসরি (YouTube)")}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="https://www.youtube.com/results?search_query=makkah+live" target="_blank" rel="noreferrer" className="btn-outline !py-2 text-[13px]">{tx("মক্কা")}</a>
          <a href="https://www.youtube.com/results?search_query=madinah+live" target="_blank" rel="noreferrer" className="btn-outline !py-2 text-[13px]">{tx("মদিনা")}</a>
        </div>
      </div>

      <div className="card mt-2 p-4">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile bg-amber-50 text-gold-600">
            <Icon name="bell" size={22} />
          </span>
          <div className="flex-1">
            <div className="font-bold">{tx("বয়ান রিমাইন্ডার")}</div>
            <div className="text-xs text-ink-faint">{tx("লাইভ শুরু হলে জানুন")}</div>
          </div>
        </div>
        <button className="btn-gold mt-3 w-full" onClick={() => (Notification as any)?.requestPermission?.()}>
          <Icon name="bell" size={16} /> {tx("রিমাইন্ডার অন করুন")}
        </button>
      </div>
    </div>
  );
}

function Link2({ href, icon, label, internal = false }: { href: string; icon: string; label: string; internal?: boolean }) {
  const cls = "btn-ghost flex items-center justify-center gap-1.5 !py-2.5 text-[13px]";
  if (internal) {
    return <Link href={href} className={cls}><Icon name={icon} size={15} /> {label}</Link>;
  }
  return <a href={href} target="_blank" rel="noreferrer" className={cls}><Icon name={icon} size={15} /> {label}</a>;
}
