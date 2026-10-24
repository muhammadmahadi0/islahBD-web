// Islamic (Hijri) + Bengali (Bangla) calendar math for /calendar.
//
// Hijri: Umm al-Qura via Intl, shifted back one day to match the BD
// moon-sighting convention used by lib/prayer.ts (Aladhan − 1 day). A tabular
// arithmetic fallback covers engines without the Islamic calendar.
//
// Bangla: Bangla Academy 2019 reform — Boishakh..Ashwin 31 days,
// Kartik..Magh 30, Falgun 29 (30 in a Gregorian leap year), Choitro 30,
// Pohela Boishakh = 14 April, Bangla year = Gregorian start year − 593.

export const DAY_MS = 86_400_000;

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBn = (v: string | number) =>
  String(v).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

/** Timezone-stable day ordinal (local calendar day; immune to DST). */
export const dayNumber = (d: Date) =>
  Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const sameDay = (a: Date, b: Date) => dayNumber(a) === dayNumber(b);

/* ------------------------------------------------------------------ Hijri */

export type HijriDate = { year: number; month: number; day: number }; // month 1..12

export const HIJRI_MONTHS = [
  { bn: "মুহাররম", en: "Muharram", ar: "ٱلْمُحَرَّم" },
  { bn: "সফর", en: "Safar", ar: "صَفَر" },
  { bn: "রবিউল আউয়াল", en: "Rabi al-Awwal", ar: "رَبِيعُ الْأَوَّلِ" },
  { bn: "রবিউস সানি", en: "Rabi al-Thani", ar: "رَبِيعُ الْآخِرِ" },
  { bn: "জুমাদাল উলা", en: "Jumada al-Awwal", ar: "جُمَادَى الْأُولَى" },
  { bn: "জুমাদাস সানি", en: "Jumada al-Thani", ar: "جُمَادَى الْآخِرَة" },
  { bn: "রজব", en: "Rajab", ar: "رَجَب" },
  { bn: "শাবান", en: "Sha'ban", ar: "شَعْبَان" },
  { bn: "রমযান", en: "Ramadan", ar: "رَمَضَان" },
  { bn: "শাওয়াল", en: "Shawwal", ar: "شَوَّال" },
  { bn: "জিলকদ", en: "Dhu al-Qidah", ar: "ذُو الْقَعْدَة" },
  { bn: "জিলহজ", en: "Dhu al-Hijjah", ar: "ذُو الْحِجَّة" },
] as const;

let hijriFmt: Intl.DateTimeFormat | null | undefined;

function getFormatter(): Intl.DateTimeFormat | null {
  if (hijriFmt !== undefined) return hijriFmt;
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    // Some engines silently fall back to the Gregorian calendar — probe it.
    const probe = fmt.formatToParts(new Date(2024, 3, 14));
    const year = Number(probe.find((p) => p.type === "year")?.value.replace(/[^\d]/g, ""));
    hijriFmt = year > 1350 && year < 1600 ? fmt : null;
  } catch {
    hijriFmt = null;
  }
  return hijriFmt;
}

/** Tabular (arithmetic) Islamic calendar — rarely used fallback. */
function tabularHijri(d: Date): HijriDate {
  const jd = dayNumber(d) + 2440588;
  let l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  l0 = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l0) / 5316) * Math.floor((50 * l0) / 17719) +
    Math.floor(l0 / 5670) * Math.floor((43 * l0) / 15238);
  l0 =
    l0 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l0) / 709);
  const day = l0 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

/** Hijri date for a Gregorian day, adjusted to the BD moon sighting. */
export function hijriFromDate(date: Date): HijriDate {
  const d = addDays(date, -1);
  const fmt = getFormatter();
  if (fmt) {
    const parts = fmt.formatToParts(d);
    const num = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? parseInt(part.value.replace(/[^\d]/g, ""), 10) : NaN;
    };
    const year = num("year");
    const month = num("month");
    const day = num("day");
    if (year > 0 && month > 0 && day > 0) return { year, month, day };
  }
  return tabularHijri(d);
}

const HIJRI_EPOCH = new Date(622, 6, 19); // 1 Muharram 1 AH

/** First Gregorian day of a Hijri month. */
export function hijriMonthStart(year: number, month: number): Date {
  const target = (year - 1) * 12 + (month - 1);
  let d = addDays(HIJRI_EPOCH, Math.round(target * 29.530588));
  for (let i = 0; i < 40; i += 1) {
    const h = hijriFromDate(d);
    const ord = (h.year - 1) * 12 + (h.month - 1);
    if (ord === target && h.day === 1) return startOfDay(d);
    if (ord === target) {
      d = addDays(d, 1 - h.day);
      continue;
    }
    d = addDays(d, ord < target ? 15 : -15);
  }
  return startOfDay(d);
}

