"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHead, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import { useTx } from "../../../store/language-store";

// Unified search: quran.com full-text and the offline Bengali database
// queried together, results shown in one list.
function SearchBody() {
  const tx = useTx();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [submitted, setSubmitted] = useState(params.get("q") || "");
  const [onlineHits, setOnlineHits] = useState<any[]>([]);
  const [onlineTotal, setOnlineTotal] = useState(0);
  const [db, setDb] = useState<any[]>([]);
  const [irab, setIrab] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/data/quran_database.json").then((r) => r.json()).then(setDb).catch(() => {});
    fetch("/data/quran_irab.json").then((r) => r.json()).then(setIrab).catch(() => {});
  }, []);

  useEffect(() => {
    if (!submitted.trim()) {
      setOnlineHits([]);
      setOnlineTotal(0);
      return;
    }
    setBusy(true);
    fetch(`/api/quran/search?q=${encodeURIComponent(submitted.trim())}`)
      .then((r) => r.json())
      .then((d) => {
        setOnlineHits(d.results || []);
        setOnlineTotal(d.total || 0);
      })
      .catch(() => { setOnlineHits([]); setOnlineTotal(0); })
      .finally(() => setBusy(false));
  }, [submitted]);

  const query = submitted.trim();
  const offlineHits = query
    ? db.filter((a: any) => a.text.includes(query) || a.translation.includes(query)).slice(0, 60)
    : [];

  // Merge: online verse_keys first, then offline-only ayahs (dedup by key)
  const onlineKeys = new Set(onlineHits.map((h: any) => h.verse_key));
  const extraOffline = offlineHits.filter(
    (a: any) => !onlineKeys.has(`${a.surahNumber}:${a.numberInSurah}`)
  );

  const irabOf = (key: string) => {
    const [s, a] = key.split(":");
    return irab?.[s]?.[a] || "";
  };

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("কুরআন সার্চ")} subtitle={tx("quran.com + অফলাইন একসাথে")} icon="search" backHref="/quran" />
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx("আরবি, বাংলা বা ইংরেজিতে খুঁজুন…")}
          className="input !pl-11 !shadow-card"
        />
      </form>

      {query !== "" && (
        <div className="mb-2 mt-3 text-xs font-bold text-ink-faint">
          {busy ? tx("খোঁজা হচ্ছে…") : `${onlineHits.length + extraOffline.length}${tx("টি ফলাফল")}${onlineTotal > 0 ? ` (${tx("মোট")} ${onlineTotal})` : ""}`}
        </div>
      )}

      {query !== "" && !busy && onlineHits.length === 0 && extraOffline.length === 0 && (
        <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} hint={tx("অন্য শব্দে খুঁজে দেখুন")} />
      )}

      <div className="space-y-2.5">
        {onlineHits.map((h: any) => {
          const gram = irabOf(h.verse_key);
          return (
            <div key={h.verse_id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="ayah-badge">{h.verse_key}</span>
                <span className="chip !text-[10px]">quran.com</span>
              </div>
              <div className="font-arabic mt-2 text-[22px]" dir="rtl">{h.text}</div>
              {gram && (
                <details className="mt-2.5 rounded-2xl bg-sand p-3 text-[13px]">
                  <summary className="cursor-pointer font-bold text-primary-700">{tx("ইরাব (ব্যাকরণ) দেখুন")}</summary>
                  <p className="font-arabic mt-1.5 whitespace-pre-line text-[16px]" dir="rtl">{gram}</p>
                </details>
              )}
            </div>
          );
        })}
        {extraOffline.map((a: any) => {
          const gram = irabOf(`${a.surahNumber}:${a.numberInSurah}`);
          return (
            <div key={a.number} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="ayah-badge">{a.surahNumber}:{a.numberInSurah}</span>
                <span className="chip !text-[10px]">{tx("অফলাইন")} • {a.surahEnglish}</span>
              </div>
              <div className="font-arabic mt-2 text-[22px]" dir="rtl">{a.text}</div>
              <div className="mt-1 text-sm text-ink-soft">{a.translation}</div>
              {gram && (
                <details className="mt-2.5 rounded-2xl bg-sand p-3 text-[13px]">
                  <summary className="cursor-pointer font-bold text-primary-700">{tx("ইরাব (ব্যাকরণ) দেখুন")}</summary>
                  <p className="font-arabic mt-1.5 whitespace-pre-line text-[16px]" dir="rtl">{gram}</p>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuranSearchPage() {
  return (
    <Suspense>
      <SearchBody />
    </Suspense>
  );
}
