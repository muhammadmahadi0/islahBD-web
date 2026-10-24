import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStringStorage } from "../lib/storage";

// Theme preference, persisted as `islah-theme`. "system" follows the OS
// setting and is the default until the user explicitly picks light or dark.
export type Theme = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
    return "light";
  }
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? systemTheme() : theme;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
}

function normalizeTheme(value: unknown): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        if (get().theme === theme) {
          applyTheme(theme);
          return;
        }
        applyTheme(theme);
        set({ theme });
      },
      toggle: () => {
        const next: Theme = resolveTheme(get().theme) === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "islah-theme",
      storage: createJSONStorage(() => safeStringStorage),
      onRehydrateStorage: () => (state) => {
        applyTheme(normalizeTheme(state?.theme));
      },
    }
  )
);

/**
 * The theme currently painted on screen. While the preference is "system",
 * this tracks live OS changes so settings can show the correct icon/label.
 */
export function useResolvedTheme(): ResolvedTheme {
  const theme = useThemeStore((s) => s.theme);
  const [system, setSystem] = useState<ResolvedTheme>("light");

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystem(media.matches ? "dark" : "light");
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return theme === "system" ? system : theme;
}
