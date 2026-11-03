"use client";
import { useEffect, useRef } from "react";
import type Hls from "hls.js";
import { usePlayerStore } from "../../store/player-store";
import { SEEK_EVENT } from "../../lib/yt-engine";
import { tryPlay } from "../../lib/storage";

function looksLikeHls(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url) || /\/live(\?|$)/i.test(url);
}

// One pending gesture-retry at a time: if a programmatic play() is
// rejected (stale gesture after async engine load), the user's next tap
// or keypress anywhere carries a fresh gesture — retry there.
let kickArmed = false;
function retryOnNextGesture(audio: HTMLAudioElement | null) {
  if (!audio || kickArmed) return;
  kickArmed = true;
  const kick = () => {
    kickArmed = false;
    try {
      const p = audio.play();
      if (p) p.catch(() => {});
    } catch {
      // still blocked — the next tap will arm a fresh retry
      kickArmed = false;
    }
  };
  window.addEventListener("pointerdown", kick, { once: true });
  window.addEventListener("keydown", kick, { once: true });
  // Don't hold the slot forever if the user walks away.
  setTimeout(() => { kickArmed = false; }, 30000);
}

/**
 * Stream playback engine — ported from beta (src/components/AudioPlayer.tsx).
 * `<audio>` + hls.js for live HLS + recordings (tracks carrying
 * `hlsUrl`/`audioUrl`). YouTube lecture tracks are owned by the YT engine
 * in MiniPlayer — this component only makes sure the stream engine is
 * stopped when such a track plays.
 */
