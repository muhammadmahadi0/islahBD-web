/** Channel video shape + Bengali formatting (shared by the channel pages). */
import { bnNum, formatSecs } from "./audio";

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

export function fmtViewsBn(views: number): string {
  if (!views || views <= 0) return "";
  if (views >= 1e6) return `${bnNum(Number((views / 1e6).toFixed(1)))} মিলিয়ন ভিউ`;
  if (views >= 1e3) return `${bnNum(Number((views / 1e3).toFixed(1)))} হাজার ভিউ`;
  return `${bnNum(views)} ভিউ`;
}

const UNITS: [RegExp, string][] = [
  [/second/i, "সেকেন্ড"],
  [/minute/i, "মিনিট"],
  [/hour/i, "ঘণ্টা"],
  [/day/i, "দিন"],
  [/week/i, "সপ্তাহ"],
  [/month/i, "মাস"],
  [/year/i, "বছর"],
];

/** "9 days ago" → "৯ দিন আগে" (InnerTube only exposes relative labels). */
export function fmtPublishedBn(label: string): string {
  if (!label) return "";
  const value = label.trim();
  const match = value.match(/(\d+(?:\.\d+)?)\s*(second|minute|hour|day|week|month|year)/i);
  if (match) {
    const unit = UNITS.find(([re]) => re.test(match[2]))?.[1] ?? "";
    return `${bnNum(Number(match[1]))} ${unit} আগে`;
  }
  if (/streamed|premiere/i.test(value)) return "সম্প্রচারিত";
  return "";
}
