"use client";
import Link from "next/link";
import { Icon } from "./icons";
import { openIslahBDApp } from "../lib/open-app";
import { useNum, useT, useTx } from "../store/language-store";

// Desktop-only footer, following the reference site's four-column layout:
// brand blurb, two link columns, a help column and an app download card.
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">
        {title}
      </h3>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] font-medium text-ink-soft transition hover:text-primary-700 dark:text-slate-400 dark:hover:text-primary-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DesktopFooter() {
  const tx = useTx();
  const t = useT();
  const num = useNum();

  const explore = [
    { href: "/", label: tx("হোম") },
    { href: "/boyan", label: tx("বয়ান") },
    { href: "/quran", label: tx("কুরআন") },
    { href: "/live", label: tx("লাইভ") },
    { href: "/prayer-times", label: tx("নামাজের সময়") },
  ];
  const essentials = [
    { href: "/library", label: tx("লাইব্রেরি") },
    { href: "/hamdnaat", label: tx("হামদ-নাত") },
    { href: "/hajj-umrah", label: tx("হজ ও ওমরাহ") },
    { href: "/munajate", label: tx("মুনাজাত") },
    { href: "/dua", label: tx("দোআ") },
  ];
  const more = [
    { href: "/settings", label: t("settings") },
    { href: "/qibla", label: tx("কিবলা") },
    { href: "/tasbeeh", label: tx("তাসবীহ") },
    { href: "/notice", label: tx("নোটিশ") },
    { href: "/support", label: tx("সহায়তা") },
  ];

  return (
    <footer className="desktop-footer hidden border-t border-primary-900/10 lg:block dark:border-white/10">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[1.5fr_1fr_1fr_1fr_1.25fr] gap-8 px-8 py-12">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-primary-900/10 dark:ring-white/10">
              <img src="/images/logo.png" alt="Islah" className="h-full w-full object-cover" />
            </span>
            <span className="leading-none">
              <span className="block text-xl font-extrabold tracking-wide text-ink">islah</span>
              <span className="mt-1 block text-[11px] font-medium text-ink-faint">{t("tagline")}</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-ink-soft dark:text-slate-400">
            {tx("কুরআন, বয়ান, দোআ, হজ ও দৈনন্দিন আমল — দ্বীনি জীবনের সবকিছু এক জায়গায়।")}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-900/10 bg-white/70 text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-primary-300">
              <Icon name="globe" size={14} />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-900/10 bg-white/70 text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-primary-300">
              <Icon name="youtube" size={14} />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-900/10 bg-white/70 text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-primary-300">
              <Icon name="chat" size={14} />
            </span>
          </div>
        </div>

        <FooterColumn title={tx("আরও দেখুন")} links={explore} />
        <FooterColumn title={tx("প্রয়োজনীয়")} links={essentials} />
        <FooterColumn title={tx("অন্যান্য")} links={more} />

        <div className="rounded-2xl border border-primary-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm font-extrabold text-ink">{tx("অ্যাপ নিন")}</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">
            {tx("যেকোনো সময়, যেকোনো জায়গায়")}
          </p>
          <button
            type="button"
            onClick={openIslahBDApp}
            className="btn-primary mt-3 w-full !rounded-full !py-2 text-[11.5px]"
          >
            <Icon name="download" size={14} />
            {t("openApp")}
          </button>
          <p className="mt-3 text-center text-[10px] text-ink-faint">Google Play • App Store</p>
        </div>
      </div>

      <div className="border-t border-primary-900/10 dark:border-white/10">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-8 py-5 text-[11.5px] text-ink-faint">
          <p>© {num(new Date().getFullYear())} {tx("ইসলাহ — দ্বীনি জীবনের সাথী")}</p>
          <p>{tx("সর্বস্বত্ব সংরক্ষিত")}</p>
        </div>
      </div>
    </footer>
  );
}
