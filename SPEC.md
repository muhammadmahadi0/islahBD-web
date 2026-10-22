# SPEC — Islah Web (`alpha` branch)

## 1. Goal

Faithful, modern web clone of the IslahBD Android app with beta-branch
media players and pray-bd prayer accuracy. Bengali-first, mobile-first,
offline-tolerant, keyless APIs only.

## 2. Non-goals

- No auth, no accounts, no backend database
- No paid APIs; every upstream must be keyless
- No emoji iconography (SVG set only)

## 3. Architecture

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind 3
- **State:** zustand + persist (player, playlists, theme, design);
  local component state + localStorage caches elsewhere
- **Data:** static JSON in `public/data` (bundled from APK) + cached
  Next route handlers proxying upstream APIs
- **Styling:** Tailwind utilities + `app/globals.css` design tokens;
  `html.dark` (midnight blue) and `html.glass` (liquid glass) layers

## 4. Subsystems

### 4.1 Quran (quran.com API v4, muslimbangla-style UI)
- Index (`/quran`): surah cards (number, transliteration, meaning,
  Makki/Madani badge, Arabic name, ayah count) + 7 real topic categories
  with expandable famous verses (`lib/quran-topics.ts`)
- Reader (`/quran/read`): sura + para (juz) modes, dual stacked Bengali
  translations, tafsir, word-by-word, always-on transliteration, per-ayah
  and full-surah audio, bookmarks, font size, `?surah&ayah` deep-links
- Recitation view (তেলাওয়াত) is mushaf-style: one continuous justified
  Arabic flow for the whole sura — no per-ayah cards, translations or
  action bars. The inline green ayah-number medallions (`.ayah-dot`) are
  also that ayah's play button (gold while playing).
- Reader remembers the last position (`quran_last_read` in
  `lib/quran-progress.ts`: surah, ayah, tab, timestamp). The verse at the
  top of the viewport — and any verse played — is saved; `/quran` shows a
  "যেখানে থেমেছিলেন" continue card and rings that surah's row with a
  "শেষ পড়া" chip; bare `/quran/read` and `?surah=N` on the saved sura
  resume at that verse in the saved tab. Explicit `?ayah=` deep links win.
- Whole-sura recitation is started from a floating ▶ button (top-level,
  viewport-fixed) on the reader.
- Para (juz) mode: the sidebar lists all 30 paras as rows (Bangla name,
  Arabic opening name, start verse) from `lib/juz-names.ts`; the UI always
  says পারা, never জুজ — each ayah footer reads পৃষ্ঠা … • পারা …
- Dedicated tafsir pages (`/quran/tafsir?surah&ayah`) with prev/next
- Chapters with Bengali names + Bangla transliterations (`lib/surah-names.ts`,
  all 114 verified)
- Reader: 4 Bengali translations, 3 Bengali tafsirs, word-by-word,
  transliteration, per-ayah audio, bookmarks, font-size control
- Word-by-word clips are keyed by **word position**, not quran.com's
  `word.audio_url` (which counts each waqf mark as an extra clip, drifts
  after a pause sign and 404s on later words). `lib/quran.ts → wbwAudioUrl`
  builds `wbw/SSS_AAA_PPP.mp3`; the audio routes normalise the field with
  `fixWordAudio`. The sounding tile is highlighted gold.
- **Audio:** exactly one recitation may sound — per-ayah, full-surah,
  word-by-word and the app mini-player pause each other. Button icons come
  from React state fed by the element's `play`/`pause`/`ended`/`error`
  events (never from `audio.paused` read during render), and a newer verse
  tap cancels an in-flight `/chapter-audio` fetch. The whole surah is a
  Track in the app player (`usePlayerStore`, the bayan player) rather than
  an inline `<audio>`, so it gets the mini-player/seek bar. Reciters with
  no `by_ayah` audio (quran.com 404s for id 13+) fall back to that whole
  surah with an inline notice.
- **Invariant:** `text_uthmani` must be requested via `fields=` (API omits
  it by default); render falls back Uthmani → Imlaei → offline DB so the
  Arabic line can never be blank
- Offline `quran_database.json` (6236 ayahs) auto-fills gaps and takes over
  fully when offline; search merges both sources with verse-key dedup

