/** Channel video shape + localized metadata formatting (shared by channel pages). */
import { localizeDigits, formatSecs } from "./audio";
import type { Lang } from "./i18n";

export interface ChannelVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  duration: number;
  views: number;
}

export function fmtDuration(seconds: number): string {
  return formatSecs(seconds);
}

export function fmtViews(views: number, lang: Lang = "bn"): string {
  if (!views || views <= 0) return "";
  if (views >= 1e6) {
    const value = localizeDigits(Number((views / 1e6).toFixed(1)), lang);
    return lang === "bn" ? `${value} মিলিয়ন ভিউ` : lang === "ur" ? `${value} ملین ویوز` : `${value}M views`;
  }
  if (views >= 1e3) {
    const value = localizeDigits(Number((views / 1e3).toFixed(1)), lang);
    return lang === "bn" ? `${value} হাজার ভিউ` : lang === "ur" ? `${value} ہزار ویوز` : `${value}K views`;
  }
  const value = localizeDigits(views, lang);
  return lang === "bn" ? `${value} ভিউ` : lang === "ur" ? `${value} ویوز` : `${value} views`;
}

export function fmtViewsBn(views: number): string {
  return fmtViews(views, "bn");
}

const UNITS: Record<Lang, Record<string, string>> = {
  bn: { second: "সেকেন্ড", minute: "মিনিট", hour: "ঘণ্টা", day: "দিন", week: "সপ্তাহ", month: "মাস", year: "বছর" },
  en: { second: "second", minute: "minute", hour: "hour", day: "day", week: "week", month: "month", year: "year" },
  ur: { second: "سیکنڈ", minute: "منٹ", hour: "گھنٹے", day: "دن", week: "ہفتے", month: "مہینے", year: "سال" },
};

/** "9 days ago" → localized relative label (InnerTube only exposes these). */
export function fmtPublished(label: string, lang: Lang = "bn"): string {
  if (!label) return "";
  const value = label.trim();
  const match = value.match(/(\d+(?:\.\d+)?)\s*(second|minute|hour|day|week|month|year)/i);
  if (match) {
    const key = match[2].toLowerCase();
    const n = Number(match[1]);
    const unit = UNITS[lang][key] ?? "";
    if (lang === "bn") return `${localizeDigits(n, lang)} ${unit} আগে`;
    if (lang === "ur") return `${localizeDigits(n, lang)} ${unit} پہلے`;
    return `${localizeDigits(n, lang)} ${unit}${n === 1 ? "" : "s"} ago`;
  }
  if (/streamed|premiere/i.test(value)) {
    return lang === "bn" ? "সম্প্রচারিত" : lang === "ur" ? "نشر شدہ" : "Streamed";
  }
  return "";
}

export function fmtPublishedBn(label: string): string {
  return fmtPublished(label, "bn");
}
