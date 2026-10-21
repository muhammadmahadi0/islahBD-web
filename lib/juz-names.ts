// The 30 ajzā' (পারা) with their traditional opening names — the same list
// used by the Madinah/Egyptian mushaf and quran.com — plus the verse each
// one starts at, so the reader can show a proper named list instead of bare
// numbers.

export type JuzName = {
  /** 1–30 */
  n: number;
  /** Bangla transliteration of the opening words. */
  bn: string;
  /** Opening words in Arabic. */
  ar: string;
  /** First verse of the para. */
  surah: number;
  ayah: number;
};

export const JUZ_NAMES: JuzName[] = [
  { n: 1, bn: "আলিফ লাম মীম", ar: "الم", surah: 1, ayah: 1 },
  { n: 2, bn: "সায়াকুল", ar: "سَيَقُولُ", surah: 2, ayah: 142 },
  { n: 3, bn: "তিলকাল রুসুল", ar: "تِلْكَ الرُّسُلُ", surah: 2, ayah: 253 },
  { n: 4, bn: "লান তানালু", ar: "لَنْ تَنَالُوا", surah: 3, ayah: 93 },
  { n: 5, bn: "ওয়াল মুহসানাত", ar: "وَالْمُحْصَنَاتُ", surah: 4, ayah: 24 },
  { n: 6, bn: "লা ইউহিব্বুল্লাহ", ar: "لَا يُحِبُّ اللَّهُ", surah: 4, ayah: 148 },
  { n: 7, bn: "ওয়া ইযা সামিউ", ar: "وَإِذَا سَمِعُوا", surah: 5, ayah: 82 },
  { n: 8, bn: "ওয়া লাও আন্না", ar: "وَلَوْ أَنَّنَا", surah: 6, ayah: 111 },
  { n: 9, bn: "কালাল মালাউ", ar: "قَالَ الْمَلَأُ", surah: 7, ayah: 88 },
  { n: 10, bn: "ওয়া'লামু", ar: "وَاعْلَمُوا", surah: 8, ayah: 41 },
  { n: 11, bn: "ইয়া'তাযিরুন", ar: "يَعْتَذِرُونَ", surah: 9, ayah: 93 },
  { n: 12, bn: "ওয়া মা মিন দাব্বাহ", ar: "وَمَا مِنْ دَابَّةٍ", surah: 11, ayah: 6 },
  { n: 13, bn: "ওয়া মা উবাররিউ", ar: "وَمَا أُبَرِّئُ", surah: 12, ayah: 53 },
  { n: 14, bn: "রুবামা", ar: "رُبَمَا", surah: 15, ayah: 1 },
  { n: 15, bn: "সুবহানাল্লাযি", ar: "سُبْحَانَ الَّذِي", surah: 17, ayah: 1 },
  { n: 16, bn: "কালা আলাম", ar: "قَالَ أَلَمْ", surah: 18, ayah: 75 },
  { n: 17, bn: "ইকতারাবা", ar: "اقْتَرَبَ لِلنَّاسِ", surah: 21, ayah: 1 },
  { n: 18, bn: "কাদ আফলাহা", ar: "قَدْ أَفْلَحَ", surah: 23, ayah: 1 },
  { n: 19, bn: "ওয়া কালাল্লাযিনা", ar: "وَقَالَ الَّذِينَ", surah: 25, ayah: 21 },
  { n: 20, bn: "আম্মান খালাকা", ar: "أَمَّنْ خَلَقَ", surah: 27, ayah: 56 },
  { n: 21, bn: "উতলু মা উহিয়া", ar: "اتْلُ مَا أُوحِيَ", surah: 29, ayah: 46 },
  { n: 22, bn: "ওয়া মান ইয়াকনুত", ar: "وَمَنْ يَقْنُتْ", surah: 33, ayah: 31 },
  { n: 23, bn: "ওয়া মা লিয়া", ar: "وَمَا لِيَ", surah: 36, ayah: 28 },
  { n: 24, bn: "ফামান আজলাম", ar: "فَمَنْ أَظْلَمُ", surah: 39, ayah: 32 },
  { n: 25, bn: "ইলাইহি ইউরাদ্দু", ar: "إِلَيْهِ يُرَدُّ", surah: 41, ayah: 47 },
  { n: 26, bn: "হা-মীম", ar: "حم", surah: 46, ayah: 1 },
  { n: 27, bn: "কালা ফামা খাতবুকুম", ar: "قَالَ فَمَا خَطْبُكُمْ", surah: 51, ayah: 31 },
  { n: 28, bn: "কাদ সামিআল্লাহ", ar: "قَدْ سَمِعَ اللَّهُ", surah: 58, ayah: 1 },
  { n: 29, bn: "তাবারাকাল্লাযি", ar: "تَبَارَكَ الَّذِي", surah: 67, ayah: 1 },
  { n: 30, bn: "আম্মা", ar: "عَمَّ", surah: 78, ayah: 1 },
];
