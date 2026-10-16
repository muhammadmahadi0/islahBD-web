"use client";

import { useCallback } from "react";

// Tap-bloom for theme switching — ported from beta ThemeToggle.
// A circle blooms from the tap point in the incoming theme's base color,
// the theme flips mid-expansion, then the overlay fades. Respects
// prefers-reduced-motion (plain switch, no overlay).
export function bloomTheme(
  e: React.MouseEvent<HTMLElement>,
  to: "dark" | "light",
  apply: () => void
) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    return;
  }
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  try {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    x = typeof e.clientX === "number" && e.clientX > 0 ? e.clientX : rect.left + rect.width / 2;
    y = typeof e.clientY === "number" && e.clientY > 0 ? e.clientY : rect.top + rect.height / 2;
  } catch {
    // fall back to viewport center
  }
  const size = Math.hypot(window.innerWidth, window.innerHeight) * 2.2;
  const el = document.createElement("span");
  el.className = `theme-wrap ${to === "light" ? "theme-wrap-light" : "theme-wrap-dark"}`;
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  document.body.appendChild(el);
  window.setTimeout(apply, 180);
  window.setTimeout(() => el.remove(), 700);
}

export function useBloomToggle(
  theme: "dark" | "light",
  toggle: () => void,
  setTheme: (t: "dark" | "light") => void
) {
  const bloomToggle = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const to = theme === "dark" ? "light" : "dark";
      bloomTheme(e, to, toggle);
    },
    [theme, toggle]
  );
  const bloomSet = useCallback(
    (e: React.MouseEvent<HTMLElement>, to: "dark" | "light") => {
      if (to === theme) return;
      bloomTheme(e, to, () => setTheme(to));
    },
    [theme, setTheme]
  );
  return { bloomToggle, bloomSet };
}
