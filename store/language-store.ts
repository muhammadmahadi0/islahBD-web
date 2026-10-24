import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStringStorage } from "../lib/storage";
import { translate, tx, type Lang, type TKey } from "../lib/i18n";
import { toBn } from "../lib/prayer";
import { timeAgo } from "../lib/audio";

// UI language, persisted as `islah-language`. Default stays Bengali; the
// pre-paint script in app/layout.tsx sets lang before first render.
//
// Layout stays left-to-right in every language (including Urdu) so the app
// shell, navigation and card structure do not mirror. Urdu runs still render
// right-to-left through Unicode bidi; only the surrounding layout direction
// is fixed.
interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const DOC_TITLES: Record<Lang, string> = {
  bn: "islah - দ্বীনি জীবনের সাথী",
  en: "Islah — Companion for Deen",
  ur: "اصلاح — دینی زندگی کا ساتھی",
};
const DOC_DESCRIPTIONS: Record<Lang, string> = {
  bn: "IslahBD ওয়েব: কুরআন, নামাজের সময়, কিবলা, তাসবীহ, দোআ, বয়ান, হামদ-নাত, হজ-ওমরাহ, লাইভ বয়ান, লাইব্রেরি ও আরও অনেক কিছু।",
  en: "IslahBD: Quran, prayer times, qibla, tasbeeh, duas, bayans, hamd and naat, Hajj & Umrah, live bayans, library and more.",
  ur: "اصلاح بی ڈی: قرآن، نماز کے اوقات، قبلہ، تسبیح، دعائیں، بیانات، حمد و نعت، حج و عمرہ، لائیو بیانات، لائبریری اور بہت کچھ۔",
};

export function applyLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
  document.documentElement.classList.toggle("lang-ur", lang === "ur");
  document.title = DOC_TITLES[lang];
  document.querySelector('meta[name="description"]')?.setAttribute("content", DOC_DESCRIPTIONS[lang]);
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: "bn",
      setLang: (lang) => {
        applyLang(lang);
        set({ lang });
      },
    }),
    {
      name: "islah-language",
      storage: createJSONStorage(() => safeStringStorage),
      // Hydrate after mount (AppShell) so SSR and the first client render
      // match; the pre-paint script already applied lang/dir to <html>.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        applyLang(state?.lang ?? "bn");
      },
    }
  )
);

/** Current UI language. */
export function useLang() {
  return useLanguageStore((s) => s.lang);
}

/** Format digits for the current language (Bangla digits in bn mode). */
export function useNum() {
  const lang = useLanguageStore((s) => s.lang);
  return (n: number | string) => (lang === "bn" ? toBn(n) : String(n));
}

/** Translate helper bound to the current UI language. */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (key: TKey) => translate(lang, key);
}

/** Translate arbitrary Bengali UI copy (Bengali-keyed UI map). */
export function useTx() {
  const lang = useLanguageStore((s) => s.lang);
  return (bn: string) => tx(lang, bn);
}

/** Localized relative-time formatter ("3 days ago", "٣ دن پہلے"). */
export function useTimeAgo() {
  const lang = useLanguageStore((s) => s.lang);
  return (iso: string) => timeAgo(iso, lang);
}
