import { NextResponse } from "next/server";
import { getInnertubeChannelMeta, INNERTUBE_TIMEOUT_MS } from "../../../../../lib/innertube";
import { withTimeout } from "../../../../../lib/with-timeout";
import { CHANNELS } from "../../../../../lib/channels";

// Featherweight channel header (name + avatar only) — used by the channel
// cards so they never download a 100-video listing just for an avatar.
export const runtime = "nodejs";
export const revalidate = 86400;
export const maxDuration = 30;

const CHANNEL_ID = /^UC[a-zA-Z0-9_-]{22}$/;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const raw = decodeURIComponent(params.id);
  const known = CHANNELS.find((c) => c.id === raw || c.handle === raw);

  if (known) {
    try {
      const meta = await withTimeout(
        getInnertubeChannelMeta(known.id),
        INNERTUBE_TIMEOUT_MS,
        "innertube-meta"
      );
      if (meta.name || meta.avatar) {
        return NextResponse.json({ success: true, channel: meta, source: "innertube" });
      }
    } catch {
      // fall through to the registry name
    }
    return NextResponse.json({
      success: true,
      channel: { name: known.name, avatar: "" },
      source: "registry",
    });
  }

  if (CHANNEL_ID.test(raw)) {
    try {
      const meta = await withTimeout(
        getInnertubeChannelMeta(raw),
        INNERTUBE_TIMEOUT_MS,
        "innertube-meta"
      );
      if (meta.name || meta.avatar) {
        return NextResponse.json({ success: true, channel: meta, source: "innertube" });
      }
    } catch {
      // fall through to 404
    }
  }

  return NextResponse.json({ error: "Channel not found" }, { status: 404 });
}
