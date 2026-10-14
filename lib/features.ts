// Mirrors package:islahbd/models/feature_registry.dart +
// package:islahbd/features/home/widgets/home_grid_navigation.dart
export type Feature = {
  route: string; titleBn: string; titleEn: string; icon: string; desc?: string;
};

export const homeGrid: Feature[] = [
  { route: "/quran", titleBn: "কুরআন", titleEn: "Quran", icon: "📖" },
  { route: "/prayer-times", titleBn: "নামাজের সময়", titleEn: "Prayer Times", icon: "🕌" },
  { route: "/qibla", titleBn: "কিবলা", titleEn: "Qibla", icon: "🧭" },
  { route: "/tasbeeh", titleBn: "ডিজিটাল তাসবীহ", titleEn: "Tasbeeh", icon: "📿" },
  { route: "/dua", titleBn: "দোআ", titleEn: "Dua", icon: "🤲" },
  { route: "/wazifa", titleBn: "ওয়াজিফা ও দরূদ", titleEn: "Wazifa", icon: "✨" },
  { route: "/amal", titleBn: "আমল", titleEn: "Amal", icon: "🌙" },
  { route: "/sunnat", titleBn: "সুন্নাত ও আদব", titleEn: "Sunnat", icon: "🌿" },
  { route: "/fazilat", titleBn: "ফযীলত", titleEn: "Fazilat", icon: "💎" },
  { route: "/hajj-umrah", titleBn: "হজ ও ওমরাহ", titleEn: "Hajj & Umrah", icon: "🕋" },
  { route: "/calendar", titleBn: "ইসলামিক ক্যালেন্ডার", titleEn: "Calendar", icon: "📅" },
  { route: "/poem", titleBn: "আধ্যাত্মিক কবিতা", titleEn: "Poetry", icon: "🪶" },
  { route: "/malfuzat", titleBn: "মালফুযাত", titleEn: "Malfuzat", icon: "💬" },
  { route: "/self-purification", titleBn: "আত্মশুদ্ধি", titleEn: "Purification", icon: "🤍" },
  { route: "/live", titleBn: "লাইভ বয়ান", titleEn: "Live", icon: "🔴" },
  { route: "/library", titleBn: "লাইব্রেরি", titleEn: "Library", icon: "📚" },
  { route: "/media", titleBn: "ভিডিও", titleEn: "Videos", icon: "🎬" },
  { route: "/nasheed", titleBn: "নাশীদ / অডিও", titleEn: "Nasheed", icon: "🎧" },
  { route: "/gallery", titleBn: "গ্যালারি", titleEn: "Gallery", icon: "🖼️" },
  { route: "/wallpaper", titleBn: "ওয়ালপেপার", titleEn: "Wallpaper", icon: "🌄" },
  { route: "/nearby-mosque", titleBn: "কাছের মসজিদ", titleEn: "Mosques", icon: "🕌" },
  { route: "/paribar", titleBn: "পরিবার / বাইআত", titleEn: "Paribar", icon: "👨‍👩‍👧" },
  { route: "/fatwa", titleBn: "শরঈ জিজ্ঞাসা", titleEn: "Fatwa", icon: "❓" },
  { route: "/notice", titleBn: "নোটিশ বোর্ড", titleEn: "Notice", icon: "📢" },
];

export const bottomTabs = [
  { route: "/", label: "হোম", icon: "🏠" },
  { route: "/quran", label: "কুরআন", icon: "📖" },
  { route: "/live", label: "লাইভ", icon: "🔴" },
  { route: "/library", label: "লাইব্রেরি", icon: "📚" },
  { route: "/others", label: "আরও", icon: "☰" },
];
