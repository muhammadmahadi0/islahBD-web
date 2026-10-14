"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import { stripHtml } from "../../../lib/quran";

// Search: quran.com full-text (Arabic/English) + offline Bengali database.
export default function QuranSearch() {
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
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
    if (mode !== "online" || !submitted.trim()) {
      setOnlineHits([]);
      return;
    }
    setBusy(true);
    fetch(`/api/quran/search?q=${encodeURIComponent(submitted.trim())}`)
      .then((r) => r.json())
      .then((d) => {
        setOnlineHits(d.results || []);
        setOnlineTotal(d.total || 0);
      })
      .catch(() => setOnlineHits([]))
      .finally(() => setBusy(false));
  }, [mode, submitted]);

  const offlineHits =
    mode === "offline" && submitted.trim()
      ? db.filter((a: any) => a.text.includes(submitted.trim()) || a.translation.includes(submitted.trim())).slice(0, 60)
      : [];

  return (
    <div className="animate-fade-up">
      <PageHead title="কুরআন সার্চ" subtitle="quran.com ফুল-টেক্সট + অফলাইন" icon="search" backHref="/quran" />
      <div className="card mt-3 grid grid-cols-2 gap-1 p-1">
        {(["online", "offline"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2 text-[13px] font-bold transition ${mode === m ? "bg-primary-600 text-white shadow-card" : "text-ink-faint"}`}
          >
            {m === "online" ? "quran.com" : "অফলাইন"}
          </button>
        ))}
      </div>
      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(q); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={mode === "online" ? "Arabic or English word… (e.g. mercy, light)" : "আরবি বা বাংলা লিখুন…"}
          className="input !pl-11 !shadow-card"
        />
      </form>

      {mode === "online" && submitted.trim() !== "" && (
        <div className="mb-2 mt-3 text-xs font-bold text-ink-faint">
          {busy ? "খোঁজা হচ্ছে…" : `${onlineTotal}টি ফলাফল`}
        </div>
      )}

      {mode === "online" ? (
        <div className="space-y-2.5">
          {onlineHits.map((h: any) => (
            <div key={h.verse_id} className="card p-4">
              <span className="ayah-badge">{h.verse_key}</span>
              <div className="font-arabic mt-2 text-[22px]" dir="rtl">{h.text}</div>
              {irab && (
                (() => {
                  const [s, a] = String(h.verse_key).split(":");
                  const gram = irab?.[s]?.[a];
                  return gram ? (
                    <details className="mt-2.5 rounded-2xl bg-sand p-3 text-[13px]">
                      <summary className="cursor-pointer font-bold text-primary-700">ইরাব (ব্যাকরণ) দেখুন</summary>
                      <p className="font-arabic mt-1.5 whitespace-pre-line text-[16px]" dir="rtl">{gram}</p>
                    </details>
                  ) : null;
                })()
              )}
            </div>
          ))}
          {submitted.trim() !== "" && !busy && onlineHits.length === 0 && (
            <EmptyState icon="search" title="কিছু পাওয়া যায়নি" hint="আরবি/ইংরেজি শব্দে খুঁজুন" />
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {offlineHits.map((a: any) => (
            <div key={a.number} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="ayah-badge">{a.surahNumber}:{a.numberInSurah}</span>
                <span className="text-[11px] font-bold text-ink-faint">{stripHtml(a.surahEnglish)}</span>
              </div>
              <div className="font-arabic mt-2 text-[22px]" dir="rtl">{a.text}</div>
              <div className="mt-1 text-sm text-ink-soft">{a.translation}</div>
            </div>
          ))}
          {submitted.trim() !== "" && offlineHits.length === 0 && (
            <EmptyState icon="search" title="কিছু পাওয়া যায়নি" />
          )}
        </div>
      )}
    </div>
  );
}
