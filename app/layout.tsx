import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import AudioPlayer from "../components/audio/AudioPlayer";
import MiniPlayer from "../components/audio/MiniPlayer";

const arabicFont = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Islah – দ্বীন জীবনের সঙ্গী",
  description:
    "IslahBD ওয়েব: কুরআন, নামাজের সময়, কিবলা, তাসবীহ, দোআ, বয়ান, হামদ-নাত, হজ-ওমরাহ, লাইভ বয়ান, লাইব্রেরি ও আরও অনেক কিছু।",
};

export const viewport: Viewport = {
  themeColor: "#0B6248",
};

// Pre-paint: apply persisted theme/design before first render (no flash).
// Mirrors beta Layout.astro — keys islah-theme / islah-design.
const PREPAINT = `(function(){try{var t=null;try{t=JSON.parse(localStorage.getItem('islah-theme')||'null')}catch(e){}var theme=t&&t.state&&t.state.theme?t.state.theme:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(theme==='dark')document.documentElement.classList.add('dark');var d=null;try{d=JSON.parse(localStorage.getItem('islah-design')||'null')}catch(e){}var mode=d&&d.state&&d.state.mode?d.state.mode:(/Android/i.test(navigator.userAgent)?'material':'liquid');if(mode==='liquid')document.documentElement.classList.add('glass');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={arabicFont.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <AppShell>{children}</AppShell>
        <AudioPlayer />
        <MiniPlayer />
      </body>
    </html>
  );
}
