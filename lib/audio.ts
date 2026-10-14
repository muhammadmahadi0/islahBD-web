// Bayan + Hamd/Naat catalog — ported from beta branch
// (beta: src/lib/boyan.ts + src/lib/hamdnaat.ts).
// Sources: api.islahbd.com/api/audios/ (~110 MP3 lectures, keyless)
//          api.islahbd.com/api/nasheeds/ (~50 audio/video items, keyless)

export interface BoyanAudio {
  id: number;
  title: string;
  speaker: string;
  category: string;
  audioUrl: string;
  duration: string;
  uploadDate: string;
  location: string;
}

export interface BoyanCategory {
  id: number;
  name: string;
  order: number;
}

export type HamdNaatType = "audio" | "video";

export interface HamdNaatItem {
  id: number;
  title: string;
  type: HamdNaatType;
  audioUrl: string;
  youtubeId: string;
  artist: string;
  lyricist: string;
  composer: string;
  writingPlace: string;
  writingDate: string;
  createdAt: string;
}

import type { Track } from "../store/player-store";

export function boyanToTrack(a: BoyanAudio): Track {
  return {
    id: `boyan-${a.id}`,
    title: a.title,
    thumbnail: "",
    duration: parseDuration(a.duration),
    channelName: [a.speaker, a.location].filter(Boolean).join(" • "),
    videoId: "",
    audioUrl: a.audioUrl,
    location: a.location,
  };
}

export function hamdNaatToTrack(item: HamdNaatItem): Track {
  const isVideo = item.type === "video";
  return {
    id: `hamd-${item.id}`,
    title: item.title,
    thumbnail: isVideo && item.youtubeId ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg` : "",
    duration: 0,
    channelName: [item.artist, item.writingPlace].filter(Boolean).join(" • "),
    videoId: isVideo ? item.youtubeId : "",
    audioUrl: isVideo ? undefined : item.audioUrl || undefined,
  };
}
function sanitizeBoyan(item: any): BoyanAudio | null {
  if (!item || typeof item.audioUrl !== "string" || !item.audioUrl) return null;
  return {
    id: Number(item.id) || 0,
    title: String(item.title || "শিরোনামহীন বয়ান"),
    speaker: String(item.speaker || ""),
    category: String(item.category || ""),
    audioUrl: item.audioUrl,
    duration: String(item.duration || ""),
    uploadDate: String(item.uploadDate || ""),
    location: String(item.location || ""),
  };
}

function sanitizeHamdNaat(item: any): HamdNaatItem | null {
  if (!item) return null;
  const type: HamdNaatType = item.type === "video" ? "video" : "audio";
  const audioUrl = typeof item.audioUrl === "string" ? item.audioUrl : "";
  const youtubeId = typeof item.youtubeId === "string" ? item.youtubeId : "";
  if (type === "audio" && !audioUrl) return null;
  if (type === "video" && !youtubeId) return null;
  return {
    id: Number(item.id) || 0,
    title: String(item.title || "শিরোনামহীন হামদ-নাত"),
    type,
    audioUrl,
    youtubeId,
    artist: String(item.artist || ""),
    lyricist: String(item.lyricist || ""),
    composer: String(item.composer || ""),
    writingPlace: String(item.writingPlace || ""),
    writingDate: String(item.writingDate || ""),
    createdAt: String(item.createdAt || ""),
  };
}

export function parseBoyanList(data: unknown): BoyanAudio[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(sanitizeBoyan)
    .filter((a): a is BoyanAudio => a !== null)
    .sort((a, b) => b.id - a.id);
}

export function parseBoyanCategories(data: unknown): BoyanCategory[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((c) => c && typeof c.name === "string" && c.name)
    .map((c) => ({ id: Number(c.id) || 0, name: String(c.name), order: Number(c.order) || 0 }))
    .sort((a, b) => a.order - b.order || a.id - b.id);
}

export function parseHamdNaatList(data: unknown): HamdNaatItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(sanitizeHamdNaat)
    .filter((a): a is HamdNaatItem => a !== null)
    .sort((a, b) => b.id - a.id);
}

/** "30:23" / "1:02:03" → seconds. */
export function parseDuration(raw: string): number {
  if (!raw) return 0;
  const parts = raw.trim().split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function formatSecs(sec: number): string {
  if (!sec || sec <= 0 || !isFinite(sec)) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** ISO date → Bengali relative time ("৩ দিন আগে"). */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function bnNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function timeAgoBn(iso: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${bnNum(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${bnNum(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${bnNum(days)} দিন আগে`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${bnNum(months)} মাস আগে`;
  return `${bnNum(Math.floor(months / 12))} বছর আগে`;
}
