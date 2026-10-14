import Link from "next/link";

const tiles = [
  { href: "/quran/read", icon: "📖", t: "ডিজিটাল কুরআন পড়ুন", d: "TanzilDigitalQuran • সূরা/জুজ/পৃষ্ঠা • তাওযীহুল অনুবাদ-তাফসীর • বুকমার্ক", img: "/images/digital_quran_screen.webp" },
  { href: "/quran/read?mushaf=hafezi", icon: "📜", t: "হাফেজি মুসহাফ", d: "InteractiveMushaf • ৬১০ পৃষ্ঠা • নসখ-তালিক ছাপা", img: "/images/hafezi_quran_cover.webp" },
  { href: "/quran/audio", icon: "🎧", t: "অডিও কুরআন (MP3)", d: "QuranMp3Player • ক্বারী সিলেক্ট • ডাউনলোড • ফ্লোটিং প্লেয়ার", img: "/images/audio_quran_player.webp" },
  { href: "/quran/search", icon: "🔍", t: "সার্চ + শব্দ-শব্দ + ইরাব", d: "QuranSearch • WBW • quran_irab.json ব্যাকরণ", img: "/images/cover_naskh_taleeq.webp" },
];

export default function QuranLanding() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">আল-কুরআন</h1>
      <p className="text-sm text-stone-500">QuranLandingScreen • ৬২৩৬ আয়াত • অফলাইন ডাটাবেজ</p>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {tiles.map((c) => (
          <Link key={c.t} href={c.href} className="card overflow-hidden">
            <img src={c.img} alt={c.t} className="w-full h-32 object-cover" />
            <div className="p-3">
              <div className="font-bold">{c.icon} {c.t}</div>
              <div className="text-xs text-stone-500">{c.d}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="card p-4 mt-3 text-sm">
        <b>তাফসীর ও অনুবাদ API:</b> api.islahbd.com/api/quran/translations/tawzihul/ ও /tafseer/tawzihul/ — অনলাইনে থাকলে স্বয়ংক্রিয় লোড হবে, অফলাইনে বিল্ট-ইন বাংলা অনুবাদ দেখাবে।
      </div>
    </div>
  );
}
