// Client side of the notification/push stack.
//
// Delivery is layered so a notification still reaches the user without any
// backend push service:
//   1. While a tab is open, `NotificationAlerts` polls /api/notifications.
//   2. The service worker self-checks on Periodic Background Sync (installed
//      PWA, Android/Chrome) so alerts keep coming with the app closed.
//   3. If `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is configured, a real Web Push
//      subscription is registered and forwarded to /api/push/subscribe.

import { storageGetJSON, storageSetJSON } from "./storage";

const ENABLED_KEY = "islah-notif-enabled";
const SEEN_KEY = "islah-notif-seen-id";
export const NOTIF_TOGGLE_EVENT = "islah:notif-toggle";

export interface LocalNotification {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export function notificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** User has explicitly switched notifications on (and hasn't since revoked). */
export function notificationsEnabled(): boolean {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  return storageGetJSON<boolean>(ENABLED_KEY, false) === true;
}

function emitToggle() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTIF_TOGGLE_EVENT));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return buffer;
}

/** Ask for permission, install the worker, and start delivery. */
export async function enableNotifications(): Promise<{
  ok: boolean;
  reason?: NotificationPermission | "unsupported" | "error";
}> {
  if (!notificationsSupported()) return { ok: false, reason: "unsupported" };

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    return { ok: false, reason: "error" };
  }
  if (permission !== "granted") return { ok: false, reason: permission };

  const reg = await registerServiceWorker();
  storageSetJSON(ENABLED_KEY, true);
  storageSetJSON(SEEN_KEY, storageGetJSON<number>(SEEN_KEY, 0));
  emitToggle();

  if (reg) {
    // Ask the worker to line up its own baseline immediately.
    try {
      const ready = (await navigator.serviceWorker.ready) || reg;
      ready.active?.postMessage({ type: "check" });
    } catch {
      /* worker not active yet — the next page load checks */
    }

    // Periodic Background Sync (installed PWA on Chromium). Lets the worker
    // keep checking the API while the app is closed.
    try {
      const anyReg = reg as ServiceWorkerRegistration & {
        periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
      };
      await anyReg.periodicSync?.register("islah-notifications", { minInterval: 15 * 60 * 1000 });
    } catch {
      /* unsupported / permission not granted — foreground polling covers it */
    }

    // Real Web Push when a VAPID key is configured.
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (vapid) {
      try {
        const existing = await reg.pushManager.getSubscription();
        const sub =
          existing ||
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToArrayBuffer(vapid),
          }));
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub, locale: navigator.language }),
        });
      } catch {
        /* subscription optional — in-app alerts still work */
      }
    }
  }

  return { ok: true };
}

export async function disableNotifications(): Promise<void> {
  storageSetJSON(ENABLED_KEY, false);
  emitToggle();
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    const anyReg = reg as (ServiceWorkerRegistration & {
      periodicSync?: { unregister: (tag: string) => Promise<void> };
    }) | undefined;
    await anyReg?.periodicSync?.unregister("islah-notifications");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
  } catch {
    /* best effort */
  }
}

/** Remember the newest id we've surfaced (worker + page share this). */
export function markSeen(id: number): void {
  if (!id) return;
  const current = storageGetJSON<number>(SEEN_KEY, 0);
  if (id > current) storageSetJSON(SEEN_KEY, id);
  try {
    navigator.serviceWorker?.ready
      .then((reg) => reg.active?.postMessage({ type: "seen", id }))
      .catch(() => {});
  } catch {
    /* no worker */
  }
}

export function lastSeenId(): number {
  return storageGetJSON<number>(SEEN_KEY, 0);
}

/** Raise a system notification now (worker first, Notification fallback). */
export async function showLocalNotification(payload: LocalNotification): Promise<void> {
  if (!notificationsEnabled()) return;
  const url = payload.url || "/notifications";
  try {
    const reg = (await navigator.serviceWorker?.getRegistration?.()) ?? null;
    if (reg) {
      const target = reg.active || (await navigator.serviceWorker.ready).active;
      if (target) {
        target.postMessage({ type: "notify", ...payload, url });
        return;
      }
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(payload.title, { body: payload.body, icon: "/images/logo.png" });
  } catch {
    /* notifications unavailable */
  }
}
