"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useLang, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

export default function PurificationPage() {
  const tx = useTx();
  const lang = useLang();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/self-purification/")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const itemsL = useLocalizedData(items, lang);

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("আত্মশুদ্ধি")} subtitle={tx("নফসের পরিশুদ্ধির পথ")} icon="heart" />
      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-2/3 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : itemsL.length === 0 ? (
        <div className="mt-3"><EmptyState icon="heart" title={tx("শীঘ্রই আসছে")} hint={tx("আত্মশুদ্ধির গাইড যোগ হচ্ছে")} /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {itemsL.slice(0, 40).map((p: any, i: number) => (
            <details key={i} className="card group p-4">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-bold [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-bold text-rose-500">
                  {i + 1}
                </span>
                <span className="flex-1">{p.title || `${tx("ধাপ")} ${i + 1}`}</span>
                <span className="rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform group-open:rotate-90">
                  <Icon name="chevron" size={15} />
                </span>
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.content || p.description}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
