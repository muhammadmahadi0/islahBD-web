import { NextResponse } from "next/server";
import type { LiveRecording, LiveStatus } from "../../../lib/live";

// Ported from beta (src/pages/api/live.ts).
const STATUS_URL = "https://api.islahbd.com/api/live/status/";

export const revalidate = 10;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(STATUS_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const toRecording = (r: any): LiveRecording | null =>
      r?.audioUrl
        ? {
            title: r.title || "",
            speaker: r.speaker || "",
            location: r.location || "",
            audioUrl: r.audioUrl,
            durationSeconds: r.durationSeconds || 0,
          }
        : null;

    const rec = toRecording(data?.recording);
    // Upstream now ships the latest few recordings alongside the legacy
    // single `recording`. Newest first, de-duplicated by URL.
    const rawRecordings: any[] = Array.isArray(data?.recordings) ? [...data.recordings] : [];
    rawRecordings.sort((a, b) => {
      const ta = Date.parse(a?.startedAt || "") || 0;
      const tb = Date.parse(b?.startedAt || "") || 0;
      return tb - ta;
    });
    const recordings: LiveRecording[] = [];
    const seen = new Set<string>();
    for (const raw of rawRecordings) {
      const item = toRecording(raw);
      if (!item || seen.has(item.audioUrl)) continue;
      seen.add(item.audioUrl);
      recordings.push(item);
    }
    if (!recordings.length && rec) recordings.push(rec);

    const live: LiveStatus = {
      isLive: !!data?.isLive,
      title: data?.title || "",
      speaker: data?.speaker || "",
      location: data?.location || "",
      listeners: data?.listeners ?? data?.real_listeners ?? 0,
      streamUrl: data?.streamUrl || data?.hlsUrl || "",
      recording: rec ?? recordings[0] ?? null,
      recordings,
    };
    return NextResponse.json({ success: true, live });
  } catch (e) {
    return NextResponse.json({ error: "লাইভ তথ্য পাওয়া যাচ্ছে না।" }, { status: 502 });
  }
}
