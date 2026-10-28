"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHead, ShareCopy, EmptyState } from "../../components/ui";
import { Collapse } from "../../components/Collapse";
import { Icon } from "../../components/icons";
import { useLang, useNum, useTx } from "../../store/language-store";

// Munajat-e-Maqbul — the full 175-munajat collection served from
// /data/munajat.json. Mirrors the production book: an introduction, four
// topical chapters and the seven weekly manzils. The current weekday's manzil
// is selected by default.
type AmalText = { arabic?: string; bangla_translation?: string };
type MunajatItem = {
  id: string;
  serial: string;
  title?: string;
  amal_text?: AmalText[] | null;
  fazilat?: string | null;
  reference?: string | null;
};
type MunajatCategory = {
  id: string;
  title: string;
  subtitle?: string;
  items: MunajatItem[];
};
type MunajatBook = {
  title: string;
  source_book?: string;
  author?: string;
  categories: MunajatCategory[];
};

const WEEKDAY_MANZIL = [
  "manzil_sun",
  "manzil_mon",
  "manzil_tue",
  "manzil_wed",
  "manzil_thu",
  "manzil_fri",
  "manzil_sat",
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toAsciiDigits = (raw: string) =>
  raw.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

export default function MunajatPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [data, setData] = useState<MunajatBook | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [today, setToday] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const activeChipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/data/munajat.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: MunajatBook) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  // Select the current weekday's manzil once mounted, so the server and the
  // client never disagree about "today".
  useEffect(() => {
    const id = WEEKDAY_MANZIL[new Date().getDay()];
    setToday(id);
    setCat(id);
  }, []);

  // Keep the selected chip (today's manzil by default) visible in the rail.
  useEffect(() => {
    const rail = railRef.current;
    const chip = activeChipRef.current;
    if (!rail || !chip) return;
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [cat, data]);

  const cats = data?.categories || [];
  const total = useMemo(
    () => cats.reduce((sum, c) => sum + (c.items?.length || 0), 0),
    [cats]
  );
  const active = cats.find((c) => c.id === cat);

  const items = useMemo(() => {
    const query = q.trim();
    const list = cat === "all" ? cats.flatMap((c) => c.items || []) : active?.items || [];
    if (!query) return list;
    return list.filter((it) => JSON.stringify(it).includes(query));
  }, [cats, cat, active, q]);

  const serialLabel = (it: MunajatItem, i: number) => {
    const raw = String(it.serial || num(i + 1));
    return lang === "bn" ? raw : toAsciiDigits(raw);
  };

  const preview = (it: MunajatItem) => {
    const text = it.amal_text?.[0]?.bangla_translation || it.fazilat || "";
    return text.replace(/\s+/g, " ").trim();
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("মুনাজাতে মাকবুল")}
        subtitle={tx("সপ্তাহের সাত মঞ্জিল")}
        icon="hands"
        backHref="/others"
      />

      {data && (
        <div className="card mt-3 flex items-center gap-3 p-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
            <Icon name="library" size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-extrabold leading-snug text-ink">
              {data.author || data.source_book || data.title}
            </p>
            <p className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">
              {num(total)} {tx("টি মুনাজাত")} • {num(cats.length)} {tx("টি বিভাগ")}
            </p>
          </div>
        </div>
      )}

      <div className="card mt-3 rounded-3xl p-2.5">
        <form className="relative" onSubmit={(e) => e.preventDefault()}>
          <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-ink-faint">
            <Icon name="search" size={17} />
          </span>
          <input
            type="text"
            enterKeyHint="search"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tx("খুঁজুন…")}
            aria-label={tx("খুঁজুন…")}
            className="w-full rounded-2xl border border-primary-900/10 bg-sand/70 py-2.5 pe-10 ps-10 text-[13.5px] font-medium text-ink placeholder:text-ink-faint outline-none transition focus:border-primary-500/40 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-white/10"
          />
          {q && (
            <button
              type="button"
              aria-label={tx("মুছুন")}
              onClick={() => setQ("")}
              className="absolute inset-y-0 end-2.5 my-auto flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 text-ink-faint transition hover:bg-ink/10 hover:text-ink dark:bg-white/10 dark:hover:bg-white/15"
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </form>

        {cats.length > 0 && (
          <div ref={railRef} className="rail mt-2 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
            <button
              ref={cat === "all" ? activeChipRef : undefined}
              type="button"
              aria-pressed={cat === "all"}
              onClick={() => setCat("all")}
              className={`chip shrink-0 !gap-1.5 !px-3 !py-1.5 ${cat === "all" ? "chip-active" : ""}`}
            >
              <span>{tx("সব")}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums ${
                  cat === "all"
                    ? "bg-white/20 text-white"
                    : "bg-primary-600/10 text-primary-700 dark:bg-white/10 dark:text-primary-200"
                }`}
              >
                {num(total)}
              </span>
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                ref={cat === c.id ? activeChipRef : undefined}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`chip shrink-0 !gap-1.5 !px-3 !py-1.5 ${cat === c.id ? "chip-active" : ""}`}
              >
                <span>{tx(c.title)}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums ${
                    cat === c.id
                      ? "bg-white/20 text-white"
                      : "bg-primary-600/10 text-primary-700 dark:bg-white/10 dark:text-primary-200"
                  }`}
                >
                  {num(c.items?.length || 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!data && !failed && (
        <div className="mt-4 space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-sand-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-sand-dark" />
                <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      )}

      {failed && <div className="mt-4"><EmptyState icon="hands" title={tx("লোড করা যায়নি")} /></div>}

      {data && active && (
        <div className="mb-2 mt-4 flex items-start gap-2.5 px-1">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark dark:bg-gold-500/10 dark:text-gold-200">
            <Icon name="moon" size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-[15.5px] font-extrabold leading-tight tracking-tight text-ink">
                {tx(active.title)}
              </h2>
              {active.id === today && (
                <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[9px] font-black text-white">
                  {tx("আজ")}
                </span>
              )}
            </div>
            {active.subtitle && (
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
                {tx(active.subtitle)}
              </p>
            )}
          </div>
          <span className="mt-0.5 shrink-0 rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black tabular-nums text-primary-700 dark:bg-white/10 dark:text-primary-200">
            {num(items.length)}
          </span>
        </div>
      )}

      {data && cat === "all" && (
        <div className="mb-2 mt-4 flex items-center gap-2 px-1">
          <span className="shrink-0 text-[11px] font-bold text-ink-faint">
            {num(items.length)} {tx("টি মুনাজাত")}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-900/10 to-transparent dark:from-white/10" />
        </div>
      )}

      {data && items.length === 0 && (
        <div className="mt-3">
          <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} hint={tx("অন্য শব্দে খুঁজে দেখুন")} />
        </div>
      )}

      {data && items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((it, i) => {
            const id = String(it.id || i);
            const isOpen = open === id;
            const amalTexts = it.amal_text || [];
            const heading = it.title?.trim();
            const shareText = [
              heading || `${tx("মুনাজাত")} ${serialLabel(it, i)}`,
              ...amalTexts.map((a) => a.arabic || ""),
              ...amalTexts.map((a) => a.bangla_translation || ""),
              it.fazilat || "",
              it.reference || "",
            ]
              .filter(Boolean)
              .join("\n\n");

            return (
              <article
                key={id}
                id={`munajat-${id}`}
                className={`card group relative overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "!border-primary-600/30 shadow-lift"
                    : "hover:-translate-y-0.5 hover:shadow-lift"
                }`}
              >
                {isOpen && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
                  />
                )}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`munajat-${id}-body`}
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="flex w-full items-start gap-3 p-4 text-start"
                >
                  <span
                    className={`mt-0.5 flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-2 text-[11.5px] font-black tabular-nums transition-all duration-300 ${
                      isOpen
                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                        : "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/10 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-400/15"
                    }`}
                  >
                    {serialLabel(it, i)}
                  </span>

                  <span className="min-w-0 flex-1">
                    {heading ? (
                      <span className="block text-[15px] font-bold leading-snug tracking-tight text-ink">
                        {heading}
                      </span>
                    ) : isOpen ? (
                      <span className="block text-[13px] font-bold leading-relaxed text-ink">
                        {tx("মুনাজাত")} {serialLabel(it, i)}
                      </span>
                    ) : (
                      <span className="line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
                        {preview(it)}
                      </span>
                    )}
                    {heading && !isOpen && preview(it) && (
                      <span className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                        {preview(it)}
                      </span>
                    )}
                  </span>

                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-90 border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-600/25"
                        : "border-primary-900/10 bg-white/70 text-primary-600 group-hover:border-primary-500/30 dark:border-white/10 dark:bg-white/5 dark:text-primary-300"
                    }`}
                  >
                    <Icon name="chevron" size={15} />
                  </span>
                </button>

                <Collapse open={isOpen} id={`munajat-${id}-body`}>
                  <div className="border-t border-primary-900/[0.06] bg-sand/40 px-4 pb-4 pt-3.5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-5">
                    <div className="space-y-3">
                      {amalTexts.map((a, j) => (
                        <div
                          key={j}
                          className="rounded-2xl border border-primary-900/10 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          {a.arabic && (
                            <div className="overflow-hidden rounded-xl border border-gold-500/10 bg-gold-light/60 px-3 py-3 dark:border-gold-400/10 dark:bg-gold-500/[0.06]">
                              <div
                                className="font-arabic text-center text-[21px] leading-[2] text-ink"
                                dir="rtl"
                              >
                                {a.arabic}
                              </div>
                            </div>
                          )}
                          {a.bangla_translation && (
                            <p className="mt-2.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                              {a.bangla_translation}
                            </p>
                          )}
                        </div>
                      ))}

                      {it.fazilat && (
                        amalTexts.length > 0 ? (
                          <div className="relative overflow-hidden rounded-2xl border border-primary-600/15 bg-primary-50 p-3.5 dark:border-primary-400/15">
                            <span
                              aria-hidden
                              className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary-500 to-gold-500"
                            />
                            <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-primary-700 dark:text-primary-300">
                              <Icon name="sparkle" size={12} />
                              {tx("ফযীলত")}
                            </div>
                            <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                              {it.fazilat}
                            </p>
                          </div>
                        ) : (
                          <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                            {it.fazilat}
                          </p>
                        )
                      )}

                      {it.reference && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="chip !px-2.5 !py-1 !text-[10.5px]">{it.reference}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end border-t border-primary-900/[0.06] pt-3 dark:border-white/[0.08]">
                        <div className="rounded-full border border-primary-900/[0.06] bg-white/70 p-0.5 shadow-sm dark:border-white/10 dark:bg-white/5">
                          <ShareCopy text={shareText} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Collapse>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
