import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "Islah – দ্বীন জীবনের সঙ্গী",
  description:
    "IslahBD ওয়েব ক্লোন (com.islahbd.app v1.3.0): কুরআন, নামাজের সময়, কিবলা, তাসবীহ, দোআ, হজ-ওমরাহ, লাইভ বয়ান, লাইব্রেরি ও আরও অনেক কিছু।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
