"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons";
import { Collapse } from "../Collapse";
import { EmptyState } from "../ui";
import { HAJJ_BOOK_ORDER } from "../../lib/hajj";
import { useLang, useNum, useTx } from "../../store/language-store";

// Book accordions for the Hajj & Umrah hub. Content is the same
// public/data/hajj_umrah.json catalog used by the old generic list page,
// re-arranged to match the app's hub: four categories, expandable items and
// a detail sheet (IslamicDetailScaffold equivalent).

interface BookAmal {
  name?: string;
  arabic?: string;
  bangla_translation?: string;
  recite_count?: string;
}

interface BookItem {
  id: string;
  serial?: string;
  title: string;
  fazilat?: string;
  reference?: string;
  amal_text?: BookAmal[];
}

interface BookCategory {
  id: string;
  title: string;
  subtitle?: string;
  items: BookItem[];
}

interface BookData {
  source_book?: string;
  author?: string;
  categories?: BookCategory[];
}

const CATEGORY_STYLE: Record<
  string,
  { icon: string; tile: string; bar: string }
> = {
  hajj_virtues: { icon: "gem", tile: "bg-gold-light text-gold-dark dark:bg-gold-500/10 dark:text-gold-100", bar: "from-gold-500 to-gold-600" },
  umrah_guide: { icon: "kaaba", tile: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300", bar: "from-primary-500 to-primary-700" },
  hajj_guide: { icon: "mosque", tile: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", bar: "from-emerald-500 to-teal-600" },
  hajj_guidelines: { icon: "shield", tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300", bar: "from-indigo-500 to-violet-600" },
};

export function BooksSection() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [data, setData] = useState<BookData | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [active, setActive] = useState<{ cat: BookCategory; item: BookItem } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let live = true;
    setFailed(false);
    setData(null);
    const localized = lang === "bn" ? "hajj_umrah.json" : `hajj_umrah.${lang}.json`;
    fetch(`/data/${localized}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .catch(() => fetch("/data/hajj_umrah.json").then((r) => r.json()))
      .then((d: BookData) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [lang, reloadKey]);

  // Keep the app's category order and drop the empty FAQ category.
  const categories = useMemo<BookCategory[]>(() => {
    const all = data?.categories || [];
    const ordered = HAJJ_BOOK_ORDER.map((id) => all.find((c) => c.id === id)).filter(
      (c): c is BookCategory => Boolean(c)
    );
    const extra = all.filter(
      (c) => !HAJJ_BOOK_ORDER.includes(c.id as (typeof HAJJ_BOOK_ORDER)[number]) && (c.items || []).length > 0
    );
    return [...ordered, ...extra];
  }, [data]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((it) =>
          `${it.title} ${it.fazilat || ""} ${it.reference || ""}`.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, q]);

  // Sheet dismissal: lock the page and support Escape.
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-gold-500" />
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
              {tx("অনূদিত হজ-ওমরাহ গ্রন্থাবলী")}
            </h2>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-ink-faint">
              {data?.author || tx("মাওলানা শাহ আব্দুল মতীন বিন হুসাইন")}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-extrabold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
          {data ? `${num(categories.reduce((n, c) => n + c.items.length, 0))} ${tx("টি রচনা")}` : tx("লোড হচ্ছে…")}
        </span>
      </div>

      <div className="card rounded-3xl p-2.5">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-ink-faint">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx("গ্রন্থাবলীতে খুঁজুন…")}
            aria-label={tx("গ্রন্থাবলীতে খুঁজুন…")}
            className="w-full rounded-2xl border border-primary-900/10 bg-sand/70 py-2.5 pe-10 ps-10 text-[13px] font-medium text-ink placeholder:text-ink-faint outline-none transition focus:border-primary-500/40 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-white/10"
          />
          {query && (
            <button
              type="button"
              aria-label={tx("মুছুন")}
              onClick={() => setQuery("")}
              className="absolute inset-y-0 end-2.5 my-auto flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 text-ink-faint transition hover:bg-ink/10 hover:text-ink dark:bg-white/10 dark:hover:bg-white/15"
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>

      {!data && !failed && (
        <div className="mt-2.5 space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-3.5">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-sand-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-sand-dark" />
                <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      )}

      {failed && (
        <div className="mt-2.5">
          <EmptyState icon="library" title={tx("গ্রন্থাবলী লোড করা যায়নি")} />
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="btn-outline mt-2 w-full !py-2.5 text-[12.5px]"
          >
            <Icon name="clock" size={14} />
            {tx("আবার চেষ্টা করুন")}
          </button>
        </div>
      )}

      {data && visible.length === 0 && (
        <div className="mt-2.5">
          <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} hint={tx("অন্য শব্দে খুঁজে দেখুন")} />
        </div>
      )}

      <div className="mt-2.5 space-y-2.5">
        {visible.map((cat) => {
          const style = CATEGORY_STYLE[cat.id] || CATEGORY_STYLE.hajj_guidelines;
          const isOpen = openCat === cat.id || Boolean(q);
          return (
            <article key={cat.id} className="card overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`book-${cat.id}`}
                onClick={() => setOpenCat(isOpen && !q ? null : cat.id)}
                className="flex w-full items-center gap-3 p-3.5 text-start transition hover:bg-sand/40 dark:hover:bg-white/[0.03]"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.tile}`}>
                  <Icon name={style.icon} size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${style.bar}`} />
                    <span className="text-[13.5px] font-bold leading-snug text-ink">{cat.title}</span>
                  </span>
                  {cat.subtitle && (
                    <span className="mt-0.5 line-clamp-1 block text-[11px] font-medium text-ink-faint">
                      {cat.subtitle}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-black tabular-nums text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                  {num(cat.items.length)}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary-900/10 text-primary-600 transition-transform duration-300 dark:border-white/10 dark:text-primary-300 ${
                    isOpen ? "-rotate-90" : "rotate-90"
                  }`}
                >
                  <Icon name="chevron" size={13} />
                </span>
              </button>

              <Collapse open={isOpen} id={`book-${cat.id}`}>
                <div className="border-t border-primary-900/[0.06] bg-sand/30 p-2 dark:border-white/[0.08] dark:bg-white/[0.02]">
                  <ul className="space-y-1">
                    {cat.items.map((item) => (
                      <li key={`${cat.id}-${item.id}`}>
                        <button
                          type="button"
                          onClick={() => setActive({ cat, item })}
                          className="flex w-full items-center gap-2.5 rounded-2xl bg-white/80 p-2.5 text-start ring-1 ring-inset ring-primary-900/[0.05] transition hover:bg-white hover:ring-primary-500/20 dark:bg-white/[0.03] dark:ring-white/[0.06] dark:hover:bg-white/[0.06]"
                        >
                          <span className="flex h-7 min-w-[2.1rem] shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary-50 px-1.5 text-[10px] font-black text-primary-700 ring-1 ring-inset ring-primary-600/10 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-400/15">
                            {item.serial || num(1)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">
                            {item.title}
                          </span>
                          <Icon name="chevron" size={13} className="shrink-0 rotate-90 text-ink-faint" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Collapse>
            </article>
          );
        })}
      </div>

      {active &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-2 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setActive(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={active.item.title}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-primary-900/10 bg-white p-4 shadow-lift dark:border-white/10 dark:bg-[#16202f] sm:rounded-3xl sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/20 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-primary-600 dark:text-primary-300">
                    <Icon name={CATEGORY_STYLE[active.cat.id]?.icon || "library"} size={12} />
                    {active.cat.title}
                  </p>
                  <h2 className="mt-1 text-[17px] font-extrabold leading-snug tracking-tight text-ink">
                    {active.item.title}
                  </h2>
                  {active.item.serial && (
                    <span className="mt-1.5 inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                      {active.item.serial}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label={tx("বন্ধ করুন")}
                  className="rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              {active.item.fazilat && (
                <div className="relative mt-3 overflow-hidden rounded-2xl border border-primary-600/15 bg-primary-50/70 p-3.5 dark:border-primary-400/15 dark:bg-primary-500/[0.06]">
                  <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary-500 to-gold-500" />
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                    {active.item.fazilat}
                  </p>
                </div>
              )}

              {(active.item.amal_text || []).map((amal, index) => (
                <div
                  key={index}
                  className="mt-2.5 rounded-2xl border border-primary-900/10 bg-sand/50 p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  {(amal.name || amal.recite_count) && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-bold text-primary-700 dark:text-primary-300">
                        {amal.name || ""}
                      </span>
                      {amal.recite_count && (
                        <span className="shrink-0 rounded-full bg-gold-light px-2 py-0.5 text-[9.5px] font-extrabold text-gold-dark dark:bg-gold-500/10 dark:text-gold-100">
                          {amal.recite_count}
                        </span>
                      )}
                    </div>
                  )}
                  {amal.arabic && (
                    <div
                      dir="rtl"
                      lang="ar"
                      className="font-arabic mt-2 rounded-xl border border-gold-500/10 bg-gold-light/60 px-3 py-3 text-center text-[21px] leading-[2] text-ink dark:border-gold-400/10 dark:bg-gold-500/[0.06]"
                    >
                      {amal.arabic}
                    </div>
                  )}
                  {amal.bangla_translation && (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                      {amal.bangla_translation}
                    </p>
                  )}
                </div>
              ))}

              {active.item.reference && (
                <p className="mt-3 flex items-start gap-1.5 border-t border-primary-900/[0.06] pt-2.5 text-[10.5px] font-semibold italic text-ink-faint dark:border-white/[0.08]">
                  <Icon name="book" size={12} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    {tx("বর্ণনায়")}: {active.item.reference}
                  </span>
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
