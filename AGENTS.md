# AGENTS.md — Islah Web

Instructions for coding agents working in this repo (`alpha` branch).

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind 3 + zustand + hls.js.
Package manager: **bun** (`bun.lock`; `packageManager` pinned in `package.json`).
No test suite — `bun run build` + prod smoke test is the gate.

## Before pushing

1. `bun run build` must pass (expect 49 routes).
2. Start prod (`bun run start -- -p <port>`) and curl `/`, changed pages,
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
- Domain logic: `lib/` (`prayer.ts`, `quran.ts`, `audio.ts`, `shorts.ts`,
  `shorts-server.ts`, `channels.ts`, `innertube.ts`, `channel-videos.ts`,
  `live.ts`, `yt-engine.ts`, `open-app.ts`, `surah-names.ts`, `data.ts`, `api.ts`)
- Player: `store/player-store.ts`, `store/playlist-store.ts`,
  `components/audio/{AudioPlayer,MiniPlayer,AddToPlaylistMenu}.tsx`.
  Tracks carry an optional `sharePath`; shared URLs use `?play=<track-id>`
  and the catalog page auto-plays the matching item once.
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
- Qur'an progress lives in `lib/quran-progress.ts` (`quran_last_read` =
  `{surah, ayah, mode, at}`) — go through `getLastRead` / `saveLastRead`,
  never raw localStorage. The reader saves the top-of-viewport verse and
  every verse played; an explicit `?ayah=` always beats the saved position.
- `animate-fade-up` (tailwind config) ends on `transform: none` on purpose:
  a retained transform turns the element into a containing block, which
  pins `fixed` descendants (the reader drawer, the floating play button) to
  the page bottom instead of the viewport. Don't change it back to
  `translateY(0)`, and keep viewport-fixed UI outside transformed wrappers.
- Qur'an recitation view (তেলাওয়াত) deliberately bypasses `renderVerse`:
  it renders one justified Arabic `<p>` for the whole sura with inline
  `.ayah-dot` medallions, which are `<button>`s that call `playAyah`. Keep
  each ayah wrapped in `<span id="ayah-<surah>:<ayah>">` so `?surah&ayah`
  deep links still scroll correctly, and keep the medallion size in `em`
  so the font-size setting scales it.
- Qur'an reader audio: keep the "playing" flag in React state fed by the
  element's `play`/`pause`/`ended`/`error` events — reading
  `audioRef.current.paused` during render leaves the ▶ icon stuck while the
  recitation keeps playing. Starting any player must go through
  `hushOthers()`: verse, whole surah, word-by-word and the app mini-player
  pause each other, and a newer verse tap invalidates older fetches
  (`playSeq`). Whole-surah audio must go through the app player
  (`playTrack` with an `audioUrl` track, id `quran-surah-<n>`) — never an
  inline `<audio>` — and a reciter without `by_ayah` audio falls back to
  the whole surah (quran.com 404s from reciter id 13).
- Home entrance animation is `.home-rise` (`app/globals.css`) + the
  `rise(n)` delay helper in `app/page.tsx`. Keep the largest delay near
  0.45s (step 28ms, duration 380ms) so the sequence stays under a second,
  and avoid transform-based hover effects on `.home-rise` elements —
  `animation-fill-mode: both` keeps `transform: translateY(0)` after the
  run.
- APK-asset JSON lives in `public/data`; fonts/images in
  `public/fonts|images|audios`. The library's Islami Jindegi snapshot is
  `public/data/islamijindegi-books.json` (scraped from the site's listing
  RSC payload — `initialBooks` — so PDFs/covers stay hotlinked).
- The kitab reader does **not** commit chapter text. `/api/books/[id]`
  fetches the source detail page (`lib/islamijindegi.ts`), concatenates
  `self.__next_f.push([1,"…"])` chunks, then decodes `id:T<hex-byte-len>,`
  text chunks (scan a latin1 view so byte offsets stay aligned). Chapter
  bodies are `$<id>` references into that map. Strip scripts/styles/event
  handlers before returning HTML; cache the route for a day. PDF-only
  kitabs render `components/PdfReader.tsx` (PDF.js, one page at a time).
  Keep `public/pdf.worker.min.mjs` byte-identical to the pinned
  `pdfjs-dist` version — upgrading the package requires copying
  `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` again.
- Channels (`/channels`, `/channels/[id]`) come from the stable `master`
  branch registry (`lib/channels.ts`) and list YouTube uploads through
  youtubei.js' InnerTube API. That lib is **Node-only** — keep the channel
  routes on the Node runtime and keep `youtubei.js` in
  `experimental.serverComponentsExternalPackages`. Continuation tokens are
  base64url-wrapped (`it1_…`) because raw tokens contain `%` and break the
  path route. The clips API's `title` is often just the YouTube ID, so
  titles come from oEmbed + `lib/shorts-titles.json` (`lib/shorts-server.ts`).
- Notifications: `public/sw.js` is the delivery path — it handles `push`,
  `notificationclick`, and self-checks `/api/notifications` on
  `periodicsync`/`sync`/`message` with an IndexedDB `lastSeenId`. A change to
  the notification payload or deep-link rules must be made in **both**
  `lib/notifications.ts` (`notifHref`) and `sw.js` (`notifUrl`). Server push
  is optional: it only turns on when `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
  (and `KV_REST_API_URL`/`KV_REST_API_TOKEN` to store subscriptions) — never
  make notifications depend on it, or enabling dead-ends.
- Calendar (`/calendar`): today's Hijri date must come from `/api/prayer`
  (the same Aladhan payload as the homepage prayer card) via `adjustHijri`;
  `lib/hijri.ts` is only the instant/offline fallback and is corrected by
  the API delta. Bangla dates follow the **2019 Bangla Academy reform**
  (Boishakh..Ashwin 31 days, Kartik..Magh 30, Falgun 29/30, Pohela Boishakh
  14 April) — the old Surya Siddhanta lengths shift every Bengali date by a
  day. Hijri month lengths are derived from real month-start dates, never
  hard-coded alternating 30/29.

## Deploy

Vercel imports `muhammadmahadi0/islahBD-web`, branch `alpha`,
framework preset Next.js, **no output directory**. Redeploy after each push.
