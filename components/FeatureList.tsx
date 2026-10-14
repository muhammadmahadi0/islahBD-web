"use client";
import { useMemo, useState } from "react";
import { PageHead, ShareCopy, EmptyState } from "./ui";
import { Icon } from "./icons";

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
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  useMemo(() => {
    fetch(`/data/${file}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setFailed(true));
  }, [file]);

  const cats: any[] = data?.categories || [];
  const filtered = useMemo(() => {
    const query = submitted.trim();
    let items: any[] = [];
    for (const c of cats) {
      if (cat !== "all" && c.id !== cat) continue;
      for (const it of c.items || []) items.push({ ...it, _cat: c.title });
    }
    if (query) items = items.filter((it) => JSON.stringify(it).includes(query));
    return items.slice(0, 400);
  }, [cats, submitted, cat]);

  return (
    <div className="animate-fade-up">
      <PageHead title={title} subtitle={subtitle} icon={icon} backHref={backHref} />

      {data?.source_book && (
        <div className="mt-2 flex items-center gap-1.5 px-1 text-[11px] font-bold text-ink-faint">
          <Icon name="library" size={14} />
          {data.source_book}{data.author ? ` • ${data.author}` : ""}
        </div>
      )}
      {extra && <div className="mt-3">{extra}</div>}

      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="খুঁজুন…"
          className="input !pl-11 !shadow-card"
        />
      </form>

      {cats.length > 0 && (
        <div className="rail -mx-3 flex gap-2 overflow-x-auto px-3 py-3">
          <button onClick={() => setCat("all")} className={`chip shrink-0 !px-4 !py-2 ${cat === "all" ? "chip-active" : ""}`}>
            সব
          </button>
          {cats.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`chip shrink-0 !px-4 !py-2 ${cat === c.id ? "chip-active" : ""}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 text-xs font-bold text-ink-faint">
        {data ? `${filtered.length}টি আইটেম` : failed ? "" : "লোড হচ্ছে…"}
      </div>

      {!data && !failed ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-2/3 rounded-full bg-sand-dark" />
              <div className="mt-2 h-3 w-full rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : failed ? (
        <EmptyState icon={icon} title="লোড করা যায়নি" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="কিছু পাওয়া যায়নি" hint="অন্য শব্দে খুঁজে দেখুন" />
      ) : (
        <div className="space-y-2">
          {filtered.map((it: any, i: number) => {
            const id = String(it.id || `${it._cat}-${i}`);
            const isOpen = open === id;
            const amalTexts: any[] = it.amal_text || it.amalText || [];
            return (
              <div key={id} className={`card overflow-hidden transition-all ${isOpen ? "!border-primary-600/30 shadow-lift" : ""}`}>
                <button onClick={() => setOpen(isOpen ? null : id)} className="flex w-full items-center gap-3 p-4 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-primary-600">
                      {it._cat}{it.serial ? ` • ${it.serial}` : ""}
                    </div>
                    <div className="mt-0.5 font-bold leading-snug">{it.title}</div>
                    {!isOpen && it.fazilat && (
                      <div className="mt-1 line-clamp-2 text-[13px] text-ink-soft">{it.fazilat}</div>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                    <Icon name="chevron" size={16} />
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-2.5 border-t border-primary-900/10 bg-sand/60 px-4 py-4">
                    {it.fazilat && (
                      <p className="text-sm leading-relaxed"><b className="text-primary-700">ফযীলত: </b>{it.fazilat}</p>
                    )}
                    {amalTexts.map((a: any, j: number) => (
                      <div key={j} className="inner-box rounded-2xl border border-primary-900/10 bg-white p-3.5">
                        {a.name && (
                          <div className="text-xs font-bold text-primary-700">
                            {a.name}{a.recite_count ? ` • ${a.recite_count}` : ""}
                          </div>
                        )}
                        {a.arabic && <div className="font-arabic mt-1 text-[21px]" dir="rtl">{a.arabic}</div>}
                        {a.bangla_translation && <div className="mt-1 text-sm leading-relaxed">{a.bangla_translation}</div>}
                      </div>
                    ))}
                    {it.description && <p className="whitespace-pre-line text-sm leading-relaxed">{it.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {it.reference && <span className="chip !text-[11px]">{it.reference}</span>}
                      {it.narrator && <span className="chip !text-[11px]">{it.narrator}</span>}
                      {it.date && <span className="chip !text-[11px]">{it.date}</span>}
                    </div>
                    <ShareCopy text={`${it.title}\n${it.fazilat || ""}\n${amalTexts.map((a: any) => a.arabic || "").join("\n")}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
