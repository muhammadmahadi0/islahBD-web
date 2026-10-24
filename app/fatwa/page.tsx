"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useLang, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

export default function FatwaPage() {
  const tx = useTx();
  const lang = useLang();
  const [cats, setCats] = useState<any[]>([]);
  const [qs, setQs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("https://api.islahbd.com/api/fatwa-categories/").then((r) => r.json()).catch(() => []),
      fetch("https://api.islahbd.com/api/fatwa/").then((r) => r.json()).catch(() => []),
    ]).then(([c, f]) => {
      setCats(Array.isArray(c) ? c : c.results || []);
      setQs(Array.isArray(f) ? f : f.results || []);
    }).finally(() => setLoading(false));
  }, []);

  const catsL = useLocalizedData(cats, lang);
  const qsL = useLocalizedData(qs, lang);
  const list = qsL
    .filter((x: any) => !submitted.trim() || JSON.stringify(x).includes(submitted.trim()))
    .slice(0, 40);

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("শরঈ জিজ্ঞাসা")} subtitle={tx("মাসআলা-মাসায়েলের উত্তর")} icon="help" />
      {catsL.length > 0 && (
        <div className="rail -mx-3 mt-3 flex gap-2 overflow-x-auto px-3">
          {catsL.slice(0, 20).map((c: any, i: number) => (
            <span key={i} className="chip shrink-0">{c.title || c.name}</span>
          ))}
        </div>
      )}
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx("প্রশ্ন খুঁজুন…")} className="input !pl-11 !shadow-card" />
      </form>
      <details className="card group mt-2 p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 font-bold [&::-webkit-details-marker]:hidden">
          <span className="icon-tile !h-10 !w-10 bg-primary-600 text-white"><Icon name="plus" size={18} /></span>
          <span className="flex-1">{tx("নতুন প্রশ্ন করুন")}</span>
          <span className="rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform group-open:rotate-90">
            <Icon name="chevron" size={15} />
          </span>
        </summary>
        <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); (e.target as HTMLFormElement).reset(); alert(tx("প্রশ্ন জমা হয়েছে")); }}>
          <input required placeholder={tx("আপনার নাম")} className="input" />
          <textarea required placeholder={tx("প্রশ্ন বিস্তারিত লিখুন…")} className="input" rows={4} />
          <button className="btn-primary w-full">
            <Icon name="check" size={16} /> {tx("পাঠান")}
          </button>
        </form>
      </details>
      {loading ? (
        <div className="mt-2 space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="card animate-pulse p-4"><div className="h-4 w-3/4 rounded-full bg-sand-dark" /></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-2"><EmptyState icon="help" title={tx("এখনো উত্তর প্রকাশিত হয়নি")} /></div>
      ) : (
        <div className="mt-2 space-y-2">
          {list.map((x: any, i: number) => (
            <details key={i} className="card group p-4">
              <summary className="cursor-pointer list-none text-sm font-bold leading-snug [&::-webkit-details-marker]:hidden">
                {x.question || x.title || `${tx("প্রশ্ন")} ${i + 1}`}
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{x.answer || x.fatwa || tx("উত্তর শীঘ্রই…")}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
