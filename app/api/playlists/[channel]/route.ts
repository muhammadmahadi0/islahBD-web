import { NextResponse } from "next/server";
import { CHANNELS } from "../../../../lib/channels";
import {
  getInnertubeChannelPlaylists,
  INNERTUBE_TIMEOUT_MS,
} from "../../../../lib/innertube";
import { withTimeout } from "../../../../lib/with-timeout";

// Keyless channel playlists via the InnerTube Playlists tab.
export const runtime = "nodejs";
export const revalidate = 3600;
export const maxDuration = 30;

const CHANNEL_ID = /^UC[a-zA-Z0-9_-]{22}$/;

export async function GET(
  _req: Request,
  { params }: { params: { channel: string } }
) {
  const channelId = decodeURIComponent(params.channel);

  if (!CHANNEL_ID.test(channelId) || !CHANNELS.some((c) => c.id === channelId)) {
    return NextResponse.json({ success: false, error: "Unknown channel" }, { status: 400 });
  }

  try {
    const playlists = await withTimeout(
      getInnertubeChannelPlaylists(channelId),
      INNERTUBE_TIMEOUT_MS,
      "innertube-playlists"
    );
    return NextResponse.json(
      { success: true, playlists, source: "innertube" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "চ্যানেলের প্লেলিস্ট লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
