"use client";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { storageGet, storageSet, storageSetJSON, storageGetJSON } from "../../lib/storage";
import { useLang, useNum, useTx } from "../../store/language-store";

const DHIKRS = [
  { bn: "সুবহানাল্লাহ", en: "SubhanAllah", ur: "سبحان اللہ" },
  { bn: "আলহামদুলিল্লাহ", en: "Alhamdulillah", ur: "الحمد للہ" },
  { bn: "আল্লাহু আকবার", en: "Allahu Akbar", ur: "اللہ اکبر" },
  { bn: "লা ইলাহা ইল্লাল্লাহ", en: "La ilaha illallah", ur: "لا الہ الا اللہ" },
  { bn: "আস্তাগফিরুল্লাহ", en: "Astaghfirullah", ur: "استغفر اللہ" },
  { bn: "দরূদ শরীফ", en: "Durood Sharif", ur: "درود شریف" },
];

export default function TasbeehPage() {
  const tx = useTx();
  const lang = useLang();
  const num = useNum();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(100);
  const [dhikr, setDhikr] = useState(0);
  const [hist, setHist] = useState<{ d: string; c: number; t: string }[]>([]);

  useEffect(() => {
    setHist(storageGetJSON("tasbeeh_history", []));
    setTarget(Number(storageGet("tasbeeh_target") || 100));
  }, []);

  const R = 88;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.min(1, count / target);

  const tap = () => {
    const n = count + 1;
    setCount(n);
    (navigator as any).vibrate?.(12);
    if (n >= target) {
      const entry = {
        d: lang === "bn" ? DHIKRS[dhikr].bn : lang === "ur" ? DHIKRS[dhikr].ur : DHIKRS[dhikr].en,
        c: n,
        t: new Date().toLocaleString(lang === "bn" ? "bn-BD" : lang === "ur" ? "ur-PK" : "en-US"),
      };
      const next = [entry, ...hist].slice(0, 50);
      setHist(next);
      storageSetJSON("tasbeeh_history", next);
      setCount(0);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("ডিজিটাল তাসবীহ")} subtitle={tx("যিকির গুনুন ও লক্ষ্য পূরণ করুন")} icon="beads" />
      <div className="card mt-3 p-5 text-center">
        <select value={dhikr} onChange={(e) => { setDhikr(Number(e.target.value)); setCount(0); }} className="input !text-center !font-bold" aria-label="dhikr">
          {DHIKRS.map((d, i) => <option key={d.bn} value={i}>{lang === "bn" ? d.bn : lang === "ur" ? d.ur : d.en}</option>)}
        </select>

        <div className="relative mx-auto mt-4 h-56 w-56">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#E8EFEA" strokeWidth="14" />
            <circle
              cx="100" cy="100" r={R} fill="none"
              stroke="url(#tasbeehGrad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)}
              className="transition-all duration-150"
            />
            <defs>
              <linearGradient id="tasbeehGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0E7C5B" />
                <stop offset="100%" stopColor="#C9A227" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums tracking-tight">{num(count)}</div>
            <div className="text-xs font-bold text-ink-faint">/ {num(target)}</div>
          </div>
        </div>

        <div className="font-arabic mt-1 text-2xl text-primary-700">{lang === "bn" ? DHIKRS[dhikr].bn : lang === "ur" ? DHIKRS[dhikr].ur : DHIKRS[dhikr].en}</div>

        <button
          onClick={tap}
          className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lift transition hover:scale-105 active:scale-95"
          aria-label="tap"
        >
          <Icon name="plus" size={30} />
        </button>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="btn-ghost !py-2 text-[13px]" onClick={() => setCount(0)}>{tx("রিসেট")}</button>
          <input
            type="number" min={1} value={target} aria-label="target"
            onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setTarget(v); storageSet("tasbeeh_target", String(v)); }}
            className="input !py-2 text-center font-bold"
          />
          <button
            className="btn-ghost !py-2 text-[13px]"
            onClick={() => { if (confirm(tx("সব হিস্ট্রি মুছবেন?"))) { setHist([]); storageSet("tasbeeh_history", "[]"); } }}
          >
            {tx("মুছুন")}
          </button>
        </div>
      </div>

      {hist.length > 0 && (
        <>
          <div className="mb-2 mt-5 flex items-center gap-1.5 px-1 text-sm font-bold">
            <Icon name="clock" size={16} className="text-ink-faint" />
            {tx("হিস্ট্রি")} ({num(hist.length)})
          </div>
          <div className="space-y-1.5">
            {hist.slice(0, 20).map((h, i) => (
              <div key={i} className="card flex items-center justify-between !rounded-2xl px-3.5 py-2.5 text-sm">
                <span className="font-bold">{h.d} <span className="text-primary-700">× {num(h.c)}</span></span>
                <span className="text-[11px] text-ink-faint">{h.t}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
