"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Icon } from "../../../components/icons";
import {
  PILGRIMAGE_STORAGE_KEYS,
  doneSteps,
  phaseDoneCount,
  pilgrimage,
  rulingColor,
  stepKey,
  totalSteps,
  type PilgrimStep,
} from "../../../lib/hajj";
import { useLang, useNum, useTx } from "../../../store/language-store";

// Interactive checklist — mirrors HajjWeekChecklistScreen:
// type picker, type summary, comparison table, phase timeline, step detail
// sheet and localStorage progress using the app's storage keys.

interface SheetTarget {
  phaseIndex: number;
  stepIndex: number;
}

function ProgressRing({
  pct,
  label,
  format,
}: {
  pct: number;
  label: string;
  format: (n: number | string) => string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-[74px] w-[74px] shrink-0">
      <svg viewBox="0 0 74 74" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="37" cy="37" r={radius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="7" />
        <circle
          cx="37"
          cy="37"
          r={radius}
          fill="none"
          stroke="#34D399"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (Math.max(0, Math.min(100, pct)) / 100) * circumference}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-[17px] font-black leading-none tabular-nums">{format(pct)}%</span>
        <span className="mt-0.5 text-[8px] font-bold text-white/55">{label}</span>
      </div>
    </div>
  );
}

function rulingStyle(ruling: string) {
  const color = rulingColor(ruling);
  return {
    color,
    backgroundColor: `${color}14`,
    borderColor: `${color}33`,
  };
}

function comparisonTone(value: string) {
  if (value.includes("নেই") || value.includes("প্রযোজ্য নয়")) {
    return "text-rose-600 dark:text-rose-300";
  }
  if (value.includes("হ্যাঁ")) return "text-primary-700 dark:text-primary-300";
  return "text-ink-soft";
}


