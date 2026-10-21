"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { usePlayerStore } from "../../store/player-store";
import { Icon } from "../icons";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import {
  loadYouTubeAPI,
  setEnginePlayer,
  setVideoMode,
  subscribeEngine,
  getEngineSnapshot,
  SEEK_EVENT,
} from "../../lib/yt-engine";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "০:০০";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const bn = (n: number) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
  return `${bn(mins)}:${bn(secs).padStart(2, "০")}`;
}

function EqBars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex h-4 items-end gap-[3px] text-primary-600 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="eq-bar h-full" style={{ animationDelay: `${i * 0.22}s` }} />
      ))}
    </span>
  );
}

/**
 * Full player — ported from beta MiniPlayer, restyled to the app theme.
 * - YouTube tracks play through a persistent YT embed (audio-first 144p,
 *   opt-in video mode in the same player, autoplay watchdog).
 * - Stream tracks (MP3/HLS/live) are owned by AudioPlayer; this UI only
 *   mirrors the shared store.
 * - Expanded sheet: seek, queue, download, share, stop.
 * - Collapsed pill floats above the bottom nav.
 */
export default function MiniPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playlist,
    playlistIndex,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    playTrack,
    playNext,
    playPrevious,
    stop,
  } = usePlayerStore();

  const engine = useSyncExternalStore(
    subscribeEngine,
    getEngineSnapshot,
    () => ({ mode: "audio" as const, ready: false })
  );

  const touchStartY = useRef<number>(0);
  const touchDeltaY = useRef<number>(0);

  const ytMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const readyRef = useRef(false);
  const trackIdRef = useRef<string | null>(null);
  const apiFailedRef = useRef(false);

  const storeRef = useRef({ setCurrentTime, setDuration, setIsPlaying, setIsLoading, playNext });
  storeRef.current = { setCurrentTime, setDuration, setIsPlaying, setIsLoading, playNext };
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  // Play watchdog: autoplay without a prior user gesture gets blocked by
  // the browser — reconcile with ACTUAL player state so one tap resumes.
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };
  const armWatchdog = () => {
    clearWatchdog();
    // 5s: long enough for buffering to start, short enough that a
    // blocked first-tap reconciles before the user gives up and taps again.
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null;
      try {
        const player = playerRef.current;
        const state = player?.getPlayerState?.();
        const YTNS = (window as any).YT?.PlayerState;
        if (state === YTNS?.PLAYING || state === YTNS?.BUFFERING) return;
        const s = storeRef.current;
        s.setIsLoading(false);
        s.setIsPlaying(false);
      } catch {
        storeRef.current.setIsLoading(false);
      }
    }, 5000);
  };

  const isYtTrack =
    !!currentTrack && !!currentTrack.videoId && !currentTrack.hlsUrl && !currentTrack.audioUrl;
  const showVideo = isExpanded && isYtTrack && engine.mode === "video";

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaY.current < -50) setIsExpanded(true);
    else if (touchDeltaY.current > 50 && isExpanded) setIsExpanded(false);
    touchDeltaY.current = 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    window.dispatchEvent(new CustomEvent(SEEK_EVENT, { detail: time }));
    setCurrentTime(time);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Create the YT player in the persistent mount node.
  // IMPORTANT: YT.Player REPLACES the mount div with an <iframe>. The mount
  // div's own className must NEVER change afterwards — visibility toggles on
  // the PARENT wrapper, which stays under React control.
  const createPlayer = (YT: any) => {
    if (!ytMountRef.current || playerRef.current) return;

    playerRef.current = new YT.Player(ytMountRef.current, {
      height: "100%",
      width: "100%",
      host: "https://www.youtube-nocookie.com",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: (e: any) => {
          readyRef.current = true;
          setEnginePlayer(playerRef.current);
          e.target.setVolume(Math.round(usePlayerStore.getState().volume * 100));
          const track = usePlayerStore.getState().currentTrack;
          if (track?.videoId && !track.hlsUrl && !track.audioUrl) {
            trackIdRef.current = track.videoId;
            storeRef.current.setIsLoading(true);
            const audioFirst = getEngineSnapshot().mode !== "video";
            try {
              if (playingRef.current) {
                try {
                  e.target.loadVideoById({
                    videoId: track.videoId,
                    startSeconds: 0,
                    suggestedQuality: audioFirst ? "tiny" : "default",
                  });
                } catch {
                  e.target.loadVideoById(track.videoId);
                }
                armWatchdog();
              } else e.target.cueVideoById(track.videoId);
            } catch {
              clearWatchdog();
              storeRef.current.setIsLoading(false);
            }
          }
        },
        onStateChange: (e: any) => {
          const YTNS = (window as any).YT?.PlayerState;
          const s = storeRef.current;
          switch (e.data) {
            case YTNS?.PLAYING:
              clearWatchdog();
              s.setIsPlaying(true);
              s.setIsLoading(false);
              break;
            case YTNS?.PAUSED:
              s.setIsPlaying(false);
              break;
            case YTNS?.BUFFERING:
              s.setIsLoading(true);
              break;
            case YTNS?.UNSTARTED:
              s.setIsLoading(false);
              break;
            case YTNS?.CUED:
              clearWatchdog();
              s.setIsLoading(false);
              if (playingRef.current) {
                try {
                  e.target.playVideo();
                } catch {
                  // Blocked autoplay — watchdog reconciles to paused.
                }
                armWatchdog();
              }
              break;
            case YTNS?.ENDED:
              s.setIsPlaying(false);
              if (usePlayerStore.getState().currentTrack) s.playNext();
              break;
          }
        },
        onError: () => {
          // Unplayable video: skip to next track.
          storeRef.current.setIsLoading(false);
          storeRef.current.playNext();
        },
      },
    });
  };

  // Prewarm the YT iframe API on idle — never on the critical path.
  useEffect(() => {
    let idleId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const prewarm = () => {
      if (playerRef.current) return;
      loadYouTubeAPI().catch(() => {});
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(prewarm, { timeout: 8000 });
    } else {
      timer = setTimeout(prewarm, 4000);
    }
    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
      clearWatchdog();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load / cue YT tracks; pause the embed for anything else
  useEffect(() => {
    const track = currentTrack;

    if (!track || track.hlsUrl || track.audioUrl || !track.videoId) {
      trackIdRef.current = null;
      setVideoMode("audio");
      const p = playerRef.current;
      if (p && readyRef.current) {
        try {
          const iframe = p.getIframe?.();
          if (!iframe || iframe.isConnected) p.pauseVideo();
        } catch {
          // player may be tearing down
        }
      }
      return;
    }

    if (trackIdRef.current === track.videoId) return;
    trackIdRef.current = track.videoId;

    setIsLoading(true);
    setCurrentTime(0);
    setDuration(track.duration || 0);

    if (!playerRef.current) {
      if (apiFailedRef.current) {
        setIsLoading(false);
      } else if (ytMountRef.current && (window as any).YT?.Player) {
        createPlayer((window as any).YT);
      } else if (ytMountRef.current) {
        loadYouTubeAPI()
          .then((YT) => createPlayer(YT))
          .catch(() => {
            apiFailedRef.current = true;
            storeRef.current.setIsLoading(false);
          });
      }
      return; // onReady loads the current track
    }

    const player = playerRef.current;
    if (player && readyRef.current) {
      let detached = false;
      try {
        const iframe = player.getIframe?.();
        detached = !!iframe && !iframe.isConnected;
      } catch {
        detached = true;
      }
      if (detached && ytMountRef.current && (window as any).YT?.Player) {
        try {
          player.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
        readyRef.current = false;
        setEnginePlayer(null);
        createPlayer((window as any).YT);
        return; // onReady loads the current track
      }
      try {
        if (playingRef.current) {
          const audioFirst = getEngineSnapshot().mode !== "video";
          try {
            player.loadVideoById({
              videoId: track.videoId,
              startSeconds: 0,
              suggestedQuality: audioFirst ? "tiny" : "default",
            });
          } catch {
            player.loadVideoById(track.videoId);
          }
          armWatchdog();
        } else player.cueVideoById(track.videoId);
      } catch {
        clearWatchdog();
        setIsLoading(false);
      }
    } else if (apiFailedRef.current) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.videoId, currentTrack?.hlsUrl, currentTrack?.audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play / pause for YT tracks
  useEffect(() => {
    const track = currentTrack;
    if (!track || track.hlsUrl || track.audioUrl || !track.videoId) return;
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    try {
      const iframe = player.getIframe?.();
      if (iframe && !iframe.isConnected) return;
      if (isPlaying) player.playVideo();
      else player.pauseVideo();
    } catch {
      // ignore
    }
  }, [isPlaying, currentTrack]);

  // Volume for the YT embed
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    try {
      const iframe = player.getIframe?.();
      if (iframe && !iframe.isConnected) return;
      player.setVolume(Math.round(volume * 100));
    } catch {
      // ignore
    }
  }, [volume]);

  // Collapsing returns to audio-only and closes the queue.
  useEffect(() => {
    if (!isExpanded) {
      setVideoMode("audio");
      setQueueOpen(false);
    }
  }, [isExpanded]);

  // Seek + progress polling for YT tracks
  useEffect(() => {
    const onSeek = (e: Event) => {
      const time = (e as CustomEvent<number>).detail;
      if (typeof time !== "number" || isNaN(time)) return;
      const track = usePlayerStore.getState().currentTrack;
      if (!track || track.hlsUrl || track.audioUrl || !track.videoId) return;
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      try {
        player.seekTo(time, true);
        storeRef.current.setCurrentTime(time);
      } catch {
        // ignore
      }
    };

    window.addEventListener(SEEK_EVENT, onSeek as EventListener);

    const id = setInterval(() => {
      const track = usePlayerStore.getState().currentTrack;
      if (!track || track.hlsUrl || track.audioUrl || !track.videoId) return;
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      try {
        if (typeof player.getCurrentTime === "function") {
          storeRef.current.setCurrentTime(player.getCurrentTime() || 0);
        }
        if (typeof player.getDuration === "function") {
          const d = player.getDuration() || 0;
          if (d > 0) storeRef.current.setDuration(d);
        }
      } catch {
        // ignore transient errors during track switches
      }
    }, 500);

    return () => {
      window.removeEventListener(SEEK_EVENT, onSeek as EventListener);
      clearInterval(id);
    };
  }, []);

  // Queue auto-scroll refs (above early return — hook order must not change)
  const queueScrollRef = useRef<HTMLDivElement>(null);
  const queueActiveRef = useRef<HTMLButtonElement>(null);

  const scrollQueueToActive = (smooth: boolean) => {
    const row = queueActiveRef.current;
    const box = queueScrollRef.current;
    if (!row || !box) return;
    const top = row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (queueOpen) {
      const id = requestAnimationFrame(() => scrollQueueToActive(false));
      return () => cancelAnimationFrame(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueOpen]);

  useEffect(() => {
    if (queueOpen) scrollQueueToActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueOpen, playlistIndex, currentTrack?.videoId]);

  const hasTrack = !!currentTrack;
  const isLive = !!currentTrack?.isLive;
  const queueTotal = playlist.length;
  const queuePos = playlistIndex >= 0 ? playlistIndex + 1 : null;

  useEffect(() => {
    if (!currentTrack) {
      setIsExpanded(false);
      setQueueOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Video toggle: audio ⇄ video in the SAME player — never reloads.
  const toggleVideo = () => {
    const player = playerRef.current;
    if (!player || !readyRef.current || !isYtTrack) return;
    let detached = false;
    try {
      const iframe = player.getIframe?.();
      detached = !!iframe && !iframe.isConnected;
    } catch {
      detached = true;
    }
    if (detached) return;
    let pos = 0;
    try {
      pos = player.getCurrentTime?.() || currentTime || 0;
    } catch {
      pos = currentTime || 0;
    }
    const toVideo = engine.mode !== "video";
    try {
      if (toVideo) {
        setVideoMode("video");
        try {
          player.setPlaybackQuality?.("default");
        } catch {
          // quality adapts on its own
        }
        if (usePlayerStore.getState().isPlaying) {
          try {
            player.playVideo?.();
          } catch {
            // already playing
          }
        }
      } else {
        setVideoMode("audio");
        if (pos > 1) {
          try {
            player.seekTo?.(pos, true);
          } catch {
            // already at position
          }
        }
      }
    } catch {
      // ignore
    }
  };

  // Download: only direct MP3 tracks. YouTube embeds and live HLS have no
  // single file — button hides for those.
  const [downloading, setDownloading] = useState(false);
  const downloadableUrl =
    currentTrack?.audioUrl && !/\.m3u8(\?|$)|\/live(\?|$)/i.test(currentTrack.audioUrl)
      ? currentTrack.audioUrl
      : null;

  const handleDownload = async () => {
    if (!downloadableUrl || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(downloadableUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const safe =
        (currentTrack?.title || "recording").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80) ||
        "recording";
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${safe}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
    } catch {
      window.open(downloadableUrl, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  const shareTrack = () => {
    const url = currentTrack?.sharePath
      ? `${location.origin}${currentTrack.sharePath}`
      : isYtTrack
        ? `https://www.youtube.com/watch?v=${currentTrack?.videoId}`
        : location.href;
    const text = currentTrack?.title || "";
    if (navigator.share) navigator.share({ title: text, text, url }).catch(() => {});
    else navigator.clipboard?.writeText(`${text}\n${url}`);
  };

  const playQueueTrack = (track: (typeof playlist)[number], index: number) => {
    if (index === playlistIndex) setIsPlaying(!isPlaying);
    else playTrack(track, playlist, index);
  };

  return (
    <>
      {/* ---------------- Expanded sheet ---------------- */}
      {/* Kept mounted (visibility-gated) so the video node never unmounts */}
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm transition-opacity sm:items-center ${
          (!hasTrack || !isExpanded) && "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!hasTrack || !isExpanded}
      >
        <div className="card flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden p-4" style={{ maxHeight: "92dvh" }}>
          {/* top bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="btn-ghost !rounded-2xl !p-2.5"
              aria-label="সংকুচিত করুন"
            >
              <Icon name="back" size={18} className="rotate-[-90deg]" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                এখন বাজছে
              </p>
              {queueTotal > 1 && queuePos !== null && (
                <p className="text-[11px] font-bold tabular-nums text-ink-faint">
                  {queuePos} / {queueTotal}
                </p>
              )}
            </div>
            <button
              onClick={() => { setIsExpanded(false); stop(); }}
              className="rounded-2xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100 active:scale-95"
              aria-label="বন্ধ করুন"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* video frame / artwork */}
          <div className="relative mt-3 overflow-hidden rounded-3xl bg-ink">
            <div className={`aspect-video w-full ${!showVideo && "hidden"}`}>
              <div ref={ytMountRef} className="h-full w-full" />
            </div>
            {!showVideo &&
              (currentTrack?.thumbnail ? (
                <img src={currentTrack.thumbnail} alt={currentTrack.title || ""} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                  <Icon name="music" size={52} className="text-gold-100" strokeWidth={1.3} />
                </div>
              ))}
            {isLive && (
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                লাইভ
              </span>
            )}
            {isYtTrack && (
              <button
                onClick={toggleVideo}
                disabled={!engine.ready}
                className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 disabled:opacity-40"
                aria-label={engine.mode === "video" ? "শুধু অডিও" : "ভিডিও দেখুন"}
              >
                <Icon name={engine.mode === "video" ? "music" : "play"} size={17} />
              </button>
            )}
          </div>

          {/* title */}
          <h2 className="mt-3 truncate text-center text-[17px] font-bold leading-snug">
            {currentTrack?.title || ""}
          </h2>
          {(currentTrack?.channelName || currentTrack?.location) && (
            <p className="truncate text-center text-[13px] text-ink-faint">
              {[currentTrack?.channelName, currentTrack?.location].filter(Boolean).join(" • ")}
            </p>
          )}

          {/* seek */}
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={isLive}
              className={`w-full ${isLive ? "opacity-40" : ""}`}
              aria-label="seek"
            />
            <div className="flex justify-between text-[11px] font-bold tabular-nums text-ink-faint">
              <span>{isLive ? "লাইভ" : formatTime(currentTime)}</span>
              <span>{isLive ? "" : formatTime(duration)}</span>
            </div>
          </div>

          {/* transport */}
          <div className="mt-1 flex items-center justify-center gap-5">
            <button onClick={playPrevious} className="btn-ghost !rounded-full !p-3" aria-label="আগেরটি">
              <Icon name="prev" size={20} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary !rounded-full !p-4"
              aria-label={isPlaying ? "থামান" : "চালান"}
            >
              {isLoading ? (
                <span className="block h-[22px] w-[22px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Icon name={isPlaying ? "pause" : "playfill"} size={22} />
              )}
            </button>
            <button onClick={playNext} className="btn-ghost !rounded-full !p-3" aria-label="পরেরটি">
              <Icon name="next" size={20} />
            </button>
          </div>

          {/* secondary row */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {downloadableUrl && (
              <button onClick={handleDownload} className="btn-ghost !rounded-xl !p-2.5" aria-label="ডাউনলোড">
                {downloading ? (
                  <span className="block h-[17px] w-[17px] animate-spin rounded-full border-2 border-primary-600/40 border-t-primary-600" />
                ) : (
                  <Icon name="download" size={17} />
                )}
              </button>
            )}
            <button onClick={shareTrack} className="btn-ghost !rounded-xl !p-2.5" aria-label="শেয়ার">
              <Icon name="share" size={17} />
            </button>
            <button onClick={() => setMenuOpen(true)} className="btn-ghost !rounded-xl !p-2.5" aria-label="প্লেলিস্ট">
              <Icon name="plus" size={17} />
            </button>
          </div>

          {/* queue */}
          <button
            onClick={() => setQueueOpen((v) => !v)}
            aria-expanded={queueOpen}
            className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-sand px-4 py-2.5 text-sm font-bold"
          >
            <Icon name="music" size={17} className="text-primary-600" />
            <span>পরবর্তী</span>
            {queueTotal > 0 && <span className="tabular-nums text-ink-faint">({queueTotal})</span>}
            <span className="flex-1" />
            <Icon name="chevron" size={16} className={`text-ink-faint transition-transform ${queueOpen ? "rotate-90" : ""}`} />
          </button>
          {queueOpen && (
            <div ref={queueScrollRef} className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-primary-900/10">
              {playlist.length === 0 ? (
                <p className="px-3 py-5 text-center text-[13px] text-ink-faint">সারি খালি</p>
              ) : (
                playlist.map((t, i) => {
                  const active = i === playlistIndex;
                  return (
                    <button
                      key={`${t.id}-${i}`}
                      ref={active ? queueActiveRef : undefined}
                      onClick={() => playQueueTrack(t, i)}
                      className={`flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors ${active ? "bg-primary-50" : "hover:bg-sand/70"}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
                        {t.thumbnail ? (
                          <img src={t.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <Icon name="music" size={15} className="text-primary-600" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] font-bold ${active ? "text-primary-700" : ""}`}>{t.title}</span>
                        <span className="block truncate text-[11px] text-ink-faint">{t.channelName}</span>
                      </span>
                      {active && isPlaying ? (
                        <EqBars />
                      ) : (
                        <span className="shrink-0 text-[11px] font-bold tabular-nums text-ink-faint">{formatTime(t.duration)}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Mini pill ---------------- */}
      <div
        className={`fixed inset-x-0 bottom-[86px] z-40 px-3 sm:px-5 ${(!hasTrack || isExpanded) && "invisible pointer-events-none opacity-0"}`}
        aria-hidden={!hasTrack || isExpanded}
      >
        <div
          onClick={() => setIsExpanded(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="card mx-auto max-w-md cursor-pointer overflow-hidden !rounded-3xl transition-all active:scale-[0.99]"
        >
          <div className="h-1 bg-primary-50">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-gold transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-3 p-2.5">
            <span className="icon-tile !h-11 !w-11 shrink-0 overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100">
              {currentTrack?.thumbnail ? (
                <img src={currentTrack.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon name="music" size={20} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold leading-snug">
                {isLive && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-widest text-white">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                    লাইভ
                  </span>
                )}
                <span className="truncate">{currentTrack?.title || ""}</span>
              </p>
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] text-ink-faint">{currentTrack?.channelName || ""}</p>
                {isPlaying && <EqBars />}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              className="btn-primary shrink-0 !rounded-2xl !p-2.5"
              aria-label={isPlaying ? "থামান" : "চালান"}
            >
              {isLoading ? (
                <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Icon name={isPlaying ? "pause" : "playfill"} size={18} />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); stop(); }}
              className="shrink-0 rounded-xl p-2 text-ink-faint transition hover:bg-sand"
              aria-label="বন্ধ করুন"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && currentTrack && (
        <AddToPlaylistMenu
          track={currentTrack}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
