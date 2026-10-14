"use client";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function SettingsPage() {
  return (
    <div className="animate-fade-up">
      <PageHead title="সেটিংস" subtitle="অ্যাপ আপনার মতো সাজান" icon="gear" />
      <div className="card mt-3 divide-y divide-primary-900/5">
        <label className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-indigo-50 text-indigo-500"><Icon name="moon" size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-bold">থিম</span>
            <span className="block text-xs text-ink-faint">লাইট / ডার্ক</span>
          </span>
          <select className="input !w-auto" onChange={(e) => { document.documentElement.style.colorScheme = e.target.value; }} aria-label="theme">
            <option value="light">লাইট</option>
            <option value="dark">ডার্ক</option>
          </select>
        </label>
        <label className="block p-4">
          <div className="flex items-center gap-3">
            <span className="icon-tile bg-amber-50 text-gold-600"><Icon name="doc" size={20} /></span>
            <span className="flex-1 text-sm font-bold">লেখার সাইজ</span>
          </div>
          <input
            type="range" min={14} max={22} defaultValue={16} className="mt-2 w-full" aria-label="font size"
            onChange={(e) => { document.body.style.fontSize = `${e.target.value}px`; }}
          />
        </label>
        <button
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-sand/60"
          onClick={() => (Notification as any)?.requestPermission?.()}
        >
          <span className="icon-tile bg-rose-50 text-rose-500"><Icon name="bell" size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-bold">নোটিফিকেশন অনুমতি</span>
            <span className="block text-xs text-ink-faint">নামাজ ও বয়ান রিমাইন্ডার</span>
          </span>
          <Icon name="chevron" size={17} className="text-ink-faint" />
        </button>
        <Link href="/member" className="flex items-center gap-3 p-4 transition hover:bg-sand/60">
          <span className="icon-tile bg-gold-light text-gold-600"><Icon name="star" size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-bold">লাইফটাইম মেম্বার</span>
            <span className="block text-xs text-ink-faint">বিশেষ সদস্যপদ নিন</span>
          </span>
          <Icon name="chevron" size={17} className="text-ink-faint" />
        </Link>
      </div>
      <p className="mt-4 text-center text-[11px] text-ink-faint">ইসলাহ • v1.3.0 • api.islahbd.com</p>
    </div>
  );
}
