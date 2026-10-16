import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStringStorage } from "../lib/storage";

// Ported from beta (src/store/theme-store.ts). Dark/light theme,
// persisted as `islah-theme`. First visit follows the OS scheme.
export type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function defaultTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: typeof window !== "undefined" ? defaultTheme() : "light",
      setTheme: (theme) => {
        if (get().theme === theme) return;
        applyTheme(theme);
        set({ theme });
      },
      toggle: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "islah-theme",
      storage: createJSONStorage(() => safeStringStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
        else applyTheme(defaultTheme());
      },
    }
  )
);