### 4.2 Prayer (pray-bd engine, `lib/prayer.ts`)
- Aladhan `timings` (method=1 Karachi, school=1 Hanafi) via `/api/prayer`
- IP geolocation (ipapi → ip-api → Dhaka, 24h cached) + 8 BD cities + GPS
- 24h per-location cache, midnight auto-refresh, seasonal Hanafi fallback
- Special periods: sunrise prohibited (red) → Ishraq → Chasht (Dhuhr−10)
- Hijri from Aladhan `date.hijri`, mapped by **month number**, minus 1 day
  for BD moon sighting; Intl fallback
- Home card shows the **current** ongoing prayer + remaining time
- Qibla (`/qibla`): great-circle Kaaba bearing from the selected city/GPS.
  The compass trusts only true headings — iOS `webkitCompassHeading` or
  `deviceorientationabsolute` (`360 − alpha`); relative `alpha` is ignored
  because it is not north-based. Headings are unwrapped into a continuous
  angle so the rose/needle never spin the long way across 0°/360°, and the
  rose/needle follow the short path (ডানে/বামে). Touch browsers start the
  sensor automatically, iOS asks for Motion permission, and unsupported
  devices fall back to a north-up dial + city/GPS bearing.

### 4.3 Media players (beta engine)
- zustand `player-store` (persisted queue, throttled writes) + `playlist-store`
- `AudioPlayer`: HTML audio + lazy hls.js, proxy retry, recording fallback
  for live, wake lock, SEEK_EVENT bus
- `MiniPlayer`: persistent YouTube embed (audio-first 144p, opt-in video,
  autoplay watchdog), expanded sheet (seek/volume/queue/download/share),
  mini pill, swipe, EQ bars
- Boyan: `/api/audios` + categories, search/filter, silent refresh, play-all
- Hamd/Naat: `/api/nasheeds`, audio↔player / video↔YouTube engine
- Short clips (`/media`): `/api/shorts` (clips API) — audio clips ride the
  stream engine, video clips the YouTube engine; search, type filter,
  silent refresh, playlist menu
- Clip titles: the upstream clips API stores the bare YouTube ID in
  `title` for most videos. `lib/shorts.ts` resolves real titles via the
  keyless YouTube oEmbed endpoint with a committed snapshot
  (`lib/shorts-titles.json`), and normalizes `youtubeId` (bare IDs plus
  watch/shorts/embed URLs) before thumbnails and playback
- Live: `/api/live` polling (60s), in-app HLS or last recording
- Shareable items: every track carries a `sharePath` deep link
  (`/boyan?play=boyan-<id>`, `/hamdnaat?play=hamd-<id>`,
  `/media?play=short-<id>`, `/live?play=live|live-recording`); the target
  page auto-plays that item and the expanded player's share button uses
  the same URL

### 4.4 Books
- `/library` merges the IslahBD book API (`/api/books`) with the Islami
  Jindegi kitab collection (`islamijindegi.com/bn/books`), using the
  source listing's desktop category sidebar and mobile chip rail
- Metadata/PDF links snapshot: `public/data/islamijindegi-books.json`
  (1019 books, 1015 PDFs) — search, categories, 48-per-page “আরও দেখুন”
- Islami Jindegi cards open `/library/[id]`; IslahBD's single card still
  opens its PDF. Download buttons stay PDF-only.
- `/library/[id]` is the in-app reader. `/api/books/[id]` (cached 24h)
  decodes the source detail page's RSC stream into chapter/subchapter HTML
  (`$` text-chunk references resolved by byte length) and strips scripts,
  styles, and event handlers. The reader mirrors the source: sticky
  toolbar, desktop chapter sidebar + mobile drawer, justified Bengali
  prose (`reader-prose`), font-size controls, prev/next, and a PDF button.
- Books with no chapter text (many are PDF-only) render `PdfReader`
  (`components/PdfReader.tsx`): PDF.js draws one page at a time with
  page navigation, zoom, download, and “নতুন ট্যাবে” fallbacks. PDF.js is
  lazy-loaded; its worker is served from `public/pdf.worker.min.mjs`,
  matching the pinned `pdfjs-dist` version.

### 4.5 Shell & theme
- `AppShell`: phone shell, header (logo, app-open deep link
  `islahbd://` with store fallback, bell, share, theme toggle),
  honorific block, bottom bar Home/Live(play)/Boyan/Family/More
