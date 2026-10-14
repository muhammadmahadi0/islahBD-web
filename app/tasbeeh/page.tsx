"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const DHIKRS = ["সুবহানাল্লাহ", "আলহামদুলিল্লাহ", "আল্লাহু আকবার", "লা ইলাহা ইল্লাল্লাহ", "আস্তাগফিরুল্লাহ", "দরূদ শরীফ"];

export default function TasbeehPage() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(100);
  const [dhikr, setDhikr] = useState(0);
  const [hist, setHist] = useState<{ d: string; c: number; t: string }[]>([]);

  useEffect(() => {
    setHist(JSON.parse(localStorage.getItem("tasbeeh_history") || "[]"));
    setTarget(Number(localStorage.getItem("tasbeeh_target") || 100));
  }, []);

  const tap = () => {
    const n = count + 1;
    setCount(n);
    (navigator as any).vibrate?.(15);
    if (n >= target) {
      const entry = { d: DHIKRS[dhikr], c: n, t: new Date().toLocaleString("bn-BD") };
      const next = [entry, ...hist].slice(0, 50);
      setHist(next);
      localStorage.setItem("tasbeeh_history", JSON.stringify(next));
      setCount(0);
      alert(`🎉 ${target} পূর্ণ! সওয়াব লেখা হলো ✓`);
    }
  };

  return (
    <div className="text-center">
      <div className="text-left"><Link href="/" className="text-primary text-sm font-semibold">← হোম</Link></div>
      <h1 className="text-2xl font-bold mt-1">ডিজিটাল তাসবীহ</h1>
      <select value={dhikr} onChange={(e) => setDhikr(Number(e.target.value))} className="input mt-3">
        {DHIKRS.map((d, i) => <option key={d} value={i}>{d}</option>)}
      </select>
      <div className="card p-6 mt-3">
        <div className="font-arabic text-3xl">{DHIKRS[dhikr]}</div>
        <div className="text-6xl font-bold my-4 text-primary">{count}</div>
        <div className="text-sm text-stone-500">লক্ষ্য: {target}</div>
        <div className="w-full bg-primary-light rounded-full h-3 mt-2">
          <div className="bg-primary h-3 rounded-full" style={{ width: `${Math.min(100, (count / target) * 100)}%` }} />
        </div>
        <button onClick={tap} className="btn-primary w-full !py-6 !text-2xl mt-4 !rounded-full">তাপ করুন 📿</button>
        <div className="flex gap-2 mt-2">
          <button className="chip flex-1 !py-2" onClick={() => setCount(0)}>রিসেট</button>
          <input type="number" value={target} onChange={(e) => { setTarget(Number(e.target.value)); localStorage.setItem("tasbeeh_target", e.target.value); }} className="input" />
        </div>
      </div>
      <h2 className="font-bold mt-4 text-left">🕘 Tasbeeh History ({hist.length})</h2>
      <div className="space-y-1.5 mt-2 text-left">
        {hist.map((h, i) => (
          <div key={i} className="card p-2.5 text-sm flex justify-between"><span>{h.d} × {h.c}</span><span className="text-stone-400 text-xs">{h.t}</span></div>
        ))}
      </div>
      <button className="chip mt-3" onClick={() => { if (confirm("সব হিস্ট্রি মুছবেন?")) { setHist([]); localStorage.removeItem("tasbeeh_history"); } }}>Clear all tasbeeh history</button>
    </div>
  );
}
