import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import AudioPlayer from "../components/audio/AudioPlayer";
import MiniPlayer from "../components/audio/MiniPlayer";
import EngineWarmup from "../components/audio/EngineWarmup";
import NotificationAlerts from "../components/NotificationAlerts";

const arabicFont = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const hindFont = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: "islah - দ্বীনি জীবনের সাথী",
  description:
    "IslahBD ওয়েব: কুরআন, নামাজের সময়, কিবলা, তাসবীহ, দোআ, বয়ান, হামদ-নাত, হজ-ওমরাহ, লাইভ বয়ান, লাইব্রেরি ও আরও অনেক কিছু।",
  applicationName: "islah",
  // Installable PWA (app/manifest.ts) — required for background notifications
  // and Web Push on iOS.
  appleWebApp: { capable: true, title: "islah", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B6248",
};

// Pre-paint: apply persisted theme/design/language before first render (no
// flash). Mirrors beta Layout.astro — keys islah-theme / islah-design /
// islah-language.
const PREPAINT = `(function(){try{var t=null;try{t=JSON.parse(localStorage.getItem('islah-theme')||'null')}catch(e){}var theme=t&&t.state&&t.state.theme?t.state.theme:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(theme==='dark')document.documentElement.classList.add('dark');var d=null;try{d=JSON.parse(localStorage.getItem('islah-design')||'null')}catch(e){}var mode=d&&d.state&&d.state.mode?d.state.mode:(/Android/i.test(navigator.userAgent)?'material':'liquid');if(mode==='liquid')document.documentElement.classList.add('glass');var l=null;try{l=JSON.parse(localStorage.getItem('islah-language')||'null')}catch(e){}var lang=l&&l.state&&l.state.lang?l.state.lang:'bn';document.documentElement.lang=lang;document.documentElement.dir='ltr';if(lang==='ur')document.documentElement.classList.add('lang-ur');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${arabicFont.variable} ${hindFont.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <AppShell>{children}</AppShell>
        <EngineWarmup />
        <NotificationAlerts />
        <AudioPlayer />
        <MiniPlayer />
      </body>
    </html>
  );
}
