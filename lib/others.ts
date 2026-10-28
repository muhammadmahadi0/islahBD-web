// "Others" hub — categorised feature directory (mirrors the mobile mockup).
export type OthersItem = {
  titleBn: string;
  icon: string;
  color: string;
  route?: string;
  soon?: boolean;
};

export type OthersSection = {
  titleBn: string;
  icon: string;
  accent: string; // text colour for the rail + section icon
  items: OthersItem[];
};

export const othersSections: OthersSection[] = [
  {
    titleBn: "ইবাদত",
    icon: "mosque",
    accent: "text-orange-500",
    items: [
      { titleBn: "নামাজের সময়", icon: "clock", color: "text-orange-500", route: "/prayer-times" },
      { titleBn: "কিবলা", icon: "compass", color: "text-sky-500", route: "/qibla" },
      { titleBn: "ডিজিটাল তাসবীহ", icon: "beads", color: "text-emerald-500", route: "/tasbeeh" },
      { titleBn: "কাছের মসজিদ", icon: "mosque", color: "text-emerald-500", route: "/nearby-mosque" },
      { titleBn: "হজ ও ওমরাহ", icon: "kaaba", color: "text-sky-500", route: "/hajj-umrah" },
      { titleBn: "সুন্নাত ও আদব", icon: "leaf", color: "text-amber-500", route: "/sunnat" },
      { titleBn: "ওয়াজিফা ও দরূদ", icon: "sparkle", color: "text-violet-500", route: "/wazifa" },
      { titleBn: "দোআ", icon: "hands", color: "text-gold-600", route: "/dua" },
      { titleBn: "মুনাজাতে মাকবুল", icon: "hands", color: "text-emerald-500", route: "/munajate" },
      { titleBn: "আত্মশুদ্ধি", icon: "heart", color: "text-rose-500", route: "/self-purification" },
      { titleBn: "আমল", icon: "moon", color: "text-indigo-500", route: "/amal" },
    ],
  },
  {
    titleBn: "ইলম",
    icon: "book",
    accent: "text-teal-500",
    items: [
      { titleBn: "সীরাত মানচিত্র", icon: "globe", color: "text-teal-500", route: "/seerah" },
      { titleBn: "ফযীলত", icon: "star", color: "text-orange-500", route: "/fazilat" },
      { titleBn: "ইসলামিক ক্যালেন্ডার", icon: "calendar", color: "text-teal-500", route: "/calendar" },
      { titleBn: "কুরআন", icon: "openbook", color: "text-teal-500", route: "/quran" },
      { titleBn: "মালফুযাত", icon: "chat", color: "text-orange-500", route: "/malfuzat" },
      { titleBn: "আধ্যাত্মিক কবিতা", icon: "feather", color: "text-violet-500", route: "/poem" },
      { titleBn: "শরঈ জিজ্ঞাসা", icon: "help", color: "text-gold-600", route: "/fatwa" },
      { titleBn: "বই", icon: "library", color: "text-sky-500", route: "/library" },
    ],
  },
  {
    titleBn: "মিডিয়া",
    icon: "radio",
    accent: "text-rose-500",
    items: [
      { titleBn: "বয়ান", icon: "mic", color: "text-indigo-500", route: "/boyan" },
      { titleBn: "লাইভ", icon: "radio", color: "text-rose-500", route: "/live" },
      { titleBn: "গ্যালারি", icon: "image", color: "text-teal-500", route: "/gallery" },
      { titleBn: "ওয়ালপেপার", icon: "image", color: "text-rose-500", route: "/wallpaper" },
      { titleBn: "সংক্ষিপ্ত ক্লিপস", icon: "play", color: "text-orange-500", route: "/media" },
      { titleBn: "হামদ ও নাত", icon: "music", color: "text-teal-500", route: "/hamdnaat" },
    ],
  },
  {
    titleBn: "প্রতিষ্ঠান",
    icon: "mosque",
    accent: "text-emerald-500",
    items: [
      { titleBn: "মাদরাসা", icon: "mosque", color: "text-violet-500", route: "/mission" },
      { titleBn: "ডোনেট", icon: "gift", color: "text-rose-500", route: "/donate" },
      { titleBn: "আজীবন সদস্য", icon: "star", color: "text-orange-500", route: "/member" },
      { titleBn: "নোটিশ বোর্ড", icon: "mega", color: "text-rose-500", route: "/notice" },
      { titleBn: "পরিবার / বাইআত", icon: "users", color: "text-orange-500", route: "/paribar" },
    ],
  },
  {
    titleBn: "সেটিংস ও টুলস",
    icon: "gear",
    accent: "text-slate-500",
    items: [
      { titleBn: "সেটিংস", icon: "gear", color: "text-slate-500", route: "/settings" },
      { titleBn: "সাপোর্ট সেন্টার", icon: "help", color: "text-gold-600", route: "/support" },
      { titleBn: "নোটিফিকেশন", icon: "bell", color: "text-amber-500", route: "/notifications" },
    ],
  },
];
