// quran.com API v4 integration (https://api.quran.com/api/v4).
// Keyless + CORS-open; proxied through /api/quran/* for caching.

export const QURAN_API = "https://api.quran.com/api/v4";

export interface QuranTranslation {
  id: number;
  label: string;
  author: string;
}

// Bengali translations (verified via /resources/translations)
export const BN_TRANSLATIONS: QuranTranslation[] = [
  { id: 161, label: "তাইসিরুল কুরআন", author: "তাওহীদ পাবলিকেশন্স" },
  { id: 163, label: "শাইখ মুজিবুর রহমান", author: "দারুসসালাম" },
  { id: 162, label: "রাওয়াই আল-বায়ান", author: "বায়ান ফাউন্ডেশন" },
  { id: 213, label: "ড. আবু বকর যাকারিয়া", author: "কিং ফাহদ কমপ্লেক্স" },
];

export interface QuranTafsir {
  id: number;
  label: string;
}

// Bengali tafsirs (verified via /resources/tafsirs)
export const BN_TAFSIRS: QuranTafsir[] = [
  { id: 165, label: "তাফসীর আহসানুল বায়ান" },
  { id: 166, label: "তাফসীর আবু বকর যাকারিয়া" },
  { id: 381, label: "তাফসীর ফাতহুল মাজীদ" },
];

export interface QuranChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: { language_name: string; name: string };
  verses_count: number;
  revelation_place: string;
}

export interface QuranReciter {
  id: number;
  reciter_name: string;
  style: string | null;
}

export function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/** Word-by-word clip path.
 *
 *  quran.com's own `word.audio_url` counts every waqf mark as an extra clip,
 *  so after a pause sign it points one file too far — and the last words of
 *  such verses point past the end of the dataset (404, so they play nothing).
 *  The wbw clips are actually numbered by word position: SSS_AAA_PPP for the
 *  PPP-th word of S:A. Verified against all 77,429 words in the Qur'an. */
export function wbwAudioUrl(verseKey: string, position: number): string {
  const [surah, ayah] = String(verseKey || "").split(":").map(Number);
  if (!surah || !ayah || !position) return "";
  const p = (n: number) => String(n).padStart(3, "0");
  return `wbw/${p(surah)}_${p(ayah)}_${p(position)}.mp3`;
}

/** Rewrite quran.com's drifted word audio URLs to the position-numbered set. */
export function fixWordAudio<T extends { verse_key?: string; words?: any[] }>(verse: T): T {
  if (!verse?.words?.length) return verse;
  return {
    ...verse,
    words: verse.words.map((w) =>
      w?.char_type_name === "word" && w.position
        ? { ...w, audio_url: wbwAudioUrl(verse.verse_key || w.verse_key || "", w.position) }
        : w
    ),
  };
}

