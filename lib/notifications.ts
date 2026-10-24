// Notification center — shared types, deep links, read state, and the events
// the header badge + service worker listen to.
import { localizeDigits } from "./audio";
import { storageGetJSON, storageSetJSON } from "./storage";
import type { Lang } from "./i18n";

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  type: string;
  targetId: string | number | null;
  createdAt: string;
}

export const NOTIF_READ_EVENT = "islah:notif-read";
const READ_KEY = "islah-notif-read";

export function parseNotifications(data: unknown): AppNotification[] {
  const raw = Array.isArray(data)
    ? data
    : ((data as { results?: unknown[] } | null)?.results ?? []);
  return (raw as Record<string, unknown>[])
    .filter((n) => n && typeof n === "object")
    .map((n) => ({
      id: Number(n.id) || 0,
      title: String(n.title ?? "").trim() || "নোটিফিকেশন",
      body: String(n.body ?? "").trim(),
      imageUrl: typeof n.imageUrl === "string" ? n.imageUrl : "",
      type: String(n.type ?? "general"),
      targetId: (n.targetId as string | number | null) ?? null,
      createdAt: String(n.createdAt ?? ""),
    }))
    .filter((n) => n.id > 0)
    .sort((a, b) => b.id - a.id);
}

const ICONS: Record<string, string> = {
  live: "radio",
  boayn: "mic",
  boyan: "mic",
  nasheed: "music",
  notice: "doc",
  general: "bell",
};

const TINTS: Record<string, string> = {
  live: "bg-rose-50 text-rose-500 dark:bg-rose-500/10",
  boayn: "bg-emerald-50 text-primary-600 dark:bg-emerald-500/10",
  boyan: "bg-emerald-50 text-primary-600 dark:bg-emerald-500/10",
  nasheed: "bg-amber-50 text-gold-600 dark:bg-amber-500/10",
  notice: "bg-sky-50 text-sky-600 dark:bg-sky-500/10",
  general: "bg-primary-50 text-primary-600 dark:bg-primary-500/10",
};

const TYPE_LABEL: Record<string, string> = {
  live: "লাইভ",
  boayn: "বয়ান",
  boyan: "বয়ান",
  nasheed: "হামদ-নাত",
  notice: "নোটিশ",
  general: "আপডেট",
};

export const notifIcon = (type: string): string => ICONS[type] ?? "bell";
export const notifTint = (type: string): string => TINTS[type] ?? TINTS.general;
export const notifTypeLabel = (type: string): string => TYPE_LABEL[type] ?? "আপডেট";

/** Where tapping a notification should take the user. */
export function notifHref(n: AppNotification): string | null {
  switch (n.type) {
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
      return null;
  }
}

const MONTHS: Record<Lang, string[]> = {
  bn: [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ur: [
    "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
    "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر",
  ],
};

/** Day bucket label for the feed ("Today", "Yesterday", or a local date). */
export function notifDay(iso: string, lang: Lang = "bn"): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return lang === "bn" ? "আগের" : lang === "ur" ? "پہلے" : "Earlier";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
  if (days <= 0) return lang === "bn" ? "আজ" : lang === "ur" ? "آج" : "Today";
  if (days === 1) return lang === "bn" ? "গতকাল" : lang === "ur" ? "گزشتہ کل" : "Yesterday";
  return `${localizeDigits(d.getDate(), lang)} ${MONTHS[lang][d.getMonth()]} ${localizeDigits(d.getFullYear(), lang)}`;
}

export function getReadIds(): Set<number> {
  return new Set(storageGetJSON<number[]>(READ_KEY, []));
}

export function markRead(ids: number[]): void {
  if (!ids.length) return;
  const merged = [...new Set([...getReadIds(), ...ids])].sort((a, b) => a - b).slice(-500);
  storageSetJSON(READ_KEY, merged);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTIF_READ_EVENT));
}

export function unreadCount(items: AppNotification[]): number {
  const read = getReadIds();
  return items.reduce((n, item) => (read.has(item.id) ? n : n + 1), 0);
}