export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const proxyTriedRef = useRef(false);
  const streamUrlRef = useRef<string | null>(null);

  // Live-stream watchdog. hls.js can sit on a stale playlist (encoder
  // restart, CDN hiccup, backgrounded tab) without ever raising a fatal
  // error — the element simply stops advancing and the user hears silence.
  // These refs let the watchdog notice and walk a recovery ladder.
  const lastProgressRef = useRef({ time: -1, at: 0 });
  const recoverStepRef = useRef(0);
  const loadStreamRef = useRef<(url: string, autoplay: boolean) => void>(() => {});
  const recoverLiveRef = useRef<() => void>(() => {});

  const {
    currentTrack,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    playNext,
  } = usePlayerStore();

  // Keep latest callbacks in refs for event handlers
  const storeRef = useRef({ setCurrentTime, setDuration, setIsPlaying, setIsLoading, playNext });
  storeRef.current = { setCurrentTime, setDuration, setIsPlaying, setIsLoading, playNext };
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  const destroyHls = () => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {
        // ignore
      }
      hlsRef.current = null;
    }
  };

  const stopStream = () => {
    destroyHls();
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        // ignore
      }
    }
  };

  // hls.js is large — never bundle it. It loads on demand at first HLS
  // play, and is prefetched on browser idle below so that first live-tap
  // doesn't pay the full download before audio can start.
  const hlsModuleRef = useRef<typeof Hls | null>(null);
  const loadHlsModule = async (): Promise<typeof Hls | null> => {
    if (hlsModuleRef.current) return hlsModuleRef.current;
    try {
      const mod = await import("hls.js");
      hlsModuleRef.current = mod.default;
      return mod.default;
    } catch (err) {
      console.error("[AudioPlayer] hls.js load failed:", err);
      return null;
    }
  };

  // Prefetch hls.js once the browser is idle — skipped on data-saver or
  // very slow connections so we never spend a user's mobile data unasked.
  useEffect(() => {
    let idleId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const conn = navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      if (conn.connection?.saveData) return;
      const slow = conn.connection?.effectiveType;
      if (slow === "slow-2g" || slow === "2g") return;
    } catch {
      return;
    }
    const prefetch = () => {
      if (!hlsModuleRef.current) void loadHlsModule();
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(prefetch, { timeout: 10000 });
    } else {
      timer = setTimeout(prefetch, 6000);
    }
    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStream = async (url: string, autoplay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    destroyHls();
    proxyTriedRef.current = false;
    streamUrlRef.current = url;
    // Fresh source — restart the stall clock.
    lastProgressRef.current = { time: -1, at: Date.now() };

    const startPlayback = () => {
      if (autoplay) {
        // Legacy WebKit returns undefined instead of a Promise — tryPlay
        // never throws; only real rejections arm the gesture retry.
        const p = tryPlay(audio);
        if (p) {
          p.catch(() => {
            // First-tap rejection (no usable gesture by the time the async
            // engine finished loading): keep the intent and retry on the
            // user's NEXT interaction anywhere — that tap carries a fresh
            // gesture, so playback starts instead of needing a replay tap.
            retryOnNextGesture(audio);
            storeRef.current.setIsLoading(false);
          });
        }
      } else {
        storeRef.current.setIsLoading(false);
      }
    };

    if (!looksLikeHls(url)) {
      // Progressive file (mp3) — no hls.js needed
      audio.src = url;
      audio.load();
      startPlayback();
      return;
    }

    // HLS: Safari plays natively (canPlayType check — no download);
    // everywhere else lazy-loads hls.js on first use.
    const wantedUrl = url;
    const nativeHls =
      typeof audio.canPlayType === "function" &&
      audio.canPlayType("application/vnd.apple.mpegurl") !== "";
    if (nativeHls) {
      audio.src = url;
      audio.load();
      startPlayback();
      return;
    }
    const HlsCtor = await loadHlsModule();
    if (!HlsCtor || streamUrlRef.current !== wantedUrl) return;
    if (!HlsCtor.isSupported()) {
      audio.src = url;
      audio.load();
      startPlayback();
      return;
    }
    {
      const hls = new HlsCtor({
        enableWorker: true,
        // Live tuning: stay close to the edge and ride out short CDN
        // hiccups instead of surfacing them as fatal errors.
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 6,
        fragLoadingMaxRetry: 8,
      });
      hlsRef.current = hls;
      hls.on(HlsCtor.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        // Direct CDN fetch failed (e.g. missing CORS) → retry via proxy
        if (
          data.type === HlsCtor.ErrorTypes.NETWORK_ERROR &&
          !proxyTriedRef.current &&
          !url.startsWith("/api/hls")
        ) {
          proxyTriedRef.current = true;
          try {
            hls.loadSource(`/api/hls/${encodeURIComponent(url)}`);
            return;
          } catch (err) {
            console.error("[AudioPlayer] proxy retry failed:", err);
          }
        }
        const track = usePlayerStore.getState().currentTrack;
        if (track?.isLive) {
          // Live: rebuild from a fresh manifest instead of silently swapping
          // in an old recording while the broadcast is still on air. The
          // stall watchdog keeps escalating if this attempt doesn't take.
          recoverStepRef.current = Math.max(recoverStepRef.current, 1);
          recoverLiveRef.current();
          return;
        }
        storeRef.current.setIsLoading(false);
      });
      hls.loadSource(url);
      hls.attachMedia(audio);
      startPlayback();
    }
  };

  loadStreamRef.current = (url, autoplay) => { void loadStream(url, autoplay); };

  /** Snap playback back to the live edge of the current buffer. */
  const jumpToLiveEdge = (audio: HTMLAudioElement) => {
    try {
      const ranges = audio.seekable;
      if (!ranges.length) return;
      const end = ranges.end(ranges.length - 1);
      if (Number.isFinite(end) && Math.abs(end - audio.currentTime) > 1) {
        audio.currentTime = Math.max(0, end - 0.5);
      }
    } catch {
      // not seekable yet — the next attempt will try again
    }
  };

  /**
   * Live recovery ladder. Step 1 nudges the existing hls.js pipeline and
   * jumps to the live edge; later steps rebuild from a fresh manifest (the
   * encoder may also have moved to a new URL). If the broadcast has actually
   * ended, the newest recording takes over instead of silence.
   */
  const recoverLive = async () => {
    const state = usePlayerStore.getState();
    const track = state.currentTrack;
    const audio = audioRef.current;
    if (!track?.isLive || !audio || !state.isPlaying) return;
    const step = ++recoverStepRef.current;

    if (step === 1) {
      if (hlsRef.current) {
        try {
          hlsRef.current.startLoad();
        } catch {
          // engine already torn down — the reload below handles it
        }
      }
      jumpToLiveEdge(audio);
      return;
    }

    const current = track.hlsUrl || track.audioUrl || "";
    let next = current;
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const data = await res.json();
      const fresh = data?.live;
      if (fresh && fresh.isLive === false) {
        const recUrl: string | undefined = fresh?.recording?.audioUrl;
        if (recUrl) {
          void loadStreamRef.current(recUrl, true);
          return;
        }
      } else if (fresh?.streamUrl) {
        next = fresh.streamUrl;
      }
    } catch {
      // offline / API down — retry the URL we already have
    }

    storeRef.current.setIsLoading(true);
    const delay = step >= 3 ? 5000 : 1000;
    window.setTimeout(() => {
      const now = usePlayerStore.getState();
      if (now.currentTrack?.isLive && now.isPlaying) {
        void loadStreamRef.current(next || current, true);
      }
    }, delay);
  };
  recoverLiveRef.current = () => { void recoverLive(); };

  // Stall watchdog: live audio that stops advancing for ~9s (without the
  // user pausing) is treated as a stall and recovered. The screen wake lock
  // keeps most phones awake, but backgrounded tabs still throttle hls.js.
  useEffect(() => {
    const id = setInterval(() => {
      const state = usePlayerStore.getState();
      const track = state.currentTrack;
      const audio = audioRef.current;
      if (!track?.isLive || !audio) {
        lastProgressRef.current = { time: -1, at: 0 };
        recoverStepRef.current = 0;
        return;
      }
      // A user pause clears isPlaying, so a paused element here means the
      // browser gave up (media error / lost source) — recover it. Autoplay
      // blocks are excluded: the gesture retry already covers those.
      if (!state.isPlaying || (audio.paused && !audio.error)) {
        lastProgressRef.current = { time: audio.currentTime, at: Date.now() };
        return;
      }
      const now = Date.now();
      const time = audio.currentTime;
      const prev = lastProgressRef.current;
      if (!audio.paused && (prev.time < 0 || time !== prev.time)) {
        // Moving again — the next stall starts the ladder from the top.
        lastProgressRef.current = { time, at: now };
        recoverStepRef.current = 0;
        return;
      }
      if (now - prev.at >= 9000) {
        lastProgressRef.current = { time, at: now };
        recoverLiveRef.current();
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Coming back to the tab: give the stream a fresh stall window and resume
  // if the browser suspended playback while we were away.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      lastProgressRef.current = { time: -1, at: Date.now() };
      recoverStepRef.current = 0;
      const state = usePlayerStore.getState();
      const audio = audioRef.current;
      if (state.currentTrack?.isLive && state.isPlaying && audio?.paused) {
        const p = tryPlay(audio);
        if (p) p.catch(() => retryOnNextGesture(audio));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Load a stream track when it changes; stop the stream engine otherwise
  // (the YT engine in MiniPlayer owns YouTube tracks).
  useEffect(() => {
    const track = currentTrack;
    const streamUrl = track?.hlsUrl || track?.audioUrl;

    if (!streamUrl) {
      streamUrlRef.current = null;
      stopStream();
      return;
    }

    if (streamUrlRef.current === streamUrl) return;

    setIsLoading(true);
    setCurrentTime(0);
    setDuration(track?.duration || 0);
    void loadStream(streamUrl, playingRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.hlsUrl, currentTrack?.audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play / pause for stream tracks
  useEffect(() => {
    const streamUrl = currentTrack?.hlsUrl || currentTrack?.audioUrl;
    if (!streamUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      const p = tryPlay(audio);
      if (p) {
        p.catch(() => {
          // Stale-gesture rejection — retry on the user's next tap and
          // keep the playing intent so the UI doesn't lie.
          retryOnNextGesture(audio);
          setIsLoading(false);
        });
      }
    } else {
      try {
        audio.pause();
      } catch {
        // ignore
      }
    }
  }, [isPlaying, currentTrack, setIsPlaying]);

  // Screen Wake Lock — keep the screen on while anything is playing.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> };
        };
        if (!nav.wakeLock) return;
        if (document.visibilityState !== "visible") return;
        if (!playingRef.current || !usePlayerStore.getState().currentTrack) return;
        if (lock) return;
        const l = await nav.wakeLock.request("screen");
        if (!cancelled) lock = l;
        else await l.release().catch(() => {});
      } catch {
        // Unsupported / denied — playback works fine without it.
      }
    };

    const release = async () => {
      const l = lock;
      lock = null;
      if (l) {
        try {
          await l.release();
        } catch {
          // ignore — already released
        }
      }
    };

    if (isPlaying && currentTrack) void request();
    else void release();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void release();
    };
  }, [isPlaying, currentTrack]);

  // Volume for the stream element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.volume = volume;
      } catch {
        // ignore
      }
    }
  }, [volume]);

  // Seek requests for stream tracks (live edge is not seekable)
  useEffect(() => {
    const onSeek = (e: Event) => {
      const time = (e as CustomEvent<number>).detail;
      if (typeof time !== "number" || isNaN(time)) return;
      const track = usePlayerStore.getState().currentTrack;
      if (!track || track.isLive) return;
      if (!track.hlsUrl && !track.audioUrl) return;
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.currentTime = time;
        storeRef.current.setCurrentTime(time);
      } catch {
        // ignore
      }
    };

    window.addEventListener(SEEK_EVENT, onSeek as EventListener);

    const id = setInterval(() => {
      const track = usePlayerStore.getState().currentTrack;
      if (!track || (!track.hlsUrl && !track.audioUrl)) return;
      const audio = audioRef.current;
      if (!audio) return;
      try {
        storeRef.current.setCurrentTime(audio.currentTime || 0);
        const d = audio.duration;
        if (Number.isFinite(d) && d > 0) storeRef.current.setDuration(d);
      } catch {
        // ignore transient errors during track switches
      }
    }, 500);

    return () => {
      window.removeEventListener(SEEK_EVENT, onSeek as EventListener);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    return () => {
      destroyHls();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <audio
      ref={audioRef}
      className="hidden"
      preload="none"
      onPlaying={() => {
        storeRef.current.setIsLoading(false);
        storeRef.current.setIsPlaying(true);
      }}
      onWaiting={() => storeRef.current.setIsLoading(true)}
      onEnded={() => {
        if (usePlayerStore.getState().currentTrack) {
          storeRef.current.playNext();
        }
      }}
      onError={() => {
        // Non-HLS (progressive) failures land here. Live audio that loses its
        // source should recover right away rather than waiting out the full
        // stall window.
        storeRef.current.setIsLoading(false);
        if (usePlayerStore.getState().currentTrack?.isLive) {
          lastProgressRef.current = {
            time: audioRef.current?.currentTime ?? 0,
            at: Date.now() - 9000,
          };
        }
      }}
    />
  );
}
