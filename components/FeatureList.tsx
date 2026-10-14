"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ShareCopy } from "./ui";

type Props = {
  file: string; title: string; subtitle?: string; backHref?: string; extra?: React.ReactNode;
};

// Client wrapper that fetches /data/*.json (mirrors IslamicDataService + AmalMainScreen/DuaScreen/etc.)
export function FeatureListPage({ file, title, subtitle, backHref = "/", extra }: Props) {
  return <FeatureListClient file={file} title={title} subtitle={subtitle} backHref={backHref} extra={extra} />;
}

function FeatureListClient({ file, title, subtitle, backHref = "/", extra }: Props) {
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  useMemo(() => {
    fetch(`/data/${file}`).then((r) => r.json()).then(setData).catch(() => setData({ categories: [] }));
  }, [file]);

  const cats: any[] = data?.categories || [];
  const filtered = useMemo(() => {
    const query = q.trim();
    let items: any[] = [];
    for (const c of cats) {
      if (cat !== "all" && c.id !== cat && c.title !== cat) continue;
      for (const it of c.items || []) items.push({ ...it, _cat: c.title });
    }
    if (query) items = items.filter((it) => JSON.stringify(it).includes(query));
    return items.slice(0, 400);
  }, [cats, q, cat]);

  return (
    <div>
      <Link href={backHref} className="text-primary text-sm font-semibold">← ফিরে যান</Link>
      <h1 className="text-2xl font-bold mt-1">{title}</h1>
      {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
      {data?.source_book && <p className="text-[11px] text-stone-400 mt-1">📚 {data.source_book}{data.author ? ` • ${data.author}` : ""}</p>}
      {extra && <div className="mt-3">{extra}</div>}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 খুঁজুন…" className="input mt-3" />
      <div className="flex gap-2 overflow-x-auto py-3">
        <button onClick={() => setCat("all")} className={cat === "all" ? "chip !bg-primary !text-white" : "chip"}>সব</button>
        {cats.map((c: any) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={cat === c.id ? "chip !bg-primary !text-white whitespace-nowrap" : "chip whitespace-nowrap"}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="text-xs text-stone-400 mb-2">{filtered.length}টি আইটেম</div>
      <div className="space-y-2">
        {filtered.map((it: any, i: number) => {
          const id = it.id || `${i}`;
          const isOpen = open === id;
          const amalTexts: any[] = it.amal_text || it.amalText || [];
          return (
            <div key={id} className="card">
              <button onClick={() => setOpen(isOpen ? null : id)} className="w-full text-left p-3.5">
                <div className="text-[11px] text-primary font-bold">{it._cat}{it.serial ? ` • ${it.serial}` : ""}</div>
                <div className="font-bold leading-snug">{it.title}</div>
                {it.fazilat && <div className="text-[13px] text-stone-600 mt-1 line-clamp-2">{it.fazilat}</div>}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 space-y-2 border-t border-emerald-900/10 pt-3">
                  {it.fazilat && <p className="text-sm"><b>ফযীলত:</b> {it.fazilat}</p>}
                  {amalTexts.map((a: any, j: number) => (
                    <div key={j} className="bg-ivory rounded-xl p-3">
                      {a.name && <div className="text-xs font-bold text-primary">{a.name}{a.recite_count ? ` • ${a.recite_count}` : ""}</div>}
                      {a.arabic && <div className="font-arabic text-xl leading-loose" dir="rtl">{a.arabic}</div>}
                      {a.bangla_translation && <div className="text-sm mt-1">{a.bangla_translation}</div>}
                    </div>
                  ))}
                  {it.description && <p className="text-sm whitespace-pre-line">{it.description}</p>}
                  <div className="flex flex-wrap gap-2 text-[11px] text-stone-500">
                    {it.reference && <span className="chip">📖 {it.reference}</span>}
                    {it.narrator && <span className="chip">👤 {it.narrator}</span>}
                    {it.date && <span className="chip">📅 {it.date}</span>}
                  </div>
                  <ShareCopy text={`${it.title}\n${it.fazilat || ""}\n${amalTexts.map((a: any) => a.arabic || "").join("\n")}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
