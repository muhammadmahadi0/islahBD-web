// Prayer engine — ported from pray-bd (script.js), restyled for Islah.
// Aladhan API (method=1 Karachi, school=1 Hanafi) + IP geolocation +
// 24h caching + special morning periods + Hijri with BD moon adjustment.
import { storageGet, storageSet, storageSetJSON, storageGetJSON, safeStringStorage } from "./storage";

export interface City {
  key: string;
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { key: "dhaka", name: "Dhaka", nameBn: "ঢাকা", lat: 23.8103, lng: 90.4125 },
  { key: "chittagong", name: "Chittagong", nameBn: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832 },
  { key: "sylhet", name: "Sylhet", nameBn: "সিলেট", lat: 24.8995, lng: 91.8733 },
  { key: "khulna", name: "Khulna", nameBn: "খুলনা", lat: 22.8456, lng: 89.5403 },
  { key: "barisal", name: "Barisal", nameBn: "বরিশাল", lat: 22.701, lng: 90.3535 },
  { key: "rajshahi", name: "Rajshahi", nameBn: "রাজশাহী", lat: 24.3745, lng: 88.6042 },
  { key: "rangpur", name: "Rangpur", nameBn: "রংপুর", lat: 25.7439, lng: 89.2752 },
  { key: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203 },
];

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export const PRAYER_ORDER: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
export const PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export type Lang = "bn" | "ur" | "en";

const NAMES: Record<Lang, Record<PrayerKey, string>> = {
  bn: { fajr: "ফজর", sunrise: "সূর্যোদয়", dhuhr: "যোহর", asr: "আসর", maghrib: "মাগরিব", isha: "এশা" },
  en: { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
  ur: { fajr: "فجر", sunrise: "سورج طلوع", dhuhr: "ظہر", asr: "عصر", maghrib: "مغرب", isha: "عشاء" },
};

export const prayerName = (k: PrayerKey, lang: Lang) => NAMES[lang][k];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (v: string | number) =>
  String(v).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

export interface DetectedLocation {
  city: string;
  lat: number;
  lng: number;
  country: string;
  timezone: string;
  ip: string | null;
  detectedAt: number;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  /** Aladhan's sunset time; usually equal to Maghrib, but kept separate so
   *  the pre-Maghrib prohibition window can be shown when they differ. */
  sunset?: string;
}

export interface HijriInfo {
  day: string;
  monthNum: number;
  monthEn: string;
  year: string;
}

/** IP geolocation: re-checked on every load (no stale cache).
 * ipapi.co → ip-api.com → cached value → Dhaka. Cached copy is only a
 * fallback when both providers fail, and is refreshed on every success. */
export async function detectLocation(): Promise<DetectedLocation> {
  const KEY = "praybd-detected-location";
  const withTimeout = async (url: string, ms = 8000) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      return await fetch(url, { signal: ctl.signal });
    } finally {
      clearTimeout(t);
    }
  };
  const readCache = (): DetectedLocation | null => {
    try {
      const cached = storageGet(KEY);
      if (!cached) return null;
      const p = JSON.parse(cached);
      if (p && p.detectedAt) return p;
    } catch {
      safeStringStorage.removeItem(KEY);
    }
    return null;
  };
  const fallback: DetectedLocation = {
    city: "Dhaka", lat: 23.8103, lng: 90.4125, country: "BD",
    timezone: "Asia/Dhaka", ip: null, detectedAt: Date.now(),
  };
  try {
    const r = await withTimeout("https://ipapi.co/json/");
    if (r.ok) {
      const d = await r.json();
      const loc: DetectedLocation = {
        city: d.city || "Dhaka", lat: d.latitude || 23.8103, lng: d.longitude || 90.4125,
        country: d.country_code || "BD", timezone: d.timezone || "Asia/Dhaka",
        ip: d.ip || null, detectedAt: Date.now(),
      };
      storageSetJSON(KEY, loc);
      return loc;
    }
  } catch {}
  try {
    const r = await withTimeout("https://ip-api.com/json");
    if (r.ok) {
      const d = await r.json();
      if (d.status === "success") {
        const loc: DetectedLocation = {
          city: d.city || "Dhaka", lat: d.lat || 23.8103, lng: d.lon || 90.4125,
          country: d.countryCode || "BD", timezone: d.timezone || "Asia/Dhaka",
          ip: d.query || null, detectedAt: Date.now(),
        };
        storageSetJSON(KEY, loc);
        return loc;
      }
    }
  } catch {}
  return readCache() || fallback;
};

/** Match a detected city name to one of the 8 options (pray-bd logic). */
export function matchCity(detectedCity: string | undefined): string {
  if (!detectedCity) return "dhaka";
  const c = detectedCity.toLowerCase();
  if (["mirpur", "gazipur", "uttara", "savar", "tongi", "narayanganj", "keraniganj"].some((a) => c.includes(a))) return "dhaka";
  if (["sylhet", "zindabazar"].some((a) => c.includes(a))) return "sylhet";
  if (c.includes("chattogram") || c.includes("chittagong")) return "chittagong";
  for (const city of CITIES) {
    if (c === city.key || c === city.name.toLowerCase()) return city.key;
  }
  for (const city of CITIES) {
    if (city.name.toLowerCase().includes(c) || c.includes(city.name.toLowerCase())) return city.key;
  }
  return "dhaka";
}

