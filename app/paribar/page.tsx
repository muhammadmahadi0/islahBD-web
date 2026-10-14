"use client";
import { useState } from "react";
import Link from "next/link";

export default function ParibarPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">👨‍👩‍👧 পরিবার / বাইআত</h1>
      <p className="text-sm text-stone-500">Paribar • BaiyatGuidance • HazratDetail • ShaykhMission • Forms</p>
      <div className="card p-4 mt-3">
        <div className="font-bold">🤝 বাইআত ফর্ম (BaiyatFormSheet)</div>
        {!sent ? (
          <form className="space-y-2 mt-2" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.target as any); await fetch("https://api.islahbd.com/api/paribar/apply/", { method: "POST", body: f }).catch(() => {}); setSent(true); }}>
            <input name="name" required placeholder="নাম" className="input" />
            <input name="phone" required placeholder="মোবাইল" className="input" />
            <textarea name="message" placeholder="বার্তা" className="input" />
            <button className="btn-primary w-full">আবেদন পাঠান</button>
          </form>
        ) : <div className="text-primary font-bold mt-2">✓ আবেদন গৃহীত (ডেমো)</div>}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-2">
        <Link href="/support" className="card p-4"><b>🌟 শায়খ মিশন</b><div className="text-xs text-stone-500">ShaykhMissionScreen</div></Link>
        <Link href="/support" className="card p-4"><b>👤 হযরত পরিচিতি</b><div className="text-xs text-stone-500">HazratDetailScreen</div></Link>
      </div>
    </div>
  );
}
