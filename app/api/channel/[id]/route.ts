import { NextResponse } from "next/server";
import {
  getInnertubeChannelVideos,
  toClientToken,
  INNERTUBE_TIMEOUT_MS,
  type InnertubeVideo,
} from "../../../../lib/innertube";
import { withTimeout } from "../../../../lib/with-timeout";

// Keyless YouTube channel listing via InnerTube (same as the master branch).
// Node runtime is required — youtubei.js is not Edge-compatible.
export const runtime = "nodejs";
export const revalidate = 3600;
export const maxDuration = 30;

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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const channelId = decodeURIComponent(params.id);
  try {
    const inner = await withTimeout(
      getInnertubeChannelVideos(channelId),
      INNERTUBE_TIMEOUT_MS,
      "innertube-channel"
    );
    if (inner.videos.length === 0) {
      return NextResponse.json({ error: "No videos found for this channel." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      channel: { name: inner.name, avatar: inner.avatar },
      videos: inner.videos.map(toApiVideo),
      nextPageToken: toClientToken(inner.nextToken),
      total: null,
      source: "innertube",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "চ্যানেলের ভিডিও এখন লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
