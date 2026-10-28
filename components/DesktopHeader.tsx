"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { openIslahBDApp } from "../lib/open-app";
import { useResolvedTheme, useThemeStore } from "../store/theme-store";
import { useLanguageStore, useLang, useNum, useT, useTx } from "../store/language-store";
import { bloomTheme } from "./theme-bloom";
import type { Lang } from "../lib/i18n";

// Desktop-only top navigation. Mirrors the mobile chrome but laid out like the
// islahbd.com web header: brand on the left, primary links in the centre and
// utility actions on the right. Hidden below `lg`, where the app keeps its
// original mobile header and floating bottom nav.
const LANGS: Lang[] = ["bn", "en", "ur"];

export default function DesktopHeader({
  moreActive,
  unread,
}: {
  moreActive: boolean;
  unread: number;
}) {
  const tx = useTx();
  const t = useT();
  const num = useNum();
  const lang = useLang();
  const path = usePathname();
  const setLang = useLanguageStore((s) => s.setLang);
  const resolvedTheme = useResolvedTheme();
  const setTheme = useThemeStore((s) => s.setTheme);

  const nav = [
    { href: "/", label: t("navHome"), active: path === "/" },
    { href: "/boyan", label: t("navBoyan"), active: path === "/boyan" || path.startsWith("/boyan/") },
    { href: "/quran", label: tx("কুরআন"), active: path === "/quran" || path.startsWith("/quran/") },
    { href: "/live", label: t("navLive"), active: path === "/live" || path.startsWith("/live/") },
    {
      href: "/member",
      label: tx("আজীবন সদস্য সম্মেলন"),
      active: path === "/member" || path.startsWith("/member/"),
      wide: true,
    },
    { href: "/media", label: tx("মিডিয়া"), active: path === "/media" || path.startsWith("/media/") },
    { href: "/others", label: t("navOthers"), active: moreActive },
  ];

  const cycleLang = () => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  const langShort = lang === "bn" ? "বাং" : lang === "en" ? "EN" : "اردو";

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const to = resolvedTheme === "dark" ? "light" : "dark";
    bloomTheme(e, to, () => setTheme(to));
  };

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-900/10 bg-white/70 text-ink-soft shadow-sm transition hover:border-primary-600/30 hover:text-primary-700 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";

  return (
    <header className="desktop-header sticky top-0 z-40 hidden lg:block">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-6 xl:gap-6 xl:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-primary-900/10 dark:ring-white/10">
            <img src="/images/logo.png" alt="Islah" className="h-full w-full object-cover" />
          </span>
          <span className="leading-none">
            <span className="block text-[19px] font-extrabold tracking-wide text-ink">islah</span>
            <span className="mt-1 hidden text-[10.5px] font-medium text-ink-faint xl:block">
              {t("tagline")}
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-semibold transition xl:px-3.5 xl:text-[13.5px] ${
                item.active
                  ? "bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-500/15 dark:text-primary-300"
                  : "text-ink-soft hover:bg-sand hover:text-ink dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              } ${item.wide ? "hidden xl:inline-flex" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link href="/quran/search" aria-label={tx("খুঁজুন")} title={tx("খুঁজুন")} className={iconBtn}>
            <Icon name="search" size={16} />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? tx("লাইট মোড") : tx("ডার্ক মোড")}
            title={resolvedTheme === "dark" ? tx("লাইট মোড") : tx("ডার্ক মোড")}
            className={iconBtn}
          >
            <Icon name={resolvedTheme === "dark" ? "sun" : "moon"} size={16} />
          </button>
          <button
            type="button"
            onClick={cycleLang}
            aria-label={tx("ভাষা পরিবর্তন করুন")}
            title={`${tx("ভাষা")}: ${lang === "bn" ? "বাংলা" : lang === "en" ? "English" : "اردو"}`}
            className={`${iconBtn} !w-auto gap-1 px-2.5`}
          >
            <Icon name="globe" size={15} />
            <span className="text-[10px] font-extrabold leading-none">{langShort}</span>
          </button>
          <Link
            href="/notifications"
            aria-label={tx("নোটিফিকেশন")}
            title={tx("নোটিফিকেশন")}
            className={`${iconBtn} relative`}
          >
            <Icon name="bell" size={16} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
                {unread > 9 ? `${num(9)}+` : num(unread)}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openIslahBDApp}
            className="btn-primary ms-1 !rounded-full !px-3 !py-2 text-xs xl:!px-4"
          >
            <Icon name="download" size={15} />
            <span className="hidden xl:inline">{t("openApp")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
