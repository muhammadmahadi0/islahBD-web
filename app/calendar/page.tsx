"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/icons";
import { adjustHijri, gregorianText, type HijriInfo } from "../../lib/prayer";
import {
  HIJRI_MONTHS,
  WEEKDAYS_SHORT_BN,
  WEEKDAYS_SHORT_EN,
  addDays,
  banglaFromDate,
  banglaText,
  dayNumber,
  gregorianRange,
  hijriFromDate,
  hijriMonthMeta,
  hijriMonthStart,
  hijriText,
  nextHijriMonth,
  prevHijriMonth,
  sameDay,
  toBn,
  type HijriDate,
} from "../../lib/hijri";
import { useLang, useNum, useTx } from "../../store/language-store";

type Tab = "calendar" | "history";

type EventItem = {
  id: string;
  title: string;
  titleAr: string;
  day: number;
  month: number; // 0..11 (Hijri)
  description: string;
  reference: string;
};

type DayCell = {
  date: Date;
  inMonth: boolean;
  gregorian: number;
  hijriDay: number;
  banglaDay: number;
};

type MonthRef = { year: number; month: number };

const WD_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday-first, like the reference design
const WEEKDAYS_SHORT_UR: Record<number, string> = {
  0: "اتوار", 1: "پیر", 2: "منگل", 3: "بدھ", 4: "جمعرات", 5: "جمعہ", 6: "ہفتہ",
};

