// Mirrors package:islahbd/models/feature_registry.dart +
// package:islahbd/features/home/widgets/home_grid_navigation.dart
export type Feature = {
  route: string;
  titleBn: string;
  titleEn: string;
  icon: string;
  tint: string; // tile bg
  color: string; // icon color
  desc?: string;
};

const T = {
  emerald: { tint: "bg-emerald-50", color: "text-primary-600" },
  gold: { tint: "bg-amber-50", color: "text-gold-600" },
  teal: { tint: "bg-teal-50", color: "text-teal-600" },
  sky: { tint: "bg-sky-50", color: "text-sky-600" },
  rose: { tint: "bg-rose-50", color: "text-rose-500" },
  violet: { tint: "bg-violet-50", color: "text-violet-600" },
  orange: { tint: "bg-orange-50", color: "text-orange-500" },
  indigo: { tint: "bg-indigo-50", color: "text-indigo-500" },
};

export const homeGrid: Feature[] = [
  { route: "/quran", titleBn: "কুরআন", titleEn: "Quran", icon: "openbook", ...T.emerald },
  { route: "/prayer-times", titleBn: "নামাজের সময়", titleEn: "Prayer Times", icon: "clock", ...T.teal },
  { route: "/qibla", titleBn: "কিবলা", titleEn: "Qibla", icon: "compass", ...T.sky },
  { route: "/tasbeeh", titleBn: "ডিজিটাল তাসবীহ", titleEn: "Tasbeeh", icon: "beads", ...T.violet },
  { route: "/dua", titleBn: "দোআ", titleEn: "Dua", icon: "hands", ...T.gold },
  { route: "/wazifa", titleBn: "ওয়াজিফা ও দরূদ", titleEn: "Wazifa", icon: "sparkle", ...T.orange },
  { route: "/amal", titleBn: "আমল", titleEn: "Amal", icon: "moon", ...T.indigo },
  { route: "/sunnat", titleBn: "সুন্নাত ও আদব", titleEn: "Sunnat", icon: "leaf", ...T.emerald },
  { route: "/fazilat", titleBn: "ফযীলত", titleEn: "Fazilat", icon: "gem", ...T.rose },
  { route: "/hajj-umrah", titleBn: "হজ ও ওমরাহ", titleEn: "Hajj & Umrah", icon: "kaaba", ...T.gold },
  { route: "/calendar", titleBn: "ইসলামিক ক্যালেন্ডার", titleEn: "Calendar", icon: "calendar", ...T.sky },
  { route: "/poem", titleBn: "আধ্যাত্মিক কবিতা", titleEn: "Poetry", icon: "feather", ...T.violet },
  { route: "/malfuzat", titleBn: "মালফুযাত", titleEn: "Malfuzat", icon: "chat", ...T.teal },
  { route: "/self-purification", titleBn: "আত্মশুদ্ধি", titleEn: "Purification", icon: "heart", ...T.rose },
  { route: "/live", titleBn: "লাইভ বয়ান", titleEn: "Live", icon: "radio", ...T.rose },
  { route: "/boyan", titleBn: "বয়ান", titleEn: "Boyan", icon: "mic", ...T.teal },
  { route: "/hamdnaat", titleBn: "হামদ ও নাত", titleEn: "Hamd/Naat", icon: "music", ...T.violet },
  { route: "/library", titleBn: "লাইব্রেরি", titleEn: "Library", icon: "library", ...T.orange },
  { route: "/media", titleBn: "সংক্ষিপ্ত ক্লিপস", titleEn: "Short Clips", icon: "play", ...T.sky },
  { route: "/gallery", titleBn: "গ্যালারি", titleEn: "Gallery", icon: "image", ...T.indigo },
  { route: "/nearby-mosque", titleBn: "কাছের মসজিদ", titleEn: "Mosques", icon: "mosque", ...T.emerald },
  { route: "/paribar", titleBn: "পরিবার / বাইআত", titleEn: "Paribar", icon: "users", ...T.orange },
  { route: "/fatwa", titleBn: "শরঈ জিজ্ঞাসা", titleEn: "Fatwa", icon: "help", ...T.gold },
  { route: "/notice", titleBn: "নোটিশ বোর্ড", titleEn: "Notice", icon: "mega", ...T.sky },
];

export const bottomTabs = [
  { route: "/", label: "হোম", icon: "home" },
  { route: "/quran", label: "কুরআন", icon: "book" },
  { route: "/live", label: "লাইভ", icon: "radio" },
  { route: "/library", label: "লাইব্রেরি", icon: "library" },
  { route: "/others", label: "আরও", icon: "grid" },
];
