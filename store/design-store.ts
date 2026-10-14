import { create } from "zustand";
import { persist } from "zustand/middleware";

// Ported from beta (src/store/design-store.ts). Liquid Glass vs Material,
// persisted as `islah-design`. Smart default: Material on Android,
// Liquid everywhere else — first visit only.
export type DesignMode = "liquid" | "material";

interface DesignState {
  mode: DesignMode;
  setMode: (mode: DesignMode) => void;
  toggle: () => void;
}

function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return (
    navigator.platform === "MacIntel" &&
    (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints > 1
  );
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobile|Tablet|Touch|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ""
  );
}

export function defaultDesignMode(): DesignMode {
  if (typeof navigator === "undefined") return "liquid";
  if (isAndroidDevice()) return "material";
  if (isIOSDevice()) return "liquid";
  if (isMobileDevice()) return "material";
  return "liquid";
}

function applyDesign(mode: DesignMode) {
  if (typeof document === "undefined") return;
  // Liquid glass surfaces; Material keeps the solid cards.
  document.documentElement.classList.toggle("glass", mode === "liquid");
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      mode: typeof window !== "undefined" ? defaultDesignMode() : "liquid",
      setMode: (mode) => {
        if (get().mode === mode) return;
        applyDesign(mode);
        set({ mode });
      },
      toggle: () => {
        const next: DesignMode = get().mode === "liquid" ? "material" : "liquid";
        applyDesign(next);
        set({ mode: next });
      },
    }),
    {
      name: "islah-design",
      onRehydrateStorage: () => (state) => {
        if (state) applyDesign(state.mode);
        else if (typeof window !== "undefined") applyDesign(defaultDesignMode());
      },
    }
  )
);
