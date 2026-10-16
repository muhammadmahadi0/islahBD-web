# AGENTS.md — Islah Web

Instructions for coding agents working in this repo (`alpha` branch).

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind 3 + zustand + hls.js.
No test suite — `npm run build` + prod smoke test is the gate.

## Before pushing

1. `npm run build` must pass (expect 49 routes).
2. Start prod (`npm start -- -p <port>`) and curl `/`, changed pages,
   and any touched `/api/*` route — all must return 200 with real data.
3. Kill the server afterwards (avoid `pkill -f` with a pattern that
   matches your own command; prefer `lsof -ti:<port>`).
4. Commit, push `origin alpha`, then **update README.md, SPEC.md and
   this file** if behavior, routes, or conventions changed.

## Where things live

- Pages: `app/<section>/page.tsx` (Quran has `read|audio|search`)
- Cached API proxies: `app/api/<name>/route.ts`
- Shared UI: `components/ui.tsx` (`PageHead`, `ShareCopy`, `EmptyState`),
  `components/icons.tsx` (SVG only — never emoji), `components/AppShell.tsx`
- Domain logic: `lib/` (`prayer.ts`, `quran.ts`, `audio.ts`, `live.ts`,
  `yt-engine.ts`, `open-app.ts`, `surah-names.ts`, `data.ts`, `api.ts`)
- Player: `store/player-store.ts`, `store/playlist-store.ts`,
  `components/audio/{AudioPlayer,MiniPlayer,AddToPlaylistMenu}.tsx`
- Theme: `store/theme-store.ts` (`islah-theme`), `store/design-store.ts`
  (`islah-design`), layers in `app/globals.css` (`html.dark`, `html.glass`)

## Gotchas (learned the hard way)

- api.quran.com **omits `text_uthmani` unless `fields=` is sent**; the
  reader triple-fallbacks (Uthmani → Imlaei → offline DB). Never regress this.
- Aladhan Hijri lives at `data.date.hijri` with diacritic month names —
  map by `month.number`, then −1 day for BD sighting (`lib/prayer.ts`).
- `useSyncExternalStore(subscribeEngine, …)` needs a server snapshot or
  prerender crashes.
- `next/font/google` needs network at build time; local TTFs live in
  `public/fonts` with explicit weights.
- `dark:` Tailwind variants are class-based (`darkMode: "class"`); ad-hoc
  `bg-white` + theme-aware text combos break in dark mode — use the
  `.btn-*`/`.chip`/`.inner-box`/`.hero-search` classes instead.
- Never call `audio.play().catch()` or raw `localStorage.*` directly —
  use `tryPlay` / `storage*` from `lib/storage.ts`, or Safari/Firefox
  private mode shows the crash screen on tap.
- APK-asset JSON lives in `public/data`; fonts/images in
  `public/fonts|images|audios`.

## Deploy

Vercel imports `muhammadmahadi0/islahBD-web`, branch `alpha`,
framework preset Next.js, **no output directory**. Redeploy after each push.
