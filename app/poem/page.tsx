"use client";
import { useEffect, useState } from "react";
import { PageHead, ShareCopy, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useLang, useNum, useTx } from "../../store/language-store";

export default function PoemPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [tab, setTab] = useState<"cats" | "hakim">("hakim");
  const [cats, setCats] = useState<any[]>([]);
  const [poems, setPoems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  useEffect(() => {
    let live = true;
    const suffix = lang === "bn" ? "" : `.${lang}`;
    fetch(`/data/spiritual_poetry${suffix}.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .catch(() => fetch("/data/spiritual_poetry.json").then((r) => r.json()))
      .then((d) => { if (live) setCats(d.categories || []); })
      .catch(() => {});
    fetch(`/data/hakim_akhtar${suffix}.json`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .catch(() => fetch("/data/hakim_akhtar.json").then((r) => r.json()))
      .then((d) => { if (live) setPoems(d.poems || []); })
      .catch(() => {});
    return () => { live = false; };
  }, [lang]);

  const list = poems.filter((p: any) => !submitted.trim() || JSON.stringify(p).includes(submitted.trim())).slice(0, 80);

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("আধ্যাত্মিক কবিতা")} subtitle={`${tx("হাকীম আখতার (রহ.)")} • ${num(poems.length)} ${tx("কবিতা")}`} icon="feather" />
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-sand p-1 shadow-card">
        {(["hakim", "cats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-[13px] font-bold transition ${tab === t ? "bg-primary-600 text-white shadow-card" : "text-ink-faint"}`}
          >
            {t === "hakim" ? tx("হাকীম আখতার") : tx("কবিগণ")}
          </button>
        ))}
      </div>
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx("কবিতা খুঁজুন…")} className="input !pl-11 !shadow-card" />
      </form>
      {tab === "cats" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {cats.map((c: any) => (
            <div key={c.id} className="card card-hover p-4">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-ink-faint">{c.title} • {c.era}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-soft">{c.books_summary}</div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-3"><EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {list.map((p: any) => (
            <details key={p.id} className="card group p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-bold [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{p.title} <span className="text-xs font-bold text-ink-faint">• {p.book_source}</span></span>
                <span className="rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform group-open:rotate-90">
                  <Icon name="chevron" size={15} />
                </span>
              </summary>
              {p.original_text && <div className="font-arabic mt-2 whitespace-pre-line text-lg" dir="auto">{p.original_text}</div>}
              {p.bangla_translation && <div className="mt-1 whitespace-pre-line text-sm leading-relaxed">{p.bangla_translation}</div>}
              {p.sharh && <div className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-ink-soft">{p.sharh}</div>}
              <div className="mt-3"><ShareCopy text={`${p.title}\n${p.original_text || ""}\n${p.bangla_translation || ""}`} /></div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
