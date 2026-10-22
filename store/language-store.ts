import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStringStorage } from "../lib/storage";
import { LANGUAGES, translate, type Lang, type TKey } from "../lib/i18n";

// UI language, persisted as `islah-language`. Default stays Bengali; the
// pre-paint script in app/layout.tsx sets lang/dir before first render so
// there is no LTR→RTL flash for Urdu.
interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

function applyLang(lang: Lang) {
  if (typeof document === "undefined") return;
  const dir = LANGUAGES.find((l) => l.id === lang)?.dir ?? "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.documentElement.classList.toggle("lang-ur", lang === "ur");
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

/** Translate helper bound to the current UI language. */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (key: TKey) => translate(lang, key);
}
