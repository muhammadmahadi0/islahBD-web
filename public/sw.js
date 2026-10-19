/* islah service worker — delivers notifications from the IslahBD API.
 *
 * Two delivery paths:
 *   1. Web Push (`push` event) once a server-side push service is wired.
 *   2. Self-check (`periodicsync` / `sync` / page `message`) — the worker
 *      polls /api/notifications itself and raises a system notification for
 *      anything newer than the last id it showed. This is what makes
 *      "a notification whenever the API posts one" work with no backend.
 */
const ICON = "/images/logo.png";
const SEEN_CTX = "islah-sw";
const TAG = "islah-notifications";

/* ---------- tiny IndexedDB kv (lastSeenId survives worker restarts) ---------- */
function withStore(mode, fn) {
  return new Promise((resolve) => {
    let req;
    try {
      req = indexedDB.open(SEEN_CTX, 1);
    } catch {
      return resolve(undefined);
    }
    req.onupgradeneeded = () => {
      req.result.createObjectStore("kv");
    };
    req.onsuccess = () => {
      const db = req.result;
      try {
        const tx = db.transaction("kv", mode);
        const out = fn(tx.objectStore("kv"));
        tx.oncomplete = () => resolve(out && out.result);
        tx.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    };
    req.onerror = () => resolve(undefined);
  });
}

const kvGet = (key) => withStore("readonly", (s) => s.get(key));
const kvSet = (key, value) => withStore("readwrite", (s) => s.put(value, key));

/* ---------- shared helpers ---------- */
function notifUrl(n) {
  switch (n && n.type) {
    case "live":
      return "/live";
    case "boayn":
    case "boyan":
      return n.targetId ? `/boyan?play=boyan-${n.targetId}` : "/boyan";
    case "nasheed":
      return n.targetId ? `/hamdnaat?play=hamd-${n.targetId}` : "/hamdnaat";
    case "notice":
      return "/notice";
    default:
      return "/notifications";
  }
}

async function show(title, options) {
  return self.registration.showNotification(title || "islah", {
    icon: ICON,
    badge: ICON,
    lang: "bn",
    ...options,
  });
}

/** Poll the feed and notify anything newer than lastSeenId. */
async function checkNotifications() {
  let data;
  try {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }
  const items = (data && data.notifications) || [];
  if (!items.length) return;

  const newest = items[0].id;
  const seen = (await kvGet("lastSeenId")) || 0;

  // First ever run: remember where we are instead of dumping the backlog.
  if (!seen) {
    await kvSet("lastSeenId", newest);
    return;
  }
  if (newest <= seen) return;

  const fresh = items.filter((n) => n.id > seen).slice(0, 5).reverse();
  for (const n of fresh) {
    await show(n.title, {
      body: n.body || "",
      tag: `islah-${n.id}`,
      data: { url: notifUrl(n) },
    });
  }
  await kvSet("lastSeenId", newest);
}

/* ---------- lifecycle ---------- */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/* ---------- real web push (future server-side sender) ---------- */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "islah", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    show(payload.title, {
      body: payload.body || "",
      tag: payload.tag,
      data: { url: payload.url || "/notifications" },
    })
  );
});

/* ---------- background sync → self-check ---------- */
self.addEventListener("periodicsync", (event) => {
  if (!event.tag || event.tag === TAG) event.waitUntil(checkNotifications());
});
self.addEventListener("sync", (event) => {
  if (!event.tag || event.tag === TAG) event.waitUntil(checkNotifications());
});

/* ---------- page messages ---------- */
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "check") {
    event.waitUntil(checkNotifications());
  } else if (msg.type === "seen") {
    event.waitUntil(kvSet("lastSeenId", msg.id || 0));
  } else if (msg.type === "notify") {
    event.waitUntil(
      show(msg.title, {
        body: msg.body || "",
        tag: msg.tag,
        data: { url: msg.url || "/notifications" },
      })
    );
  }
});

/* ---------- tap-through ---------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("focus" in client) {
          try {
            if ("navigate" in client) await client.navigate(target);
          } catch {
            /* cross-origin / detached — focus anyway */
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })()
  );
});