export default function HajjChecklistPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();

  const [typeIndex, setTypeIndex] = useState(0);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = pilgrimage.types[typeIndex] || pilgrimage.types[0];
  const total = useMemo(() => totalSteps(type), [type]);
  const completed = useMemo(() => doneSteps(type, done), [type, done]);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => setMounted(true), []);

  // Restore the app's SharedPreferences equivalents from localStorage.
  useEffect(() => {
    try {
      const rawIndex = localStorage.getItem(PILGRIMAGE_STORAGE_KEYS.typeIndex);
      const index = Number(rawIndex);
      if (Number.isInteger(index) && index >= 0 && index < pilgrimage.types.length) {
        setTypeIndex(index);
      }
      const rawDone = localStorage.getItem(PILGRIMAGE_STORAGE_KEYS.doneItems);
      if (rawDone) {
        let list: unknown = null;
        try {
          list = JSON.parse(rawDone);
        } catch {
          list = rawDone.split(",");
        }
        if (Array.isArray(list)) {
          setDone(new Set(list.filter((item): item is string => typeof item === "string")));
        }
      }
    } catch {
      // Private mode / storage disabled — the checklist still works in-memory.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PILGRIMAGE_STORAGE_KEYS.typeIndex, String(typeIndex));
    } catch {}
  }, [typeIndex, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PILGRIMAGE_STORAGE_KEYS.doneItems, JSON.stringify([...done]));
    } catch {}
  }, [done, hydrated]);

  const overlayOpen = Boolean(sheet) || comparisonOpen;

  // Lock the page behind a sheet and let Escape dismiss it.
  useEffect(() => {
    if (!overlayOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheet(null);
        setComparisonOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen]);

  useEffect(() => {
    if (!sheet) setCopied(false);
  }, [sheet]);

  const toggle = useCallback(
    (phaseIndex: number, stepIndex: number) => {
      const key = stepKey(type.id, phaseIndex, stepIndex);
      setDone((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [type.id]
  );

  const activePhase = sheet ? type.phases[sheet.phaseIndex] : null;
  const activeStep: PilgrimStep | null = activePhase?.steps[sheet?.stepIndex ?? -1] || null;
  const activeDone = sheet ? done.has(stepKey(type.id, sheet.phaseIndex, sheet.stepIndex)) : false;

  const copyDua = async (step: PilgrimStep) => {
    const text = [step.arabic, step.transliteration, step.translation].filter(Boolean).join("\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="animate-fade-up">
      {/* ---------- hero ---------- */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2027] via-[#162F38] to-[#203A43] p-4 text-white shadow-lift sm:p-5">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.28),transparent_65%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(230,202,101,0.18),transparent_60%)]"
        />
        <div className="relative">
          <Link
            href="/hajj-umrah"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="back" size={13} />
            {tx("হজ ও ওমরাহ")}
          </Link>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold leading-tight tracking-tight">
                {tx("ধাপে ধাপে হজ্জ চেকলিস্ট")}
              </h1>
              <p className="mt-0.5 text-[11.5px] font-medium leading-relaxed text-white/75">
                {tx("সহজে আমলগুলো মনে রাখতে টিক দিয়ে এগিয়ে যান")}
              </p>
            </div>
            <ProgressRing pct={pct} label={tx("সম্পন্ন")} format={num} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-white/70">
              <Icon name="calendar" size={12} className="text-emerald-300" />
              {tx("আপনার হজ্জের সফরসূচী")}
            </span>
            <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold tabular-nums text-white/90 ring-1 ring-inset ring-white/10">
              <Icon name="check" size={11} className="text-emerald-300" />
              {num(completed)} {tx("টি আমল সম্পন্ন")} / {tx("মোট")} {num(total)} {tx("টি")}
            </span>
          </div>
        </div>
      </header>

      {/* ---------- type picker ---------- */}
      <section className="mt-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-[12px] font-extrabold text-ink">
            {tx("হজ্জের প্রকার বেছে নিন")}
          </h2>
          <button
            type="button"
            onClick={() => setComparisonOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-extrabold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/15"
          >
            <Icon name="grid" size={11} />
            {tx("তুলনামূলক ছক")}
          </button>
        </div>

        <div className="rail mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {pilgrimage.types.map((item, index) => {
            const active = index === typeIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTypeIndex(index)}
                className={`shrink-0 rounded-2xl border px-3 py-2 text-start transition ${
                  active
                    ? "border-primary-600 bg-primary-600 text-white shadow-card"
                    : "border-primary-900/10 bg-white text-ink hover:border-primary-500/30 dark:border-white/10 dark:bg-white/[0.04]"
                }`}
              >
                <span className="block text-[12px] font-extrabold leading-tight">{tx(item.name)}</span>
                <span
                  className={`mt-0.5 block text-[9.5px] font-semibold ${
                    active ? "text-white/70" : "text-ink-faint"
                  }`}
                >
                  {tx(item.tagline)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- selected type summary ---------- */}
      <section className="card mt-2.5 overflow-hidden p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-arabic text-[15px] leading-tight text-primary-700 dark:text-primary-300" dir="rtl" lang="ar">
              {type.arabic}
            </p>
            <h3 className="mt-0.5 text-[17px] font-extrabold tracking-tight text-ink">{tx(type.name)}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-gold-light px-2 py-0.5 text-[9.5px] font-extrabold text-gold-dark ring-1 ring-inset ring-gold-500/20 dark:bg-gold-500/10 dark:text-gold-100">
            {tx(type.tagline)}
          </span>
        </div>

        <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-soft">{tx(type.summary)}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">{tx(type.description)}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-bold text-ink-soft dark:bg-white/10">
            <Icon name={type.hasUmrah ? "check" : "x"} size={10} className={type.hasUmrah ? "text-primary-600 dark:text-primary-300" : "text-rose-500"} />
            {type.hasUmrah ? tx("উমরাহ সহ") : tx("উমরাহ ছাড়া")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-bold text-ink-soft dark:bg-white/10">
            <Icon name={type.opensIhram ? "check" : "shield"} size={10} className={type.opensIhram ? "text-primary-600 dark:text-primary-300" : "text-amber-500"} />
            {type.opensIhram ? tx("ইহরাম খোলা যায়") : tx("টানা ইহরাম")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-bold text-ink-soft dark:bg-white/10">
            <Icon name="gem" size={10} className="text-gold-600" />
            {tx("কুরবানী")}: {tx(type.qurbani)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-primary-900/[0.06] pt-2.5 dark:border-white/[0.08]">
          <span className="text-[10px] font-bold tabular-nums text-ink-faint">
            {num(type.phases.length)} {tx("টি ধাপ")} · {num(total)} {tx("টি আমল")}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
              pct === 100 && total > 0
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
            }`}
          >
            <Icon name="check" size={11} />
            {pct === 100 && total > 0 ? tx("সকল ধাপ সম্পন্ন") : tx("এটি আপনার নির্বাচিত প্রকার")}
          </span>
        </div>
      </section>

      {lang !== "bn" && (
        <p className="mt-1.5 px-1 text-[10.5px] font-semibold text-ink-faint">
          {tx("ধাপের বিবরণ বাংলায় দেওয়া হয়েছে")}
        </p>
      )}

      {/* ---------- completion banner ---------- */}
      {pct === 100 && total > 0 && (
        <div className="mt-2.5 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-primary-700 p-3.5 text-white shadow-lift">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl leading-none" aria-hidden>🎉</span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-extrabold">{tx("আলহামদুলিল্লাহ! 🎉")}</h3>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-white/85">
                {tx("{type} — সকল ধাপ সফলভাবে সম্পন্ন হয়েছে। আল্লাহ সুবহানাহু ওয়া তা’আলা আপনার হজ্জ ও আমলসমূহ কবুল করুন। আমীন।").replace("{type}", tx(type.name))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- timeline ---------- */}
      <div className="mt-3 space-y-2.5">
        {type.phases.map((phase, phaseIndex) => {
          const phaseDone = phaseDoneCount(type, phase, phaseIndex, done);
          const phaseComplete = phase.steps.length > 0 && phaseDone === phase.steps.length;
          return (
            <article key={`${type.id}-${phaseIndex}-${phase.title}`} className="flex gap-2.5">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black tabular-nums ring-2 ring-white transition-colors dark:ring-[#0b1120] ${
                    phaseComplete
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                      : "border border-primary-900/10 bg-white text-primary-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-primary-300"
                  }`}
                >
                  {phaseComplete ? <Icon name="check" size={13} /> : num(phaseIndex + 1)}
                </span>
                {phaseIndex < type.phases.length - 1 && (
                  <span aria-hidden className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-primary-500/35 to-primary-900/10 dark:from-primary-400/30 dark:to-white/10" />
                )}
              </div>

              <div className="card min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-primary-900/[0.06] p-3 dark:border-white/[0.08]">
                  <h3 className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-ink">{tx(phase.title)}</h3>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-faint">
                    ({num(phase.steps.length)})
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black tabular-nums ${
                      phaseComplete
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                        : "bg-sand text-ink-faint dark:bg-white/10"
                    }`}
                  >
                    {num(phaseDone)}/{num(phase.steps.length)}
                  </span>
                </div>

                <ul className="divide-y divide-primary-900/[0.05] dark:divide-white/[0.06]">
                  {phase.steps.map((step, stepIndex) => {
                    const isDone = done.has(stepKey(type.id, phaseIndex, stepIndex));
                    return (
                      <li key={`${phaseIndex}-${stepIndex}-${step.title}`}>
                        <div className="flex items-start gap-2.5 p-2.5">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={`${step.title} — ${tx("আমল সম্পন্ন")}`}
                            onClick={() => toggle(phaseIndex, stepIndex)}
                            className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95 ${
                              isDone
                                ? "border-primary-600 bg-primary-600 text-white shadow-sm shadow-primary-600/25"
                                : "border-primary-900/20 bg-white text-transparent hover:border-primary-500 dark:border-white/25 dark:bg-white/[0.04]"
                            }`}
                          >
                            <Icon name="check" size={11} strokeWidth={3} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSheet({ phaseIndex, stepIndex })}
                            className="group min-w-0 flex-1 text-start"
                          >
                            <span
                              className={`block text-[12.5px] font-semibold leading-snug transition ${
                                isDone ? "text-ink-faint line-through decoration-1" : "text-ink"
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="mt-1 flex items-center gap-1.5">
                              <span
                                className="inline-flex shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black"
                                style={rulingStyle(step.ruling)}
                              >
                                {tx(step.ruling)}
                              </span>
                              <span className="hidden truncate text-[9.5px] font-semibold text-ink-faint sm:inline">
                                {step.hint}
                              </span>
                              <span className="ms-auto inline-flex shrink-0 items-center gap-0.5 text-[9.5px] font-bold text-primary-600 group-hover:text-primary-700 dark:text-primary-300">
                                <span className="hidden sm:inline">{tx("বিস্তারিত ও দোয়া")}</span>
                                <Icon name="chevron" size={11} />
                              </span>
                            </span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 px-2 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
        {tx("সূত্র")}: দারসে মানসূর (darsemansoor.com) · Mobile App: Islami Jendegi
      </p>

      {/* ---------- step detail sheet ---------- */}
      {activeStep &&
        sheet &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setSheet(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activeStep.title}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-primary-900/10 bg-white shadow-lift dark:border-white/10 dark:bg-[#16202f] sm:rounded-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 border-b border-primary-900/[0.06] bg-white/95 px-4 pb-3 pt-2.5 backdrop-blur dark:border-white/[0.08] dark:bg-[#16202f]/95">
                <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/20 sm:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="inline-flex rounded-md border px-1.5 py-0.5 text-[9.5px] font-black"
                      style={rulingStyle(activeStep.ruling)}
                    >
                      {activeStep.ruling}
                    </span>
                    <h2 className="mt-1.5 text-[16px] font-extrabold leading-snug tracking-tight text-ink">
                      {activeStep.title}
                    </h2>
                    {activeStep.hint && (
                      <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-ink-faint">
                        {activeStep.hint}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSheet(null)}
                    aria-label={tx("বন্ধ করুন")}
                    className="rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 pt-3">
                {activeStep.detail && (
                  <section>
                    <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                      <Icon name="sparkle" size={13} className="text-gold-600" />
                      {tx("আমল ও সঠিক নিয়ম")}
                    </h3>
                    <div className="mt-1.5 rounded-2xl border border-primary-600/15 bg-primary-50/70 p-3 dark:border-primary-400/15 dark:bg-primary-500/[0.06]">
                      <p className="whitespace-pre-line text-[12.5px] font-medium leading-relaxed text-ink-soft">
                        {activeStep.detail}
                      </p>
                    </div>
                  </section>
                )}

                {activeStep.arabic && (
                  <section className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink">
                        <Icon name="hands" size={13} className="text-primary-600 dark:text-primary-300" />
                        {tx("মাসনূন দো’আ")}
                      </h3>
                      <button
                        type="button"
                        onClick={() => copyDua(activeStep)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-[9.5px] font-extrabold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300"
                      >
                        <Icon name={copied ? "check" : "copy"} size={11} />
                        {copied ? tx("কপি হয়েছে") : tx("দোআ কপি করুন")}
                      </button>
                    </div>
                    <div className="mt-1.5 rounded-2xl border border-gold-500/15 bg-gold-light/50 p-3 dark:border-gold-400/15 dark:bg-gold-500/[0.06]">
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-arabic text-right text-[22px] leading-[1.95] text-ink"
                      >
                        {activeStep.arabic}
                      </p>
                      {activeStep.transliteration && (
                        <p className="mt-2 border-t border-gold-500/15 pt-2 text-[11.5px] font-medium italic leading-relaxed text-ink-soft dark:border-gold-400/15">
                          <span className="font-bold not-italic text-ink-faint">{tx("উচ্চারণ")}: </span>
                          {activeStep.transliteration}
                        </p>
                      )}
                      {activeStep.translation && (
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                          <span className="font-bold text-ink-faint">{tx("অর্থ")}: </span>
                          {activeStep.translation}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold text-ink-soft dark:bg-white/10">
                    <Icon name="pin" size={11} className="text-primary-600 dark:text-primary-300" />
                    {tx("স্থান")}: {tx(activeStep.location)}
                  </span>
                  {activeStep.arabic && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold text-ink-soft dark:bg-white/10">
                      <Icon name="book" size={11} className="text-gold-600" />
                      {tx("দোআসহ ধাপ")}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggle(sheet.phaseIndex, sheet.stepIndex)}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-extrabold transition active:scale-[0.98] ${
                    activeDone
                      ? "border border-primary-600/30 bg-primary-50 text-primary-700 dark:border-primary-400/30 dark:bg-primary-500/10 dark:text-primary-300"
                      : "bg-primary-600 text-white shadow-card hover:bg-primary-700"
                  }`}
                >
                  <Icon name="check" size={15} strokeWidth={2.6} />
                  {activeDone
                    ? tx("আমলটি সম্পন্ন হয়েছে (টিক দেওয়া আছে)")
                    : tx("আমল সম্পন্ন হিসেবে মার্ক করুন")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ---------- comparison sheet ---------- */}
      {comparisonOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setComparisonOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={tx("তুলনামূলক ছক")}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-primary-900/10 bg-white p-4 shadow-lift dark:border-white/10 dark:bg-[#16202f] sm:rounded-3xl sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/20 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight text-ink">
                    <Icon name="grid" size={15} className="text-primary-600 dark:text-primary-300" />
                    {tx("তুলনামূলক ছক")}
                  </h2>
                  <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-ink-faint">
                    {tx("এক নজরে ৪টি হজ্জের মূল বিষয় ও পার্থক্যের তুলনামূলক ছক")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setComparisonOpen(false)}
                  aria-label={tx("বন্ধ করুন")}
                  className="rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Mobile: one compact card per type, no horizontal scrolling. */}
              <div className="mt-3 space-y-2 sm:hidden">
                {pilgrimage.types.map((item) => {
                  const key = item.id as "tamattu" | "qiran" | "ifrad" | "umrah";
                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-primary-900/10 dark:border-white/10"
                    >
                      <div className="bg-primary-50/80 px-3 py-2 text-[11px] font-extrabold text-primary-800 dark:bg-primary-500/10 dark:text-primary-200">
                        {tx(item.name)}
                      </div>
                      <dl className="divide-y divide-primary-900/[0.06] dark:divide-white/[0.06]">
                        {pilgrimage.comparisonRows.map((row) => (
                          <div key={row.label} className="flex items-start justify-between gap-3 px-3 py-2">
                            <dt className="w-[6.5rem] shrink-0 text-[10px] font-bold text-ink">
                              {tx(row.label)}
                            </dt>
                            <dd className={`flex-1 text-end text-[10.5px] font-semibold leading-relaxed ${comparisonTone(row[key])}`}>
                              {tx(row[key])}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: the app's four-column comparison table. */}
              <div className="mt-3 hidden overflow-x-auto rounded-2xl border border-primary-900/10 dark:border-white/10 sm:block">
                <table className="w-full border-collapse text-start text-[11px]">
                  <thead>
                    <tr className="bg-primary-50/80 dark:bg-primary-500/10">
                      <th className="sticky start-0 z-10 min-w-[7.5rem] border-b border-primary-900/10 bg-primary-50 px-2.5 py-2 text-start text-[10px] font-extrabold text-primary-800 dark:border-white/10 dark:bg-[#1b2940] dark:text-primary-200">
                        {tx("বিষয় / উপাদান")}
                      </th>
                      {pilgrimage.types.map((item) => (
                        <th
                          key={item.id}
                          className="border-b border-primary-900/10 px-2.5 py-2 text-center text-[10px] font-extrabold text-ink dark:border-white/10"
                        >
                          {tx(item.name)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pilgrimage.comparisonRows.map((row, rowIndex) => (
                      <tr
                        key={row.label}
                        className={rowIndex % 2 === 1 ? "bg-sand/40 dark:bg-white/[0.02]" : ""}
                      >
                        <th
                          scope="row"
                          className="sticky start-0 z-10 border-b border-primary-900/[0.06] bg-white px-2.5 py-2 text-start text-[10.5px] font-bold text-ink dark:border-white/[0.06] dark:bg-[#16202f]"
                        >
                          {tx(row.label)}
                        </th>
                        {(["tamattu", "qiran", "ifrad", "umrah"] as const).map((key) => (
                          <td
                            key={key}
                            className={`border-b border-primary-900/[0.06] px-2.5 py-2 text-center text-[10.5px] font-semibold leading-relaxed dark:border-white/[0.06] ${comparisonTone(row[key])}`}
                          >
                            {tx(row[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-gold-500/25 bg-gold-light/60 p-3 dark:border-gold-400/20 dark:bg-gold-500/[0.06]">
                <span className="text-[13px]" aria-hidden>💡</span>
                <p className="text-[11.5px] font-medium leading-relaxed text-ink-soft">
                  {tx(pilgrimage.tip).replace(/^💡\s*/, "")}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
