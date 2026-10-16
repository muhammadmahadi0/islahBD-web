"use client";
import { useEffect } from "react";
import { loadYouTubeAPI } from "../../lib/yt-engine";

/**
 * Warms both playback engines on the user's FIRST interaction instead of
 * waiting for browser-idle prefetch. First taps are the ones that fail:
 * the YouTube iframe API (~100KB) and hls.js (~500KB) download lazily on
 * first play, so the playback intent fires into an engine that isn't ready
 * and gets dropped — forcing a second tap. Warming on pointerdown closes
 * that gap. Module/script caches make the later real loads instant.
 */
export default function EngineWarmup() {
  useEffect(() => {
    let done = false;
    const warm = () => {
      if (done) return;
      done = true;
      try {
        loadYouTubeAPI().catch(() => {});
      } catch {
        // ignore
      }
      try {
        void import("hls.js").catch(() => {});
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointerdown", warm, { once: true, passive: true });
    window.addEventListener("keydown", warm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", warm);
      window.removeEventListener("keydown", warm);
    };
  }, []);
  return null;
}
