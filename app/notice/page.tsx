"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useLang, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

export default function NoticePage() {
  const tx = useTx();
  const lang = useLang();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/notices/?ordering=-date")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const itemsL = useLocalizedData(items, lang);
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return iso;
    const locale = lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-GB";
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d);
  };

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("নোটিশ বোর্ড")} subtitle={tx("ঘোষণা ও আপডেট")} icon="mega" />
      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-4"><div className="h-4 w-2/3 rounded-full bg-sand-dark" /></div>
          ))}
        </div>
      ) : itemsL.length === 0 ? (
        <div className="mt-3"><EmptyState icon="mega" title={tx("কোনো নোটিশ নেই")} /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {itemsL.slice(0, 40).map((n: any, i: number) => {
            const title = n.title === "Notice" ? tx("নোটিশ") : n.title;
            return (
            <details key={i} className="card group p-4" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
                <span className="icon-tile !h-10 !w-10 shrink-0 bg-sky-50 text-sky-600"><Icon name="mega" size={18} /></span>
                <span className="flex-1">
                  <span className="block text-sm font-bold leading-snug">{title}</span>
                  <span className="block text-[11px] font-bold text-ink-faint">{fmtDate(n.date)}</span>
                </span>
                <span className="rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform group-open:rotate-90">
                  <Icon name="chevron" size={15} />
                </span>
              </summary>
              <p className="mt-2 whitespace-pre-line pl-[52px] text-sm leading-relaxed text-ink-soft">{n.body || n.description}</p>
              <div className="mt-2 pl-[52px]">
                <button
                  className="btn-ghost !py-1.5 !text-xs"
                  onClick={() => navigator.clipboard?.writeText(`${title}\n${n.body || ""}`)}
                >
                  <Icon name="copy" size={14} /> {tx("কপি")}
                </button>
              </div>
            </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
