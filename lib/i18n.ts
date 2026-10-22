// UI language dictionaries. The app content (bayans, duas, articles) stays in
// Bengali — this covers the shared chrome and the settings screen. Add keys
// here in all three languages before using them.
export type Lang = "bn" | "ur" | "en";

export const LANGUAGES: { id: Lang; native: string; dir: "ltr" | "rtl" }[] = [
  { id: "bn", native: "বাংলা", dir: "ltr" },
  { id: "ur", native: "اردو", dir: "rtl" },
  { id: "en", native: "English", dir: "ltr" },
];

type Dict = {
  navHome: string;
  navLive: string;
  navBoyan: string;
  navParibar: string;
  navOthers: string;
  tagline: string;
  openApp: string;
  back: string;
  settings: string;
  settingsSub: string;
  language: string;
  languageDesc: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeLightDesc: string;
  themeDarkDesc: string;
  design: string;
  designGlass: string;
  designMaterial: string;
  designGlassDesc: string;
  designMaterialDesc: string;
  textSize: string;
  notifications: string;
  notifOn: string;
  notifOff: string;
  notifBlocked: string;
  notifUnsupported: string;
  notifEnabling: string;
  appOpenTitle: string;
  appOpenDesc: string;
  member: string;
  memberDesc: string;
};

export type TKey = keyof Dict;

const bn: Dict = {
  navHome: "হোম",
  navLive: "লাইভ",
  navBoyan: "বয়ান",
  navParibar: "পরিবার",
  navOthers: "অন্যান্য",
  tagline: "দ্বীনি জীবনের সাথী",
  openApp: "অ্যাপ খুলুন",
  back: "ফিরুন",
  settings: "সেটিংস",
  settingsSub: "অ্যাপ আপনার মতো সাজান",
  language: "ভাষা",
  languageDesc: "অ্যাপের ভাষা বেছে নিন",
  theme: "থিম",
  themeLight: "লাইট",
  themeDark: "ডার্ক",
  themeLightDesc: "লাইট — দিনের আলো",
  themeDarkDesc: "ডার্ক — গভীর রাতের সবুজ",
  design: "ডিজাইন",
  designGlass: "গ্লাস",
  designMaterial: "ম্যাটেরিয়াল",
  designGlassDesc: "লিকুইড গ্লাস — কাঁচের মতো ঝাপসা",
  designMaterialDesc: "ম্যাটেরিয়াল — পরিষ্কার সলিড",
  textSize: "লেখার সাইজ",
  notifications: "পুশ নোটিফিকেশন",
  notifOn: "চালু — নতুন আপডেট এলেই জানানো হবে",
  notifOff: "বন্ধ — নতুন বয়ান, লাইভ ও নামাজের সময়",
  notifBlocked: "ব্লক করা — ব্রাউজার সেটিংস থেকে অনুমতি দিন",
  notifUnsupported: "এই ব্রাউজারে সমর্থিত নয়",
  notifEnabling: "চালু করা হচ্ছে…",
  appOpenTitle: "IslahBD অ্যাপ খুলুন",
  appOpenDesc: "ইনস্টল থাকলে অ্যাপ, না থাকলে স্টোর",
  member: "লাইফটাইম মেম্বার",
  memberDesc: "বিশেষ সদস্যপদ নিন",
};

const ur: Dict = {
  navHome: "ہوم",
  navLive: "لائیو",
  navBoyan: "بیان",
  navParibar: "خاندان",
  navOthers: "مزید",
  tagline: "دینی زندگی کا ساتھی",
  openApp: "ایپ کھولیں",
  back: "واپس",
  settings: "ترتیبات",
  settingsSub: "ایپ کو اپنی پسند کے مطابق بنائیں",
  language: "زبان",
  languageDesc: "ایپ کی زبان منتخب کریں",
  theme: "تھیم",
  themeLight: "لائٹ",
  themeDark: "ڈارک",
  themeLightDesc: "لائٹ — دن کی روشنی",
  themeDarkDesc: "ڈارک — رات کا گہرا سبز",
  design: "ڈیزائن",
  designGlass: "گلاس",
  designMaterial: "میٹیریل",
  designGlassDesc: "لیکوئڈ گلاس — شیشے جیسا دھندلا",
  designMaterialDesc: "میٹیریل — صاف اور ٹھوس",
  textSize: "تحریر کا سائز",
  notifications: "پش اطلاعات",
  notifOn: "فعال — نئی اپڈیٹ پر اطلاع ملے گی",
  notifOff: "بند — نئے بیان، لائیو اور نماز کے اوقات",
  notifBlocked: "بلاک شدہ — براؤزر کی ترتیبات سے اجازت دیں",
  notifUnsupported: "اس براؤزر میں معاون نہیں",
  notifEnabling: "فعال کیا جا رہا ہے…",
  appOpenTitle: "IslahBD ایپ کھولیں",
  appOpenDesc: "انسٹال ہو تو ایپ، ورنہ اسٹور",
  member: "تاحیات رکن",
  memberDesc: "خصوصی رکنیت حاصل کریں",
};

const en: Dict = {
  navHome: "Home",
  navLive: "Live",
  navBoyan: "Bayan",
  navParibar: "Family",
  navOthers: "More",
  tagline: "Your companion in deen",
  openApp: "Open app",
  back: "Back",
  settings: "Settings",
  settingsSub: "Set up the app your way",
  language: "Language",
  languageDesc: "Choose the app language",
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeLightDesc: "Light — daylight",
  themeDarkDesc: "Dark — deep night green",
  design: "Design",
  designGlass: "Glass",
  designMaterial: "Material",
  designGlassDesc: "Liquid glass — frosted and translucent",
  designMaterialDesc: "Material — clean, solid surfaces",
  textSize: "Text size",
  notifications: "Push notifications",
  notifOn: "On — you'll be notified about new updates",
  notifOff: "Off — new bayans, live and prayer times",
  notifBlocked: "Blocked — allow notifications in browser settings",
  notifUnsupported: "Not supported in this browser",
  notifEnabling: "Enabling…",
  appOpenTitle: "Open the IslahBD app",
  appOpenDesc: "Opens the app if installed, otherwise the store",
  member: "Lifetime member",
  memberDesc: "Get a special membership",
};

export const dictionaries: Record<Lang, Dict> = { bn, ur, en };

export function translate(lang: Lang, key: TKey): string {
  return dictionaries[lang][key];
}

export function isRtl(lang: Lang): boolean {
  return lang === "ur";
}
