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
- Dedicated tafsir pages (`/quran/tafsir?surah&ayah`) with prev/next
- Chapters with Bengali names + Bangla transliterations (`lib/surah-names.ts`,
  all 114 verified)
- Reader: 4 Bengali translations, 3 Bengali tafsirs, word-by-word,
  transliteration, per-ayah audio, bookmarks, font-size control
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

## 5. Conventions

- Bengali UI strings inline (no i18n framework); dates/digits in Bengali
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
- Verify with `bun run build` (49 routes) + prod smoke test before push
