/**
 * Open the installed IslahBD app, otherwise go to the right store.
 * Ported from beta (src/lib/open-app.ts) — same battle-tested shape:
 * - Android: full intent:// URL via top-level navigation (Chrome honours
 *   S.browser_fallback_url natively; other browsers still resolve the app).
 * - iOS: scheme through a hidden iframe (a bare location assignment
 *   navigates Safari to an error state); guarded App Store timer.
 * - Every timer cancels the moment the page hides/blurs (app opened),
 *   so installed users are never raced to the store.
 */

const SCHEME = "islahbd://open";
const PACKAGE = "com.islahbd.app";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.islahbd.app";
const APP_STORE = "https://apps.apple.com/us/app/islahbd/id6762509692";
const WEBSITE = "https://www.islahbd.com/";

const ANDROID_TIMER_MS = 2500;
const IOS_TIMER_MS = 1800;

function isAndroid(ua: string): boolean {
  return /Android/i.test(ua);
}

function isIOS(ua: string): boolean {
  if (typeof navigator === "undefined") return /iPad|iPhone|iPod/i.test(ua);
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function androidIntentUrl(): string {
  return (
    "intent://open#Intent;scheme=islahbd;package=" +
    PACKAGE +
    ";action=android.intent.action.VIEW" +
    ";category=android.intent.category.BROWSABLE" +
    ";S.browser_fallback_url=" +
    encodeURIComponent(PLAY_STORE) +
    ";end"
  );
}

/** Fire a custom scheme without navigating the page (fails silently). */
function fireSchemeViaIframe(scheme: string): void {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    iframe.src = scheme;
    document.body.appendChild(iframe);
    window.setTimeout(() => {
      try {
        iframe.remove();
      } catch {
        // ignore
      }
    }, 3000);
  } catch {
    // ignore — the timed store fallback below still runs
  }
}

/** Runs `fallback` after `ms` unless the page hides/blurs first. */
function guardedFallback(ms: number, fallback: () => void): void {
  let done = false;
  const cancel = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", onHide);
    window.removeEventListener("blur", onHide);
  };
  const onVis = () => {
    if (document.hidden) cancel();
  };
  const onHide = () => cancel();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("blur", onHide);
  const timer = window.setTimeout(() => {
    try {
      const unfocused =
        typeof document.hasFocus === "function" && !document.hasFocus();
      if (!done && !document.hidden && !unfocused) {
        done = true;
        fallback();
      }
    } finally {
      cancel();
    }
  }, ms);
}

export function openIslahBDApp(): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  const ua = navigator.userAgent || "";

  if (isAndroid(ua)) {
    const goStore = () => {
      try {
        window.location.href = PLAY_STORE;
      } catch {
        // ignore — user stays on the page
      }
    };
    guardedFallback(ANDROID_TIMER_MS, goStore);
    try {
      window.location.href = androidIntentUrl();
    } catch {
      goStore();
    }
    return;
  }

  if (isIOS(ua)) {
    const goStore = () => {
      try {
        window.location.href = APP_STORE;
      } catch {
        // ignore — user stays on the page
      }
    };
    guardedFallback(IOS_TIMER_MS, goStore);
    fireSchemeViaIframe(SCHEME);
    return;
  }

  window.open(WEBSITE, "_blank", "noopener");
}
