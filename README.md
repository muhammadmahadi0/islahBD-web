# Islah Web — দ্বীন জীবনের সঙ্গী

Web clone of the IslahBD Android app (`com.islahbd.app` v1.3.0), built with
**Next.js 14 + Tailwind**. Reverse-engineered from the APK (Flutter,
80+ screens), plus sections ported from the `beta` branch (Astro) and the
prayer engine from `pray-bd`.

**Live:** Vercel, branch `alpha` · **API:** `https://api.islahbd.com`

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
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
| Quran landing, reader, audio, search | `/quran`, `/quran/read`, `/quran/audio`, `/quran/search` |
| Prayer times, Qibla, Tasbeeh, Nearby mosques | `/prayer-times`, `/qibla`, `/tasbeeh`, `/nearby-mosque` |
| Dua, Wazifa, Amal, Sunnat, Fazilat, Hajj/Umrah, Calendar | `/dua`, `/wazifa`, `/amal`, `/sunnat`, `/fazilat`, `/hajj-umrah`, `/calendar` |
| Poems, Munajate, Malfuzat, Self-purification | `/poem`, `/munajate`, `/malfuzat`, `/self-purification` |
| Live broadcast, Boyan, Hamd/Naat | `/live`, `/boyan`, `/hamdnaat` |
| Library, Videos/Clips, Gallery/Wallpaper | `/library`, `/media`, `/gallery`, `/wallpaper` (`/nasheed` → `/hamdnaat`) |
| Paribar/Baiyat, Fatwa, Notice, Notifications | `/paribar` (family hub: biography, mission, applications, connect), `/fatwa`, `/notice`, `/notifications` |
| Donate, Support, Settings, Others hub, Member | `/donate`, `/support`, `/settings`, `/others`, `/member` |

API proxies (cached): `/api/boyan`, `/api/hamdnaat`, `/api/live`,
`/api/hls/…`, `/api/prayer`, `/api/quran/chapters|verses|recitations|chapter-audio|search`.

## Design system

- Phone shell (`max-w-md`), Hind Siliguri + Kalpurush + Noto Naskh Arabic
- Emerald/gold theme, SVG icon set (`components/icons.tsx`), no emoji icons
- Dark midnight-blue mode + Liquid Glass / Material toggle (Settings,
  persisted, pre-paint script — no flash)
- Golden signature pieces: prayer card, bottom nav, honorific title
