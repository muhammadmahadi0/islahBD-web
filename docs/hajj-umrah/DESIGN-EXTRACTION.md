# Hajj & Umrah — Design Extraction (IslahBD APK v1.3.0)

> Source of truth: `libapp.so` from `Islah-দবন-জবনর-সঙগ_1.3.0_apkcube.apk`, decompiled with Blutter
> (Flutter 3.12.1, Dart 3.12.1, ARM64). Bengali strings were read as UTF-16LE from `objs.txt`;
> layout/interaction was reconstructed from `asm/islahbd/features/hajj/**`.
>
> Companion data files in this folder:
> `week-guide.json`, `pilgrimage.json`, `places.json`, `map-places.json`.
>
> This document describes the **app design as built**, then maps it against the current website.
> It is an extraction, not a pixel-copy mandate: implementation should reuse the website's
> existing tokens (`tailwind.config.js`, `components/ui.tsx`, `components/icons.tsx`).

---

## 1. Navigation map

```
Others screen ──► Historical Places (HajjPlacesGuideScreen)
Home / Others ──► Hajj & Umrah hub (HajjMainScreen)
                    ├─ HajjWeekGuideScreen          "এক নজরে হজ্বের এক সপ্তাহ"
                    ├─ HajjWeekChecklistScreen      "ধাপে ধাপে হজ্জ চেকলিস্ট"
                    │    └─ step sheet ──► HajjMapScreen
                    └─ book accordions (4 categories)
                         ├─ HajjVirtuesScreen       hajj_virtues
                         ├─ UmrahStepsScreen        umrah_guide
                         ├─ HajjStepsScreen         hajj_guide
                         └─ HajjGuidelinesScreen    hajj_guidelines
```

