# Hajj & Umrah — extracted design + data

Extraction of the Hajj & Umrah module from the IslahBD Android app **v1.3.0**
(`libapp.so`, Flutter 3.12.1, decompiled with Blutter).

| File | What it is |
| --- | --- |
| [`DESIGN-EXTRACTION.md`](./DESIGN-EXTRACTION.md) | Full design spec: tokens, components, 10 screens, interactions, gap analysis, implementation plan |
| [`week-guide.json`](./week-guide.json) | 7 days (৭–১৩ জিলহজ), 26 tasks grouped by obligation type |
| [`pilgrimage.json`](./pilgrimage.json) | 4 pilgrimage types, 13 phases, 37 steps with Arabic / transliteration / translation, comparison table |
| [`places.json`](./places.json) | 6 historical regions, 65 places with descriptions + coordinates |
| [`map-places.json`](./map-places.json) | 17 mappable places (Makkah / Madinah / Hijaz) |

## Quick facts

- The app's book content (`hajj_virtues`, `umrah_guide`, `hajj_guide`, `hajj_guidelines`,
  `hajj_faq`) is already byte-identical to `public/data/hajj_umrah.json`.
- Everything else (hero/prayer header, week guide, checklist, comparison table, places guide,
  map, step-detail sheet) is hardcoded Dart and **missing from the website**.
- Bengali is the app's only language for this module. The website's `bn` / `en` / `ur`
  localization needs a translation layer for these strings.

## Implementation status

| Screen | Website route | Status |
| --- | --- | --- |
| Hub (hero + books + guide cards) | `/hajj-umrah` | Done — `components/hajj/HajjHero.tsx`, `components/hajj/BooksSection.tsx` |
| Week guide | `/hajj-umrah/week` | Done — `week-guide.json` imported statically via `lib/hajj.ts` |
| Checklist + comparison + step sheet | `/hajj-umrah/checklist` | Done — localStorage keys `hajj_checklist_type_index`, `hajj_checklist_done_items` |
| Places guide | `/hajj-umrah/places` | Pending (phase 2) |
| Map | `/hajj-umrah/map` | Pending (phase 2) — Leaflet + OpenStreetMap |

The runtime copies of the JSON live in `public/data/hajj/`; this folder keeps the
extraction originals and the design spec. UI chrome is localized through
`lib/ui-strings.ts`; the Bengali religious content (step titles/details, week task
text, book text) stays Bengali by design, with an in-page notice in `en` / `ur`.

## Regenerating

The JSON files were produced from the Blutter dump of `objs.txt` with a small parser
(`parse_objs.py` → `objs.json`) and a builder (`build_docs.py`). The dump is kept in
`opencode-tmp/blutter-out/` next to the project for traceability.

Source paths inside the APK:

```
lib/features/hajj/screens/hajj_main_screen.dart
lib/features/hajj/screens/hajj_week_guide_screen.dart
lib/features/hajj/screens/hajj_week_checklist_screen.dart
lib/features/hajj/screens/hajj_places_guide_screen.dart
lib/features/hajj/screens/hajj_map_screen.dart
lib/features/hajj/widgets/hajj_hero_header.dart
lib/features/hajj/data/hajj_week_data.dart
lib/features/hajj/data/hajj_pilgrimage_data.dart
lib/features/common/widgets/islamic_detail_scaffold.dart
```