function dateStr(d: Date): string {
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

/** Seasonal Bangladesh fallback (Hanafi) when offline — pray-bd values. */
export function fallbackTimes(month: number): PrayerTimes {
  const summer = month >= 4 && month <= 9;
  return {
    fajr: summer ? "04:30" : "04:50",
    sunrise: summer ? "05:15" : "05:35",
    dhuhr: "12:00",
    asr: summer ? "15:45" : "16:00",
    maghrib: summer ? "18:30" : "18:10",
    isha: summer ? "19:45" : "19:30",
  };
}

export interface PrayerData {
  times: PrayerTimes;
  hijri: HijriInfo | null;
  offline: boolean;
}

/** Fetch Aladhan timings (via /api/prayer proxy) with 24h local cache. */
export async function fetchPrayerData(lat: number, lng: number, force = false): Promise<PrayerData> {
  const now = new Date();
  const ds = dateStr(now);
  const key = `prayertimes-${lat.toFixed(2)}-${lng.toFixed(2)}-${ds}`;
  if (!force) {
    const cached = storageGet(key);
    if (cached) {
      try {
        const p = JSON.parse(cached);
        if (p.date === ds && Date.now() - p.timestamp < 24 * 3600 * 1000) {
          return { times: p.times, hijri: p.hijri || null, offline: false };
        }
      } catch {
        safeStringStorage.removeItem(key);
      }
    }
  }
  try {
    const res = await fetch(`/api/prayer?lat=${lat}&lng=${lng}&date=${ds}`);
    const data = await res.json();
    if (!data.success) throw new Error("api");
    const out: PrayerData = { times: data.times, hijri: data.hijri || null, offline: false };
    try {
      storageSetJSON(key, { date: ds, times: out.times, hijri: out.hijri, timestamp: Date.now() });
    } catch {}
    return out;
  } catch {
    return { times: fallbackTimes(now.getMonth() + 1), hijri: null, offline: true };
  }
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** "HH:MM" plus N minutes (wraps past midnight). */
export function addMinutes(t: string, mins: number): string {
  const total = ((toMinutes(t) + mins) % 1440 + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface NaflWindows {
  ishraqStart: string;
  ishraqEnd: string;
  chashtStart: string;
  chashtEnd: string;
}

/** Morning nafl windows from pray-bd: prohibited sunrise+15, then
 *  Ishraq (+2h), then Chasht until Dhuhr−10. */
export function getNaflWindows(times: PrayerTimes): NaflWindows | null {
  if (!times.sunrise || !times.dhuhr) return null;
  const sunriseEnd = addMinutes(times.sunrise, 15);
  const ishraqEnd = addMinutes(sunriseEnd, 120);
  const chashtEnd = addMinutes(times.dhuhr, -10);
  return { ishraqStart: sunriseEnd, ishraqEnd, chashtStart: ishraqEnd, chashtEnd };
}

/** 12-hour display with Bengali digits/AM-PM in BN mode. */
export function formatTime12(t: string, lang: Lang): string {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  const s = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (lang === "bn") return toBn(s).replace("AM", "এ এম").replace("PM", "পি এম");
  return s;
}

export function formatCountdown(h: number, m: number, s: number, lang: Lang): string {
  const p = (n: number) => String(Math.floor(n)).padStart(2, "0");
  const str = `${p(h)}:${p(m)}:${p(s)}`;
  return lang === "bn" ? toBn(str) : str;
}

export interface SpecialPeriod {
  type: "prohibited" | "ishraq" | "chasht";
  labelBn: string;
  labelEn: string;
  labelUr: string;
  remainSec: number;
  isRed: boolean;
}

/** Morning nafl windows: sunrise prohibited (RED) → Ishraq → Chasht. */
export function getSpecialPeriod(times: PrayerTimes, now: Date): SpecialPeriod | null {
  if (!times.sunrise || !times.dhuhr) return null;
  const cm = now.getHours() * 60 + now.getMinutes();
  const cs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const sun = toMinutes(times.sunrise);
  const dhuhr = toMinutes(times.dhuhr);
  const sunriseEnd = sun + 15;
  const ishraqEnd = sunriseEnd + 120;
  const chashtEnd = dhuhr - 10;
  if (cm >= sun && cm < sunriseEnd) {
    return { type: "prohibited", labelBn: "সূর্যোদয় (নিষিদ্ধ)", labelEn: "Sunrise (prohibited)", labelUr: "سورج طلوع (ممنوع)", remainSec: (sunriseEnd * 60 - cs + 86400) % 86400, isRed: true };
  }
  if (cm >= sunriseEnd && cm < ishraqEnd) {
    return { type: "ishraq", labelBn: "ইশরাক", labelEn: "Ishraq", labelUr: "اشراق", remainSec: (chashtEnd * 60 - cs + 86400) % 86400, isRed: false };
  }
  if (cm >= ishraqEnd && cm < chashtEnd) {
    return { type: "chasht", labelBn: "চাশত", labelEn: "Chasht", labelUr: "چاشت", remainSec: (chashtEnd * 60 - cs + 86400) % 86400, isRed: false };
  }
  return null;
}

export interface NextInfo {
  key: PrayerKey;
  time: string;
  isTomorrow: boolean;
}

/** Next upcoming prayer; wraps to tomorrow's Fajr. */
export function getNextPrayer(times: PrayerTimes, now: Date): NextInfo {
  const cm = now.getHours() * 60 + now.getMinutes();
  for (const k of PRAYER_KEYS) {
    if (times[k] && cm < toMinutes(times[k])) return { key: k, time: times[k], isTomorrow: false };
  }
  return { key: "fajr", time: times.fajr, isTomorrow: true };
}

/** Current prayer = last one whose time arrived (Isha extends to Fajr). */
export function getCurrentKey(times: PrayerTimes, now: Date): PrayerKey {
  const cm = now.getHours() * 60 + now.getMinutes();
  let cur: PrayerKey = "isha";
  for (const k of PRAYER_KEYS) {
    if (times[k] && cm >= toMinutes(times[k])) cur = k;
  }
  return cur;
}

/** Seconds until a "HH:MM" time (rolls to tomorrow). */
export function secsUntil(time: string, now: Date, isTomorrow = false): number {
  const [h, m] = time.split(":").map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (isTomorrow || t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return Math.max(0, Math.floor((t.getTime() - now.getTime()) / 1000));
}

/** Aladhan Umm al-Qura Hijri minus 1 day for BD moon sighting. */
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qidah", "Dhu al-Hijjah",
];
const HIJRI_LEN = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

export const HIJRI_BN: Record<string, string> = {
  Muharram: "মুহাররম", Safar: "সফর", "Rabi al-Awwal": "রবিউল আউয়াল",
  "Rabi al-Thani": "রবিউস সানি", "Jumada al-Awwal": "জুমাদাল উলা",
  "Jumada al-Thani": "জুমাদাস সানিয়া", Rajab: "রজব", "Sha'ban": "শাবান",
  Ramadan: "রমজান", Shawwal: "শাওয়াল", "Dhu al-Qidah": "জিলকদ",
  "Dhu al-Hijjah": "জিলহজ",
};

export function adjustHijri(h: HijriInfo): { day: number; month: string; year: string } {
  // Map by month number — Aladhan month names carry diacritics
  // ("Jumādá al-ūlá") that don't match plain-English keys.
  const idx0 = (h.monthNum || HIJRI_MONTHS.indexOf(h.monthEn) + 1 || 1) - 1;
  let day = parseInt(h.day) - 1;
  let month = HIJRI_MONTHS[Math.max(0, Math.min(11, idx0))];
  let year = h.year;
  if (day < 1) {
    const idx = HIJRI_MONTHS.indexOf(month);
    if (idx > 0) month = HIJRI_MONTHS[idx - 1];
    else {
      month = "Dhu al-Hijjah";
      year = String(Number(year) - 1);
    }
    day = HIJRI_LEN[HIJRI_MONTHS.indexOf(month)] || 30;
  }
  return { day, month, year };
}

export function hijriText(h: HijriInfo | null, lang: Lang): string {
  if (h) {
    const a = adjustHijri(h);
    const month = lang === "bn" ? HIJRI_BN[a.month] || a.month : lang === "ur" ? HIJRI_UR[a.month] || a.month : a.month;
    const day = lang === "bn" ? toBn(a.day) : a.day;
    const suffix = lang === "bn" ? "হিজরি" : lang === "ur" ? "ہجری" : "AH";
    return `${day} ${month}, ${lang === "bn" ? toBn(a.year) : a.year} ${suffix}`;
  }
  try {
    const s = new Intl.DateTimeFormat(lang === "bn" ? "bn-BD-u-ca-islamic-umalqura" : "en-u-ca-islamic-umalqura", {
      day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
    return s;
  } catch {
    return "";
  }
}

export const HIJRI_UR: Record<string, string> = {
  Muharram: "محرم", Safar: "صفر", "Rabi al-Awwal": "ربیع الاول",
  "Rabi al-Thani": "ربیع الثانی", "Jumada al-Awwal": "جمادی الاول",
  "Jumada al-Thani": "جمادی الثانی", Rajab: "رجب", "Sha'ban": "شعبان",
  Ramadan: "رمضان", Shawwal: "شوال", "Dhu al-Qidah": "ذیقعد",
  "Dhu al-Hijjah": "ذیالحج",
};

const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export function gregorianText(lang: Lang, d = new Date()): string {
  if (lang === "bn") return `${BN_DAYS[d.getDay()]}, ${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}`;
  if (lang === "ur") return d.toLocaleDateString("ur-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
