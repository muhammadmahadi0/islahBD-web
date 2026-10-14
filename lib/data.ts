import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "public", "data");
const cache = new Map<string, any>();

export function readData<T = any>(file: string): T {
  if (cache.has(file)) return cache.get(file);
  const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
  const json = JSON.parse(raw);
  cache.set(file, json);
  return json;
}

export type Category = { id: string; title: string; items: any[]; [k: string]: any };
export type FeatureModule = {
  id: string; title: string; description?: string; categories: Category[];
  [k: string]: any;
};

export function featureModule(file: string): FeatureModule {
  return readData<FeatureModule>(file);
}

// Quran DB: [{number, surahNumber, surahName, surahEnglish, numberInSurah, text, translation, page, juz}]
export type Ayah = {
  number: number; surahNumber: number; surahName: string; surahEnglish: string;
  numberInSurah: number; text: string; translation: string; page: number; juz: number;
};

export function quranDb(): Ayah[] {
  return readData<Ayah[]>("quran_database.json");
}

export function surahIndex() {
  const db = quranDb();
  const map = new Map<number, { surahNumber: number; name: string; english: string; ayahs: Ayah[] }>();
  for (const a of db) {
    if (!map.has(a.surahNumber))
      map.set(a.surahNumber, { surahNumber: a.surahNumber, name: a.surahName, english: a.surahEnglish, ayahs: [] });
    map.get(a.surahNumber)!.ayahs.push(a);
  }
  return [...map.values()].sort((x, y) => x.surahNumber - y.surahNumber);
}

export function ayahsOfSurah(n: number): Ayah[] {
  return quranDb().filter((a) => a.surahNumber === n);
}
