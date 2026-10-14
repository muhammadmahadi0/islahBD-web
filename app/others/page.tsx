"use client";
import Link from "next/link";
import { homeGrid } from "../../lib/features";

export default function OthersPage() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">☰ আরও (OthersScreen)</h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
        {homeGrid.map((f) => (
          <Link key={f.route} href={f.route} className="card p-3 flex flex-col items-center text-center gap-1">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-[11px] font-bold">{f.titleBn}</span>
          </Link>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-2">
        <Link href="/notifications" className="card p-4"><b>🔔 নোটিফিকেশন</b><div className="text-xs text-stone-500">NotificationList • SmartOverlay • Router</div></Link>
        <Link href="/donate" className="card p-4"><b>💝 ডোনেট</b><div className="text-xs text-stone-500">DonateScreen • বিকাশ/ব্যাংক</div></Link>
        <Link href="/support" className="card p-4"><b>🛟 সাপোর্ট সেন্টার</b><div className="text-xs text-stone-500">SupportCenter • FAQ</div></Link>
        <Link href="/member" className="card p-4"><b>👑 লাইফটাইম মেম্বার</b><div className="text-xs text-stone-500">LifetimeMemberWebview</div></Link>
        <Link href="/settings" className="card p-4"><b>⚙️ সেটিংস</b><div className="text-xs text-stone-500">Language • Theme • Font</div></Link>
      </div>
    </div>
  );
}