- Theme store (`islah-theme`, OS default) + design store
  (`islah-design`, Material on Android, Liquid elsewhere) + pre-paint script
- UI language (`islah-language`: `bn` default, `ur`, `en`) via
  `store/language-store.ts` + `lib/i18n.ts`. The pre-paint script sets
  `<html lang>`/`dir` (Urdu = RTL) before first paint; the store uses
  `skipHydration` and AppShell rehydrates after mount so SSR stays Bengali
  and there is no text hydration mismatch. Scope is **all static UI copy**
  (navigation, cards, labels, empty states, buttons, counts, dates) stored
  in `lib/ui-strings.ts` and rendered through `tx("বাংলা")` / `useTx()`;
  API content (bayan titles, dua text, articles, Qur'an Arabic/translation)
  remains in its source language. Counts/dates use `useNum()`, so Bangla
  digits appear only in Bengali mode. The old `praybd-lang` BN/EN toggle is
  gone — Prayer Times follows the global language, and `lib/prayer.ts`
  supports `bn`/`ur`/`en` names, months and time formats. Urdu UI uses the
  local Naskh/Nastaliq stack (`html[lang="ur"]`) with Bengali falling back
  to Hind Siliguri.
- Theme switch plays beta's tap-bloom (`components/theme-bloom.tsx` +
  `.theme-wrap` CSS, reduced-motion safe)
- Golden signature elements identical in both modes
- Home entrance: every section/card carries `.home-rise` (380ms
  `translateY(18px)` → `0`) with a 28ms inline `animation-delay` per item,
  so the whole sequence lands in under 1s; disabled under
  `prefers-reduced-motion`. The API-loaded “সাম্প্রতিক বয়ান” group restarts
  a short stagger when it mounts.

### 4.6 Channels (YouTube, ported from `master`)
- Registry `lib/channels.ts` from the stable `master` branch — Islah
  (`@islahbd`) + Islahi Ghazal (`@IslahiGhazal`); avatars come from
  `/api/channel/[id]/meta` (name + avatar only, never the video listing)
- `lib/innertube.ts` lists uploads through youtubei.js' keyless InnerTube
  API (Node runtime only); `serverComponentsExternalPackages` keeps it out
  of the server bundle. Continuation tokens are wrapped as path-safe
  `it1_`-base64url (`toClientToken`/`fromClientToken`) because raw tokens
  contain `%`
- Routes: `/api/channel/[id]` (first ~100 uploads + token),
  `/meta` (name/avatar), `/more/[token]` (next chunks)
- Pages: `/channels` (directory; also surfaced as a single **চ্যানেল**
  button on `/others` that holds both channels and opens the directory) and
  `/channels/[id]` (video grid with সব/বয়ান/ক্লিপস + নতুন/জনপ্রিয়/পুরনো
  and a pinned YouTube-style search button beside the sort chips).
  Newest is the native upload order with “আরও দেখুন” paging; **জনপ্রিয়**,
  **পুরনো**, and any **title search** cover the whole catalog via a background
  indexer that walks the continuation tokens (a progress line shows while
  indexing), and results render in windows of 60 to keep the DOM light.
  Videos play through the existing YouTube engine and share via
  `/channels/[id]?play=<videoId>`

### 4.7 Nearest mosque (`/nearby-mosque`)
- Data: keyless OpenStreetMap via Overpass (`/api/mosques?lat&lon`), not the
  IslahBD API. Node route; **races all Overpass mirrors in parallel** and takes
  the first that returns data (the rest are aborted). An “empty” reply is not
  accepted as a win — regional mirrors answer in a second but only cover their
  own country — so empty only stands once every mirror has failed/add nothing.
- Queries `place_of_worship`+`religion=muslim` and `building=mosque` for both
  nodes and ways (`out center` for way centroids), widens the radius in rings
  (2.5 km → 8 km) under one shared time budget, then sorts by haversine
  distance and de-dupes node/way twins (same name within 150 m)
- The page auto-loads the IP-detected city (`detectLocation`) so it works with
  no tap, a distinct **জিপিএস দিয়ে খুঁজুন** button refines to an exact fix, and
  each card shows the Bengali distance + a Google Maps directions deep link

