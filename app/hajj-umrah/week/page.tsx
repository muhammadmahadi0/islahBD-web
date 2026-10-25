"use client";
import Link from "next/link";
import { Icon } from "../../../components/icons";
import { weekGuide } from "../../../lib/hajj";
import { useLang, useNum, useTx } from "../../../store/language-store";

// Week guide — mirrors HajjWeekGuideScreen: 7–13 Zilhajj, day cards grouped
// by obligation type, a serial-order note and the source credit.
export default function HajjWeekPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();

  const total = weekGuide.days.reduce(
    (sum, day) => sum + day.groups.reduce((n, group) => n + group.tasks.length, 0),
    0
  );

  return (
    <div className="animate-fade-up">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3D2C] via-primary-700 to-[#083B2A] p-4 text-white shadow-lift sm:p-5">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(230,202,101,0.35),transparent_65%)]"
        />
        <div className="relative">
          <Link
            href="/hajj-umrah"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="back" size={13} />
            {tx("হজ ও ওমরাহ")}
          </Link>

          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-gold-100 ring-1 ring-inset ring-white/15">
              <Icon name="calendar" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold leading-tight tracking-tight">
                {tx("এক নজরে হজ্বের এক সপ্তাহ")}
              </h1>
              <p className="mt-0.5 text-[12px] font-medium text-white/75">
                {tx("৭ থেকে ১৩ জিলহজ — দিনভিত্তিক আমল")}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white/85 ring-1 ring-inset ring-white/10">
              <Icon name="calendar" size={11} className="text-gold-100" />
              {tx("৭ দিন")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white/85 ring-1 ring-inset ring-white/10">
              <Icon name="check" size={11} className="text-gold-100" />
              {num(total)} {tx("টি আমল")}
            </span>
          </div>
        </div>
      </header>

      <div className="mt-2.5 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 p-3 text-[12px] font-medium leading-relaxed text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
        <Icon name="help" size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
        <p>{tx(weekGuide.note)}</p>
      </div>

      {lang !== "bn" && (
        <p className="mt-1.5 px-1 text-[10.5px] font-semibold text-ink-faint">
          {tx("আমলসমূহ বাংলায় দেওয়া হয়েছে")}
        </p>
      )}

      <div className="mt-2.5 space-y-2.5">
        {weekGuide.days.map((day) => {
          const count = day.groups.reduce((n, group) => n + group.tasks.length, 0);
          return (
            <article key={day.day} className="card overflow-hidden">
              <div className="relative flex items-center gap-2.5 overflow-hidden border-b border-primary-900/[0.06] bg-gradient-to-r from-primary-50/80 to-transparent p-3 dark:border-white/[0.08] dark:from-primary-500/[0.08]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary-500 to-gold-500"
                />
                <span className="flex h-9 min-w-[3.6rem] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 px-2 text-[12px] font-extrabold text-white shadow-md shadow-primary-600/20">
                  {day.day}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[13.5px] font-extrabold leading-snug text-ink">{tx(day.title)}</h2>
                  <p className="mt-0.5 text-[10px] font-semibold text-ink-faint">
                    {num(count)} {tx("টি আমল")}
                  </p>
                </div>
                <Icon name="calendar" size={15} className="shrink-0 text-primary-600/40 dark:text-primary-300/40" />
              </div>

              <div className="space-y-3 p-3.5">
                {day.groups.map((group) => (
                  <section key={`${day.day}-${group.type}`}>
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3
                        className="text-[11.5px] font-extrabold"
                        style={{ color: group.color }}
                      >
                        {tx(group.label)}
                      </h3>
                      <span className="rounded-full bg-sand px-1.5 py-0.5 text-[9px] font-black tabular-nums text-ink-faint dark:bg-white/10">
                        {num(group.tasks.length)}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-primary-900/[0.06] to-transparent dark:from-white/[0.08]" />
                    </div>

                    {group.tasks.length === 0 ? (
                      <p className="mt-1 ps-3.5 text-[13px] font-medium italic text-ink-faint">
                        {tx("নেই")}
                      </p>
                    ) : (
                      <ul className="mt-1.5 space-y-1.5">
                        {group.tasks.map((task) => (
                          <li key={`${day.day}-${group.type}-${task.code}-${task.text.slice(0, 12)}`} className="flex items-start gap-2">
                            <span
                              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10.5px] font-black"
                              style={{
                                color: group.color,
                                backgroundColor: `${group.color}14`,
                                borderColor: `${group.color}33`,
                              }}
                            >
                              {task.code}
                            </span>
                            <p className="min-w-0 flex-1 whitespace-pre-line text-[12.5px] font-medium leading-relaxed text-ink-soft">
                              {task.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 px-2 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
        {weekGuide.credit}
      </p>
    </div>
  );
}
