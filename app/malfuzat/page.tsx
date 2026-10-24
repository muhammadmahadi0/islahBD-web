"use client";
import { useEffect, useMemo, useState } from "react";
import { PageHead, ShareCopy, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { storageSetJSON, storageGetJSON } from "../../lib/storage";
import { useLang, useNum, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

export default function MalfuzatPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<number[]>([]);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/malfuzat/?ordering=-createdAt")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    setSaved(storageGetJSON<number[]>("malfuzat_bookmarks", []));
  }, []);

  const visibleItems = useMemo(() => items.slice(0, 50), [items]);
  const itemsL = useLocalizedData(visibleItems, lang);
  const toggle = (i: number) => {
    const n = saved.includes(i) ? saved.filter((x) => x !== i) : [...saved, i];
    setSaved(n);
    storageSetJSON("malfuzat_bookmarks", n);
  };

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("মালফুযাত")} subtitle={`${tx("বুযুর্গদের বাণী")} • ${num(saved.length)} ${tx("সেভড")}`} icon="chat" />
      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-full rounded-full bg-sand-dark" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : itemsL.length === 0 ? (
        <div className="mt-3"><EmptyState icon="chat" title={tx("এখনো কিছু নেই")} /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {itemsL.slice(0, 50).map((m: any, i: number) => (
            <div key={i} className="card p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed">{m.text || m.content || m.title}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  onClick={() => toggle(i)}
                  aria-label="love"
                  className="rounded-full bg-white p-1.5 transition hover:bg-green-50 active:scale-95 dark:bg-transparent"
                >
                  <Icon
                    name="heart"
                    size={14}
                    className={saved.includes(i) ? "fill-red-500 text-red-500" : "text-ink-soft"}
                  />
                </button>
                <ShareCopy text={m.text || m.content || m.title || ""} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
