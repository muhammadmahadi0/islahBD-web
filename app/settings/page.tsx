"use client";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">⚙️ সেটিংস</h1>
      <p className="text-sm text-stone-500">Settings • Developer • HomeWidgets • NotificationPermission</p>
      <div className="card p-4 mt-3 space-y-3">
        <label className="block text-sm font-bold">🌙 থিম
          <select className="input mt-1" onChange={(e) => document.documentElement.style.colorScheme = e.target.value}>
            <option value="light">লাইট (Ivory)</option>
            <option value="dark">ডার্ক</option>
          </select>
        </label>
        <label className="block text-sm font-bold">🔤 ফন্ট সাইজ
          <input type="range" min={14} max={22} defaultValue={16} className="w-full" onChange={(e) => (document.body.style.fontSize = e.target.value + "px")} />
        </label>
        <button className="btn-primary w-full" onClick={() => { Notification?.requestPermission?.(); alert("নোটিফিকেশন অনুমতি চাওয়া হয়েছে (NotificationPermissionScreen)"); }}>🔔 নোটিফিকেশন অনুমতি</button>
        <Link href="/member" className="btn-primary block text-center !bg-gold !text-ink">👑 লাইফটাইম মেম্বার হোন</Link>
        <div className="text-[11px] text-stone-400">App: com.islahbd.app • v1.3.0 (27) • Django: api.islahbd.com • DeveloperScreen: ডিবাগ তথ্য কনসোলে (F12)</div>
      </div>
    </div>
  );
}
