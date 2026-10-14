import Link from "next/link";
import PrayerCard from "../components/PrayerCard";
import { SectionTitle } from "../components/ui";
import { Icon } from "../components/icons";

const SERVICES = [
  { route: "/quran", bn: "কুরআন", icon: "book", tint: "bg-emerald-50", color: "text-primary-600" },
  { route: "/live", bn: "লাইভ", icon: "radio", tint: "bg-rose-50", color: "text-rose-500" },
  { route: "/qibla", bn: "কিবলা", icon: "compass", tint: "bg-sky-50", color: "text-sky-600" },
  { route: "/malfuzat", bn: "মালফুজাত", icon: "chat", tint: "bg-teal-50", color: "text-teal-600" },
  { route: "/library", bn: "বই", icon: "library", tint: "bg-orange-50", color: "text-orange-500" },
  { route: "/paribar", bn: "মাদ্রাসা", icon: "mosque", tint: "bg-emerald-50", color: "text-primary-600" },
  { route: "/tasbeeh", bn: "তাসবিহ", icon: "beads", tint: "bg-violet-50", color: "text-violet-600" },
  { route: "/dua", bn: "দোআ", icon: "hands", tint: "bg-amber-50", color: "text-gold-600" },
];

const MEDIA = [
  { route: "/boyan", bn: "বয়ান", d: "MP3 লেকচার শুনুন", icon: "mic" },
  { route: "/media", bn: "সংক্ষিপ্ত ক্লিপস", d: "ছোট ভিডিও ক্লিপ", icon: "play" },
  { route: "/hamdnaat", bn: "হামদ-নাত", d: "অডিও ও ভিডিও", icon: "music" },
  { route: "/library", bn: "বই", d: "ইসলামি বই পড়ুন", icon: "book" },
];

function MosqueSilhouette() {
  return (
    <svg viewBox="0 0 400 120" className="pointer-events-none absolute bottom-0 left-0 w-full opacity-25" aria-hidden>
      <path
        fill="currentColor"
        d="M0 120 V90 h20 V60 h8 V40 h6 V60 h8 v30 h18 c0-26 16-44 40-50 -2-6-2-12 0-16 3 4 4 8 4 12 24 6 40 24 40 50 h18 V60 h8 V40 h6 v20 h8 v30 h20 v30 Z
           M30 120 V70 h6 v50 Z M364 120 V70 h6 v50 Z"
      />
      <circle cx="200" cy="14" r="4" fill="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="animate-fade-up">
      <div className="mt-1">
        <PrayerCard />
      </div>

      {/* Promo banner */}
      <div className="page-hero mt-3 overflow-hidden p-5">
        <MosqueSilhouette />
        <div className="relative z-10 text-center">
          <div className="font-arabic text-xl text-gold-100" dir="rtl">ٱقْرَأْ بِٱسْمِ رَبِّكَ</div>
          <div className="gold-text text-[26px] font-bold leading-tight">islahBD</div>
          <p className="mx-auto mt-1 max-w-xs text-[12px] text-white/75">
            দ্বীনি জীবনের সব প্রয়োজন — কুরআন, বয়ান, দোআ ও লাইভ — এক অ্যাপে
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <a
              href="https://play.google.com/store/apps/details?id=com.islahbd.app"
              target="_blank" rel="noreferrer"
              className="btn-white inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition hover:scale-105 active:scale-95"
            >
              <Icon name="play" size={15} /> Google Play
            </a>
            <a
              href="https://apps.apple.com/us/app/islahbd/id6762509692"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/25 hover:scale-105 active:scale-95"
            >
              <Icon name="external" size={15} /> App Store
            </a>
          </div>
        </div>
      </div>

      {/* Services */}
      <SectionTitle title="প্রয়োজনীয় সেবা" hint="দৈনন্দিন দ্বীনি প্রয়োজন" link="/others" linkLabel="সব দেখুন" />
      <div className="grid grid-cols-4 gap-2">
        {SERVICES.map((s) => (
          <Link
            key={s.route + s.bn}
            href={s.route}
            className="card card-hover flex flex-col items-center gap-1.5 rounded-3xl border p-3 text-center"
          >
            <span className={`icon-tile !h-11 !w-11 ${s.tint} ${s.color}`}>
              <Icon name={s.icon} size={22} />
            </span>
            <span className="text-[11px] font-bold leading-tight">{s.bn}</span>
          </Link>
        ))}
      </div>

      {/* Media */}
      <SectionTitle title="মিডিয়া" hint="শুনুন ও দেখুন" link="/media" linkLabel="সব দেখুন" />
      <div className="grid grid-cols-2 gap-2">
        {MEDIA.map((m) => (
          <Link
            key={m.route + m.bn}
            href={m.route}
            className="card card-hover group flex items-center gap-3 p-4"
          >
            <span className="icon-tile bg-primary-600 text-white transition-transform group-hover:scale-110">
              <Icon name={m.icon} size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{m.bn}</span>
              <span className="block truncate text-xs text-ink-faint">{m.d}</span>
            </span>
            <Icon name="chevron" size={18} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] text-ink-faint">
        ইসলাহ • দ্বীন জীবনের সঙ্গী
      </p>
    </div>
  );
}
