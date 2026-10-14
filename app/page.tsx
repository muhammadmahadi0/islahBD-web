import Link from "next/link";
import PrayerCard from "../components/PrayerCard";
import { SectionTitle, IslamicCard } from "../components/ui";
import { homeGrid } from "../lib/features";

export default function HomePage() {
  return (
    <div>
      <PrayerCard />

      <SectionTitle title="ফিচারসমূহ" link="/others" linkLabel="সব ফিচার" />
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {homeGrid.slice(0, 12).map((f) => (
          <Link key={f.route} href={f.route} className="card p-2.5 flex flex-col items-center text-center gap-1 active:scale-95 transition">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-[11px] font-bold leading-tight">{f.titleBn}</span>
          </Link>
        ))}
      </div>

      <SectionTitle title="কুরআন" link="/quran" />
      <div className="grid sm:grid-cols-3 gap-2">
        {[
          { img: "/images/digital_quran_screen.webp", t: "ডিজিটাল কুরআন", d: "তাওযীহুল কুরআন অনুবাদ + তাফসীরসহ পড়ুন", href: "/quran/read" },
          { img: "/images/hafezi_quran_cover.webp", t: "হাফেজি মুসহাফ", d: "৬১০ পৃষ্ঠার হুবহু ছাপা মুসহাফ", href: "/quran/read?mushaf=hafezi" },
          { img: "/images/audio_quran_player.webp", t: "অডিও কুরআন", d: "ক্বারীদের তিলাওয়াত শুনুন ও ডাউনলোড করুন", href: "/quran/audio" },
        ].map((c) => (
          <Link key={c.t} href={c.href} className="card overflow-hidden">
            <img src={c.img} alt={c.t} className="w-full h-28 object-cover" />
            <div className="p-3">
              <div className="font-bold">{c.t}</div>
              <div className="text-xs text-stone-500">{c.d}</div>
            </div>
          </Link>
        ))}
      </div>

      <SectionTitle title="আজকের আমল" link="/amal" />
      <IslamicCard>
        <div className="text-sm">সকাল-সন্ধ্যার ওয়াজিফা, দোআ ও সুন্নাত — প্রতিদিনের আমল ট্র্যাক করুন, কাস্টম আমল যোগ করুন।</div>
        <div className="flex gap-2 mt-3">
          <Link href="/amal" className="btn-primary flex-1 text-center">আমল খুলুন</Link>
          <Link href="/tasbeeh" className="btn-primary flex-1 text-center !bg-gold !text-ink">তাসবীহ</Link>
        </div>
      </IslamicCard>

      <SectionTitle title="লাইভ ও বয়ান" link="/live" />
      <IslamicCard>
        <div className="text-sm">🔴 লাইভ বয়ান, মক্কা-মদিনা লাইভ, বয়ান রিমাইন্ডার ও বয়ান হিস্ট্রি।</div>
        <div className="flex gap-2 mt-3">
          <Link href="/live" className="btn-primary flex-1 text-center">লাইভ দেখুন</Link>
          <Link href="/library" className="btn-primary flex-1 text-center !bg-ink">লাইব্রেরি</Link>
        </div>
      </IslamicCard>

      <p className="text-center text-[11px] text-stone-400 mt-6">
        Clone of IslahBD Android app • package com.islahbd.app • v1.3.0 • API: api.islahbd.com
      </p>
    </div>
  );
}
