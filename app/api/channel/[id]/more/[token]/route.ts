import { NextResponse } from "next/server";
import {
  getInnertubeMore,
  fromClientToken,
  toClientToken,
  INNERTUBE_TIMEOUT_MS,
  type InnertubeVideo,
} from "../../../../../../lib/innertube";
import { withTimeout } from "../../../../../../lib/with-timeout";

// Continuation page for a channel's uploads ("Show more").
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

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const token = fromClientToken(decodeURIComponent(params.token));
  try {
    const page = await withTimeout(
      getInnertubeMore(token, 2),
      INNERTUBE_TIMEOUT_MS,
      "innertube-more"
    );
    return NextResponse.json({
      success: true,
      videos: page.videos.map(toApiVideo),
      nextPageToken: toClientToken(page.nextToken),
      source: "innertube",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "আরও ভিডিও লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
