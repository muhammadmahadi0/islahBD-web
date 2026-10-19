import type { MetadataRoute } from "next";

// PWA manifest — installability is what unlocks background notification
// delivery (and is required for Web Push on iOS 16.4+).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "islah - দ্বীনি জীবনের সাথী",
    short_name: "islah",
    description:
      "IslahBD ওয়েব: কুরআন, নামাজের সময়, কিবলা, বয়ান, লাইভ, লাইব্রেরি ও আরও অনেক কিছু।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B6248",
    theme_color: "#0B6248",
    lang: "bn",
    dir: "ltr",
    categories: ["education", "lifestyle"],
    icons: [
      { src: "/images/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
