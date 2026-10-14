import Link from "next/link";
import PrayerCard from "../components/PrayerCard";
import { SectionTitle } from "../components/ui";
import { Icon } from "../components/icons";
import { homeGrid } from "../lib/features";

function hijriToday(): string {
  try {
    return new Intl.DateTimeFormat("bn-BD-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 4) return "গভীর রাত";
  if (h < 11) return "সুপ্রভাত";
  if (h < 16) return "শুভ দুপুর";
  if (h < 19) return "শুভ বিকেল";
  return "শুভ সন্ধ্যা";
}

export default function HomePage() {
  const hijri = hijriToday();
  return (
    <div className="animate-fade-up">
      {/* greeting */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-[13px] font-bold text-ink-faint">{greeting()} 👋</div>
          <h1 className="text-[22px] font-bold tracking-tight">আসসালামু আলাইকুম</h1>
        </div>
        {hijri && (
          <div className="rounded-2xl bg-primary-600 px-3.5 py-2 text-right text-white shadow-card">
            <div className="text-[10px] font-bold text-white/70">আজ</div>
            <div className="text-[12px] font-bold leading-tight">{hijri}</div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <PrayerCard />
      </div>

      <SectionTitle title="ফিচারসমূহ" hint="দ্বীনি জীবনের সব প্রয়োজন এক জায়গায়" link="/others" linkLabel="সব দেখুন" />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {homeGrid.slice(0, 12).map((f) => (
          <Link
            key={f.route}
            href={f.route}
            className="card card-hover flex flex-col items-center gap-1.5 p-3 text-center"
          >
            <span className={`icon-tile !h-11 !w-11 ${f.tint} ${f.color}`}>
              <Icon name={f.icon} size={22} />
            </span>
            <span className="text-[11px] font-bold leading-tight">{f.titleBn}</span>
          </Link>
        ))}
      </div>

      <SectionTitle title="শুনুন ও শিখুন" hint="বয়ান • হামদ-নাত • লাইভ" link="/boyan" linkLabel="বয়ান" />
      <div className="grid grid-cols-2 gap-2">
        <Link href="/boyan" className="page-hero card-hover block !rounded-3xl p-4">
          <span className="relative z-10 block">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Icon name="mic" size={22} />
            </span>
            <span className="mt-2 block font-bold">বয়ান</span>
            <span className="block text-xs text-white/70">MP3 লেকচার শুনুন</span>
          </span>
        </Link>
        <Link href="/hamdnaat" className="card card-hover block overflow-hidden bg-gradient-to-br from-gold-light to-amber-100 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gold-600 shadow-card">
            <Icon name="music" size={22} />
          </span>
          <span className="mt-2 block font-bold">হামদ ও নাত</span>
          <span className="block text-xs text-ink-faint">অডিও ও ভিডিও</span>
        </Link>
      </div>

      <SectionTitle title="কুরআন" hint="পড়ুন • শুনুন • খুঁজুন" link="/quran" />
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { img: "/images/digital_quran_screen.webp", t: "ডিজিটাল কুরআন", d: "অনুবাদ ও তাফসীরসহ", href: "/quran/read" },
          { img: "/images/hafezi_quran_cover.webp", t: "হাফেজি মুসহাফ", d: "৬১০ পৃষ্ঠার ছাপা মুসহাফ", href: "/quran/read" },
          { img: "/images/audio_quran_player.webp", t: "অডিও কুরআন", d: "তিলাওয়াত শুনুন", href: "/quran/audio" },
        ].map((c) => (
          <Link key={c.t} href={c.href} className="card card-hover overflow-hidden">
            <div className="relative">
              <img src={c.img} alt={c.t} className="h-28 w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              <span className="absolute bottom-2 left-3 font-bold text-white">{c.t}</span>
            </div>
            <div className="px-3 py-2 text-xs text-ink-faint">{c.d}</div>
          </Link>
        ))}
      </div>

      <SectionTitle title="আজকের আমল" link="/amal" />
      <div className="card flex items-center gap-3 p-4">
        <span className="icon-tile bg-indigo-50 text-indigo-500">
          <Icon name="moon" size={24} />
        </span>
        <div className="flex-1 text-[13px] text-ink-soft">
          সকাল-সন্ধ্যার ওয়াজিফা, দোআ ও সুন্নাত — প্রতিদিনের আমল এক জায়গায়।
        </div>
        <Link href="/tasbeeh" className="btn-gold shrink-0 !px-3.5">
          <Icon name="beads" size={16} />
          তাসবীহ
        </Link>
      </div>

      <SectionTitle title="লাইভ" link="/live" />
      <Link href="/live" className="card card-hover flex items-center gap-3 p-4">
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Icon name="radio" size={24} />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500 animate-pulsedot" />
        </span>
        <div className="flex-1">
          <div className="font-bold">লাইভ বয়ান ও মক্কা-মদিনা</div>
          <div className="text-xs text-ink-faint">সরাসরি সম্প্রচার, রিমাইন্ডার ও হিস্ট্রি</div>
        </div>
        <Icon name="chevron" size={18} className="text-ink-faint" />
      </Link>

      <p className="mt-8 text-center text-[11px] text-ink-faint">
        ইসলাহ • দ্বীন জীবনের সঙ্গী
      </p>
    </div>
  );
}
