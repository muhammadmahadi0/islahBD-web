"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerTrack } from "../../lib/audio";

interface PlayerCtx {
  track: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  close: () => void;
}

const Ctx = createContext<PlayerCtx | null>(null);

export function usePlayer() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer outside provider");
  return v;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const queueRef = useRef<PlayerTrack[]>([]);
  queueRef.current = queue;
  const trackRef = useRef<PlayerTrack | null>(null);
  trackRef.current = track;

  // Restore last track + queue (paused — browsers block autoplay)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("islah-player");
      if (raw) {
        const j = JSON.parse(raw);
        if (j.track) setTrack(j.track);
        if (Array.isArray(j.queue)) setQueue(j.queue);
      }
    } catch {}
    const el = new Audio();
    el.preload = "metadata";
    audioRef.current = el;
    el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
    el.addEventListener("loadedmetadata", () => setDuration(el.duration || 0));
    el.addEventListener("waiting", () => setIsLoading(true));
    el.addEventListener("playing", () => { setIsPlaying(true); setIsLoading(false); });
    el.addEventListener("pause", () => setIsPlaying(false));
    el.addEventListener("ended", () => step(1));
    return () => el.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("islah-player", JSON.stringify({ track, queue }));
    } catch {}
  }, [track, queue]);

  const step = useCallback((dir: 1 | -1) => {
    const q = queueRef.current;
    const cur = trackRef.current;
    if (!q.length || !cur) return;
    const i = q.findIndex((t) => t.id === cur.id);
    const n = q[(i + dir + q.length) % q.length];
    if (n) {
      setTrack(n);
      setCurrentTime(0);
      audioRef.current!.src = n.audioUrl;
      audioRef.current!.play().catch(() => {});
    }
  }, []);

  const play = useCallback((t: PlayerTrack, q?: PlayerTrack[]) => {
    if (q) setQueue(q);
    else if (!queueRef.current.some((x) => x.id === t.id)) setQueue((prev) => [...prev, t]);
    setTrack(t);
    setCurrentTime(0);
    setIsLoading(true);
    const el = audioRef.current!;
    el.src = t.audioUrl;
    el.play().catch(() => setIsLoading(false));
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, [track]);

  const seek = useCallback((sec: number) => {
    const el = audioRef.current;
    if (el) {
      el.currentTime = sec;
      setCurrentTime(sec);
    }
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setIsPlaying(false);
  }, []);

  const value = useMemo<PlayerCtx>(
    () => ({
      track, queue, isPlaying, isLoading, currentTime, duration,
      play, toggle,
      next: () => step(1),
      prev: () => {
        if (audioRef.current && audioRef.current.currentTime > 3) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
          return;
        }
        step(-1);
      },
      seek, close,
    }),
    [track, queue, isPlaying, isLoading, currentTime, duration, play, toggle, step, seek, close]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
