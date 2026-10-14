export const API_BASE = "https://api.islahbd.com";
export const APP_ID = "com.islahbd.app";
export const APP_VERSION = "1.3.0";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// Mirrors package:islahbd/services/api_client.dart + api_config.dart
export const endpoints = {
  books: "/api/books/",
  hiddenBooks: "/api/hidden-books/",
  audios: "/api/audios/",
  videos: "/api/videos/?ordering=-createdAt",
  clips: "/api/clips/?ordering=-createdAt",
  nasheeds: "/api/nasheeds/?ordering=-createdAt",
  gallery: "/api/gallery-albums/?ordering=-createdAt",
  wallpapers: "/api/wallpapers/?ordering=-createdAt",
  notices: "/api/notices/?ordering=-date",
  notifications: "/api/notifications/",
  liveStatus: "/api/live/status/",
  nextBoyan: "/api/live/next-boyan/",
  recurringMajlis: "/api/live/recurring-majlis/?ordering=order",
  malfuzat: "/api/malfuzat/?ordering=-createdAt",
  malfuzatConfig: "/api/malfuzat/config/",
  purification: "/api/self-purification/",
  fatwa: "/api/fatwa/",
  fatwaAsk: "/api/fatwa/ask/",
  fatwaCats: "/api/fatwa-categories/",
  paribarApply: "/api/paribar/apply/",
  categories: "/api/categories/?ordering=order",
  tawzihulTafsir: "/api/quran/tafseer/tawzihul/",
  tawzihulTranslation: "/api/quran/translations/tawzihul/",
};
