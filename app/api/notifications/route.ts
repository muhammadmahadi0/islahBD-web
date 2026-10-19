import { NextResponse } from "next/server";
import { parseNotifications } from "../../../lib/notifications";

// Cached proxy for the IslahBD notification feed. The service worker and the
// alert poller both hit this path, so it must stay cheap and CORS-free.
// Mirrors beta's /api/* proxies with ISR caching.
export const revalidate = 120;

const UPSTREAM = "https://api.islahbd.com/api/notifications/";

export async function GET() {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    let data: unknown = null;
    try {
      const res = await fetch(UPSTREAM, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
        signal: ctl.signal,
      });
      if (!res.ok) throw new Error(`upstream ${res.status}`);
      data = await res.json();
    } finally {
      clearTimeout(timer);
    }

    const notifications = parseNotifications(data).slice(0, 60);
    return NextResponse.json(
      { success: true, count: notifications.length, notifications },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "নোটিফিকেশন লোড করা যাচ্ছে না।" },
      { status: 502 }
    );
  }
}
