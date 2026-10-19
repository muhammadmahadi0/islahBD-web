/**
 * Short clips (`/media`) — shared types + player mapping.
 *
 * The catalog fetch and title resolution live in `lib/shorts-server.ts` so
 * `shorts-titles.json` and the oEmbed helper stay out of the client bundle.
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
