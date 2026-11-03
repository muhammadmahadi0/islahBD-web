import type { Track } from "../store/player-store";
import type { Lang } from "./i18n";
import type { LiveRecording, LiveStatus } from "./live";

/**
 * Track ids for the live broadcast and the recordings queued behind it.
 * The newest recording keeps the original `live-recording` id so existing
 * links, persisted queues and the live bar keep working.
 */
export const LIVE_TRACK_ID = "live";
export const LIVE_RECORDING_ID = "live-recording";

/** True for the live stream and every recording in its queue. */
export function isLiveTrackId(id?: string | null): boolean {
  return (
    !!id &&
    (id === LIVE_TRACK_ID || id === LIVE_RECORDING_ID || id.startsWith(`${LIVE_RECORDING_ID}-`))
  );
}

/** Latest recordings, newest first. Falls back to the single `recording`. */
export function liveRecordings(live: LiveStatus): LiveRecording[] {
  const list = live.recordings?.length ? live.recordings : live.recording ? [live.recording] : [];
  return list.filter((r) => !!r.audioUrl);
}

function fallbackTitle(lang: Lang): string {
  return lang === "bn" ? "সর্বশেষ বয়ান" : lang === "ur" ? "تازہ ترین بیان" : "Latest bayan";
}

function recordingTrack(rec: LiveRecording, index: number, lang: Lang): Track {
  const id = index === 0 ? LIVE_RECORDING_ID : `${LIVE_RECORDING_ID}-${index}`;
  return {
    id,
    title: rec.title || fallbackTitle(lang),
    thumbnail: "",
    duration: rec.durationSeconds || 0,
    channelName: [rec.speaker, rec.location].filter(Boolean).join(" • "),
    videoId: "",
    audioUrl: rec.audioUrl,
    location: rec.location,
    sharePath: `/live?play=${id}`,
  };
}

/** The live HLS broadcast, when one is running. */
export function liveStreamTrack(live: LiveStatus, lang: Lang): Track | null {
  if (!live.isLive || !live.streamUrl) return null;
  const fallback = lang === "bn" ? "সরাসরি বয়ান" : lang === "ur" ? "براہ راست بیان" : "Live bayan";
  return {
    id: LIVE_TRACK_ID,
    title: live.title || fallback,
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

/** All recordings as a playable queue, newest first. */
export function liveRecordingTracks(live: LiveStatus, lang: Lang): Track[] {
  return liveRecordings(live).map((rec, i) => recordingTrack(rec, i, lang));
}

/** Broadcast when live, otherwise the newest recording. */
export function livePrimaryTrack(live: LiveStatus, lang: Lang): Track | null {
  return liveStreamTrack(live, lang) ?? liveRecordingTracks(live, lang)[0] ?? null;
}
