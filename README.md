# Islah Web — দ্বীন জীবনের সঙ্গী (Web Clone)

Android app `com.islahbd.app` **v1.3.0 (v27)** — `Islah-দ্বীন জীবনের সঙ্গী_1.3.0_apkcube.apk` (Flutter) এর ফাংশন-বাই-ফাংশন ওয়েব ক্লোন (Next.js 14 + Tailwind)।

## Source analysis (from APK)
- Flutter app (`libapp.so` + `assets/flutter_assets`), API base `https://api.islahbd.com`, package `com.islahbd.app`
- Offline JSON bundled in `public/data/`: `amal, dua, wazifa, sunnat, fazilat, hajj_umrah, islamic_calendar, spiritual_poetry, hakim_akhtar (269 poems), quran_database (6236 ayahs), hafezi_pages (610), quran_irab`
- Fonts: Kalpurush (Bengali), ScheherazadeNew (Arabic), Inter, AbrilFatface — copied to `public/fonts`
- Images: kaaba, mushaf covers, Quran banners — copied to `public/images`
- 80+ Dart screens mapped to routes below (class names from `libapp.so` strings).

## Screen → Route map (every button/action)
| App screen (Dart) | Web route | Action covered |
|---|---|---|
| SplashScreen | `/` (header) | branding |
| HomeScreen, HomeGridNavigation, HomePrayerCard, HomeSliderSection, HomeMultimediaSection | `/` | prayer card, grid, slider notices, multimedia |
| QuranLandingScreen | `/quran` | 4 tiles |
| TanzilDigitalQuranScreen, InteractiveMushafScreen, QuranNavDrawer, bookmarks | `/quran/read` | surah select, search, bookmarks, juz/page, copy/share |
| QuranMp3PlayerScreen, Mp3DownloadsScreen, Mp3FullPlayerScreen, QariSelector, Mp3FloatingPlayer | `/quran/audio` | qari select, surah audio (everyayah), download list |
| QuranSearchScreen, WBW, Irab | `/quran/search` | full-text search, irab grammar, quran.com WBW link |
| QuranManuscriptsScreen | `/quran` tile | cover images |
| PrayerTimesScreen, LocationSetup/Settings, PrayerAlarmBottomSheet, SunPath | `/prayer-times` | GPS/manual, Hanafi/Karachi, alarm |
| QiblaScreen, QiblaCompass | `/qibla` | live compass + Kaaba bearing |
| TasbeehScreen, TasbeehHistory | `/tasbeeh` | counter, target, vibrate, history, clear |
| NearbyMosqueScreen | `/nearby-mosque` | Overpass mosques + Google Maps |
| DuaScreen, CollapsibleDuaCard, MunajateMaqbulMain/Detail/Drawer | `/dua`, `/munajate` | categories, search, expand, copy/share |
| WazifaMainScreen | `/wazifa` | same pattern |
| AmalMainScreen, AmalDetailScreen/Card, SalikeenAmalScreen, AmalHitlistView, AmalTouchItem, custom AmalLog | `/amal` | same + custom amal link |
| SunnatMain/Detail | `/sunnat` | same |
| FazilatMain/Detail | `/fazilat` | same |
| HajjMain/Steps/Virtues/Guidelines/Map/PlacesGuide/WeekGuide/WeekChecklist/UmrahSteps | `/hajj-umrah` | all categories in one searchable list |
| IslamicCalendarScreen | `/calendar` | month-wise history |
| PoemScreen, PoetPoemDetailScreen, copy/share/expand | `/poem` | poets tab + 269 Hakim Akhtar poems |
| MalfuzatScreen, DailyDialog, bookmarks, reactions | `/malfuzat` | live API + local bookmarks + reaction |
| SelfPurificationScreen + config | `/self-purification` | live API list |
| LiveScreen, HolySitesLiveScreen, HolySiteLivePlayerScreen, NextBoyanCountdown, RecurringMajlis, BayanHistory/Reminders, LiveChat | `/live` | status JSON, YouTube links, Makkah/Madinah, reminders |
| LibraryScreen, BookDetail/Reader, PdfViewerScreen, BookshopScreen, BookPdfDownloader | `/library` | live books API + read/download PDF |
| VideoScreen, ShortClipsScreen | `/media` | videos tab |
| NasheedScreen, NasheedHistoryScreen, AudioCard/Provider/Download/History | `/media` (audios/nasheeds tabs), `/nasheed` redirect | audio players |
| GalleryScreen, AlbumDetailScreen | `/gallery` | albums grid |
| WallpaperScreen, WallpaperCard | `/gallery` + `/wallpaper` redirect | download |
| ParibarScreen, ParibarForms, BaiyatGuidanceScreen, BaiyatFormSheet, HazratDetailScreen, ShaykhMissionScreen | `/paribar` | apply form POST /api/paribar/apply/ |
| SharaiJigashaScreen, AskQuestionModal, fatwa cats/my-questions | `/fatwa` | search + ask form |
| NoticeList/DetailScreen | `/notice` | expandable + copy |
| NotificationList/NotificationsScreen, NotificationRouter/Service, SmartOverlay, NotificationPermissionScreen | `/notifications`, `/settings` | list + permission |
| DonateScreen | `/donate` | copy account info |
| SupportCenterScreen | `/support` | FAQ from app strings |
| SettingsScreen, DeveloperScreen, HomeWidgetsScreen, BayanRemindersScreen | `/settings` | theme, font, permission, member |
| OthersScreen | `/others` | all-features hub |
| ComingSoonScreen, DisplayFeatureSubScreen | inline fallbacks | — |
| LifetimeMemberWebviewScreen | `/member` | iframe islahbd.com/lifetime-member?isApp=true |

## Online APIs proxied (same as app)
`api.islahbd.com`: books, audios, videos, clips, nasheeds, gallery, wallpapers, notices, notifications, live/status, next-boyan, recurring-majlis, malfuzat, self-purification, fatwa(+ask, cats), paribar/apply, amal-categories, quran tawzihul translation/tafseer. Plus `everyayah.com` audio, `quran.com/api/v4` WBW, `overpass` mosques.

## Run
```bash
cd "islah-web"
npm install
npm run dev   # http://localhost:3000
npm run build && npm start
```
