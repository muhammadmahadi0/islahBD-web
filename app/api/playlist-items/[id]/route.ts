import { NextResponse } from "next/server";
import {
  getInnertubePlaylistItems,
  INNERTUBE_TIMEOUT_MS,
  type InnertubeVideo,
} from "../../../../lib/innertube";
import { withTimeout } from "../../../../lib/with-timeout";

// Keyless playlist items (first ~200 videos) via InnerTube.
export const runtime = "nodejs";
export const revalidate = 3600;
export const maxDuration = 30;

const PLAYLIST_ID = /^[a-zA-Z0-9_-]{13,64}$/;

function toApiVideo(v: InnertubeVideo) {
  return {
    id: v.videoId,
    videoId: v.videoId,
    title: v.title,
    thumbnail: v.thumbnail,
    publishedAt: v.publishedAt,
    duration: v.duration,
    views: v.views,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const playlistId = decodeURIComponent(params.id);
  if (!PLAYLIST_ID.test(playlistId)) {
    return NextResponse.json({ success: false, error: "Invalid playlist ID" }, { status: 400 });
  }

  try {
    const { videos } = await withTimeout(
      getInnertubePlaylistItems(playlistId, 2),
      INNERTUBE_TIMEOUT_MS,
      "innertube-playlist-items"
    );
    return NextResponse.json(
      { success: true, videos: videos.map(toApiVideo), source: "innertube" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "প্লেলিস্টের ভিডিও লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