export interface HijriMonthMeta {
  start: Date;
  days: number;
  /** Monday-first weekday index of the 1st (0 = Monday). */
  lead: number;
}

export function hijriMonthMeta(year: number, month: number): HijriMonthMeta {
  const start = hijriMonthStart(year, month);
  const next = month === 12 ? hijriMonthStart(year + 1, 1) : hijriMonthStart(year, month + 1);
  const days = Math.round((dayNumber(next) - dayNumber(start)) / 1);
  return { start, days, lead: (start.getDay() + 6) % 7 };
}

export const nextHijriMonth = (y: number, m: number) =>
  m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 };

export const prevHijriMonth = (y: number, m: number) =>
  m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 };

/* ----------------------------------------------------------------- Bangla */

export type BanglaDate = { year: number; month: number; day: number }; // month 0..11

export const BANGLA_MONTHS = [
  { bn: "বৈশাখ", en: "Boishakh", ur: "بیشاکھ" },
  { bn: "জ্যৈষ্ঠ", en: "Jyoishtho", ur: "جیٹھ" },
  { bn: "আষাঢ়", en: "Ashar", ur: "آسرھ" },
  { bn: "শ্রাবণ", en: "Srabon", ur: "سراون" },
  { bn: "ভাদ্র", en: "Bhadro", ur: "بھادر" },
  { bn: "আশ্বিন", en: "Ashwin", ur: "آشون" },
  { bn: "কার্তিক", en: "Kartik", ur: "کاتک" },
  { bn: "অগ্রহায়ণ", en: "Ogrohayon", ur: "اگرہاین" },
  { bn: "পৌষ", en: "Poush", ur: "پوس" },
  { bn: "মাঘ", en: "Magh", ur: "ماگھ" },
  { bn: "ফাল্গুন", en: "Falgun", ur: "فالگن" },
  { bn: "চৈত্র", en: "Choitro", ur: "چیت" },
] as const;

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const banglaLengths = (startYear: number) => [
  31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear(startYear + 1) ? 30 : 29, 30,
];

export function banglaFromDate(date: Date): BanglaDate {
  const d = startOfDay(date);
  let startYear = d.getFullYear();
  if (d.getTime() < new Date(startYear, 3, 14).getTime()) startYear -= 1;
  const start = new Date(startYear, 3, 14);
  const year = startYear - 593;
  const lengths = banglaLengths(startYear);
  let offset = dayNumber(d) - dayNumber(start);
  let month = 0;
  while (month < 11 && offset >= lengths[month]) {
    offset -= lengths[month];
    month += 1;
  }
  return { year, month, day: offset + 1 };
}

/** Gregorian day on which a Bangla month begins. */
export function banglaMonthStart(year: number, month: number): Date {
  const startYear = year + 593;
  const start = new Date(startYear, 3, 14);
  const lengths = banglaLengths(startYear);
  let offset = 0;
  for (let i = 0; i < month; i += 1) offset += lengths[i];
  return addDays(start, offset);
}

/* ------------------------------------------------------------- formatting */

export const GREG_MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export const WEEKDAYS_BN = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
export const WEEKDAYS_SHORT_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
export const WEEKDAYS_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const gregorianLong = (d: Date) =>
  `${toBn(d.getDate())} ${GREG_MONTHS_BN[d.getMonth()]} ${toBn(d.getFullYear())}`;

export const gregorianFull = (d: Date) =>
  `${gregorianLong(d)}, ${WEEKDAYS_BN[d.getDay()]}`;

export const hijriText = (h: HijriDate) =>
  `${toBn(h.day)} ${HIJRI_MONTHS[h.month - 1].bn} ${toBn(h.year)} হিজরী`;

export function banglaText(b: BanglaDate, lang: "bn" | "ur" | "en" = "bn"): string {
  if (lang === "bn") {
    return `${toBn(b.day)} ${BANGLA_MONTHS[b.month].bn}, ${toBn(b.year)}`;
  }
  const month = lang === "ur" ? BANGLA_MONTHS[b.month].ur : BANGLA_MONTHS[b.month].en;
  return `${b.day} ${month}, ${b.year}`;
}

/** Gregorian span of a Hijri month, e.g. "১৩ অক্টোবর – ১০ নভেম্বর ২০২৬". */
export function gregorianRange(start: Date, days: number): string {
  const end = addDays(start, Math.max(0, days - 1));
  const head = `${toBn(start.getDate())} ${GREG_MONTHS_BN[start.getMonth()]}`;
  const tail = `${toBn(end.getDate())} ${GREG_MONTHS_BN[end.getMonth()]} ${toBn(end.getFullYear())}`;
  return start.getFullYear() === end.getFullYear()
    ? `${head} – ${tail}`
    : `${head} ${toBn(start.getFullYear())} – ${tail}`;
}