There is **no separate route for the map** in the app: it is pushed from a checklist step sheet
(the step's `location` + "ম্যাপে দেখুন" action). The places guide is a standalone entry in the
"Others" list.

**Web IA (current).** The two screens above moved out of the Hajj hub into their own
**সীরাত মানচিত্র / Seerah Maps** section under **Others**:

```
/others ──► "সীরাত মানচিত্র" section
             ├─ ঐতিহাসিক স্থানসমূহ   → /seerah#places  (65 places, 6 regions)
             └─ স্থানসমূহের মানচিত্র → /seerah/map      (full map, 17 pins)

/seerah        header → inline map subsection ("স্থানসমূহের মানচিত্র") → places guide
/seerah/map    full-screen map; ?lat/lng/title (place cards) or ?q=<location> (checklist)

/hajj-umrah    week guide + checklist only
```

Legacy `/hajj-umrah/places` and `/hajj-umrah/map` are 307 redirects to `/seerah` and
`/seerah/map`. The section is reachable from the bottom-bar **More/Others** tab
(`MORE_PREFIXES` includes `/seerah`), and the checklist location chip deep-links to the map.

---

## 2. Design tokens

### 2.1 Palette (measured from `Color` objects)

| Role | Hex | Usage |
| --- | --- | --- |
| Slate 900 | `#0F172A` | primary text (light) |
| Slate 800 | `#1E293B` | dark surface / dark card |
| Slate 700 | `#334155` | dark border, secondary dark text |
| Slate 600 | `#475569` | body text (light) |
| Slate 500 | `#64748B` | muted text |
| Slate 400 | `#94A3B8` | faint text, icons |
| Slate 300 | `#CBD5E1` | disabled text, dividers (dark) |
| Slate 200 | `#E2E8F0` | light border, track |
| Slate 100 | `#F1F5F9` | subtle fill |
| Slate 50 | `#F8FAFC` | page background (light) |
| Emerald 500 | `#10B981` | primary accent, progress, success |
| Emerald 600 | `#059669` | completion banner gradient |
| Emerald 300 | `#6EE7B7` | dark-mode accent text |
| Emerald 800 | `#065F46` | accent text on light |
| Emerald 50 | `#ECFDF5` | accent tint |
| Emerald 50b | `#F0FDF4` | accent tint (alternate) |
| Amber 500 | `#F59E0B` | ওয়াজিব |
| Amber 300 | `#FDE68A` | warning border |
| Amber 50 | `#FFFBEB` | warning tint |
| Amber 800 | `#92400E` | warning text |
| Amber 600 | `#D97706` | warning icon |
| Indigo 500 | `#6366F1` | মুস্তাহাব / info |
| Red 500 | `#EF4444` | ফরয / destructive |
| Google Blue | `#4285F4` | map/directions action |
| Region green | `#2E7D32` | Madinah region |

**Dark hero gradient:** `#0F2027 → #203A43` (checklist hero).
**Light hero gradient:** emerald `#10B981`/`#059669` family, with a radial white highlight
(white at ~16% alpha) in the top-right corner and a soft shadow at ~30% alpha.

### 2.2 Region colors (places guide)

| Region | Color | Icon codepoint |
| --- | --- | --- |
| হিজাজ ও মিকাতসমূহ | `#795548` | `0xf724` |
| ইসলামের যুদ্ধক্ষেত্রসমূহ | `#C62828` | `0xf016b` |
| তায়েফ | `#5C6BC0` | `0xf021d` |
| মদিনা মুনাওয়ারা | `#2E7D32` | `0xf0355` |
| মক্কা মুকাররমা | `#D4A957` | `0xf0355` |
| সীরাত সফর | `#00695C` | `0xf7ee` |

Each region banner is a linear gradient of the region color at ~8% → transparent, with a 44 px
icon tile, a 15 px bold title, and a pill showing the place count.

### 2.3 Obligation colors

| Type | Color | Label |
| --- | --- | --- |
| ফরয | `#EF4444` | ফরয |
| ওয়াজিব | `#F59E0B` | ওয়াজিব |
| সুন্নাত | `#10B981` | সুন্নাত |
| মুস্তাহাব | `#6366F1` | মুস্তাহাব ও অন্যান্য |

### 2.4 Type scale (logical px)

| Token | Size / weight | Where |
| --- | --- | --- |
| Hero title | 19 / w800 | week guide, checklist, places headers |
| Section title | 15 / w800 | hub section headers |
| Card title | 17 / w700 | type detail, phase card |
| Feature title | 14.5 / w700 | hub feature cards |
| Accordion title | 13.5 / w700 | book accordion |
| Body | 13.5–14 / w400, height 1.6 | step detail, descriptions |
| Step title | 13 / w600 | timeline rows |
| Caption | 12–12.5 / w400–w600 | subtitles, notes |
| Micro | 10–11.5 / w700 | badges, chips, counts |
| Arabic | 23 / w400, right-aligned, height ~1.9 | dua block |
| Arabic (card) | 17–20 | inline arabic in step sheet |

### 2.5 Shape & elevation

- Radii: `12` (chips/inner), `14`, `16` (hero), `18` (headers), `22`, `24` (hero card), `999` (pills).
- Card border: `1px` slate at 6–8% alpha (light) / white at 8% (dark).
- Shadow: black 6–10% alpha, blur 12–18, offset `(0, 4–6)`.
- Icon tiles: 32 px (accordion), 44 px (region), 48 px (feature card), radius 12–14.
- Timeline node: 32 px circle, 2 px white ring, connector 2 px at 50% alpha.

### 2.6 Spacing

Base unit 4. Common values: 4, 6, 8, 10, 12, 14, 16, 20, 24.
Screen horizontal padding: **16**; card inner padding: **14–16**; section gap: **20–24**.

---

## 3. Shared components

### `_SectionHeader`
Accent bar (4 × 30, radius 2, emerald→gold gradient) + title 15/w800 + subtitle 11.5/w600,
right-aligned optional action. 16 px horizontal padding.

### `_FeatureCard`
Full-width tappable card, radius 18, gradient tint (emerald/amber variants) with 22% overlay.
48 px icon tile → title 14.5/w700 → subtitle 12/w400 → chevron 15. Padding 14–16, gap 10.

### `_BookAccordion`
Card, radius 16, 1 px border. Header row: 32 px icon tile (17 px icon), title 13.5/w700,
subtitle 12/w400, chevron 22 rotating 180° on expand. Expanded body: divider + item rows
(serial badge + title), each row opens the detail screen. Padding 12–14.

### `IslamicDetailScaffold`
Sliver app bar with gradient, circular back button (20 px icon), title 15/w700, optional subtitle
11/w600. Body is a list of `IslamicContentCard`s. Header strings: `"পাঠ: "`, `"বর্ণনায়: "`.

### `IslamicContentCard`
Card with radius 16, 1 px border at 6%, title 15/w800, body 14/w400 height 1.7, reference row
(book icon 12 + 11/w600 `"বর্ণনায়: "` + 11 italic reference), optional `IslamicArabicBlock`
(tinted panel, label 12/w700, arabic 23 right-aligned, transliteration 13 italic, translation).

### `IslamicArabicBlock`
Tinted container (surface at 4–6%), radius 12, label chip 11/w700, arabic 23/w400 RTL,
divider, transliteration 13 italic height 1.5, translation.

---

## 4. Screen specifications

### 4.1 Hub — `HajjMainScreen`

`Scaffold` → `CustomScrollView` (bouncing physics, no AppBar):

1. `SliverToBoxAdapter(HajjHeroHeader)`
2. `_SectionHeader("অনূদিত হজ-ওমরাহ গ্রন্থাবলী", "মাওলানা শাহ আব্দুল মতীন বিন হুসাইন")`
3. `SliverList` of four `_BookAccordion`s, one per book category:
   `hajj_virtues`, `umrah_guide`, `hajj_guide`, `hajj_guidelines`.
4. `_SectionHeader("হজ ও ওমরা গাইড", "ধাপে ধাপে গাইড — প্রতিটি ধাপ সম্পন্ন করুন")`
5. Row of two `_FeatureCard`s (equal width, gap 10):
   - `"এক নজরে হজ্বের এক সপ্তাহ"` / `"৭ থেকে ১৩ জিলহজ — সম্পূর্ণ বই পড়ুন"` → week guide
   - `"ধাপে ধাপে হজ্জ চেকলিস্ট"` / `"প্রতিটি আমল টিক দিয়ে এগিয়ে যান (সরাসরি ইন্টারঅ্যাক্টিভ)"` → checklist

> Order extracted from the `build` sliver construction in `hajj_main_screen.dart`
> (`0xc8503c` hero → `0xc850a4` books header → `0xc85158` books `SliverList` →
> `0xc8516c` guide header → `0xc851a8`/`0xc85220` feature cards). The books section is above
> the interactive guide cards.

The four categories are filtered from the loaded book catalog; `hajj_faq` (0 items) is hidden.
Accordion item tap → `IslamicDetailScaffold` screen for that category.

Loading state: centered `CircularProgressIndicator` (emerald) on the page background.

### 4.2 Hero header — `HajjHeroHeader`

Rounded card (radius 24), 16 px margin, gradient + radial highlight + shadow.

- Header row: mosque icon + `"হজ ও ওমরা গাইড"` (16/w800, white) + spacer + refresh circle button.
- City toggle (3 equal pills): `🇧🇩 ঢাকা` / `🕋 মক্কা` / `🕌 মদিনা`.
  Active pill = white 20% fill + white text; inactive = transparent + white 70%.
- Clock card (white 10% fill, radius 16):
  - `hh:mm:ss` + `AM/পূর্বাহ্ন` or `PM/অপরাহ্ন` (large, tabular).
  - Gregorian date `d MMM` (Bengali digits) + Hijri date.
  - Next-prayer line: name + `"চলছে"` state + countdown.
- Prayer strip: 5 compact columns (ফজর, যোহর, আসর, মাগরিব, এশা) with name 10.5 and time 12.5;
  the current prayer is highlighted (white 18% pill).
- Source labels: `"মসজিদুল হারামের সময়সূচী"` / `"মসজিদে নববীর সময়সূচী"`; Dhaka uses the
  user's local city.
- Times come from the Aladhan API (method 1, Hanafi); clock ticks every second; city change
  triggers a refetch; timers disposed on unmount.

### 4.3 Book detail screens — virtues / umrah / hajj / guidelines

All four are thin wrappers over `IslamicDetailScaffold`:

| Screen | App bar title | Subtitle | Content |
| --- | --- | --- | --- |
| `HajjVirtuesScreen` | `"ফজিলত"` | `"কোরআন ও হাদিসের আলোকে"` | `hajj_virtues` items |
| `UmrahStepsScreen` | `"ওমরা"` | `"NN টি ধাপ"` | `umrah_guide` items |
| `HajjStepsScreen` | `"হজ্জ"` | `"NN টি ধাপ"` | `hajj_guide` items |
| `HajjGuidelinesScreen` | `"দিকনির্দেশনা"` | `"আদব, নসিহত ও সতর্কতা"` | `hajj_guidelines` items |

Each item renders serial badge (`ধাপ ১`…), title, `fazilat` body, reference, optional `amal_text`.
This content already exists in `public/data/hajj_umrah.json` and is byte-identical to the app's copy.

### 4.4 Week guide — `HajjWeekGuideScreen`

Read-only reference. `CustomScrollView`:

1. `_Header` — gradient card (radius 18, shadow 30%), circular back button, title
   `"এক নজরে হজ্বের এক সপ্তাহ"` (19/w800), subtitle `"৭ থেকে ১৩ জিলহজ — দিনভিত্তিক আমল"`
   (12.5, white 90%).
2. `SliverList` of 7 `_DayCard`s, 7 → 13 জিলহজ. Each card groups its tasks by obligation
   type (ফরয → ওয়াজিব → সুন্নাত → মুস্তাহাব); empty groups render `"নেই"` in muted italic 13.
3. `_NoteStrip` — amber tinted strip (radius 12, 30% border) with info icon + note
   `"বি:দ্র: প্রতিদিনের আমলের মধ্যে ক, খ, গ, ঘ, ঙ, চ অনুযায়ী সিরিয়াল রক্ষা করতে হবে।"`
   (12.5, height 1.5).
4. Footer credit: `"সূত্র: দারসে মানসূর (darsemansoor.com) · Mobile App: Islami Jendegi · islamijendegi.com"`.

**`_DayCard`** — card radius 16, 1 px border, gradient header strip:

- Date chip: gradient pill with `"৭ জিলহজ"` (15/w800, white).
- Day title 13.5/w700.
- Body: for each obligation type in order (ফরয → ওয়াজিব → সুন্নাত → মুস্তাহাব), a group with a
  colored dot + label; tasks rendered as rows of `[code badge ক/খ/গ…] + text 12.5/height 1.5`.
  Empty groups render `"নেই"`.
- Tasks are filtered per type via `HajjDay.tasksOf(type)`; the stored order is preserved.

### 4.5 Checklist — `HajjWeekChecklistScreen`

Stateful; persisted in `SharedPreferences`:

- `hajj_checklist_type_index` (int, default 0 = তামাত্তু)
- `hajj_checklist_done_items` (string list; each key is `"<typeId>::<phaseIndex>::<stepIndex>"`)

`Scaffold` → `CustomScrollView`:

1. `_ChecklistHeroHeader` — dark gradient `#0F2027 → #203A43`, radius 18, title
   `"ধাপে ধাপে হজ্জ চেকলিস্ট"` (19/w800), subtitle
   `"সহজে আমলগুলো মনে রাখতে টিক দিয়ে এগিয়ে যান"` (12, white 85%).
   Right: 74 px circular progress ring (emerald, 7 px stroke) with `NN%` (19/w800).
   Bottom row: `"আপনার হজ্জের সফরসূচী"` (12/w600, white 85%) and
   `"X টি আমল সম্পন্ন / মোট Y টি"` pill (white 15% fill).
2. `_TypeTabSelector` — label `"হজ্জের প্রকার বেছে নিন"` + horizontal scroll of 4 type pills
   (name + tagline). Tapping changes the active type and resets the visible timeline.
   A `"তুলনামূলক ছক"` button opens the comparison table.
3. `_TypeDetailCard` — selected type summary:
   - Arabic name (16/w700) + Bengali name (17/w800) + tagline chip.
   - Summary bullet(s) 12.5.
   - Chips: `"উমরাহ সহ"` / `"উমরাহ ছাড়া"`, `"ইহরাম খোলা যায়"` / `"টানা ইহরাম"`,
     `"কুরবানী: …"`.
   - CTA: `"✓ এটি আপনার নির্বাচিত প্রকার"` (emerald outline) or `"এটি বেছে নিন"`.
4. `_CompletionBanner` (only at 100%) — emerald gradient card (radius 18), 🎉,
   `"আলহামদুলিল্লাহ! 🎉"` + `"আপনি <type>-এর সকল ধাপ সফলভাবে সম্পন্ন করেছেন। আল্লাহ সুবহানাহু ওয়া
   তা’আলা আপনার হজ্জ ও আমলসমূহ কবুল করুন। আমীন।"`
5. `SliverList` of `_TimelinePhaseCard` for the selected type's phases.

**`_TimelinePhaseCard`**

- Left rail: 32 px node (icon or phase number), 2 px connector, 2.5 px gap.
- Header: phase title 13/w700 + step count `(n)` 11.
- Steps: `_StepRowTile` list.

**`_StepRowTile`**

- Leading circular checkbox (22 px) — emerald filled + white check when done; slate outline otherwise.
- Title 13/w600, strikethrough + 60% opacity when done.
- Ruling chip (colored by type, 10/w700).
- Trailing `"বিস্তারিত ও দোয়া"` (11/w600) + chevron.
- Tap row → `_StepDetailSheet`.

**`_StepDetailSheet`** (modal bottom sheet, drag handle, max height ~88%)

- Ruling chip + step title 17/w800 + hint 12.5 (muted).
- `"আমল ও সঠিক নিয়ম"` section label 15/w700, body 13.5/height 1.6 on a tinted panel.
- `"মাসনূন দো’আ"` section (only when the step has `arabic`):
  - Arabic 23 RTL, right-aligned, height ~1.9.
  - `"উচ্চারণ: "` label + transliteration 13 italic.
  - `"অর্থ: "` label + translation 13.5.
  - `"দোআ কপি করুন"` icon button → clipboard → snackbar `"দোয়া কপি করা হয়েছে"`.
- Location chip (`"স্থান: মক্কা"` etc.).
- `"ম্যাপে দেখুন"` button → `HajjMapScreen`.
- Completion toggle: `"আমল সম্পন্ন হিসেবে মার্ক করুন"` / `"আমলটি সম্পন্ন হয়েছে (টিক দেওয়া আছে)"`.
- Closing the sheet updates the checklist + progress ring + completion banner.

**`_ComparisonTableTab` / comparison sheet**

- Header: `"এক নজরে ৪টি হজ্জের মূল বিষয় ও পার্থক্যের তুলনামূলক ছক:"` (12.5/w600) with a table icon.
- `DataTable`: first column `"বিষয় / উপাদান"`; 4 type columns.
- Rows (exact copy):
  1. `"১. উমরাহ করা"` — হ্যাঁ (আলাদা) / হ্যাঁ (একসাথে) / নেই / শুধু উমরাহ
  2. `"২. ইহরাম খোলা"` — উমরাহর পর মুক্ত / টানা ইহরামে / টানা ইহরামে / উমরাহর পর মুক্ত
  3. `"৩. কুরবানী/দম"` — ওয়াজিব (শুকরানা) / ওয়াজিব (শুকরানা) / মুস্তাহাব / প্রযোজ্য নয়
  4. `"৪. উপযোগিতা"` — বাংলাদেশীদের সেরা / সর্বোচ্চ ফযীলত / মক্কাবাসীদের জন্য / বছরের যেকোনো সময়
- Cell colors: affirmative = emerald, negative = red, neutral = slate.
- Tip strip: `"💡 টিপস: আপনি যদি বাংলাদেশ থেকে প্রথমবার হজ্জে যান, তবে "হজ্জে তামাত্তু" নির্বাচন করা
  সবচেয়ে সুন্নাতসম্মত, সহজ ও আনন্দদায়ক।"`

### 4.6 Places guide — `HajjPlacesGuideScreen`

`CustomScrollView` + `SliverAppBar` (gradient, back button):

- Title `"সীরাত মানচিত্র"` (19/w800), subtitle `"Historical Places & Islamic Heritage"` (9.5/w600,
  uppercase-ish, white 45%).
- Filter bar: 9 chips — `সব · সীরাত · মক্কা · মদিনা · তায়েফ · যুদ্ধ · মসজিদ · গুহা · মিকাত`.
  Active chip = filled emerald, inactive = surface with 6% border. Sticky under the app bar.
- Count strip: `"NN টি"` pill.
- Region sections: `_buildRegionBanner` (gradient by region color, 44 px icon tile, title,
  count) followed by place cards.
- Footer: `"মোট NN টি স্থান"`.

**`_buildPlaceCard`**

- Title 14/w700, English name 11.5/w500 (muted), description 12.5/height 1.6 (max 3–4 lines).
- Coordinate row (pin icon + `lat, lng` 10.5).
- Action row: `"ম্যাপে দেখুন"` (Google Maps place URL, blue) and `"যেভাবে যাবেন"`
  (directions URL, emerald).
- URL templates:
  - place: `https://www.google.com/maps/place/<lat>,<lng>/@<lat>,<lng>,16z/data=!3m1!1e3`
  - directions: `https://www.google.com/maps/dir//<lat>,<lng>/@<lat>,<lng>,14z/data=!3m1!1e3`

**Filter semantics** (applied to region + place text):

| Chip | Match |
| --- | --- |
| সব | everything |
| সীরাত | region `সীরাত সফর` |
| মক্কা | region `মক্কা মুকাররমা` |
| মদিনা | region `মদিনা মুনাওয়ারা` |
| তায়েফ | region `তায়েফ` |
| যুদ্ধ | region `ইসলামের যুদ্ধক্ষেত্রসমূহ` |
| মসজিদ | place title/description contains `মসজিদ` or `masjid` |
| গুহা | contains `গুহা`, `গার`, or `cave` |
| মিকাত | contains `মিকাত` or `miqat` |

### 4.7 Map — `HajjMapScreen`

Full-screen `FlutterMap` (OpenStreetMap tiles, EPSG:3857), initial center Makkah
(`21.4225, 39.8262`), zoom ~11, marker layer for the 17 `HistoricalPlace` records.

Overlays:

- Top card (radius 18): back button, title `"ইসলামিক স্থানসমূহের মানচিত্র"` (14.5/w700),
  subtitle `"মক্কা, মদিনা ও হিজাজ অঞ্চলের পবিত্র স্থানসমূহ"` (10.5), list button
  `"স্থানসমূহের তালিকা"` (13/w600).
- Filter chips: `সব · মক্কা · মদিনা · হিজাজ` (region match).
- Markers: colored pin by region (মক্কা gold, মদিনা green, হিজাজ brown), selected marker larger.
- Tap marker → small info card (name + `"Google Maps-এ দেখুন"`).
- List button → bottom sheet `"গুরুত্বপূর্ণ স্থানসমূহ (N টি স্থান)"` grouped by region; tapping an
  item closes the sheet and `_focusPlace` animates the map to it.
- Zoom controls (+, −) bottom-right; attribution bottom-left.

---

## 5. Content inventory

### 5.1 Book categories (already on the website)

| id | title | items |
| --- | --- | --- |
| `hajj_virtues` | হজ ও ওমরা এর ফজিলত | 5 |
| `umrah_guide` | ওমরা | 18 |
| `hajj_guide` | হজ্জ | 12 |
| `hajj_guidelines` | হজ ও ওমরা এর গুরুত্বপূর্ণ দিকনির্দেশনা | 12 |
| `hajj_faq` | হজ ও ওমরা কেন্দ্রিক যেকোন জিজ্ঞাসা | 0 (coming soon) |

Source: `public/data/hajj_umrah.json` (identical to the APK asset, sha256 `f95669dd…`).

### 5.2 Week guide — `week-guide.json`

7 days (৭–১৩ জিলহজ), 26 tasks, grouped by obligation type:

| Day | Title | Tasks |
| --- | --- | --- |
| ৭ | ইহরাম ও যাত্রার প্রস্তুতি | 4 |
| ৮ | মিনায় অবস্থান | 2 |
| ৯ | আরাফার দিন | 4 |
| ১০ | কুরবানী ও কংকর নিক্ষেপ | 6 |
| ১১ | কংকর নিক্ষেপ | 4 |
| ১২ | কংকর নিক্ষেপ ও তাওয়াফ | 3 |
| ১৩ | বিদায়ী তাওয়াফ | 3 |

Task codes `ক খ গ ঘ ঙ চ` are sequence markers, not display order.

### 5.3 Pilgrimage — `pilgrimage.json`

| Type | Phases | Steps |
| --- | --- | --- |
| হজ্জে তামাত্তু (`tamattu`) | 10 | 29 |
| হজ্জে ক্বেরান (`qiran`) | 8 | 23 |
| হজ্জে ইফরাদ (`ifrad`) | 7 | 21 |
| উমরাহ (`umrah`) | 4 | 11 |

Phase composition:

- **উমরাহ phases:** ১. ইহরাম (3) → ২. তাওয়াফ (4) → ৩. সাঈ (2) → ৪. হালাল হওয়া (2)
- **হজ্জ phases:** ৮ জিলহজ — মিনা (3) → ৯ জিলহজ — আরাফা (4) → ৯–১০ জিলহজ — মুযদালিফা (3) →
  ১০ জিলহজ — ইয়াওমুন নাহর (5) → ১১–১৩ জিলহজ — আইয়ামে তাশরীক্ব (2) → বিদায়ী আমল (1)
- **ক্বেরান** replaces the umrah block with: ১. ইহরাম (উমরাহ ও হজ্জ একসাথে) (2) +
  ২. উমরাহর কাজ (3), then the hajj phases.
- **ইফরাদ** replaces the umrah block with: ১. ইহরাম (শুধু হজ্জ) (3), then the hajj phases.

Step schema: `title`, `hint`, `ruling` (ফরয/ওয়াজিব/সুন্নত/রুকন), `arabic?`,
`transliteration?`, `translation?`, `detail`, `location`.

### 5.4 Places — `places.json`

6 regions, 65 places:

| Region | Places |
| --- | --- |
| হিজাজ ও মিকাতসমূহ | 5 |
| ইসলামের যুদ্ধক্ষেত্রসমূহ | 7 |
| তায়েফ | 3 |
| মদিনা মুনাওয়ারা | 10 |
| মক্কা মুকাররমা | 13 |
| সীরাত সফর | 27 |

### 5.5 Map — `map-places.json`

17 places with `title`, `titleEn`, `region` (হিজাজ/মদিনা/মক্কা), `lat`, `lng`.
Includes Masjid al-Haram, Masjid an-Nabawi, Arafat, Mina, Muzdalifah, Quba, Qiblatayn, Uhud,
Badr, Seven Mosques, Jannat al-Baqi, Masjid al-Jinn, Bir Shifa, Miqat Dhul Hulaifah, etc.

---

## 6. Website gap matrix

Current page: `app/hajj-umrah/page.tsx` → `FeatureListPage` (`components/FeatureList.tsx`):
search + category chips + accordion of book items. It renders `serial`, `title`, `fazilat`,
`reference`, `amal_text`.

| App feature | Current website | Gap |
| --- | --- | --- |
| Hub with hero + two guide cards | Generic page head | **Missing** hero, feature cards, section structure |
| Prayer hero (Dhaka/Makkah/Madinah, clock, next prayer) | — | **Missing** (but `lib/prayer.ts` + `/api/prayer` exist) |
| Book accordions by category | Search + chips + accordion | Present, different interaction; can be kept as "গ্রন্থাবলী" section |
| Book detail screens | Inline accordion body | Acceptable; optional dedicated route |
| Week guide (7 day cards, type legend, note, credit) | — | **Missing** |
| Checklist (type picker, timeline, progress, persistence) | — | **Missing** |
| Type comparison table + tip | — | **Missing** |
| Step detail sheet (ruling, arabic, transliteration, translation, copy, location, map link) | — | **Missing** (JSON has no arabic/transliteration fields) |
| Places guide (9 filters, 6 region banners, 65 cards, Maps actions) | — | **Missing** |
| Map (OSM, 17 markers, filters, list sheet) | — | **Missing** |
| Localization bn/en/ur | `useT/useTx` on UI strings | Hardcoded Bengali data needs translation strategy |

Existing reusable pieces: `lib/prayer.ts` (`fetchPrayerData`, `CITIES`, `prayerName`,
`formatTime12`, `formatCountdown`), `components/ui.tsx` (`PageHead`, `SectionTitle`),
`components/icons.tsx` (`kaaba`, `mosque`, `compass`, `mountain`, `clock`, `pin`, `check`, …),
`tailwind.config.js` tokens (emerald/gold/sand/ink).

---

## 7. Suggested implementation plan

**Phase 0 — data layer**
- Copy the four JSON files into `public/data/hajj/` (or import as TS modules).
- Add `lib/hajj.ts` with types (`WeekDay`, `PilgrimageType`, `Phase`, `Step`, `Place`, `Region`)
  and helpers (`totalSteps`, `stepId`, `groupByType`, `filterPlaces`).
- Add English/Urdu overlays later; fall back to Bengali.

**Phase 1 — hub**
- Replace `FeatureListPage` with a dedicated `app/hajj-umrah/page.tsx`:
  hero card (prayer-aware), two feature cards, book accordions (reuse the JSON content),
  links to `/hajj-umrah/week`, `/hajj-umrah/checklist`, `/hajj-umrah/places`.

**Phase 2 — week guide**
- `app/hajj-umrah/week/page.tsx`: legend, note strip, 7 day cards grouped by type, credit.
- Reuse `PageHead` or build a gradient header consistent with the site.

**Phase 3 — checklist**
- `app/hajj-umrah/checklist/page.tsx` (client):
  type picker, type detail card, comparison table (`<table>` or responsive cards on mobile),
  timeline, step sheet (`<dialog>`/sheet), progress ring, completion banner.
- Persist in `localStorage` under the same keys (`hajj_checklist_type_index`,
  `hajj_checklist_done_items`) for parity.

**Phase 4 — places + map**
- `app/hajj-umrah/places/page.tsx`: filters, region banners, cards, Google Maps links.
- Map: choose one —
  (a) add `leaflet` + `react-leaflet` (matches the app's OSM tiles), or
  (b) embed Google Maps iframe (no new dependency, less control).
  Recommendation: (a) for marker/filter parity; ask before adding a dependency.

**Phase 5 — hero polish**
- Wire `fetchPrayerData` for Dhaka/Makkah/Madinah, tick the clock, highlight the current prayer,
  respect system/light/dark.

**Accessibility & responsiveness**
- All grids collapse to 1 column under `sm`; filter chips scroll horizontally.
- Checkboxes are real `<input type="checkbox">` or `role="checkbox"` with keyboard support.
- Arabic blocks use `dir="rtl"` and `lang="ar"`.

---

## 8. Open decisions

1. **URL structure** — sub-routes (`/hajj-umrah/week`, `/checklist`, `/places`, `/map`) vs a single
   tabbed page. Sub-routes are recommended for deep links and back behavior.
2. **Map provider** — Leaflet/OSM (new dependency) vs Google Maps embed.
3. **Localization of hardcoded data** — translate the week/checklist/places data into en/ur, or
   show Bengali only with localized chrome. The app itself is Bengali-only for this content.
4. **Book content placement** — keep the existing search/chips/accordion as a "গ্রন্থাবলী" section,
   or move it to `/hajj-umrah/books`.
5. **Design fidelity** — reuse website tokens (emerald/gold/sand/ink) rather than copying the APK's
   slate-heavy palette; keep the app's information architecture and interactions.
