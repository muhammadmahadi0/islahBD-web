"use client";
import Link from "next/link";
import { Icon } from "../../components/icons";
import { HajjHero } from "../../components/hajj/HajjHero";
import { BooksSection } from "../../components/hajj/BooksSection";
import { useTx } from "../../store/language-store";

// Hajj & Umrah hub — mirrors HajjMainScreen:
// hero → translated books → interactive guide cards.
export default function HajjPage() {
  const tx = useTx();

  const guides = [
    {
      href: "/hajj-umrah/week",
      icon: "calendar",
      title: tx("এক নজরে হজ্বের এক সপ্তাহ"),
      subtitle: tx("৭ থেকে ১৩ জিলহজ — দিনভিত্তিক আমল"),
      badge: tx("৭ দিন"),
      tile: "bg-primary-600 text-white shadow-md shadow-primary-600/25",
      card: "border-primary-600/15 bg-gradient-to-br from-primary-50 to-emerald-50/50 dark:border-primary-400/15 dark:from-primary-500/10 dark:to-emerald-500/[0.04]",
      cta: "text-primary-700 dark:text-primary-300",
    },
    {
      href: "/hajj-umrah/checklist",
      icon: "check",
      title: tx("ধাপে ধাপে হজ্জ চেকলিস্ট"),
      subtitle: tx("প্রতিটি আমল টিক দিয়ে এগিয়ে যান"),
      badge: tx("৪ প্রকার"),
      tile: "bg-gold-500 text-white shadow-md shadow-gold-500/25",
      card: "border-gold-500/20 bg-gradient-to-br from-gold-light to-amber-50/60 dark:border-gold-400/20 dark:from-gold-500/10 dark:to-amber-500/[0.04]",
      cta: "text-gold-dark dark:text-gold-100",
    },
  ];

  return (
    <div className="animate-fade-up">
      <HajjHero />

      <BooksSection />

      <section className="mt-6">
        <div className="mb-2.5 flex items-center gap-2">
          <span aria-hidden className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-gold-500" />
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
              {tx("হজ ও ওমরা গাইড")}
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-faint">
              {tx("ধাপে ধাপে গাইড — প্রতিটি ধাপ সম্পন্ন করুন")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[0.99] ${guide.card}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/40 blur-xl dark:bg-white/5"
              />
              <div className="relative flex items-start justify-between gap-2">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${guide.tile}`}>
                  <Icon name={guide.icon} size={19} />
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9.5px] font-extrabold text-ink-faint ring-1 ring-inset ring-primary-900/[0.06] dark:bg-white/10 dark:text-white/60 dark:ring-white/10">
                  {guide.badge}
                </span>
              </div>

              <h3 className="relative mt-2.5 text-[13.5px] font-extrabold leading-snug tracking-tight text-ink">
                {guide.title}
              </h3>
              <p className="relative mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-ink-soft">
                {guide.subtitle}
              </p>

              <span className={`relative mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-extrabold ${guide.cta}`}>
                {tx("শুরু করুন")}
                <Icon
                  name="chevron"
                  size={12}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-5 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
        {tx("সূত্র")}: দারসে মানসূর (darsemansoor.com) · Mobile App: Islami Jendegi
      </p>
    </div>
  );
}
