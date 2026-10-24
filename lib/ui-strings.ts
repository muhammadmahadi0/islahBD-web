// Bengali → English/Urdu UI copy. Keyed by the Bengali source string so
// screens can call tx("…") without inventing keys. Content that comes from the
// API (bayan titles, dua text, articles) is intentionally not listed here.
export type UiTranslation = [en: string, ur: string];

export const UI_STRINGS: Record<string, UiTranslation> = {
  "বছরে কমপক্ষে একবার আজীবন সদস্য সম্মেলনে অংশগ্রহণের মাধ্যমে উলামায়ে কেরাম ও তালিবুল ইলমদের সাথে উঠা-বসা, খাওয়া-দাওয়া ও বিশেষ দোয়ায় শরীক থাকা যায়।": [
    "By attending the Lifetime Member Conference at least once a year, members can meet the scholars and students of knowledge, share meals, and join in special duas.",
    "سال میں کم از کم ایک بار تاحیات رکن کانفرنس میں شرکت کے ذریعے علماء کرام اور طلبۂ علم کے ساتھ اٹھنے بیٹھنے، کھانے پینے اور خصوصی دعاؤں میں شریک ہوا جا سکتا ہے۔"
  ],
  "কম্পাস রিডিং পাওয়া যাচ্ছে না — ফোন সমতলে রেখে ৮-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন, অথবা নিচের ডিগ্রি দেখে কাবার দিক মিলিয়ে নিন।": [
    "Compass reading unavailable — place the phone flat and rotate it in a figure-8 to calibrate, or match the Qibla using the degrees below.",
    "قطب نما کی ریڈنگ نہیں مل رہی — فون کو سطح پر رکھ کر ۸ کی شکل میں گھما کر کیلیبریٹ کریں، یا نیچے دیے گئے ڈگریوں سے کعبہ کی سمت ملائیں۔"
  ],
  "IslahBD ওয়েব: কুরআন, নামাজের সময়, কিবলা, তাসবীহ, দোআ, বয়ান, হামদ-নাত, হজ-ওমরাহ, লাইভ বয়ান, লাইব্রেরি ও আরও অনেক কিছু।": [
    "IslahBD Web: Qur'an, prayer times, qibla, tasbeeh, dua, bayan, hamd-naat, hajj & umrah, live bayan, library and much more.",
    "IslahBD ویب: قرآن، نماز کے اوقات، قبلہ، تسبیح، دعا، بیان، حمد و نعت، حج و عمرہ، لائیو بیان، لائبریری اور بہت کچھ۔"
  ],
  "আলেম-উলামাদের সাথে মহব্বতের কারণে হাদীসের ভাষ্য অনুযায়ী নায়েবে রাসূলদের সাথে হাশর হওয়ার সৌভাগ্য অর্জন হতে পারে।": [
    "Out of love for the scholars, one may attain the fortune of being raised with the deputies of the Prophet, as explained in the hadith commentary.",
    "علماء سے محبت کی وجہ سے حدیث کی شرح کے مطابق نائبانِ رسول کے ساتھ حشر ہونے کی سعادت حاصل ہو سکتی ہے۔"
  ],
  "পাতার সংখ্যা বাড়ালে বা কমালে নিচের তীর চিহ্ন ব্যবহার করুন। চাইলে মূল PDF নতুন ট্যাবে খুলতে বা ডাউনলোড করতে পারেন।": [
    "Use the arrow buttons below to add or remove pages. You can also open the original PDF in a new tab or download it.",
    "صفحات بڑھانے یا کم کرنے کے لیے نیچے تیر کے نشانات استعمال کریں۔ چاہیں تو اصل PDF نئی ٹیب میں کھولیں یا ڈاؤن لوڈ کریں۔"
  ],
  "সঠিক দিকের জন্য ফোন সমতলে রেখে ৮-আকৃতিতে কয়েকবার ঘুরিয়ে ক্যালিব্রেট করুন। চুম্বক/মেটাল কভার দূরে রাখুন।": [
    "For the correct direction, keep the phone flat and rotate it in a figure-8 a few times to calibrate. Keep magnets and metal covers away.",
    "صحیح سمت کے لیے فون کو سطح پر رکھیں اور ۸ کی شکل میں کئی بار گھما کر کیلیبریٹ کریں۔ مقناطیس اور دھاتی کور دور رکھیں۔"
  ],
  "প্রতিদিন শত শত হাফেয ও আলেম মাদরাসার বিশেষ দোয়ায় সদস্যদের সার্বিক কল্যাণে দোয়া করতে থাকেন।": [
    "Every day, hundreds of huffaz and scholars make special dua for the overall well-being of members at the madrasa.",
    "ہر روز سینکڑوں حفاظ اور علماء مدرسے میں اراکین کی مجموعی بھلائی کے لیے خصوصی دعا کرتے رہتے ہیں۔"
  ],
  "কোনো সদস্য বা তাঁর আপনজন অসুস্থ হলে বা বিপদে পড়লে তাঁর জন্য বিশেষ দোয়ার ব্যবস্থা করা হয়।": [
    "If a member or their family member falls ill or faces hardship, special dua is arranged for them.",
    "اگر کوئی رکن یا اس کا عزیز بیمار ہو یا مصیبت میں مبتلا ہو تو اس کے لیے خصوصی دعا کا انتظام کیا جاتا ہے۔"
  ],
  "মৃত্যুর পরও সদকায়ে জারিয়ারূপে মাদরাসার দ্বীনি খেদমতের একটা অংশ তাঁর আমলনামায় যেতে থাকবে।": [
    "Even after death, a share of the madrasa's religious service continues to be recorded in their book of deeds as ongoing charity.",
    "موت کے بعد بھی صدقۂ جاریہ کے طور پر مدرسے کی دینی خدمت کا ایک حصہ ان کے نامۂ اعمال میں جاتا رہے گا۔"
  ],
  "এই ব্রাউজারে কম্পাস সেন্সর সাপোর্ট করে না — নিচের ডিগ্রি দেখে কাবার দিক মিলিয়ে নিন।": [
    "This browser does not support the compass sensor — match the Qibla using the degrees below.",
    "یہ براؤزر قطب نما سینسر کو سپورٹ نہیں کرتا — نیچے دیے گئے ڈگریوں سے کعبہ کی سمت ملائیں۔"
  ],
  "ইন্টারনেট ও স্টোরেজ চেক করুন। ডাউনলোড আটকে গেলে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।": [
    "Check your internet and storage. If the download stalls, refresh the page and try again.",
    "انٹرنیٹ اور اسٹوریج چیک کریں۔ ڈاؤن لوڈ رک جائے تو صفحہ ریفریش کر کے دوبارہ کوشش کریں۔"
  ],
  "কোনো সদস্য বা তাঁর ঘনিষ্ঠজন মারা গেলে কুরআন খতম করে সওয়াব রেসানী করা হয়।": [
    "If a member or their close relative passes away, Qur'an recitation is completed and the reward is gifted.",
    "اگر کوئی رکن یا اس کا قریبی عزیز وفات پا جائے تو قرآن ختم کر کے ثواب ایصال کیا جاتا ہے۔"
  ],
  "আপনার দান দ্বীন প্রচারের কাজে ব্যয় হয়। নিচের তথ্যে পাঠিয়ে কপি চাপুন।": [
    "Your donation is spent on spreading the deen. Copy the details below and send.",
    "آپ کا عطیہ دین کی تبلیغ کے کام میں خرچ ہوتا ہے۔ نیچے دی گئی معلومات کاپی کر کے بھیجیں۔"
  ],
  "এই ক্বারীর আয়াতভিত্তিক তিলাওয়াত নেই — পুরো সূরার অডিও চালানো হচ্ছে।": [
    "This reciter has no verse-by-verse recitation — the full surah audio is playing.",
    "اس قاری کی آیت بہ آیت تلاوت نہیں ہے — پوری سورت کی آڈیو چل رہی ہے۔"
  ],
  "লোকেশন অনুমতি দিন, ফোন সমতলে রেখে 8-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন।": [
    "Allow location, keep the phone flat and rotate it in a figure-8 to calibrate.",
    "لوکیشن کی اجازت دیں، فون کو سطح پر رکھ کر 8 کی شکل میں گھما کر کیلیبریٹ کریں۔"
  ],
  "স্থান: গুলশানে আল্লামা শাহ আব্দুল মতীন কমপ্লেক্স, পাইটি, ডেমরা, ঢাকা।": [
    "Venue: Allama Shah Abdul Matin Complex, Paiti, Demra, Dhaka.",
    "مقام: علامہ شاہ عبد المتین کمپلیکس، پائیتی، ڈیمرا، ڈھاکہ۔"
  ],
  "কম্পাসের অনুমতি দিন — iOS সেটিংসে Motion & Fitness চালু থাকতে হবে।": [
    "Allow compass access — Motion & Fitness must be enabled in iOS Settings.",
    "قطب نما کی اجازت دیں — iOS ترتیبات میں Motion & Fitness فعال ہونا ضروری ہے۔"
  ],
  "এই ব্রাউজারে কম্পাস সেন্সর নেই — GPS বা শহর বেছে কাবার দিক দেখুন।": [
    "This browser has no compass sensor — use GPS or pick a city to see the Qibla direction.",
    "یہ براؤزر قطب نما سینسر نہیں رکھتا — GPS یا شہر منتخب کر کے کعبہ کی سمت دیکھیں۔"
  ],
  "তামাত্তু হজ ও ওমরাহর ধাপে ধাপে গাইড — দোআ, নিয়ম, ম্যাপ, চেকলিস্ট": [
    "A step-by-step guide to Tamattu Hajj and Umrah — duas, rules, maps, checklist.",
    "حج تمتع اور عمرہ کی مرحلہ وار رہنمائی — دعائیں، احکام، نقشے، چیک لسٹ۔"
  ],
  "GPS লোকেশন সেট করুন — হানাফি মাযহাব ও করাচি পদ্ধতি ব্যবহার হয়।": [
    "Set your GPS location — the Hanafi school and Karachi method are used.",
    "GPS لوکیشن سیٹ کریں — حنفی مسلک اور کراچی طریقہ استعمال ہوتا ہے۔"
  ],
  "বয়ান বা হামদ-নাত তালিকায় প্রতিটি আইটেমের ডাউনলোড বোতাম চাপুন।": [
    "Tap the download button on each item in the bayan or hamd-naat list.",
    "بیان یا حمد و نعت کی فہرست میں ہر آئٹم پر ڈاؤن لوڈ بٹن دبائیں۔"
  ],
  "প্রতিটি চ্যানেলের সর্বশেষ ভিডিও সরাসরি এখানেই শুনুন ও দেখুন।": [
    "Watch and listen to the latest video from each channel right here.",
    "ہر چینل کی تازہ ترین ویڈیو یہیں سنیں اور دیکھیں۔"
  ],
  "মাদরাসার বিশেষ রেজিস্ট্রি খাতায় তাঁর নাম রেকর্ড হয়ে যায়।": [
    "Their name is recorded in the madrasa's special registry.",
    "مدرسے کے خصوصی رجسٹر میں ان کا نام درج ہو جاتا ہے۔"
  ],
  "চ্যানেলের ভিডিও লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।": [
    "Could not load the channel videos — check your internet.",
    "چینل کی ویڈیوز لوڈ نہیں ہو سکیں — انٹرنیٹ چیک کریں۔"
  ],
  "মুনাজাতে মাকবুলের সম্পূর্ণ সংকলন দোআ বিভাগে সাজানো আছে।": [
    "The complete collection of Munajat-e-Maqbul is arranged in the Dua section.",
    "مناجاتِ مقبول کا مکمل مجموعہ دعا کے حصے میں ترتیب دیا گیا ہے۔"
  ],
  "হামদ-নাত তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।": [
    "Could not load the hamd-naat list — check your internet.",
    "حمد و نعت کی فہرست لوڈ نہیں ہو سکی — انٹرنیٹ چیک کریں۔"
  ],
  "উলামায়ে কেরাম ও তালিবুল ইলমদের সাথে জুড়ে থাকা যায়।": [
    "Stay connected with the scholars and students of knowledge.",
    "علماء کرام اور طلبۂ علم کے ساتھ جڑے رہیں۔"
  ],
  "কিতাবের লেখা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।": [
    "Could not load the book text — check your internet.",
    "کتاب کا متن لوڈ نہیں ہو سکا — انٹرنیٹ چیک کریں۔"
  ],
  "ক্লিপ তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।": [
    "Could not load the clip list — check your internet.",
    "کلپس کی فہرست لوڈ نہیں ہو سکی — انٹرنیٹ چیک کریں۔"
  ],
  "চলতি বছর আজীবন সদস্য সম্মেলন অনুষ্ঠিত হবে ইনশাআল্লাহ": [
    "This year's Lifetime Member Conference will be held, InshaAllah.",
    "اس سال تاحیات رکن کانفرنس منعقد ہو گی، ان شاء اللہ۔"
  ],
  "বয়ান তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।": [
    "Could not load the bayan list — check your internet.",
    "بیانات کی فہرست لوڈ نہیں ہو سکی — انٹرنیٹ چیک کریں۔"
  ],
  "দুঃখিত — এই অংশটি লোড করা যায়নি। আবার চেষ্টা করুন।": [
    "Sorry — this section could not be loaded. Please try again.",
    "معذرت — یہ حصہ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔"
  ],
  "আল্লাহর মহব্বত, আত্মশুদ্ধি ও মানুষ গড়ার মহান মিশন": [
    "A great mission of love for Allah, self-purification and building people.",
    "اللہ کی محبت، تزکیۂ نفس اور انسان سازی کا عظیم مشن۔"
  ],
  "কম্পাসের অনুমতি নেওয়া যায়নি — আবার চেষ্টা করুন।": [
    "Could not get compass permission — please try again.",
    "قطب نما کی اجازت نہیں مل سکی — دوبارہ کوشش کریں۔"
  ],
  "নতুন আবেদন অথবা বিদ্যমান সদস্যের অনুদান ও রসিদ": [
    "New application, or donations and receipts for existing members.",
    "نئی درخواست، یا موجودہ اراکین کے عطیات و رسیدیں۔"
  ],
  "লোকেশন পাওয়া যায়নি — নিচ থেকে শহর বেছে নিন।": [
    "Location not found — pick a city below.",
    "لوکیشن نہیں ملی — نیچے سے شہر منتخب کریں۔"
  ],
  "এই ডিভাইসে GPS নেই — নিচ থেকে শহর বেছে নিন।": [
    "This device has no GPS — pick a city below.",
    "اس ڈیوائس میں GPS نہیں ہے — نیچے سے شہر منتخب کریں۔"
  ],
  "অ্যাপটি চালু করা যায়নি। আবার চেষ্টা করুন।": [
    "Could not open the app. Please try again.",
    "ایپ نہیں کھل سکی۔ دوبارہ کوشش کریں۔"
  ],
  "আবেদন পৌঁছেছে — যোগাযোগ করা হবে ইনশাআল্লাহ": [
    "Application received — we will contact you, InshaAllah.",
    "درخواست موصول ہو گئی — ان شاء اللہ رابطہ کیا جائے گا۔"
  ],
  "জিপিএস দিয়ে নির্ভুল অবস্থান দিয়ে খুঁজুন": [
    "Find with an accurate location using GPS.",
    "GPS سے درست مقام کے ساتھ تلاش کریں۔"
  ],
  "এই অধ্যায়ে নিম্নলিখিত বিষয়গুলো রয়েছে:": [
    "This chapter contains the following topics:",
    "اس باب میں درج ذیل موضوعات شامل ہیں:"
  ],
  "এখনো প্লেলিস্ট নেই — নিচে নাম লিখে বানান": [
    "No playlists yet — create one by entering a name below.",
    "ابھی کوئی پلے لسٹ نہیں — نیچے نام لکھ کر بنائیں۔"
  ],
  "আবার চেষ্টা করুন বা জিপিএস ব্যবহার করুন": [
    "Try again or use GPS.",
    "دوبارہ کوشش کریں یا GPS استعمال کریں۔"
  ],
  "কোরআন ও হাদীছ থেকে গুরুত্বপূর্ণ আমলসমূহ": [
    "Important deeds from the Qur'an and Hadith.",
    "قرآن و حدیث سے اہم اعمال۔"
  ],
  "পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে": [
    "In the name of Allah, the Most Gracious, the Most Merciful.",
    "اللہ کے نام سے جو بے حد مہربان، نہایت رحم والا ہے۔"
  ],
  "এখন লাইভ বন্ধ — সর্বশেষ রেকর্ডিং বাজবে": [
    "Live is off now — the latest recording will play.",
    "ابھی لائیو بند ہے — تازہ ترین ریکارڈنگ چلے گی۔"
  ],
  "তারিখে চাপ দিলে ক্যালেন্ডারে দেখা যাবে": [
    "Tap a date to view it in the calendar.",
    "تاریخ پر دبائیں تو کیلنڈر میں نظر آئے گی۔"
  ],
  "তাসবীহ কাউন্টার দিয়ে আমল ট্র্যাক করুন": [
    "Track your deeds with the tasbeeh counter.",
    "تسبیح کاؤنٹر سے اپنے اعمال کا حساب رکھیں۔"
  ],
  "এই অংশে এখনো কোনো লেখা যোগ করা হয়নি।": [
    "No text has been added to this section yet.",
    "اس حصے میں ابھی کوئی متن شامل نہیں کیا گیا۔"
  ],
  "এই মাসের জন্য কোনো ঘটনা সংকলিত হয়নি।": [
    "No events have been compiled for this month.",
    "اس ماہ کے لیے کوئی واقعہ مرتب نہیں کیا گیا۔"
  ],
  "পুরাতন সদস্য (হিসাব ও অনুদান প্রদান)": [
    "Existing member (account and donations).",
    "پرانا رکن (حساب اور عطیات)۔"
  ],
  "অফলাইন সময় — কিছুটা ভিন্ন হতে পারে": [
    "Offline time — may differ slightly.",
    "آف لائن وقت — کچھ فرق ہو سکتا ہے۔"
  ],
  "ইন্টারনেট চেক করে আবার চেষ্টা করুন": [
    "Check your internet and try again.",
    "انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔"
  ],
  "কিতাবুস সুন্নাহ — মুফতী মনসূরুল হক": [
    "Kitabus Sunnah — Mufti Mansurul Haq.",
    "کتاب السنہ — مفتی منصور الحق۔"
  ],
  "লোকেশন পাওয়া যায়নি — অনুমতি দিন।": [
    "Location not found — please allow access.",
    "لوکیشن نہیں ملی — اجازت دیں۔"
  ],
  "আজীবন সদস্য সেবা ও অনুদান পোর্টাল": [
    "Lifetime member service and donation portal.",
    "تاحیات رکن سروس اور عطیات پورٹل۔"
  ],
  "ইসলাহ • v1.3.0 • api.islahbd.com": [
    "Islah • v1.3.0 • api.islahbd.com",
    "Islah • v1.3.0 • api.islahbd.com"
  ],
  "এই আয়াতের তাফসীর পাওয়া যায়নি।": [
    "Tafsir for this verse was not found.",
    "اس آیت کی تفسیر نہیں ملی۔"
  ],
  "ছালেকীনের সকাল-সন্ধ্যার মা'মূলাত": [
    "The morning and evening practices of the salikeen.",
    "سالکین کے صبح و شام کے معمولات۔"
  ],
  "আধ্যাত্মিক বাইআত ও দিকনির্দেশনা": [
    "Spiritual bay'ah and guidance.",
    "روحانی بیعت اور رہنمائی۔"
  ],
  "আরবি, বাংলা বা ইংরেজিতে খুঁজুন…": [
    "Search in Arabic, Bangla or English…",
    "عربی، بنگلہ یا انگریزی میں تلاش کریں…"
  ],
  "নতুন আজীবন সদস্য হতে আবেদন করুন": [
    "Apply to become a new lifetime member.",
    "نیا تاحیات رکن بننے کے لیے درخواست دیں۔"
  ],
  "বিষয়ভিত্তিক ও দৈনন্দিন দোআসমূহ": [
    "Topical and daily duas.",
    "موضوعاتی اور روزمرہ دعائیں۔"
  ],
  "হিজরি · বাংলা · ইংরেজি — একসাথে": [
    "Hijri · Bangla · English — together.",
    "ہجری · بنگلہ · انگریزی — ایک ساتھ۔"
  ],
  "ইউটিউব চ্যানেলের বয়ান ও ভিডিও": [
    "Bayan and videos from the YouTube channel.",
    "یوٹیوب چینل کے بیانات اور ویڈیوز۔"
  ],
  "নতুন আপডেট এলে এখানে দেখা যাবে": [
    "New updates will appear here.",
    "نئی اپڈیٹس یہاں نظر آئیں گی۔"
  ],
  "যিকির গুনুন ও লক্ষ্য পূরণ করুন": [
    "Count zikr and reach your goal.",
    "ذکر گنیں اور اپنا ہدف پورا کریں۔"
  ],
  "বয়ান, বক্তা বা স্থান খুঁজুন…": [
    "Search bayan, speaker or place…",
    "بیان، خطیب یا مقام تلاش کریں…"
  ],
  "PDF পৃষ্ঠা দেখানো যাচ্ছে না।": [
    "Could not display the PDF page.",
    "PDF صفحہ دکھایا نہیں جا سکا۔"
  ],
  "ইসলাহ পরিবারে আপনাকে স্বাগতম": [
    "Welcome to the Islah family.",
    "اصلاح خاندان میں آپ کا خیر مقدم۔"
  ],
  "এ দিনে সংকলিত কোনো ঘটনা নেই।": [
    "No events compiled for this day.",
    "اس دن کوئی واقعہ مرتب نہیں کیا گیا۔"
  ],
  "মাওলানা তৈয়্যেব আশরাফ সাহেব": [
    "Maulana Tayyeb Ashraf Sahib.",
    "مولانا طیب اشرف صاحب۔"
  ],
  "অন্য শব্দ বা মাস বেছে দেখুন": [
    "Try another word or month.",
    "کوئی دوسرا لفظ یا مہینہ دیکھیں۔"
  ],
  "অফলাইন ডাটাবেজ দেখানো হচ্ছে": [
    "Showing the offline database.",
    "آف لائن ڈیٹا بیس دکھایا جا رہا ہے۔"
  ],
  "আশেপাশে মসজিদ পাওয়া যায়নি": [
    "No mosques found nearby.",
    "قریب کوئی مسجد نہیں ملی۔"
  ],
  "নতুন বয়ানের নোটিফিকেশন পান": [
    "Get notified about new bayans.",
    "نئے بیانات کی اطلاع پائیں۔"
  ],
  "শব্দে শব্দে কুরআন (অডিও সহ)": [
    "Word by word Qur'an (with audio).",
    "لفظ بہ لفظ قرآن (آڈیو کے ساتھ)۔"
  ],
  "সূরা ও আমলের সওয়াব ও ফযীলত": [
    "Rewards and virtues of surahs and deeds.",
    "سورتوں اور اعمال کے ثواب و فضائل۔"
  ],
  "হামদ, নাত বা শিল্পী খুঁজুন…": [
    "Search hamd, naat or artist…",
    "حمد، نعت یا فنکار تلاش کریں…"
  ],
  "islah - দ্বীনি জীবনের সাথী": [
    "islah - companion for a life of deen.",
    "islah - دینی زندگی کا ساتھی۔"
  ],
  "আত্মশুদ্ধির গাইড যোগ হচ্ছে": [
    "Self-purification guide coming soon.",
    "تزکیۂ نفس کی رہنمائی جلد آ رہی ہے۔"
  ],
  "ইসলাহ • দ্বীনি জীবনের সাথী": [
    "Islah • companion for a life of deen.",
    "اصلاح • دینی زندگی کا ساتھی۔"
  ],
  "এই চ্যানেলের ভিডিও খুঁজুন…": [
    "Search videos on this channel…",
    "اس چینل کی ویڈیوز تلاش کریں…"
  ],
  "কবুল হওয়া মুনাজাতের সংকলন": [
    "A collection of accepted munajats.",
    "قبول شدہ مناجات کا مجموعہ۔"
  ],
  "কিবলার দিকে মুখ করে আছেন ✓": [
    "Facing the Qibla ✓",
    "قبلہ کی طرف رخ ہے ✓"
  ],
  "মসজিদের তথ্য পাওয়া যায়নি": [
    "Mosque information not found.",
    "مسجد کی معلومات نہیں ملیں۔"
  ],
  "লাইভ তথ্য পাওয়া যাচ্ছে না": [
    "Live information unavailable.",
    "لائیو معلومات دستیاب نہیں۔"
  ],
  "GPS দিয়ে সঠিক লোকেশন নিন": [
    "Get an accurate location with GPS.",
    "GPS سے درست لوکیشن حاصل کریں۔"
  ],
  "quran.com + অফলাইন একসাথে": [
    "quran.com + offline together.",
    "quran.com + آف لائن ایک ساتھ۔"
  ],
  "আজীবন সদস্য হওয়ার ফায়দা": [
    "Benefits of becoming a lifetime member.",
    "تاحیات رکن بننے کے فوائد۔"
  ],
  "ইসলামিক ক্যালেন্ডার দেখুন": [
    "View the Islamic calendar.",
    "اسلامی کیلنڈر دیکھیں۔"
  ],
  "এখনো উত্তর প্রকাশিত হয়নি": [
    "No answer published yet.",
    "ابھی کوئی جواب شائع نہیں ہوا۔"
  ],
  "জরুরি হেল্পলাইন ও যোগাযোগ": [
    "Emergency helpline and contacts.",
    "ایمرجنسی ہیلپ لائن اور رابطے۔"
  ],
  "জামেআ মারকাযুল ইহসান ঢাকা": [
    "Jamia Markazul Ihsan Dhaka.",
    "جامعہ مرکز الاحسان ڈھاکہ۔"
  ],
  "নোটিফিকেশন লোড করা যায়নি": [
    "Could not load notifications.",
    "اطلاعات لوڈ نہیں ہو سکیں۔"
  ],
  "বয়ান ডাউনলোড করব কীভাবে?": [
    "How do I download a bayan?",
    "بیان کیسے ڈاؤن لوڈ کروں؟"
  ],
  "হারামাইন সরাসরি (YouTube)": [
    "Haramain live (YouTube).",
    "حرمین لائیو (یوٹیوب)۔"
  ],
  "৫ই ডিসেম্বর ২০২৬ (শনিবার)": [
    "5 December 2026 (Saturday).",
    "۵ دسمبر ۲۰۲۶ (ہفتہ)۔"
  ],
  "অন্য ফিল্টার চেষ্টা করুন": [
    "Try another filter.",
    "کوئی دوسرا فلٹر آزمائیں۔"
  ],
  "ইসলাহ-এর সম্পূর্ণ সংগ্রহ": [
    "The complete Islah collection.",
    "اصلاح کا مکمل مجموعہ۔"
  ],
  "কোনো ভিডিও পাওয়া যায়নি": [
    "No videos found.",
    "کوئی ویڈیو نہیں ملی۔"
  ],
  "ঘটনা, মাস বা সাল খুঁজুন…": [
    "Search event, month or year…",
    "واقعہ، مہینہ یا سال تلاش کریں…"
  ],
  "বই বা লেখকের নাম খুঁজুন…": [
    "Search book or author name…",
    "کتاب یا مصنف کا نام تلاش کریں…"
  ],
  "সম্মেলন চলছে — শরীক হোন!": [
    "The conference is live — join us!",
    "کانفرنس جاری ہے — شریک ہوں!"
  ],
  "★ বিশেষ এলান ও দাওয়াত ★": [
    "★ Special announcement and invitation ★",
    "★ خصوصی اعلان اور دعوت ★"
  ],
  "কিছু একটা সমস্যা হয়েছে": [
    "Something went wrong.",
    "کچھ مسئلہ ہو گیا ہے۔"
  ],
  "প্রশ্ন বিস্তারিত লিখুন…": [
    "Write your question in detail…",
    "اپنا سوال تفصیل سے لکھیں…"
  ],
  "প্লেলিস্টে যোগ হয়েছে ✓": [
    "Added to playlist ✓",
    "پلے لسٹ میں شامل ہو گیا ✓"
  ],
  "মাসআলা-মাসায়েলের উত্তর": [
    "Answers to fiqh questions.",
    "مسائل و احکام کے جوابات۔"
  ],
  "সব ভিডিওতে খোঁজা হচ্ছে…": [
    "Searching all videos…",
    "تمام ویڈیوز میں تلاش ہو رہی ہے…"
  ],
  "সরাসরি বয়ান ও হারামাইন": [
    "Live bayan and Haramain.",
    "لائیو بیان اور حرمین۔"
  ],
  "PDF লোড করা যাচ্ছে না।": [
    "Could not load the PDF.",
    "PDF لوڈ نہیں ہو سکا۔"
  ],
  "অনুমতি দিয়ে চালু করুন": [
    "Allow access and enable.",
    "اجازت دے کر فعال کریں۔"
  ],
  "অন্য শব্দ দিয়ে খুঁজুন": [
    "Search with another word.",
    "کوئی دوسرا لفظ استعمال کریں۔"
  ],
  "অন্য শব্দে খুঁজে দেখুন": [
    "Try searching with another word.",
    "کسی دوسرے لفظ سے تلاش کریں۔"
  ],
  "এই ডিভাইসে জিপিএস নেই।": [
    "This device has no GPS.",
    "اس ڈیوائس میں GPS نہیں ہے۔"
  ],
  "দ্বীনি খেদমতে শরিক হোন": [
    "Join in religious service.",
    "دینی خدمت میں شریک ہوں۔"
  ],
  "সব ভিডিও সাজানো হচ্ছে…": [
    "Organising all videos…",
    "تمام ویڈیوز ترتیب دی جا رہی ہیں…"
  ],
  "গ্যালারি ও ওয়ালপেপার": [
    "Gallery and wallpapers.",
    "گیلری اور وال پیپرز۔"
  ],
  "নতুন প্লেলিস্টের নাম…": [
    "New playlist name…",
    "نئی پلے لسٹ کا نام…"
  ],
  "মিশারী রাশিদ আল-আফাসী": [
    "Mishary Rashid Alafasy.",
    "مشاری راشد العفاسی۔"
  ],
  "শব্দ দিয়ে অনুসন্ধান…": [
    "Search by word…",
    "لفظ سے تلاش کریں…"
  ],
  "অডিও / ভিডিও চলে না?": [
    "Audio / video not working?",
    "آڈیو / ویڈیو نہیں چل رہی؟"
  ],
  "আমাদের ফিকির ও দোয়া": [
    "Our thoughts and prayers.",
    "ہماری فکر اور دعائیں۔"
  ],
  "ইরাব (ব্যাকরণ) দেখুন": [
    "Show i'rab (grammar).",
    "اعراب (گرامر) دیکھیں۔"
  ],
  "এই অ্যালবামে ছবি নেই": [
    "This album has no photos.",
    "اس البم میں تصاویر نہیں ہیں۔"
  ],
  "তৈয়্যেব আশরাফ সাহেব": [
    "Tayyeb Ashraf Sahib.",
    "طیب اشرف صاحب۔"
  ],
  "বিকাশ / নগদ (মোবাইল)": [
    "bKash / Nagad (mobile).",
    "بکاش / نقد (موبائل)۔"
  ],
  "লাইফটাইম মেম্বার হোন": [
    "Become a lifetime member.",
    "تاحیات رکن بنیں۔"
  ],
  "সব আপডেট এক জায়গায়": [
    "All updates in one place.",
    "تمام اپڈیٹس ایک جگہ۔"
  ],
  "quran.com তিলাওয়াত": [
    "quran.com recitation.",
    "quran.com تلاوت۔"
  ],
  "আজীবন সদস্য সম্মেলন": [
    "Lifetime Member Conference.",
    "تاحیات رکن کانفرنس۔"
  ],
  "ইসলামিক ক্যালেন্ডার": [
    "Islamic calendar.",
    "اسلامی کیلنڈر۔"
  ],
  "কম্পাসের অনুমতি দিন": [
    "Allow compass access.",
    "قطب نما کی اجازت دیں۔"
  ],
  "কোনো ওয়ালপেপার নেই": [
    "No wallpapers.",
    "کوئی وال پیپر نہیں۔"
  ],
  "কোনো নোটিফিকেশন নেই": [
    "No notifications.",
    "کوئی اطلاع نہیں۔"
  ],
  "ক্যাশ মুছে হোমে যান": [
    "Clear cache and go home.",
    "کیش صاف کر کے ہوم پر جائیں۔"
  ],
  "ক্লিপের নাম খুঁজুন…": [
    "Search clip name…",
    "کلپ کا نام تلاش کریں…"
  ],
  "জিপিএস দিয়ে খুঁজুন": [
    "Search with GPS.",
    "GPS سے تلاش کریں۔"
  ],
  "নফসের পরিশুদ্ধির পথ": [
    "The path to purifying the nafs.",
    "نفس کی پاکیزگی کا راستہ۔"
  ],
  "পছন্দ সংরক্ষিত থাকে": [
    "Your preference is saved.",
    "آپ کی پسند محفوظ رہتی ہے۔"
  ],
  "পুনরায় চেষ্টা করুন": [
    "Try again.",
    "دوبارہ کوشش کریں۔"
  ],
  "লা ইলাহা ইল্লাল্লাহ": [
    "La ilaha illallah.",
    "لا الٰہ الا اللہ۔"
  ],
  "লাইভ শুরু হলে জানুন": [
    "Know when live starts.",
    "لائیو شروع ہونے پر جانیں۔"
  ],
  "সব হিস্ট্রি মুছবেন?": [
    "Clear all history?",
    "تمام ہسٹری صاف کریں؟"
  ],
  "সম্মেলন তথ্যকেন্দ্র": [
    "Conference information desk.",
    "کانفرنس معلومات مرکز۔"
  ],
  "অডিও পাওয়া যায়নি": [
    "Audio not found.",
    "آڈیو نہیں ملی۔"
  ],
  "কম্পাস চালু হচ্ছে…": [
    "Starting compass…",
    "قطب نما شروع ہو رہا ہے…"
  ],
  "কম্পাস পড়া হচ্ছে…": [
    "Reading compass…",
    "قطب نما پڑھا جا رہا ہے…"
  ],
  "কিছু পাওয়া যায়নি": [
    "Nothing found.",
    "کچھ نہیں ملا۔"
  ],
  "ক্বারী (তেলাওয়াত)": [
    "Qari (recitation).",
    "قاری (تلاوت)۔"
  ],
  "মক্কা ও মদিনা লাইভ": [
    "Makkah and Madinah live.",
    "مکہ اور مدینہ لائیو۔"
  ],
  "রিমাইন্ডার অন করুন": [
    "Turn on reminders.",
    "یاد دہانی فعال کریں۔"
  ],
  "সরাসরি বয়ান শুনুন": [
    "Listen to the live bayan.",
    "لائیو بیان سنیں۔"
  ],
  "সাহায্য ও জিজ্ঞাসা": [
    "Help and enquiries.",
    "مدد اور سوالات۔"
  ],
  "আরবি অক্ষরের সাইজ": [
    "Arabic text size",
    "عربی متن کا سائز"
  ],
  "কাবার দিক নির্ণয়": [
    "Find the Qibla direction",
    "کعبہ کی سمت کا تعین"
  ],
  "কিবলা ভুল দেখায়?": [
    "Qibla showing wrong?",
    "قبلہ غلط دکھا رہا ہے؟"
  ],
  "কুরআনের সূরা সমূহ": [
    "Surahs of the Qur'an",
    "قرآن کی سورتیں"
  ],
  "কোনো অ্যালবাম নেই": [
    "No albums",
    "کوئی البم نہیں"
  ],
  "ডাটাবেজ লোড হয়নি": [
    "Database not loaded",
    "ڈیٹا بیس لوڈ نہیں ہوا"
  ],
  "দামাত বারাকাতুহুম": [
    "Damat barakatuhum",
    "دامت برکاتہم"
  ],
  "নতুন ট্যাবে খুলুন": [
    "Open in a new tab",
    "نئی ٹیب میں کھولیں"
  ],
  "নামাজের সময় ভুল?": [
    "Prayer times wrong?",
    "نماز کے اوقات غلط ہیں؟"
  ],
  "প্রশ্ন জমা হয়েছে": [
    "Question submitted",
    "سوال جمع ہو گیا"
  ],
  "ম্যাপে কাবা দেখুন": [
    "View the Kaaba on the map",
    "نقشے پر کعبہ دیکھیں"
  ],
  "লাইব্রেরিতে ফিরুন": [
    "Back to library",
    "لائبریری میں واپس"
  ],
  "সরাসরি বয়ান চলছে": [
    "Live bayan in progress",
    "لائیو بیان جاری ہے"
  ],
  "সাহায্য ও যোগাযোগ": [
    "Help and contact",
    "مدد اور رابطہ"
  ],
  "আধ্যাত্মিক কবিতা": [
    "Spiritual poetry",
    "روحانی شاعری"
  ],
  "আবার চেষ্টা করুন": [
    "Try again",
    "دوبارہ کوشش کریں"
  ],
  "আরবি/হিজরি তারিখ": [
    "Arabic/Hijri date",
    "عربی/ہجری تاریخ"
  ],
  "কম্পাস চালু করুন": [
    "Enable the compass",
    "قطب نما فعال کریں"
  ],
  "তাফসীর লোড হয়নি": [
    "Tafsir not loaded",
    "تفسیر لوڈ نہیں ہوئی"
  ],
  "থিম, ফন্ট ও ভাষা": [
    "Theme, font and language",
    "تھیم، فونٹ اور زبان"
  ],
  "নতুন প্রশ্ন করুন": [
    "Ask a new question",
    "نیا سوال پوچھیں"
  ],
  "নির্বাচিত অনুবাদ": [
    "Selected translation",
    "منتخب ترجمہ"
  ],
  "পূর্ণ সময়সূচি →": [
    "Full schedule →",
    "مکمل شیڈول →"
  ],
  "প্রধান হেল্পলাইন": [
    "Main helpline",
    "مرکزی ہیلپ لائن"
  ],
  "প্রয়োজনীয় সেবা": [
    "Essential services",
    "ضروری خدمات"
  ],
  "প্লেলিস্টে রাখুন": [
    "Add to playlist",
    "پلے لسٹ میں رکھیں"
  ],
  "বই পাওয়া যায়নি": [
    "Book not found",
    "کتاب نہیں ملی"
  ],
  "বয়ান রিমাইন্ডার": [
    "Bayan reminder",
    "بیان کی یاد دہانی"
  ],
  "যেখানে থেমেছিলেন": [
    "Where you left off",
    "جہاں آپ نے چھوڑا تھا"
  ],
  "লাইফটাইম মেম্বার": [
    "Lifetime member",
    "تاحیات رکن"
  ],
  "সংক্ষিপ্ত ক্লিপস": [
    "Short clips",
    "مختصر کلپس"
  ],
  "সদস্য সংগ্রহ উইং": [
    "Membership collection wing",
    "رکنیت جمع کرنے کا شعبہ"
  ],
  "সাম্প্রতিক বয়ান": [
    "Recent bayans",
    "حالیہ بیانات"
  ],
  "YouTube চ্যানেল": [
    "YouTube channel",
    "یوٹیوب چینل"
  ],
  "অনুসন্ধান করুন…": [
    "Search…",
    "تلاش کریں…"
  ],
  "আস্তাগফিরুল্লাহ": [
    "Astaghfirullah",
    "استغفراللہ"
  ],
  "ইসলাহ লোড হয়নি": [
    "Islah could not load",
    "اصلاح لوڈ نہیں ہوا"
  ],
  "ওয়াজিফা ও দরূদ": [
    "Wazifa and Durud",
    "وظیفہ اور درود"
  ],
  "কুরআন তিলাওয়াত": [
    "Qur'an recitation",
    "قرآن تلاوت"
  ],
  "চলতি মাসে ফিরুন": [
    "Back to current month",
    "موجودہ مہینے پر واپس"
  ],
  "দোআ সংকলন খুলুন": [
    "Open the dua collection",
    "دعا کا مجموعہ کھولیں"
  ],
  "ফযীলত লাইব্রেরি": [
    "Fazilat library",
    "فضائل لائبریری"
  ],
  "বার্তা (ঐচ্ছিক)": [
    "Message (optional)",
    "پیغام (اختیاری)"
  ],
  "মুনাজাতে মাকবুল": [
    "Munajat-e-Maqbul",
    "مناجاتِ مقبول"
  ],
  "সম্পূর্ণ তাফসীর": [
    "Full tafsir",
    "مکمل تفسیر"
  ],
  "সাপোর্ট সেন্টার": [
    "Support centre",
    "سپورٹ سینٹر"
  ],
  "২য় অনুবাদ বন্ধ": [
    "Second translation off",
    "دوسرا ترجمہ بند"
  ],
  "PDF লোড হচ্ছে…": [
    "Loading PDF…",
    "PDF لوڈ ہو رہا ہے…"
  ],
  "আজকের সময়সূচি": [
    "Today's schedule",
    "آج کا شیڈول"
  ],
  "আমার দৈনিক আমল": [
    "My daily amal",
    "میرے روزانہ اعمال"
  ],
  "আলহামদুলিল্লাহ": [
    "Alhamdulillah",
    "الحمدللہ"
  ],
  "কোনো নোটিশ নেই": [
    "No notices",
    "کوئی نوٹس نہیں"
  ],
  "ডিজিটাল তাসবীহ": [
    "Digital tasbeeh",
    "ڈیجیٹل تسبیح"
  ],
  "প্রশ্ন খুঁজুন…": [
    "Search questions…",
    "سوالات تلاش کریں…"
  ],
  "মারকাজুল ইহসান": [
    "Markazul Ihsan",
    "مرکز الاحسان"
  ],
  "রেকর্ডিং শুনুন": [
    "Listen to the recording",
    "ریکارڈنگ سنیں"
  ],
  "লোড করা যায়নি": [
    "Could not load",
    "لوڈ نہیں ہو سکا"
  ],
  "হযরতের পরিচিতি": [
    "About Hazrat",
    "حضرت کا تعارف"
  ],
  "আপনার অবস্থান": [
    "Your location",
    "آپ کا مقام"
  ],
  "আল্লাহু আকবার": [
    "Allahu Akbar",
    "اللہ اکبر"
  ],
  "উত্তর শীঘ্রই…": [
    "Answer coming soon…",
    "جواب جلد آ رہا ہے…"
  ],
  "এখনো কিছু নেই": [
    "Nothing yet",
    "ابھی کچھ نہیں"
  ],
  "কবিতা খুঁজুন…": [
    "Search poetry…",
    "شاعری تلاش کریں…"
  ],
  "ঘোষণা ও আপডেট": [
    "Announcements and updates",
    "اعلانات اور اپڈیٹس"
  ],
  "দক্ষিণ-পশ্চিম": [
    "South-west",
    "جنوب مغرب"
  ],
  "পরিবারে ফিরুন": [
    "Back to family",
    "خاندان میں واپس"
  ],
  "বাইআতের আবেদন": [
    "Bay'ah application",
    "بیعت کی درخواست"
  ],
  "বিশেষ সদস্যপদ": [
    "Special membership",
    "خصوصی رکنیت"
  ],
  "মূল PDF দেখুন": [
    "View the original PDF",
    "اصل PDF دیکھیں"
  ],
  "লেখা ছোট করুন": [
    "Decrease text size",
    "متن چھوٹا کریں"
  ],
  "লেখা বড় করুন": [
    "Increase text size",
    "متن بڑا کریں"
  ],
  "সংগ্রহে রাখুন": [
    "Save to collection",
    "مجموعے میں محفوظ کریں"
  ],
  "সর্বশেষ বয়ান": [
    "Latest bayan",
    "تازہ ترین بیان"
  ],
  "সুন্নাত ও আদব": [
    "Sunnah and adab",
    "سنت اور آداب"
  ],
  "ইংরেজি তারিখ": [
    "English date",
    "انگریزی تاریخ"
  ],
  "উত্তর-পশ্চিম": [
    "North-west",
    "شمال مغرب"
  ],
  "কিবলা কম্পাস": [
    "Qibla compass",
    "قبلہ قطب نما"
  ],
  "খোঁজা হচ্ছে…": [
    "Searching…",
    "تلاش ہو رہی ہے…"
  ],
  "তাফসীর দেখান": [
    "Show tafsir",
    "تفسیر دکھائیں"
  ],
  "দক্ষিণ-পূর্ব": [
    "South-east",
    "جنوب مشرق"
  ],
  "দিকনির্দেশনা": [
    "Guidance",
    "رہنمائی"
  ],
  "নামাজের সময়": [
    "Prayer times",
    "نماز کے اوقات"
  ],
  "পড়ার সেটিংস": [
    "Reading settings",
    "پڑھنے کی ترتیبات"
  ],
  "বয়ানের অডিও": [
    "Bayan audio",
    "بیان کی آڈیو"
  ],
  "বিষয়ভিত্তিক": [
    "By topic",
    "موضوع کے مطابق"
  ],
  "ব্যাংক হিসাব": [
    "Bank account",
    "بینک اکاؤنٹ"
  ],
  "ভিডিও খুঁজুন": [
    "Search videos",
    "ویڈیوز تلاش کریں"
  ],
  "মোবাইল নম্বর": [
    "Mobile number",
    "موبائل نمبر"
  ],
  "যোগাযোগ করুন": [
    "Contact us",
    "رابطہ کریں"
  ],
  "শরঈ জিজ্ঞাসা": [
    "Shariah enquiry",
    "شرعی سوال"
  ],
  "শায়খের মিশন": [
    "The Sheikh's mission",
    "شیخ کا مشن"
  ],
  "সংকুচিত করুন": [
    "Collapse",
    "سکیڑیں"
  ],
  "সরাসরি বয়ান": [
    "Live bayan",
    "لائیو بیان"
  ],
  "সুবহানাল্লাহ": [
    "SubhanAllah",
    "سبحان اللہ"
  ],
  "সূরা ও আয়াত": [
    "Surah and ayah",
    "سورت اور آیت"
  ],
  "আজকের তারিখ": [
    "Today's date",
    "آج کی تاریخ"
  ],
  "আজীবন সদস্য": [
    "Lifetime member",
    "تاحیات رکن"
  ],
  "আবেদন পাঠান": [
    "Submit application",
    "درخواست بھیجیں"
  ],
  "ইসলামিক গজল": [
    "Islamic naat",
    "اسلامی نعت"
  ],
  "উত্তর-পূর্ব": [
    "North-east",
    "شمال مشرق"
  ],
  "কাছের মসজিদ": [
    "Nearby mosque",
    "قریبی مسجد"
  ],
  "কুরআন সার্চ": [
    "Qur'an search",
    "قرآن تلاش"
  ],
  "চালিয়ে যান": [
    "Continue",
    "جاری رکھیں"
  ],
  "তাফসীর বন্ধ": [
    "Tafsir off",
    "تفسیر بند"
  ],
  "নোটিশ": [
    "Notice",
    "نوٹس"
  ],
  "নোটিশ বোর্ড": [
    "Notice board",
    "نوٹس بورڈ"
  ],
  "বাংলা তারিখ": [
    "Bangla date",
    "بنگلہ تاریخ"
  ],
  "ভিডিও দেখুন": [
    "Watch video",
    "ویڈیو دیکھیں"
  ],
  "শীঘ্রই আসছে": [
    "Coming soon",
    "جلد آ رہا ہے"
  ],
  "হাকীম আখতার": [
    "Hakim Akhtar",
    "حکیم اختر"
  ],
  "হিজরি তারিখ": [
    "Hijri date",
    "ہجری تاریخ"
  ],
  "অটো লোকেশন": [
    "Auto location",
    "خودکار لوکیشن"
  ],
  "অডিও কুরআন": [
    "Audio Qur'an",
    "آڈیو قرآن"
  ],
  "অডিও বয়ান": [
    "Audio bayan",
    "آڈیو بیان"
  ],
  "আগের আয়াত": [
    "Previous ayah",
    "پچھلی آیت"
  ],
  "আত্মশুদ্ধি": [
    "Self-purification",
    "تزکیۂ نفس"
  ],
  "ইসলামিক বই": [
    "Islamic books",
    "اسلامی کتابیں"
  ],
  "ইসলাহ বিডি": [
    "IslahBD",
    "اصلاح بی ڈی"
  ],
  "ইসলাহ লাইভ": [
    "Islah Live",
    "اصلاح لائیو"
  ],
  "ওয়ালপেপার": [
    "Wallpaper",
    "وال پیپر"
  ],
  "নতুন আপলোড": [
    "New upload",
    "نئی اپلوڈ"
  ],
  "নোটিফিকেশন": [
    "Notifications",
    "اطلاعات"
  ],
  "পরের আয়াত": [
    "Next ayah",
    "اگلی آیت"
  ],
  "লাইভ বয়ান": [
    "Live bayan",
    "لائیو بیان"
  ],
  "লাইভ শুনুন": [
    "Listen live",
    "لائیو سنیں"
  ],
  "লোড হচ্ছে…": [
    "Loading…",
    "لوڈ ہو رہا ہے…"
  ],
  "হজ ও ওমরাহ": [
    "Hajj and Umrah",
    "حج و عمرہ"
  ],
  "হামদ ও নাত": [
    "Hamd and naat",
    "حمد و نعت"
  ],
  "হোমে ফিরুন": [
    "Back home",
    "ہوم پر واپس"
  ],
  "০১২৩৪৫৬৭৮৯": [
    "0123456789",
    "۰۱۲۳۴۵۶۷۸۹"
  ],
  "PDF কিতাব": [
    "PDF book",
    "PDF کتاب"
  ],
  "আগের পাতা": [
    "Previous page",
    "پچھلا صفحہ"
  ],
  "আগের সূরা": [
    "Previous surah",
    "پچھلی سورت"
  ],
  "আপনার নাম": [
    "Your name",
    "آپ کا نام"
  ],
  "আবেদনসমূহ": [
    "Applications",
    "درخواستیں"
  ],
  "আরও জানুন": [
    "Learn more",
    "مزید جانیں"
  ],
  "আরও দেখুন": [
    "See more",
    "مزید دیکھیں"
  ],
  "এখন বাজছে": [
    "Now playing",
    "ابھی چل رہا ہے"
  ],
  "ওয়েবসাইট": [
    "Website",
    "ویب سائٹ"
  ],
  "জুম রিসেট": [
    "Reset zoom",
    "زوم ری سیٹ"
  ],
  "তেলাওয়াত": [
    "Recitation",
    "تلاوت"
  ],
  "দরূদ শরীফ": [
    "Durud Sharif",
    "درود شریف"
  ],
  "পরের পাতা": [
    "Next page",
    "اگلا صفحہ"
  ],
  "পরের সূরা": [
    "Next surah",
    "اگلی سورت"
  ],
  "প্লেলিস্ট": [
    "Playlist",
    "پلے لسٹ"
  ],
  "চ্যানেলের প্লেলিস্ট": [
    "Channel playlists",
    "چینل کی پلے لسٹس"
  ],
  "চ্যানেলের প্লেলিস্ট লোড করা যাচ্ছে না।": [
    "Couldn’t load channel playlists.",
    "چینل کی پلے لسٹس لوڈ نہیں ہو سکیں۔"
  ],
  "প্লেলিস্টের ভিডিও লোড করা যাচ্ছে না।": [
    "Couldn’t load this playlist.",
    "اس پلے لسٹ کی ویڈیوز لوڈ نہیں ہو سکیں۔"
  ],
  "প্লেলিস্টটি খালি বা পাওয়া যায়নি।": [
    "This playlist is empty or unavailable.",
    "یہ پلے لسٹ خالی ہے یا دستیاب نہیں۔"
  ],
  "এই চ্যানেলে এখনো কোনো পাবলিক প্লেলিস্ট নেই।": [
    "No public playlists on this channel yet.",
    "اس چینل پر ابھی کوئی عوامی پلے لسٹ نہیں ہے۔"
  ],
  "বন্ধ করুন": [
    "Close",
    "بند کریں"
  ],
  "লাইব্রেরি": [
    "Library",
    "لائبریری"
  ],
  "লাইভ চলছে": [
    "Live now",
    "لائیو جاری ہے"
  ],
  "শুধু অডিও": [
    "Audio only",
    "صرف آڈیو"
  ],
  "সারি খালি": [
    "Queue is empty",
    "قطار خالی ہے"
  ],
  "অন্যান্য": [
    "More",
    "مزید"
  ],
  "অ্যালবাম": [
    "Album",
    "البم"
  ],
  "আগেই আছে": [
    "Already added",
    "پہلے سے موجود ہے"
  ],
  "আগের অংশ": [
    "Previous part",
    "پچھلا حصہ"
  ],
  "আগের মাস": [
    "Previous month",
    "پچھلا مہینہ"
  ],
  "কম দেখুন": [
    "Show less",
    "کم دکھائیں"
  ],
  "জনপ্রিয়": [
    "Popular",
    "مقبول"
  ],
  "পরের অংশ": [
    "Next part",
    "اگلا حصہ"
  ],
  "পরের মাস": [
    "Next month",
    "اگلا مہینہ"
  ],
  "মালফুযাত": [
    "Malfuzat",
    "ملفوظات"
  ],
  "শেষ পড়া": [
    "Last read",
    "آخری پڑھائی"
  ],
  "সব চালান": [
    "Play all",
    "سب چلائیں"
  ],
  "সব দেখুন": [
    "See all",
    "سب دیکھیں"
  ],
  "সব ফিচার": [
    "All features",
    "تمام فیچرز"
  ],
  "সূচিপত্র": [
    "Contents",
    "فہرست"
  ],
  "সূরাসমূহ": [
    "Surahs",
    "سورتیں"
  ],
  "হাইলাইটস": [
    "Highlights",
    "جھلکیاں"
  ],
  "হামদ-নাত": [
    "Hamd-naat",
    "حمد و نعت"
  ],
  "খুঁজুন…": [
    "Search…",
    "تلاش کریں…"
  ],
  "চ্যানেল": [
    "Channel",
    "چینل"
  ],
  "জুম আউট": [
    "Zoom out",
    "زوم آؤٹ"
  ],
  "ডাউনলোড": [
    "Download",
    "ڈاؤن لوڈ"
  ],
  "তাফসীরঃ": [
    "Tafsir:",
    "تفسیر:"
  ],
  "পরবর্তী": [
    "Next",
    "اگلا"
  ],
  "মিডিয়া": [
    "Media",
    "میڈیا"
  ],
  "রিফ্রেশ": [
    "Refresh",
    "ریفریش"
  ],
  "সেকেন্ড": [
    "seconds",
    "سیکنڈ"
  ],
  "অনুবাদ": [
    "Translation",
    "ترجمہ"
  ],
  "অফলাইন": [
    "Offline",
    "آف لائن"
  ],
  "আগেরটি": [
    "Previous",
    "پچھلا"
  ],
  "জুম ইন": [
    "Zoom in",
    "زوم ان"
  ],
  "তাফসীর": [
    "Tafsir",
    "تفسیر"
  ],
  "তাফসীর:": [
    "Tafsir:",
    "تفسیر:"
  ],
  "দক্ষিণ": [
    "South",
    "جنوب"
  ],
  "পরিবার": [
    "Family",
    "خاندان"
  ],
  "পরেরটি": [
    "Next",
    "اگلا"
  ],
  "পশ্চিম": [
    "West",
    "مغرب"
  ],
  "ফযীলত:": [
    "Virtues:",
    "فضائل:"
  ],
  "মাক্কী": [
    "Makki",
    "مکی"
  ],
  "মাদানী": [
    "Madani",
    "مدنی"
  ],
  "শেয়ার": [
    "Share",
    "شیئر کریں"
  ],
  "সব মাস": [
    "All months",
    "تمام مہینے"
  ],
  "সেটিংস": [
    "Settings",
    "ترتیبات"
  ],
  "আপডেট": [
    "Update",
    "اپڈیٹ"
  ],
  "আয়াত": [
    "Ayah",
    "آیت"
  ],
  "ইশরাক": [
    "Ishraq",
    "اشراق"
  ],
  "ইসলাহ": [
    "Islah",
    "اصلاح"
  ],
  "উত্তর": [
    "North",
    "شمال"
  ],
  "কবিগণ": [
    "Poets",
    "شعراء"
  ],
  "কিতাব": [
    "Book",
    "کتاب"
  ],
  "কুরআন": [
    "Qur'an",
    "قرآن"
  ],
  "ঘণ্টা": [
    "hours",
    "گھنٹے"
  ],
  "চালান": [
    "Play",
    "چلائیں"
  ],
  "ডোনেট": [
    "Donate",
    "عطیہ دیں"
  ],
  "থামান": [
    "Pause",
    "روکیں"
  ],
  "পড়ুন": [
    "Read",
    "پڑھیں"
  ],
  "পাঠান": [
    "Send",
    "بھیجیں"
  ],
  "পি এম": [
    "PM",
    "PM"
  ],
  "পুরনো": [
    "Old",
    "پرانا"
  ],
  "পূর্ব": [
    "East",
    "مشرق"
  ],
  "ফিরুন": [
    "Back",
    "واپس"
  ],
  "বয়ান": [
    "Bayan",
    "بیان"
  ],
  "বিরতি": [
    "Break",
    "وقفہ"
  ],
  "বিষয়": [
    "Topic",
    "موضوع"
  ],
  "ভিডিও": [
    "Video",
    "ویڈیو"
  ],
  "মক্কা": [
    "Makkah",
    "مکہ"
  ],
  "মদিনা": [
    "Madinah",
    "مدینہ"
  ],
  "মিনিট": [
    "minutes",
    "منٹ"
  ],
  "মুছুন": [
    "Clear",
    "صاف کریں"
  ],
  "রিসেট": [
    "Reset",
    "ری سیٹ"
  ],
  "শুনুন": [
    "Listen",
    "سنیں"
  ],
  "সার্চ": [
    "Search",
    "تلاش"
  ],
  "• অটো": [
    "• Auto",
    "• خودکار"
  ],
  "অডিও": [
    "Audio",
    "آڈیو"
  ],
  "আবার": [
    "Again",
    "دوبارہ"
  ],
  "এ এম": [
    "AM",
    "AM"
  ],
  "চাশত": [
    "Chasht",
    "چاشت"
  ],
  "ডানে": [
    "Right",
    "دائیں"
  ],
  "ঢাকা": [
    "Dhaka",
    "ڈھاکہ"
  ],
  "নতুন": [
    "New",
    "نیا"
  ],
  "পারা": [
    "Para",
    "پارہ"
  ],
  "বাকি": [
    "Remaining",
    "باقی"
  ],
  "বামে": [
    "Left",
    "بائیں"
  ],
  "লাইভ": [
    "Live",
    "لائیو"
  ],
  "শুরু": [
    "Start",
    "شروع"
  ],
  "সূরা": [
    "Surah",
    "سورت"
  ],
  "০:০০": [
    "0:00",
    "۰:۰۰"
  ],
  "আগে": [
    "Before",
    "پہلے"
  ],
  "আমল": [
    "Amal",
    "عمل"
  ],
  "এখন": [
    "Now",
    "ابھی"
  ],
  "কপি": [
    "Copy",
    "کاپی"
  ],
  "দিন": [
    "days",
    "دن"
  ],
  "দোআ": [
    "Dua",
    "دعا"
  ],
  "নফল": [
    "Nafl",
    "نفل"
  ],
  "পরে": [
    "After",
    "بعد"
  ],
  "বাং": [
    "Bn",
    "بن"
  ],
  "শেষ": [
    "End",
    "اختتام"
  ],
  "আজ": [
    "Today",
    "آج"
  ],
  "বই": [
    "Books",
    "کتابیں"
  ],
  "সব": [
    "All",
    "سب"
  ],
  "৯+": [
    "9+",
    "۹+"
  ],
  "০": [
    "0",
    "۰"
  ],
  "সম্পূর্ণ তিলাওয়াত": [
    "Full recitation",
    "مکمل تلاوت"
  ],
  "পৃষ্ঠা": [
    "Page",
    "صفحہ"
  ],
  "মোট আয়াতঃ": [
    "Total ayahs:",
    "کل آیات:"
  ],
  "পারা অনুযায়ী পড়ুন": [
    "Read by para",
    "پارے کے مطابق پڑھیں"
  ],
  "ক্বারী": [
    "Qari",
    "قاری"
  ],
  "আমার সংগ্রহ": [
    "My collection",
    "میرا مجموعہ"
  ],
  "টি ফলাফল": [
    " results",
    " نتائج"
  ],
  "মোট": [
    "Total",
    "کل"
  ],
  "মোট সূরা": [
    "Total surahs",
    "کل سورتیں"
  ],
  "আমাদের পরম শ্রদ্ধেয় শায়েখ হযরত মাওলানা শাহ তৈয়্যেব আশরাফ সাহেব (দামাত বারাকাতুহুম) এর প্রতিষ্ঠিত ও পরিচালিত দ্বীনি প্রতিষ্ঠান “জামেআ মারকাযুল ইহসান ঢাকা (গুলশানে আল্লামা শাহ আব্দুল মতীন কমপ্লেক্স)”। প্রতিষ্ঠানটির সামগ্রিক উন্নতি-অগ্রগতি এবং শত শত তালিবুল ইলম ও কুরআনের হাফেজদের আর্থিক খেদমতের সহযোগিতাকে বেগবান করার লক্ষ্যে যাঁরা বাৎসরিক নির্দিষ্ট অনুদান প্রদানের অঙ্গীকার করেন, তাঁরাই হলেন এই জামেআর সম্মানিত আজীবন সদস্য। এটি দুনিয়া ও আখেরাতের এক চিরন্তন সদকায়ে জারিয়া।": [
    "This is a religious institution founded and run by our most revered Sheikh Hazrat Maulana Shah Tayyeb Ashraf Sahib (Damat barakatuhum) — Jamia Markazul Ihsan Dhaka (Gulshan, Allama Shah Abdul Matin Complex). Those who pledge a fixed annual donation to accelerate the institution's overall progress and to support the financial service of hundreds of students of knowledge and huffaz of the Qur'an are the honoured lifetime members of this Jamia. It is an everlasting sadaqah jariyah for this world and the Hereafter.",
    "یہ ہمارے نہایت محترم شیخ حضرت مولانا شاہ طیب اشرف صاحب (دامت برکاتہم) کی قائم کردہ اور چلائی جانے والی دینی ادارہ — جامعہ مرکز الاحسان ڈھاکہ (گلشن، علامہ شاہ عبد المتین کمپلیکس) ہے۔ اس ادارے کی مجموعی ترقی و پیش رفت اور سینکڑوں طلبۂ علم اور حفاظِ قرآن کی مالی خدمت میں تعاون کو تیز کرنے کے لیے جو لوگ سالانہ مقررہ عطیہ دینے کا عہد کرتے ہیں، وہی اس جامعہ کے محترم تاحیات ارکان ہیں۔ یہ دنیا و آخرت کا ایک دائمی صدقۂ جاریہ ہے۔"
  ],
  "দ্বীনি এ খেদমতে অংশগ্রহণ করার লক্ষ্যে আমরা নিজেরা সদস্য হওয়ার ও নিজেদের আপনজন প্রিয়জনদেরকে সদস্য করার ফিকির করবো ইনশাআল্লাহ। সেই সাথে দোয়া করবো, মহান আল্লাহ রাব্বুল আলামীন নিজ দয়া ও অনুগ্রহে খুব বেশি কবুল করুন এবং সফল করুন। আমীন।": [
    "To take part in this religious service, we will, InshaAllah, consider becoming members ourselves and encouraging our relatives and loved ones to become members. Along with that, we pray that Allah, the Lord of the worlds, accepts it abundantly by His mercy and grants success. Ameen.",
    "اس دینی خدمت میں حصہ لینے کے لیے ہم خود رکن بننے اور اپنے عزیزوں اور پیاروں کو رکن بنانے کی فکر کریں گے، ان شاء اللہ۔ ساتھ ہی دعا کریں گے کہ اللہ رب العالمین اپنی رحمت و کرم سے اسے بہت زیادہ قبول فرمائے اور کامیاب کرے۔ آمین۔"
  ],
  "ইসলামি কিতাব পড়ুন ও ডাউনলোড করুন": [
    "Read and download Islamic books",
    "اسلامی کتابیں پڑھیں اور ڈاؤن لوڈ کریں"
  ],
  "টি বয়ান": [
    " bayans",
    " بیانات"
  ],
  "টি ভিডিও": [
    " videos",
    " ویڈیوز"
  ],
  "টি প্লেলিস্ট": [
    " playlists",
    " پلے لسٹس"
  ],
  "টি বই": [
    " books",
    " کتابیں"
  ],
  "টি বাকি": [
    " more",
    " مزید"
  ],
  "টি নতুন": [
    " new",
    " نئی"
  ],
  "টি ছবি": [
    " photos",
    " تصاویر"
  ],
  "টি মসজিদ": [
    " mosques",
    " مساجد"
  ],
  "টি": [
    " items",
    " آئٹمز"
  ],
  "ক্লিপস": [
    "Clips",
    "کلپس"
  ],
  "লিখে কোনো ভিডিও পাওয়া যায়নি": [
    "— no videos found",
    "— کوئی ویڈیو نہیں ملی"
  ],
  "সরাসরি MP3 লেকচার": [
    "Live MP3 lectures",
    "لائیو MP3 لیکچرز"
  ],
  "প্রশ্ন": [
    "Question",
    "سوال"
  ],
  "হিস্ট্রি": [
    "History",
    "تاریخ"
  ],
  "পরিসরে, নিকটতম আগে": [
    "range, nearest first",
    "دائرے میں، قریب ترین پہلے"
  ],
  "পাতা": [
    "Page",
    "صفحہ"
  ],
  "হিজরী": [
    "Hijri",
    "ہجری"
  ],
  "মাসের ঘটনাবলী": [
    "Events of the month",
    "ماہ کے واقعات"
  ],
  "সূত্র:": [
    "Source:",
    "حوالہ:"
  ],
  "ক্যালেন্ডার": [
    "Calendar",
    "کیلنڈر"
  ],
  "ঐতিহাসিক ঘটনা ও তথ্য": [
    "Historical events and information",
    "تاریخی واقعات اور معلومات"
  ],
  "জন শুনছেন": [
    " listening",
    " سن رہے ہیں"
  ],
  "তারজুমান-এ-আকাবির আরিফবিল্লাহ হযরত মাওলানা শাহ আব্দুল মতিন বিন হুসাইন সাহেবের খলিফা — মাদরাসা মারকাযুল ইহসান ঢাকার প্রতিষ্ঠাতা প্রিন্সিপাল ও বাইতুল আমান জামে মসজিদের সম্মানিত খতীব।": [
    "Khalifa of Tarjuman-e-Akabir Arif Billah Hazrat Maulana Shah Abdul Matin bin Husain Sahib — founding principal of Madrasa Markazul Ihsan Dhaka and respected Khatib of Baitul Aman Jame Mosque.",
    "ترجمانِ اکابر عارف باللہ حضرت مولانا شاہ عبد المتین بن حسین صاحب کے خلیفہ — مدرسہ مرکز الاحسان ڈھاکہ کے بانی پرنسپل اور بیت الامان جامع مسجد کے محترم خطیب۔"
  ],
  "তারজুমান-এ-আকাবির আরিফ বিল্লাহ হযরত মাওলানা শাহ আব্দুল মতিন বিন হুসাইন সাহেব-এর খলিফা হযরত মাওলানা": [
    "Khalifa of Tarjuman-e-Akabir Arif Billah Hazrat Maulana Shah Abdul Matin bin Husain Sahib, Hazrat Maulana",
    "ترجمانِ اکابر عارف باللہ حضرت مولانا شاہ عبد المتین بن حسین صاحب کے خلیفہ، حضرت مولانا"
  ],
  "তাফসীর আহসানুল বায়ান": [
    "Tafsir Ahsanul Bayan",
    "تفسیر احسن البیان"
  ],
  "তাফসীর আবু বকর যাকারিয়া": [
    "Tafsir Abu Bakr Zakaria",
    "تفسیر ابو بکر زکریا"
  ],
  "তাফসীর ফাতহুল মাজীদ": [
    "Tafsir Fathul Majid",
    "تفسیر فتح المجید"
  ],
  "পুরনো নোটিফিকেশন": [
    "Older notifications",
    "پرانی اطلاعات"
  ],
  "মিটার": [
    "m",
    "میٹر"
  ],
  "কিমি": [
    "km",
    "کلومیٹر"
  ],
  "টি ঘটনা": [
    " events",
    " واقعات"
  ],
  "সূর্যাস্ত": [
    "Sunset",
    "غروب"
  ],
  "অটো": [
    "Auto",
    "خودکار"
  ],
  "চট্টগ্রাম": [
    "Chattogram",
    "چٹاگانگ"
  ],
  "সিলেট": [
    "Sylhet",
    "سلہٹ"
  ],
  "খুলনা": [
    "Khulna",
    "کھلنا"
  ],
  "বরিশাল": [
    "Barishal",
    "باریسال"
  ],
  "রাজশাহী": [
    "Rajshahi",
    "راجشاہی"
  ],
  "রংপুর": [
    "Rangpur",
    "رنگپور"
  ],
  "ময়মনসিংহ": [
    "Mymensingh",
    "میمن سنگھ"
  ],
  "ফোনের মুখ:": [
    "Facing:",
    "سمتِ فون:"
  ],
  "অবস্থান:": [
    "Location:",
    "مقام:"
  ],
  "হাকীম আখতার (রহ.)": [
    "Hakim Akhtar (RA)",
    "حکیم اختر (رحمہ اللہ)"
  ],
  "কবিতা": [
    "poems",
    "نظمیں"
  ],
  "টু কবিতা": [
    " poems",
    " نظمیں"
  ],
  "বুযুর্গদের বাণী": [
    "Words of the pious",
    "بزرگوں کے اقوال"
  ],
  "সেভড": [
    "saved",
    "محفوظ"
  ],
  "ধাপ": [
    "Step",
    "مرحلہ"
  ],
  "টি আইটেম": [
    " items",
    " آئٹمز"
  ],
  "টি সেভড": [
    " saved",
    " محفوظ"
  ],
  "কিবলা": [
    "Qibla",
    "قبلہ"
  ],
  "ফযীলত": [
    "Fazilat",
    "فضیلت"
  ],
  "গ্যালারি": [
    "Gallery",
    "گیلری"
  ],
  "পরিবার / বাইআত": [
    "Family / Bay'ah",
    "خاندان / بیعت"
  ]
};

export function lookupUi(bn: string, lang: "en" | "ur"): string | undefined {
  const entry = UI_STRINGS[bn];
  return entry ? entry[lang === "en" ? 0 : 1] : undefined;
}
