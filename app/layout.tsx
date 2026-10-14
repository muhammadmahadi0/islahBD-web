import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";
import { PlayerProvider } from "../components/audio/player";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={arabicFont.variable}>
      <body>
        <PlayerProvider>
          <AppShell>{children}</AppShell>
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
