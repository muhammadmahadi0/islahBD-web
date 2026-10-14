import { NextResponse } from "next/server";

// Ported from beta (src/pages/api/hls/[...url].ts).
// HLS proxy with CORS fallback. Target URL travels in the path:
// GET /api/hls/<encodeURIComponent(manifest-or-media-url)>
export const dynamic = "force-dynamic";

function isManifest(url: string, contentType: string | null): boolean {
  if (contentType?.includes("mpegurl") || contentType?.includes("m3u8")) return true;
  return /\.m3u8(\?|$)/i.test(url);
}

function proxied(base: string, uri: string): string {
  const absolute = new URL(uri, base).toString();
  return `/api/hls/${encodeURIComponent(absolute)}`;
}

function rewriteManifest(text: string, base: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "" || trimmed.startsWith("#EXTM3U")) return line;
      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_m, uri) => `URI="${proxied(base, uri)}"`);
      }
      if (/^[a-zA-Z0-9]/.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("http")) {
        return proxied(base, trimmed);
      }
      return line;
    })
    .join("\n");
}

export async function GET(
  _req: Request,
  { params }: { params: { url: string[] } }
) {
  const raw = params.url?.join("/");
  if (!raw) {
    return NextResponse.json({ error: "URL প্যারামিটার নেই।" }, { status: 400 });
  }
  let target: string;
  try {
    target = decodeURIComponent(raw);
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "ভুল URL।" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "ভুল URL।" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target, {
      headers: { Accept: "*/*", "User-Agent": "IslahAudio/1.0 (HLS proxy)" },
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `Upstream: ${upstream.status}` }, { status: 502 });
    }
    const contentType = upstream.headers.get("content-type");
    if (isManifest(target, contentType)) {
      const text = await upstream.text();
      return new NextResponse(rewriteManifest(text, target), {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "প্রক্সি ব্যর্থ।" }, { status: 502 });
  }
}
