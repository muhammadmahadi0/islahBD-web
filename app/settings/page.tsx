"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import {
  systemTheme,
  useResolvedTheme,
  useThemeStore,
  type Theme,
} from "../../store/theme-store";
import { useDesignStore } from "../../store/design-store";
import { useLanguageStore, useT, useTx } from "../../store/language-store";
import { LANGUAGES } from "../../lib/i18n";
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
  const tx = useTx();
  const { theme, setTheme } = useThemeStore();
  const resolvedTheme = useResolvedTheme();
  const { mode, setMode } = useDesignStore();
  const { lang, setLang } = useLanguageStore();
  const t = useT();

  const [permission, setPermission] = useState<string>("default");
  const [notifOn, setNotifOn] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  // Browser APIs return different values on the server; only read them after
  // mount so the first client render matches the server HTML.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPermission(notificationPermission());
    setNotifOn(notificationsEnabled());
  }, []);

  const supported = mounted && notificationsSupported();

  const toggleNotifications = async () => {
    if (notifBusy || !supported) return;
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

  const notifStatus = !mounted
    ? ""
    : !supported
      ? t("notifUnsupported")
      : permission === "denied"
        ? t("notifBlocked")
        : notifOn
          ? t("notifOn")
          : t("notifOff");

  const seg = (active: boolean) =>
    `flex-1 rounded-xl py-2 text-[13px] font-bold transition-all active:scale-95 ${
      active ? "bg-primary-600 text-white shadow-card" : "text-ink-faint hover:text-primary-700"
    }`;

  const pickTheme = (e: React.MouseEvent<HTMLElement>, to: Theme) => {
    if (to === theme) return;
    const target = to === "system" ? systemTheme() : to;
    if (target === resolvedTheme) {
      setTheme(to);
      return;
    }
    bloomTheme(e, target, () => setTheme(to));
  };

  return (
    <div className="animate-fade-up">
      <PageHead title={t("settings")} subtitle={t("settingsSub")} icon="gear" />

      {/* IslahBD app */}
      <button onClick={openIslahBDApp} className="card card-hover mt-3 flex w-full items-center gap-3 p-4 text-left">
        <span className="icon-tile bg-gradient-to-br from-[#cba135] to-[#a07e28] text-[#1a1405]">
          <Icon name="external" size={22} strokeWidth={2.2} />
        </span>
        <span className="flex-1">
          <span className="block font-bold">{t("appOpenTitle")}</span>
          <span className="block text-xs text-ink-faint">{t("appOpenDesc")}</span>
        </span>
        <Icon name="chevron" size={18} className="text-ink-faint" />
      </button>

      <div className="card mt-2 divide-y divide-primary-900/5">
        {/* language */}
        <div className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-sky-50 text-sky-600">
            <Icon name="globe" size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">{t("language")}</span>
            <span className="block text-xs text-ink-faint">{t("languageDesc")}</span>
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-sand p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                lang={l.id}
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={seg(lang === l.id)}
              >
                {lang === "bn" ? l.native : lang === "ur" ? l.ur : l.en}
              </button>
            ))}
          </div>
        </div>

        {/* theme */}
        <div className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-indigo-50 text-indigo-500">
            <Icon name={resolvedTheme === "dark" ? "moon" : "sun"} size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">{t("theme")}</span>
            <span className="block text-xs text-ink-faint">
              {theme === "system"
                ? t("themeSystemDesc")
                : resolvedTheme === "dark"
                  ? t("themeDarkDesc")
                  : t("themeLightDesc")}
            </span>
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-sand p-1">
            <button onClick={(e) => pickTheme(e, "system")} className={seg(theme === "system")}>
              🖥️ {t("themeSystem")}
            </button>
            <button onClick={(e) => pickTheme(e, "light")} className={seg(theme === "light")}>
              ☀ {t("themeLight")}
            </button>
            <button onClick={(e) => pickTheme(e, "dark")} className={seg(theme === "dark")}>
              🌙 {t("themeDark")}
            </button>
          </div>
        </div>

        {/* design */}
        <div className="flex items-center gap-3 p-4">
          <span className="icon-tile bg-amber-50 text-gold-600">
            <Icon name="sparkle" size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">{t("design")}</span>
            <span className="block text-xs text-ink-faint">
              {mode === "liquid" ? t("designGlassDesc") : t("designMaterialDesc")}
            </span>
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
            <button onClick={() => setMode("liquid")} className={seg(mode === "liquid")}>
              ✨ {t("designGlass")}
            </button>
            <button onClick={() => setMode("material")} className={seg(mode === "material")}>
              ◼ {t("designMaterial")}
            </button>
          </div>
        </div>

        {/* font size */}
        <label className="block p-4">
          <div className="flex items-center gap-3">
            <span className="icon-tile bg-teal-50 text-teal-600"><Icon name="doc" size={20} /></span>
            <span className="flex-1 text-sm font-bold">{t("textSize")}</span>
          </div>
          <input
            type="range" min={14} max={22} defaultValue={16} className="mt-2 w-full" aria-label={t("textSize")}
            onChange={(e) => { document.body.style.fontSize = `${e.target.value}px`; }}
          />
        </label>

        {/* notifications */}
        <button
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-sand/60 disabled:opacity-60"
          onClick={toggleNotifications}
          disabled={notifBusy || (mounted && !supported)}
        >
          <span className="icon-tile bg-rose-50 text-rose-500"><Icon name="bell" size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-bold">{t("notifications")}</span>
            <span className="block text-xs text-ink-faint">
              {notifBusy ? t("notifEnabling") : notifStatus}
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
            <span className="block text-sm font-bold">{t("member")}</span>
            <span className="block text-xs text-ink-faint">{t("memberDesc")}</span>
          </span>
          <Icon name="chevron" size={17} className="text-ink-faint" />
        </Link>
      </div>
      <p className="mt-4 text-center text-[11px] text-ink-faint">{tx("ইসলাহ • v1.3.0 • api.islahbd.com")}</p>
    </div>
  );
}
