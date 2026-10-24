import { surahBn } from "./surah-names";

export interface QuranTopic {
  id: string;
  title: string;
  desc: string;
  titleEn: string;
  descEn: string;
  titleUr: string;
  descUr: string;
  /** Famous verse keys in this topic — verified standard references. */
  verses: string[];
}

// Topic categories mirror muslimbangla.com/quran?menu=topics; verse
// references are famous, standard ayahs (individually verifiable).
export const QURAN_TOPICS: QuranTopic[] = [
  {
    id: "akaid",
    title: "আকাঈদ",
    desc: "ঈমান ও আকীদার আয়াত",
    titleEn: "Aqidah",
    descEn: "Verses on faith and belief",
    titleUr: "عقیدہ",
    descUr: "ایمان اور عقیدے کی آیات",
    verses: ["112:1", "112:2", "112:3", "112:4", "2:255", "2:163", "59:22", "59:23", "59:24"],
  },
  {
    id: "islam-muslim",
    title: "ইসলাম ও মুসলিম",
    desc: "দ্বীন ও মুসলিম পরিচয়",
    titleEn: "Islam & Muslims",
    descEn: "Deen and Muslim identity",
    titleUr: "اسلام اور مسلمان",
    descUr: "دین اور مسلمانی کی پہچان",
    verses: ["3:19", "3:85", "5:3", "49:13", "2:208", "3:110"],
  },
  {
    id: "ahkam",
    title: "আহ্কাম",
    desc: "বিধি-বিধানের আয়াত",
    titleEn: "Ahkam",
    descEn: "Verses of rulings and laws",
    titleUr: "احکام",
    descUr: "احکام و قوانین کی آیات",
    verses: ["2:183", "2:184", "2:185", "2:43", "5:90", "17:23", "4:11"],
  },
  {
    id: "sristi",
    title: "সৃষ্টি",
    desc: "সৃষ্টিজগতের আয়াত",
    titleEn: "Creation",
    descEn: "Verses about the created universe",
    titleUr: "تخلیق",
    descUr: "کائنات کی تخلیق کے بارے میں آیات",
    verses: ["21:30", "67:3", "67:4", "88:17", "88:18", "88:19", "88:20", "41:53"],
  },
  {
    id: "itihas",
    title: "ইতিহাস",
    desc: "পূর্ববর্তীদের ঘটনা",
    titleEn: "History",
    descEn: "Accounts of earlier peoples",
    titleUr: "تاریخ",
    descUr: "پچھلی قوموں کے واقعات",
    verses: ["12:111", "20:99", "11:100", "40:21", "30:9"],
  },
  {
    id: "ambia",
    title: "আম্বিয়া আলাইহিমুস সালাম",
    desc: "নবীগণের ঘটনা",
    titleEn: "Prophets (peace be upon them)",
    descEn: "Stories of the prophets",
    titleUr: "انبیاء علیہم السلام",
    descUr: "نبیوں کے واقعات",
    verses: ["21:83", "21:87", "37:102", "19:41", "12:4", "20:11"],
  },
  {
    id: "ulumul-quran",
    title: "উলুমুল কুরআন",
    desc: "কুরআন সম্পর্কিত আয়াত",
    titleEn: "Ulum al-Quran",
    descEn: "Verses about the Quran",
    titleUr: "علوم القرآن",
    descUr: "قرآن سے متعلق آیات",
    verses: ["15:9", "17:82", "54:17", "39:23", "25:32"],
  },
];

export function topicSurahNames(ids: number[]): string {
  return ids
    .map((id) => surahBn(id))
    .filter(Boolean)
    .slice(0, 4)
    .join(" • ");
}
