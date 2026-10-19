/**
 * Short clips catalog (`api.islahbd.com/api/clips/`).
 *
 * ~194 items: `audio` clips carry a direct MP3 (stream engine) and `video`
 * clips carry a `youtubeId` (YouTube engine). Keyless, no pagination —
 * fetch the whole list once and filter client-side.
 */
import type { Track } from "../store/player-store";

export type ShortClipType = "audio" | "video";

export interface ShortClip {
  id: number;
  title: string;
  type: ShortClipType;
  audioUrl: string;
  youtubeId: string;
  createdAt: string;
}

const CLIPS_URL = "https://api.islahbd.com/api/clips/";
const FETCH_TIMEOUT_MS = 10000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeClip(item: any): ShortClip | null {
  if (!item) return null;
  const audioUrl = typeof item.audioUrl === "string" ? item.audioUrl : "";
  const youtubeId = typeof item.youtubeId === "string" ? item.youtubeId : "";
  // Video clips ride the YouTube embed; audio clips ride the stream engine.
  if (youtubeId) {
    return {
      id: Number(item.id) || 0,
      title: String(item.title || "শিরোনামহীন ক্লিপ"),
      type: "video",
      audioUrl: "",
      youtubeId,
      createdAt: String(item.createdAt || ""),
    };
  }
  if (!audioUrl) return null;
  return {
    id: Number(item.id) || 0,
    title: String(item.title || "শিরোনামহীন ক্লিপ"),
    type: "audio",
    audioUrl,
    youtubeId: "",
    createdAt: String(item.createdAt || ""),
  };
}

/** Whole catalog, newest first. */
export async function getShortClips(): Promise<ShortClip[]> {
  const data = await fetchJson<any[]>(CLIPS_URL);
  if (!Array.isArray(data)) return [];
  return data
    .map(sanitizeClip)
    .filter((c): c is ShortClip => c !== null)
    .sort((a, b) => b.id - a.id);
}

/** Short clip → player Track (same shapes as bayan / hamd-naat). */
export function shortToTrack(clip: ShortClip): Track {
  if (clip.type === "video") {
    return {
      id: `short-${clip.id}`,
      title: clip.title,
      thumbnail: `https://i.ytimg.com/vi/${clip.youtubeId}/hqdefault.jpg`,
      duration: 0,
      channelName: "ইসলাহ",
      videoId: clip.youtubeId,
      publishedAt: clip.createdAt || "",
      sharePath: `/media?play=${encodeURIComponent(`short-${clip.id}`)}`,
    };
  }
  return {
    id: `short-${clip.id}`,
    title: clip.title,
    thumbnail: "",
    duration: 0,
    channelName: "ইসলাহ",
    videoId: "",
    audioUrl: clip.audioUrl,
    publishedAt: clip.createdAt || "",
    sharePath: `/media?play=${encodeURIComponent(`short-${clip.id}`)}`,
  };
}
