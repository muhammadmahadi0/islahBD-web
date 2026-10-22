"use client";
import { useMemo, useState } from "react";
import { PageHead, ShareCopy, EmptyState } from "./ui";
import { Icon } from "./icons";
import { useLang, useNum, useTx } from "../store/language-store";

type Props = {
  file: string;
  title: string;
  subtitle?: string;
  icon?: string;
  backHref?: string;
  extra?: React.ReactNode;
};

// Client list view — mirrors AmalMainScreen / DuaScreen / CollapsibleDuaCard:
// category chips + search + expandable detail cards with copy/share.
export function FeatureListPage({ file, title, subtitle, icon = "book", backHref = "/", extra }: Props) {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  useMemo(() => {
    fetch(`/data/${file}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setFailed(true));
  }, [file]);

  const cats: any[] = data?.categories || [];
  const catCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cats) map[c.id] = (c.items || []).length;
    return map;
  }, [cats]);
  const totalCount = useMemo(
    () => Object.values(catCounts).reduce((a, b) => a + b, 0),
    [catCounts]
  );
  const serialLabel = (it: any, i: number) => {
    const raw = it.serial || num(i + 1);
    if (lang === "bn") return raw;
    return String(raw).replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  };

  const filtered = useMemo(() => {
    const query = q.trim();
    let items: any[] = [];
    for (const c of cats) {
      if (cat !== "all" && c.id !== cat) continue;
      for (const it of c.items || []) items.push({ ...it, _cat: c.title });
    }
    if (query) items = items.filter((it) => JSON.stringify(it).includes(query));
    return items.slice(0, 400);
  }, [cats, q, cat]);

  return (
    <div className="animate-fade-up">
      <PageHead title={title} subtitle={subtitle} icon={icon} backHref={backHref} />

      {data?.source_book && (
        <div className="mt-2.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-900/10 bg-white/60 px-2.5 py-1 text-[10.5px] font-bold text-ink-faint shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
          <Icon name="library" size={12} className="shrink-0 text-gold-600" />
          <span className="truncate">
            {data.source_book}
            {data.author ? ` • ${data.author}` : ""}
          </span>
        </div>
      )}
      {extra && <div className="mt-3">{extra}</div>}

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
          <div className="rail mt-2 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
            <button
              type="button"
              aria-pressed={cat === "all"}
              onClick={() => setCat("all")}
              className={`chip shrink-0 !gap-1.5 !px-3 !py-1.5 ${cat === "all" ? "chip-active" : ""}`}
            >
              <span>{tx("সব")}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums ${
                cat === "all"
                  ? "bg-white/20 text-white"
                  : "bg-primary-600/10 text-primary-700 dark:bg-white/10 dark:text-primary-200"
              }`}>
                {num(totalCount)}
              </span>
            </button>
            {cats.map((c: any) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`chip shrink-0 !gap-1.5 !px-3 !py-1.5 ${cat === c.id ? "chip-active" : ""}`}
              >
                <span>{c.title}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums ${
                  cat === c.id
                    ? "bg-white/20 text-white"
                    : "bg-primary-600/10 text-primary-700 dark:bg-white/10 dark:text-primary-200"
                }`}>
                  {num(catCounts[c.id] || 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-2 mt-3 flex items-center gap-2 px-1">
        <span className="shrink-0 text-[11px] font-bold text-ink-faint">
          {data ? `${num(filtered.length)}${tx("টি আইটেম")}` : failed ? "" : tx("লোড হচ্ছে…")}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-primary-900/10 to-transparent dark:from-white/10" />
      </div>

      {!data && !failed ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-sand-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-sand-dark" />
                <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-sand-dark" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      ) : failed ? (
        <EmptyState icon={icon} title={tx("লোড করা যায়নি")} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} hint={tx("অন্য শব্দে খুঁজে দেখুন")} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((it: any, i: number) => {
            const id = String(it.id || `${it._cat}-${i}`);
            const isOpen = open === id;
            const amalTexts: any[] = it.amal_text || it.amalText || [];
            return (
              <article
                key={id}
                id={`feature-${id}`}
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
                  aria-controls={`feature-${id}-body`}
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
                    {cat === "all" && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        <span className="truncate text-[10.5px] font-bold text-primary-600/90 dark:text-primary-300">
                          {it._cat}
                        </span>
                      </span>
                    )}
                    <span className={`block text-[15px] font-bold leading-snug tracking-tight text-ink ${cat === "all" ? "mt-1" : ""}`}>
                      {it.title}
                    </span>
                    {!isOpen && it.fazilat && (
                      <span className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                        {it.fazilat}
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

                {isOpen && (
                  <div
                    id={`feature-${id}-body`}
                    className="animate-fade-up border-t border-primary-900/[0.06] bg-sand/40 px-4 pb-4 pt-3.5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-5"
                  >
                    <div className="space-y-3">
                      {it.fazilat && (
                        <div className="relative overflow-hidden rounded-2xl border border-primary-600/15 bg-primary-50 p-3.5 dark:border-primary-400/15">
                          <span
                            aria-hidden
                            className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary-500 to-gold-500"
                          />
                          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-primary-700 dark:text-primary-300">
                            <Icon name="sparkle" size={12} />
                            {tx("ফযীলত")}
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{it.fazilat}</p>
                        </div>
                      )}

                      {amalTexts.length > 0 && (
                        <div className="space-y-2">
                          {amalTexts.map((a: any, j: number) => (
                            <div
                              key={j}
                              className="rounded-2xl border border-primary-900/10 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                            >
                              {(a.name || a.recite_count) && (
                                <div className="flex items-center justify-between gap-2">
                                  {a.name ? (
                                    <span className="min-w-0 text-[12px] font-bold text-primary-700 dark:text-primary-300">
                                      {a.name}
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  {a.recite_count && (
                                    <span className="shrink-0 rounded-full bg-gold-light px-2.5 py-1 text-[10px] font-extrabold text-gold-dark ring-1 ring-inset ring-gold-500/20 dark:text-gold-100">
                                      {a.recite_count}
                                    </span>
                                  )}
                                </div>
                              )}

                              {a.arabic && (
                                <div className="mt-2.5 overflow-hidden rounded-xl border border-gold-500/10 bg-gold-light/60 px-3 py-3 dark:border-gold-400/10 dark:bg-gold-500/[0.06]">
                                  <div
                                    className="font-arabic text-center text-[21px] leading-[2] text-ink"
                                    dir="rtl"
                                  >
                                    {a.arabic}
                                  </div>
                                </div>
                              )}

                              {a.bangla_translation && (
                                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
                                  {a.bangla_translation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {it.description && (
                        <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                          {it.description}
                        </p>
                      )}

                      {(it.reference || it.narrator || it.date) && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {it.reference && (
                            <span className="chip !px-2.5 !py-1 !text-[10.5px]">{it.reference}</span>
                          )}
                          {it.narrator && (
                            <span className="chip !px-2.5 !py-1 !text-[10.5px]">{it.narrator}</span>
                          )}
                          {it.date && (
                            <span className="chip !px-2.5 !py-1 !text-[10.5px]">{it.date}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end border-t border-primary-900/[0.06] pt-3 dark:border-white/[0.08]">
                        <div className="rounded-full border border-primary-900/[0.06] bg-white/70 p-0.5 shadow-sm dark:border-white/10 dark:bg-white/5">
                          <ShareCopy
                            text={`${it.title}\n${it.fazilat || ""}\n${amalTexts.map((a: any) => a.arabic || "").join("\n")}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
