import { NextResponse } from "next/server";
import type { LiveStatus } from "../../../lib/live";

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
    const rec = data?.recording;
    const live: LiveStatus = {
      isLive: !!data?.isLive,
      title: data?.title || "",
      speaker: data?.speaker || "",
      location: data?.location || "",
      listeners: data?.listeners ?? data?.real_listeners ?? 0,
      streamUrl: data?.streamUrl || data?.hlsUrl || "",
      recording: rec?.audioUrl
        ? {
            title: rec.title || "",
            speaker: rec.speaker || "",
            location: rec.location || "",
            audioUrl: rec.audioUrl,
            durationSeconds: rec.durationSeconds || 0,
          }
        : null,
    };
    return NextResponse.json({ success: true, live });
  } catch (e) {
    return NextResponse.json({ error: "লাইভ তথ্য পাওয়া যাচ্ছে না।" }, { status: 502 });
  }
}
