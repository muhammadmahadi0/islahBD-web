import { surahBn } from "./surah-names";

export interface QuranTopic {
  id: string;
  title: string;
  desc: string;
  surahs: number[];
}

// Curated topic groups (well-known virtues and everyday use).
export const QURAN_TOPICS: QuranTopic[] = [
  {
    id: "fazilat",
    title: "ফজিলতপূর্ণ সূরা",
    desc: "বিশেষ সওয়াবের সূরাসমূহ",
    surahs: [36, 67, 18, 55, 56, 44, 32, 62],
  },
  {
    id: "namaz",
    title: "নামাজের সূরা",
    desc: "নামাজে পড়ার ছোট সূরা",
    surahs: [1, 103, 105, 106, 107, 108, 112, 113, 114],
  },
  {
    id: "sokal-sondha",
    title: "সকাল-সন্ধ্যার আমল",
    desc: "সকাল-সন্ধ্যায় পড়ার সূরা",
    surahs: [112, 113, 114, 36, 67],
  },
  {
    id: "ghum",
    title: "ঘুমানোর আগের সূরা",
    desc: "ঘুমের আগে পড়ার আমল",
    surahs: [67, 32, 112, 113, 114],
  },
  {
    id: "juma",
    title: "জুমার দিনের সূরা",
    desc: "জুমাবারে পড়ার সূরা",
    surahs: [18, 62],
  },
  {
    id: "shifa",
    title: "শিফা ও রুকইয়ার সূরা",
    desc: "ঝাড়ফুঁক ও শিফার সূরা",
    surahs: [1, 2, 112, 113, 114],
  },
];

export function topicSurahNames(ids: number[]): string {
  return ids
    .map((id) => surahBn(id))
    .filter(Boolean)
    .slice(0, 4)
    .join(" • ");
}
