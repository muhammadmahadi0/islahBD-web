"use client";
import { useEffect, useState } from "react";
import { detectLocation, fetchPrayerData, PRAYER_KEYS, prayerName } from "../lib/prayer";
import {
  lastSeenId,
  markSeen,
  notificationsEnabled,
  NOTIF_TOGGLE_EVENT,
  registerServiceWorker,
  showLocalNotification,
} from "../lib/push";
import { notifHref, parseNotifications } from "../lib/notifications";
import { useLang } from "../store/language-store";

// How often an open tab checks the API for new notifications.
const POLL_MS = 3 * 60 * 1000;

/**
 * Delivers notifications raised by the IslahBD API.
 *
 * - Foreground: polls /api/notifications and shows a system notification for
 *   anything newer than the last id we surfaced (also re-checks on tab focus).
 * - Background: the service worker self-checks on Periodic Background Sync, so
 *   an installed PWA keeps alerting with the app closed (Chromium).
 * - Prayer reminders are scheduled for the current day while the app runs.
 */
export default function NotificationAlerts() {
  const lang = useLang();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(notificationsEnabled());
    sync();
    window.addEventListener(NOTIF_TOGGLE_EVENT, sync);
    return () => window.removeEventListener(NOTIF_TOGGLE_EVENT, sync);
  }, []);

  // New API notifications → system notification.
  useEffect(() => {
    if (!enabled) return;
    let dead = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (dead || !data.success) return;

        const items = parseNotifications(data.notifications);
        if (!items.length) return;

        const newest = items[0].id;
        const seen = lastSeenId();
        // First run after enabling: record the baseline instead of firing a
        // burst of notifications for the whole backlog.
        if (!seen) {
          markSeen(newest);
          return;
        }
        if (newest <= seen) return;

        const fresh = items
          .filter((n) => n.id > seen)
          .slice(0, 4)
          .reverse();
        for (const n of fresh) {
          await showLocalNotification({
            title: n.title,
            body: n.body,
            url: notifHref(n) || "/notifications",
            tag: `islah-${n.id}`,
          });
        }
        markSeen(newest);
      } catch {
        // Offline — the next tick (or focus) retries.
      }
    };

    registerServiceWorker();
    poll();
    const id = window.setInterval(poll, POLL_MS);
    const recheck = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      dead = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, [enabled]);

  // Prayer-time reminders for today (real background alarms need a server
  // push service — see SPEC §4.8).
  useEffect(() => {
    if (!enabled) return;
    let dead = false;
    const timers: number[] = [];

    (async () => {
      try {
        const loc = await detectLocation();
        const data = await fetchPrayerData(loc.lat, loc.lng);
        if (dead) return;
        const now = new Date();
        for (const key of PRAYER_KEYS) {
          const value = data.times[key];
          if (!value) continue;
          const [h, m] = value.split(":").map(Number);
          if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
          const when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
          const delay = when.getTime() - Date.now();
          if (delay <= 0 || delay > 8 * 60 * 60 * 1000) continue;
          timers.push(
            window.setTimeout(() => {
              const pn = prayerName(key, lang);
              showLocalNotification({
                title: lang === "bn" ? `${pn} এর ওয়াক্ত শুরু` : lang === "ur" ? `${pn} کا وقت شروع` : `${pn} time has begun`,
                body: lang === "bn" ? `${loc.city}-এ ${pn} এর সময় হয়েছে।` : lang === "ur" ? `${loc.city} میں ${pn} کا وقت ہو گیا ہے۔` : `${pn} time has started in ${loc.city}.`,
                url: "/prayer-times",
                tag: `prayer-${key}`,
              });
            }, delay)
          );
        }
      } catch {
        // Location or prayer API unavailable — skip reminders this session.
      }
    })();

    return () => {
      dead = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [enabled]);

  return null;
}