export default function CalendarPage() {
  const tx = useTx();
  const lang = useLang();
  const num = useNum();
  const [today, setToday] = useState<Date | null>(null);
  const [hMonth, setHMonth] = useState<MonthRef | null>(null);
  const [tab, setTab] = useState<Tab>("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<number | "all">("all");
  // Hijri date as reported by Aladhan — the exact payload the homepage prayer
  // card renders. Local math stays as the instant/offline fallback.
  const [apiHijri, setApiHijri] = useState<HijriDate | null>(null);
  const [navigated, setNavigated] = useState(false);

  // Time-dependent UI is rendered after mount only — keeps SSR/hydration in
  // sync when the server timezone differs from the visitor's.
  useEffect(() => {
    const now = new Date();
    const h = hijriFromDate(now);
    setToday(now);
    setHMonth({ year: h.year, month: h.month });
  }, []);

  useEffect(() => {
    let dead = false;
    setEvents(null);
    const file = lang === "bn" ? "islamic_calendar.json" : `islamic_calendar.${lang}.json`;
    fetch(`/data/${file}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .catch(() => fetch("/data/islamic_calendar.json").then((r) => r.json()))
      .then((data: { categories?: { items?: Record<string, unknown>[] }[] }) => {
        if (dead) return;
        const list: EventItem[] = [];
        (data.categories || []).forEach((category, monthIndex) => {
          (category.items || []).forEach((raw) => {
            const dateEn = String(raw.date_en ?? "");
            const day = parseInt(dateEn.match(/^(\d+)/)?.[1] || "", 10);
            if (!day) return;
            list.push({
              id: String(raw.id ?? `${monthIndex}-${day}-${list.length}`),
              title: String(raw.title ?? ""),
              titleAr: String(raw.title_ar ?? ""),
              day,
              month: monthIndex,
              description: String(raw.description ?? ""),
              reference: String(raw.reference ?? ""),
            });
          });
        });
        setEvents(list);
      })
      .catch(() => {
        if (!dead) setEvents([]);
      });
    return () => {
      dead = true;
    };
  }, [lang]);

  // Same source as the homepage prayer card (/api/prayer → Aladhan), so the
  // calendar's "today" can never disagree with it.
  useEffect(() => {
    let dead = false;
    const now = new Date();
    const date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    fetch(`/api/prayer?lat=23.8103&lng=90.4125&date=${date}`)
      .then((r) => r.json())
      .then((data: { success?: boolean; hijri?: HijriInfo | null }) => {
        if (dead || !data?.success || !data.hijri) return;
        const a = adjustHijri(data.hijri); // BD moon sighting (−1 day), as on the card
        const month = HIJRI_MONTHS.findIndex((m) => m.en === a.month) + 1;
        const year = Number(a.year);
        if (!month || !year || !a.day) return;
        setApiHijri({ year, month, day: a.day });
      })
      .catch(() => {
        /* offline — the local engine covers it */
      });
    return () => {
      dead = true;
    };
  }, []);

  const todayH = useMemo(() => (today ? hijriFromDate(today) : null), [today]);
  const todayB = useMemo(() => (today ? banglaFromDate(today) : null), [today]);
  const shownH = apiHijri ?? todayH;

  // Days the local engine is off from Aladhan's sighting (normally 0). Keeps
  // the grid, the today card and the prayer card on the same date.
  const shift = useMemo(() => {
    if (!apiHijri || !today) return 0;
    const apiDate = addDays(hijriMonthStart(apiHijri.year, apiHijri.month), apiHijri.day - 1);
    return dayNumber(apiDate) - dayNumber(today);
  }, [apiHijri, today]);

  const hijriAt = useCallback((d: Date) => hijriFromDate(addDays(d, -shift)), [shift]);

  const meta = useMemo(() => {
    if (!hMonth) return null;
    const base = hijriMonthMeta(hMonth.year, hMonth.month);
    const start = addDays(base.start, shift);
    return { start, days: base.days, lead: (start.getDay() + 6) % 7 };
  }, [hMonth, shift]);

  // First API answer may nudge the anchor month (month boundary) — but never
  // yank the view back after the visitor has paged around.
  useEffect(() => {
    if (!apiHijri || navigated) return;
    setHMonth((cur) =>
      cur && cur.year === apiHijri.year && cur.month === apiHijri.month
        ? cur
        : { year: apiHijri.year, month: apiHijri.month }
    );
  }, [apiHijri, navigated]);

  const cells = useMemo<DayCell[]>(() => {
    if (!meta) return [];
    const total = Math.ceil((meta.lead + meta.days) / 7) * 7;
    const out: DayCell[] = [];
    for (let i = 0; i < total; i += 1) {
      const offset = i - meta.lead;
      const date = addDays(meta.start, offset);
      out.push({
        date,
        inMonth: offset >= 0 && offset < meta.days,
        gregorian: date.getDate(),
        hijriDay: hijriAt(date).day,
        banglaDay: banglaFromDate(date).day,
      });
    }
    return out;
  }, [meta, hijriAt]);

  const monthEvents = useMemo(
    () =>
      (events || [])
        .filter((e) => hMonth && e.month === hMonth.month - 1)
        .sort((a, b) => a.day - b.day),
    [events, hMonth]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<number, EventItem[]>();
    for (const ev of monthEvents) {
      const arr = map.get(ev.day) || [];
      arr.push(ev);
      map.set(ev.day, arr);
    }
    return map;
  }, [monthEvents]);

  const isCurrentMonth =
    !!shownH && !!hMonth && hMonth.year === shownH.year && hMonth.month === shownH.month;

  const goMonth = (dir: 1 | -1) => {
    if (!hMonth) return;
    setNavigated(true);
    setHMonth(dir === 1 ? nextHijriMonth(hMonth.year, hMonth.month) : prevHijriMonth(hMonth.year, hMonth.month));
    setSelectedDay(null);
  };

  const goToday = () => {
    if (!shownH) return;
    setNavigated(false);
    setHMonth({ year: shownH.year, month: shownH.month });
    setSelectedDay(shownH.day);
    setTab("calendar");
  };

  const selectedDate = useMemo(
    () => (meta && selectedDay && selectedDay <= meta.days ? addDays(meta.start, selectedDay - 1) : null),
    [meta, selectedDay]
  );

  const historyList = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (events || []).filter((e) => {
      if (cat !== "all" && e.month !== cat) return false;
      if (!needle) return true;
      return [e.title, e.titleAr, e.description, e.reference, HIJRI_MONTHS[e.month].bn]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [events, q, cat]);

  const jumpToEvent = (ev: EventItem) => {
    if (!shownH) return;
    const target = { year: shownH.year, month: ev.month + 1 };
    const targetMeta = hijriMonthMeta(target.year, target.month);
    setNavigated(true);
    setHMonth(target);
    setSelectedDay(ev.day <= targetMeta.days ? ev.day : null);
    setTab("calendar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDay = (day: number) => {
    setSelectedDay(day);
    document.getElementById("hijri-calendar")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hero = <CalendarHero tab={tab} onTab={setTab} onToday={goToday} />;

  if (!today || !hMonth || !todayH || !todayB || !shownH || !meta) {
    return (
      <div className="animate-fade-up">
        {hero}
        <div className="card mt-3 h-[168px] animate-pulse" />
        <div className="card mt-3 h-[430px] animate-pulse" />
      </div>
    );
  }

  const monthMeta = HIJRI_MONTHS[hMonth.month - 1];
  const todayMeta = HIJRI_MONTHS[shownH.month - 1];
  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) || [] : [];
  const rangeLabel = (start: Date, days: number) => {
    if (lang === "bn") return gregorianRange(start, days);
    const end = addDays(start, days - 1);
    const fmt = (d: Date) => d.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
  };
  const hijriDayText = (d: HijriDate) => {
    if (lang === "bn") return hijriText(d);
    const m = HIJRI_MONTHS[d.month - 1];
    return `${d.day} ${lang === "ur" ? m.ar : m.en} ${d.year} ${lang === "ur" ? "ہجری" : "AH"}`;
  };

  return (
    <div className="animate-fade-up">
      {hero}

      {tab === "calendar" ? (
        <>
          {/* -------------------------------------------- today card */}
          <section className="card relative mt-3 overflow-hidden p-5 pt-4">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-sand px-3 text-[11.5px] font-bold text-ink-soft dark:bg-white/10">
                <Icon name="calendar" size={13} />
                {tx("আজকের তারিখ")}
              </span>
              <Icon name="mosque" size={34} className="-mt-1 text-primary-600/15 dark:text-white/10" />
            </div>

            <div className="mt-3 text-[19px] font-bold leading-snug tracking-tight">
              {gregorianText(lang, today)}
            </div>

            <div className="mt-4 grid grid-cols-[1.45fr_1fr] gap-3 border-t border-primary-900/10 pt-3 dark:border-white/10">
              <div>
                <div className="text-[11px] font-semibold text-ink-faint">{tx("আরবি/হিজরি তারিখ")}</div>
                <div className="mt-1 text-[14px] font-bold leading-snug text-gold-600 dark:text-amber-400">
                  {num(shownH.day)} {lang === "en" ? todayMeta.en : lang === "ur" ? todayMeta.ar : todayMeta.bn}{" "}
                  {lang !== "ur" && <span className="font-arabic text-[13.5px] font-medium opacity-80">({todayMeta.ar})</span>}{" "}
                  {num(shownH.year)} {tx("হিজরী")}
                </div>
              </div>
              <div className="border-l border-primary-900/10 pl-3 dark:border-white/10">
                <div className="text-[11px] font-semibold text-ink-faint">{tx("বাংলা তারিখ")}</div>
                <div className="mt-1 text-[14px] font-bold leading-snug text-sky-600 dark:text-sky-400">
                  {banglaText(todayB, lang)}
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------- month grid */}
          <section id="hijri-calendar" className="card mt-3 p-4">
            <div className="relative flex items-center justify-center px-10">
              <button
                onClick={() => goMonth(-1)}
                aria-label={tx("আগের মাস")}
                className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition hover:bg-primary-100 active:scale-95 dark:bg-white/10 dark:text-primary-300"
              >
                <Icon name="back" size={15} />
              </button>

              <div className="min-w-0 text-center">
                <h2 className="text-[15px] font-bold leading-snug text-primary-700 dark:text-primary-300">
                  {lang === "en" ? monthMeta.en : lang === "ur" ? monthMeta.ar : monthMeta.bn}{" "}
                  {lang !== "ur" && <span className="font-arabic text-[14.5px] font-medium opacity-80">({monthMeta.ar})</span>}{" "}
                  <span className="text-ink-soft dark:text-ink-faint">{num(hMonth.year)} {tx("হিজরী")}</span>
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-faint">
                  {rangeLabel(meta.start, meta.days)}
                </p>
              </div>

              <button
                onClick={() => goMonth(1)}
                aria-label={tx("পরের মাস")}
                className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition hover:bg-primary-100 active:scale-95 dark:bg-white/10 dark:text-primary-300"
              >
                <Icon name="chevron" size={15} />
              </button>
            </div>

            {!isCurrentMonth && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={goToday}
                  className="rounded-full bg-primary-50 px-3 py-1 text-[10.5px] font-bold text-primary-700 transition hover:bg-primary-100 dark:bg-white/10 dark:text-primary-300"
                >
                  {tx("চলতি মাসে ফিরুন")}
                </button>
              </div>
            )}

            <div className="mt-3 grid grid-cols-7 gap-1">
              {WD_ORDER.map((d) => (
                <div key={d} className="pb-1 text-center">
                  <b className="block text-[10.5px] font-bold leading-tight text-primary-700 dark:text-primary-300">
                    {lang === "bn" ? WEEKDAYS_SHORT_BN[d] : lang === "ur" ? WEEKDAYS_SHORT_UR[d] : WEEKDAYS_SHORT_EN[d]}
                  </b>
                  {lang === "bn" && (
                    <span className="block text-[9px] leading-tight text-ink-faint">
                      {WEEKDAYS_SHORT_EN[d]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                const isToday = sameDay(cell.date, today);
                const isSelected = cell.inMonth && selectedDay === cell.hijriDay;
                const hasEvent = cell.inMonth && eventsByDay.has(cell.hijriDay);

                return (
                  <button
                    key={dayNumber(cell.date) + "-" + i}
                    disabled={!cell.inMonth}
                    onClick={() => setSelectedDay(isSelected ? null : cell.hijriDay)}
                    aria-label={gregorianText(lang, cell.date)}
                    className={`relative flex h-[58px] flex-col items-center justify-center rounded-xl border transition-colors ${
                      !cell.inMonth
                        ? "border-transparent opacity-30"
                        : isToday
                          ? "border-primary-500 bg-primary-50 dark:border-primary-400/60 dark:bg-primary-500/15"
                          : "border-primary-900/10 bg-sand/50 hover:border-primary-500/40 dark:border-white/10 dark:bg-white/5"
                    } ${isSelected ? "ring-2 ring-gold-500/70" : ""}`}
                  >
                    <span className="text-[16px] font-semibold leading-none text-sky-600 dark:text-sky-400">
                      {cell.gregorian}
                    </span>
                    <span className="mt-1 flex items-center gap-0.5 text-[10px] font-bold leading-none">
                      <span className="text-gold-600 dark:text-amber-400">{num(cell.banglaDay)}</span>
                      <span className="text-ink-faint">–</span>
                      <span className="text-primary-700 dark:text-primary-300">{num(cell.hijriDay)}</span>
                    </span>
                    {hasEvent && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10.5px] font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-sky-500" />
                {tx("ইংরেজি তারিখ")}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-gold-500" />
                {tx("বাংলা তারিখ")}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-primary-500" />
                {tx("হিজরি তারিখ")}
              </span>
            </div>

            {selectedDate && selectedDay && (
              <div className="mt-3 animate-fade-up rounded-2xl border border-gold-500/25 bg-gold-light/70 p-3 dark:border-gold-500/20 dark:bg-gold-500/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold">{gregorianText(lang, selectedDate)}</div>
                    <div className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">
                      {hijriDayText(hijriAt(selectedDate))} · {banglaText(banglaFromDate(selectedDate), lang)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    aria-label={tx("বন্ধ করুন")}
                    className="shrink-0 rounded-full bg-white/70 p-1.5 text-ink-soft transition hover:bg-white active:scale-95 dark:bg-white/10"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>

                {selectedEvents.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {selectedEvents.map((ev) => (
                      <div key={ev.id} className="rounded-xl bg-white/80 p-2.5 dark:bg-white/5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[12.5px] font-bold">{ev.title}</span>
                          {ev.titleAr && (
                            <span className="font-arabic text-[12px] text-ink-faint">{ev.titleAr}</span>
                          )}
                        </div>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{ev.description}</p>
                        {ev.reference && (
                          <div className="mt-1 text-[10px] font-semibold text-ink-faint">{tx("সূত্র:")} {ev.reference}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[11.5px] text-ink-faint">{tx("এ দিনে সংকলিত কোনো ঘটনা নেই।")}</p>
                )}
              </div>
            )}
          </section>

          {/* ------------------------------------------- month events */}
          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold text-ink">{lang === "en" ? monthMeta.en : lang === "ur" ? monthMeta.ar : monthMeta.bn} — {tx("মাসের ঘটনাবলী")}</h2>
              <span className="text-[11px] font-semibold text-ink-faint">
                {events === null ? tx("লোড হচ্ছে…") : `${num(monthEvents.length)}${tx("টি")}`}
              </span>
            </div>

            {events === null ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="card animate-pulse p-4">
                    <div className="h-4 w-2/3 rounded-full bg-sand-dark" />
                    <div className="mt-2 h-3 w-full rounded-full bg-sand-dark" />
                  </div>
                ))}
              </div>
            ) : monthEvents.length === 0 ? (
              <div className="card p-5 text-center text-[12px] text-ink-faint">
                {tx("এই মাসের জন্য কোনো ঘটনা সংকলিত হয়নি।")}
              </div>
            ) : (
              <div className="space-y-2">
                {monthEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    onOpen={ev.day <= meta.days ? () => openDay(ev.day) : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* ------------------------------------------------ history tab */
        <div className="mt-3">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
              <Icon name="search" size={18} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tx("ঘটনা, মাস বা সাল খুঁজুন…")}
              className="input !pl-11 !shadow-card"
            />
          </form>

          <div className="rail -mx-3 flex gap-2 overflow-x-auto px-3 py-2.5">
            <button
              onClick={() => setCat("all")}
              className={`chip shrink-0 !px-4 !py-2 ${cat === "all" ? "chip-active" : ""}`}
            >
              {tx("সব মাস")}
            </button>
            {HIJRI_MONTHS.map((m, i) => (
              <button
                key={m.en}
                onClick={() => setCat(i)}
                className={`chip shrink-0 !px-4 !py-2 ${cat === i ? "chip-active" : ""}`}
              >
                {lang === "en" ? m.en : lang === "ur" ? m.ar : m.bn}
              </button>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-bold text-ink-faint">
            <span>{events === null ? tx("লোড হচ্ছে…") : `${num(historyList.length)}${tx("টি ঘটনা")}`}</span>
            <span>{tx("তারিখে চাপ দিলে ক্যালেন্ডারে দেখা যাবে")}</span>
          </div>

          {events === null ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card animate-pulse p-4">
                  <div className="h-4 w-2/3 rounded-full bg-sand-dark" />
                  <div className="mt-2 h-3 w-full rounded-full bg-sand-dark" />
                  <div className="mt-1.5 h-3 w-1/2 rounded-full bg-sand-dark" />
                </div>
              ))}
            </div>
          ) : historyList.length === 0 ? (
            <div className="card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-white/10">
                <Icon name="search" size={22} />
              </span>
              <div className="mt-2 text-sm font-bold">{tx("কিছু পাওয়া যায়নি")}</div>
              <div className="mt-1 text-[12px] text-ink-faint">{tx("অন্য শব্দ বা মাস বেছে দেখুন")}</div>
            </div>
          ) : (
            <div className="space-y-2">
              {historyList.map((ev) => (
                <EventCard key={ev.id} ev={ev} onOpen={() => jumpToEvent(ev)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalendarHero({
  tab,
  onTab,
  onToday,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onToday: () => void;
}) {
  const tx = useTx();
  return (
    <div className="page-hero animate-fade-up px-5 pb-0 pt-5 text-white">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label={tx("ফিরুন")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="back" size={16} />
          </Link>
          <button
            onClick={onToday}
            className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            {tx("আজ")}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-gold-100">
            <Icon name="calendar" size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[21px] font-bold leading-tight tracking-tight">{tx("ইসলামিক ক্যালেন্ডার")}</h1>
            <p className="mt-0.5 text-[12px] text-white/75">{tx("হিজরি · বাংলা · ইংরেজি — একসাথে")}</p>
          </div>
        </div>

        <div className="mt-4 flex">
          <button
            onClick={() => onTab("calendar")}
            aria-pressed={tab === "calendar"}
            className={`relative flex flex-1 flex-col items-center gap-1.5 pb-3 pt-1 text-[12.5px] font-bold transition-colors ${
              tab === "calendar" ? "text-white" : "text-white/65 hover:text-white/85"
            }`}
          >
            <Icon name="calendar" size={19} />
            {tx("ক্যালেন্ডার")}
            {tab === "calendar" && (
              <span className="absolute bottom-0 h-[3px] w-12 rounded-t-full bg-white" />
            )}
          </button>
          <button
            onClick={() => onTab("history")}
            aria-pressed={tab === "history"}
            className={`relative flex flex-1 flex-col items-center gap-1.5 pb-3 pt-1 text-[12.5px] font-bold transition-colors ${
              tab === "history" ? "text-white" : "text-white/65 hover:text-white/85"
            }`}
          >
            <Icon name="book" size={19} />
            {tx("ঐতিহাসিক ঘটনা ও তথ্য")}
            {tab === "history" && (
              <span className="absolute bottom-0 h-[3px] w-12 rounded-t-full bg-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev, onOpen }: { ev: EventItem; onOpen?: () => void }) {
  const tx = useTx();
  const lang = useLang();
  const num = useNum();
  const month = HIJRI_MONTHS[ev.month];
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-light text-gold-600 dark:bg-gold-500/15 dark:text-amber-400">
        <span className="text-[15px] font-bold leading-none">{num(ev.day)}</span>
        <span className="mt-0.5 text-[8.5px] font-bold leading-none opacity-80">{lang === "en" ? month.en : lang === "ur" ? month.ar : month.bn}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[13.5px] font-bold leading-snug">{ev.title}</span>
          {ev.titleAr && (
            <span className="font-arabic text-[12.5px] leading-snug text-ink-faint">{ev.titleAr}</span>
          )}
        </span>
        <span className="mt-1 block text-[12px] leading-relaxed text-ink-soft">{ev.description}</span>
        {ev.reference && (
          <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-ink-faint">
            <Icon name="doc" size={11} />
            {ev.reference}
          </span>
        )}
      </span>
    </>
  );

  if (!onOpen) {
    return <div className="card flex items-start gap-3 p-4">{inner}</div>;
  }

  return (
    <button onClick={onOpen} className="card card-hover flex w-full items-start gap-3 p-4 text-left">
      {inner}
    </button>
  );
}
