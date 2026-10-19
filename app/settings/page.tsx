"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useThemeStore } from "../../store/theme-store";
import { useDesignStore } from "../../store/design-store";
import { openIslahBDApp } from "../../lib/open-app";
import { bloomTheme } from "../../components/theme-bloom";
import {
  disableNotifications,
  enableNotifications,
  notificationPermission,
  notificationsEnabled,
  notificationsSupported,
} from "../../lib/push";

// Settings — beta sidebar-settings behavior (theme + design segmented
// controls, app opener) on the Islah design system.
export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { mode, setMode } = useDesignStore();

  const [permission, setPermission] = useState<string>("default");
  const [notifOn, setNotifOn] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

  useEffect(() => {
    setPermission(notificationPermission());
    setNotifOn(notificationsEnabled());
  }, []);

  const toggleNotifications = async () => {
    if (notifBusy) return;
    if (notifOn) {
      await disableNotifications();
      setNotifOn(false);
      return;
    }
    setNotifBusy(true);
    const result = await enableNotifications();
    setNotifBusy(false);
    setPermission(notificationPermission());
    setNotifOn(result.ok);
  };

  const notifStatus = !notificationsSupported()
    ? "এই ব্রাউজারে সমর্থিত নয়"
    : permission === "denied"
      ? "ব্লক করা — ব্রাউজার সেটিংস থেকে অনুমতি দিন"
      : notifOn
        ? "চালু — নতুন আপডেট এলেই জানানো হবে"
        : "বন্ধ — নতুন বয়ান, লাইভ ও নামাজের সময়";

  const seg = (active: boolean) =>
    `flex-1 rounded-xl py-2 text-[13px] font-bold transition-all active:scale-95 ${
      active ? "bg-primary-600 text-white shadow-card" : "text-ink-faint hover:text-primary-700"
    }`;

  const pickTheme = (e: React.MouseEvent<HTMLElement>, to: "dark" | "light") => {
    if (to === theme) return;
    bloomTheme(e, to, () => setTheme(to));
  };

  return (
    <div className="animate-fade-up">
      <PageHead title="সেটিংস" subtitle="অ্যাপ আপনার মতো সাজান" icon="gear" />

      {/* IslahBD app */}
      <button onClick={openIslahBDApp} className="card card-hover mt-3 flex w-full items-center gap-3 p-4 text-left">
        <span className="icon-tile bg-gradient-to-br from-[#cba135] to-[#a07e28] text-[#1a1405]">
          <Icon name="external" size={22} strokeWidth={2.2} />
        </span>
        <span className="flex-1">
          <span className="block font-bold">IslahBD অ্যাপ খুলুন</span>
          <span className="block text-xs text-ink-faint">ইনস্টল থাকলে অ্যাপ, না থাকলে স্টোর</span>
        </span>
        <Icon name="chevron" size={18} className="text-ink-faint" />
      </button>

      <div className="card mt-2 divide-y divide-primary-900/5">
        {/* theme */}
        <div className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-indigo-50 text-indigo-500">
            <Icon name={theme === "dark" ? "moon" : "sun"} size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">থিম</span>
            <span className="block text-xs text-ink-faint">
              {theme === "dark" ? "ডার্ক — গভীর রাতের সবুজ" : "লাইট — দিনের আলো"}
            </span>
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
            <button onClick={(e) => pickTheme(e, "light")} className={seg(theme === "light")}>
              ☀ লাইট
            </button>
            <button onClick={(e) => pickTheme(e, "dark")} className={seg(theme === "dark")}>
              🌙 ডার্ক
            </button>
          </div>
        </div>

        {/* design */}
        <div className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-amber-50 text-gold-600">
            <Icon name="sparkle" size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">ডিজাইন</span>
            <span className="block text-xs text-ink-faint">
              {mode === "liquid" ? "লিকুইড গ্লাস — কাঁচের মতো ঝাপসা" : "ম্যাটেরিয়াল — পরিষ্কার সলিড"}
            </span>
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
            <button onClick={() => setMode("liquid")} className={seg(mode === "liquid")}>
              ✨ গ্লাস
            </button>
            <button onClick={() => setMode("material")} className={seg(mode === "material")}>
              ◼ ম্যাটেরিয়াল
            </button>
          </div>
        </div>

        {/* font size */}
        <label className="block p-4">
          <div className="flex items-center gap-3">
            <span className="icon-tile bg-teal-50 text-teal-600"><Icon name="doc" size={20} /></span>
            <span className="flex-1 text-sm font-bold">লেখার সাইজ</span>
          </div>
          <input
            type="range" min={14} max={22} defaultValue={16} className="mt-2 w-full" aria-label="font size"
            onChange={(e) => { document.body.style.fontSize = `${e.target.value}px`; }}
          />
        </label>

        {/* notifications */}
        <button
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-sand/60 disabled:opacity-60"
          onClick={toggleNotifications}
          disabled={notifBusy || !notificationsSupported()}
        >
          <span className="icon-tile bg-rose-50 text-rose-500"><Icon name="bell" size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-bold">পুশ নোটিফিকেশন</span>
            <span className="block text-xs text-ink-faint">
              {notifBusy ? "চালু করা হচ্ছে…" : notifStatus}
            </span>
          </span>
          <span
            aria-hidden
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              notifOn ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                notifOn ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {/* member */}
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
