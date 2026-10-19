# Islah Web — দ্বীনি জীবনের সাথী

Web clone of the IslahBD Android app (`com.islahbd.app` v1.3.0), built with
**Next.js 14 + Tailwind**. Reverse-engineered from the APK (Flutter,
80+ screens), plus sections ported from the `beta` branch (Astro) and the
prayer engine from `pray-bd`.

**Live:** Vercel, branch `alpha` · **API:** `https://api.islahbd.com`

## Quick start

```bash
bun install
bun run dev      # http://localhost:3000
bun run build && bun start
```

No env vars needed. All upstream APIs are keyless.

## Sources

| Source | What was taken |
|---|---|
| APK (`Islah-…_1.3.0_apkcube.apk`) | All 80+ screen names, offline JSON data, fonts, images, API base |
| `beta` branch | Boyan + Hamd/Naat catalogs, live/HLS/mini-player engine, app-open button, dark mode, liquid glass |
| `pray-bd` repo | Prayer engine: Aladhan Karachi/Hanafi, countdown, Hijri, cities |
| `islah.html` | Home layout: phone shell, header, gold card, sections, gold nav |

## Screen → route map

| App / beta feature | Route |
|---|---|
| Home, prayer card, services, media, recent boyan | `/` |
| Quran landing, reader, audio, search | `/quran` (muslimbangla-style index + topics), `/quran/read` (reader), `/quran/audio`, `/quran/search` |
| Prayer times, Qibla, Tasbeeh, Nearby mosques | `/prayer-times`, `/qibla`, `/tasbeeh`, `/nearby-mosque` |
| Dua, Wazifa, Amal, Sunnat, Fazilat, Hajj/Umrah, Calendar | `/dua`, `/wazifa`, `/amal`, `/sunnat`, `/fazilat`, `/hajj-umrah`, `/calendar` |
| Poems, Munajate, Malfuzat, Self-purification | `/poem`, `/munajate`, `/malfuzat`, `/self-purification` |
| Live broadcast, Boyan, Hamd/Naat | `/live`, `/boyan`, `/hamdnaat` |
| Library + kitab reader, Short clips, Gallery/Wallpaper | `/library`, `/library/[id]` (chapter reader / PDF fallback), `/media`, `/gallery`, `/wallpaper` (`/nasheed` → `/hamdnaat`) |
| Channels (YouTube) + video listing | `/channels`, `/channels/[id]` |
| Paribar/Baiyat, Fatwa, Notice, Notifications | `/paribar` (family hub: biography, mission, applications, connect), `/mission` (Shaykh's mission, beta), `/fatwa`, `/notice`, `/notifications` |
| Donate, Support, Settings, Others hub, Member | `/donate`, `/support`, `/settings`, `/others`, `/member` |

API proxies (cached): `/api/boyan`, `/api/hamdnaat`, `/api/shorts`,
`/api/books`, `/api/books/[id]` (kitab chapters), `/api/live`, `/api/hls/…`,
`/api/prayer`, `/api/quran/chapters|verses|recitations|chapter-audio|search`,
`/api/channel/[id]` (+ `/meta`, `/more/[token]` — YouTube InnerTube listings),
`/api/mosques` (nearest masjid via OpenStreetMap Overpass),
`/api/notifications` (feed for the page + service worker),
`/api/push/subscribe` (Web Push subscription sink).

## Design system

- Phone shell (`max-w-md`), Hind Siliguri + Kalpurush + Noto Naskh Arabic
- Emerald/gold theme, SVG icon set (`components/icons.tsx`), no emoji icons
- Dark midnight-blue mode + Liquid Glass / Material toggle (Settings,
  persisted, pre-paint script — no flash)
- Golden signature pieces: prayer card, bottom nav, honorific title
- Home entrance: sections/cards rise in with a 380ms slide-up and 28ms
  inline stagger (`.home-rise`, whole sequence under 1s)
- Kitab reader (`/library/[id]`): source-style chapter sidebar/drawer,
  justified Bengali text, text-size controls, prev/next; PDF-only books
  use an in-app PDF.js viewer (page nav, zoom, download)
