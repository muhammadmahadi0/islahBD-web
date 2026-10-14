import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

const tiles = [
  { href: "/quran/read", icon: "book", tint: "bg-emerald-50", color: "text-primary-600", t: "ডিজিটাল কুরআন", d: "তাওযীহুল অনুবাদ ও তাফসীরসহ পড়ুন", img: "/images/digital_quran_screen.webp" },
  { href: "/quran/read", icon: "doc", tint: "bg-teal-50", color: "text-teal-600", t: "হাফেজি মুসহাফ", d: "৬১০ পৃষ্ঠার হুবহু ছাপা মুসহাফ", img: "/images/hafezi_quran_cover.webp" },
  { href: "/quran/audio", icon: "headphones", tint: "bg-violet-50", color: "text-violet-600", t: "অডিও কুরআন", d: "ক্বারীদের তিলাওয়াত শুনুন", img: "/images/audio_quran_player.webp" },
  { href: "/quran/search", icon: "search", tint: "bg-amber-50", color: "text-gold-600", t: "সার্চ ও ইরাব", d: "শব্দ-শব্দ অর্থ ও ব্যাকরণ", img: "/images/cover_naskh_taleeq.webp" },
];

export default function QuranLanding() {
  return (
    <div className="animate-fade-up">
      <PageHead title="আল-কুরআন" subtitle="৬২৩৬ আয়াত • অফলাইন ডাটাবেজ" icon="book" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {tiles.map((c) => (
          <Link key={c.t} href={c.href} className="card card-hover overflow-hidden">
            <div className="relative">
              <img src={c.img} alt={c.t} className="h-32 w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
              <span className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-card ${c.color}`}>
                <Icon name={c.icon} size={20} />
              </span>
              <span className="absolute bottom-2.5 left-3 font-bold text-white">{c.t}</span>
            </div>
            <div className="px-3.5 py-2.5 text-xs text-ink-faint">{c.d}</div>
          </Link>
        ))}
      </div>
      <div className="card mt-2 flex items-start gap-3 p-4 text-[13px] text-ink-soft">
        <Icon name="globe" size={20} className="mt-0.5 shrink-0 text-primary-600" />
        <span>
          অনলাইনে থাকলে তাওযীহুল কুরআনের অনুবাদ-তাফসীর স্বয়ংক্রিয় লোড হয়;
          অফলাইনে বিল্ট-ইন বাংলা অনুবাদ দেখায়।
        </span>
      </div>
    </div>
  );
}
