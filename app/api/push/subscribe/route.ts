import { NextResponse } from "next/server";

// Web Push subscription sink.
//
// Real background push needs (a) VAPID keys and (b) somewhere to keep the
// subscriptions. Both are optional: when `KV_REST_API_URL` +
// `KV_REST_API_TOKEN` are present (Vercel KV / Upstash) subscriptions are
// stored in a Redis set so a cron/job can fan out with web-push. Without them
// the endpoint stays a no-op success — the service worker's own API polling
// still delivers notifications, so enabling notifications never breaks.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SET_KEY = "islah-push-subscriptions";

function kvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function kv(command: string, ...args: string[]): Promise<boolean> {
  const cfg = kvConfig();
  if (!cfg) return false;
  try {
    const path = [command, ...args.map(encodeURIComponent)].join("/");
    const res = await fetch(`${cfg.url}/${path}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function isValid(sub: unknown): sub is { endpoint: string; keys: { p256dh: string; auth: string } } {
  if (!sub || typeof sub !== "object") return false;
  const s = sub as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return (
    typeof s.endpoint === "string" &&
    s.endpoint.startsWith("https://") &&
    !!s.keys &&
    typeof s.keys.p256dh === "string" &&
    typeof s.keys.auth === "string"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!isValid(body?.subscription)) {
      return NextResponse.json({ success: false, error: "invalid subscription" }, { status: 400 });
    }
    const record = JSON.stringify({
      endpoint: body.subscription.endpoint,
      keys: body.subscription.keys,
      locale: typeof body.locale === "string" ? body.locale : null,
      at: Date.now(),
    });
    const stored = await kv("sadd", SET_KEY, record);
    return NextResponse.json({ success: true, stored });
  } catch {
    return NextResponse.json({ success: false, error: "bad request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const endpoint = body?.endpoint;
    if (typeof endpoint !== "string" || !endpoint) {
      return NextResponse.json({ success: false, error: "endpoint required" }, { status: 400 });
    }
    // Best-effort: drop any stored record whose endpoint matches.
    const cfg = kvConfig();
    if (cfg) {
      const res = await fetch(`${cfg.url}/smembers/${SET_KEY}`, {
        headers: { Authorization: `Bearer ${cfg.token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string[] };
        for (const member of data.result ?? []) {
          try {
            if (JSON.parse(member).endpoint === endpoint) {
              await kv("srem", SET_KEY, member);
            }
          } catch {
            /* skip malformed member */
          }
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "bad request" }, { status: 400 });
  }
}