### 4.8 Notifications & push
- `/notifications` is a day-grouped feed over the cached `/api/notifications`
  proxy of api.islahbd.com — type icons/tints, unread dots, Bengali relative
  times, image thumbs, “পুরনো” paging, and deep links (live → `/live`,
  `boayn` → `/boyan?play=boyan-<id>`, nasheed → `/hamdnaat?play=hamd-<id>`,
  notice → `/notice`). Read ids live in `islah-notif-read`; the header bell
  shows the unread count and clears when the feed opens (`islah:notif-read`
  event).
- **Delivery** — “notify whenever the API posts”: `public/sw.js` handles
  `push`, `notificationclick`, and self-checks `/api/notifications` on
  `periodicsync` / `sync` / a page `message`, keeping a `lastSeenId` in
  IndexedDB (first run records a baseline instead of dumping the backlog), so
  an installed PWA keeps alerting with the app closed (Chromium). With a tab
  open, `NotificationAlerts` polls every 3 min and re-checks on tab focus, and
  schedules today's prayer reminders. Notification `tag` is `islah-<id>` so
  the two paths can't double-post.
- The app is an installable PWA (`app/manifest.ts`, apple meta in
  `app/layout.tsx`) — a prerequisite for background delivery and iOS push.
- Settings toggles it: permission → SW registration → Periodic Background
  Sync → optional Web Push subscribe. True server-sent push needs
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (plus `KV_REST_API_URL`/`KV_REST_API_TOKEN`
  to persist subscriptions through `/api/push/subscribe`); without them the
  worker's own polling still delivers, so enabling never dead-ends.

### 4.9 Islamic calendar (`/calendar`)
- Two tabs in one hero: **ক্যালেন্ডার** (Hijri month grid) and **ঐতিহাসিক
  ঘটনা ও তথ্য** (searchable archive over `public/data/islamic_calendar.json`,
  165 entries in 12 month buckets, tap → jump to that day in the grid)
- Each cell carries three dates at once — Gregorian (sky), Bangla (gold),
  Hijri (emerald) — with a red dot on days that have a recorded event.
  Tapping a day opens its full date + events inline. Prev/next arrows page
  Hijri months, today is marked, and **আজ** / **চলতি মাসে ফিরুন** jump back.
  Under the grid: that month’s events, tappable to select the day.
- Today’s Hijri date comes from the same `/api/prayer` (Aladhan) payload the
  homepage prayer card renders, through `adjustHijri`’s BD −1 day rule — the
  two can never disagree. `lib/hijri.ts` is the instant/offline fallback and
  is shifted by the API delta (normally 0) so the grid matches the card.
- Hijri math: Umm al-Qura via `Intl` (tabular fallback) plus a month-start
  search; month lengths come from real start dates (29/30). Bangla math:
  Bangla Academy 2019 reform — Boishakh..Ashwin 31 days, Kartik..Magh 30,
  Falgun 29 (30 in a leap year), Choitro 30, Pohela Boishakh = 14 April.
  The week grid is Monday-first, matching the design reference.
- Navigation is Hijri-based; the Gregorian span of the shown Hijri month is
  printed under its title.

## 5. Conventions

- Static UI copy lives in `lib/ui-strings.ts`, keyed by its Bengali source
  string (`[en, ur]` tuples), and is rendered with `tx("…")`; content from
  the API stays in its source language. Dates/digits follow the UI language
  via `useNum()` (Bengali digits in `bn` only)
- New pages: `PageHead` hero + skeleton loaders + `EmptyState`
- Buttons only from the `.btn-*` / `.chip` system — every variant must be
  readable in **both** light and dark (pinned colors on gold/white)
- Crash safety: all `localStorage` goes through `lib/storage.ts`
  (never raw — Safari private mode throws), all `audio.play()` through
  `tryPlay` (legacy WebKit returns undefined), route + root Bengali
  error screens (`app/error.tsx`, `app/global-error.tsx`)
- Favicon: `app/icon.png` + `app/apple-icon.png` + `app/favicon.ico`
  (generated from `public/images/logo.png`)
- Toolchain: **bun** is the package manager (`bun install`, `bun run *`,
  `bun.lock` committed, `packageManager` pinned in `package.json`)
- Verify with `bun run build` (66 routes) + prod smoke test before push
