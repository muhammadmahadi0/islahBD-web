"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomTabs } from "../lib/features";
import { Icon } from "./icons";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-l from-primary-800 via-primary-700 to-primary-800 text-white shadow-lift">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-card">
            <img src="/images/logo.png" alt="Islah" className="h-full w-full object-cover" />
          </Link>
          <div className="flex-1 leading-tight">
            <div className="text-[17px] font-bold tracking-tight">ইসলাহ</div>
            <div className="text-[11px] font-medium text-white/70">দ্বীন জীবনের সঙ্গী</div>
          </div>
          <Link
            href="/notifications"
            aria-label="notifications"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <Icon name="bell" size={20} />
          </Link>
          <Link
            href="/settings"
            aria-label="settings"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <Icon name="gear" size={20} />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-3 pb-28 pt-4 sm:px-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 rounded-3xl border border-primary-900/10 bg-white/90 p-1.5 shadow-lift backdrop-blur-xl">
          {bottomTabs.map((t) => {
            const active = path === t.route || (t.route !== "/" && path.startsWith(t.route));
            return (
              <Link
                key={t.route}
                href={t.route}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-bold transition-all active:scale-95 ${
                  active ? "bg-primary-600 text-white shadow-card" : "text-ink-faint hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <span className="relative">
                  <Icon name={t.icon} size={21} />
                  {t.route === "/live" && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulsedot" />
                  )}
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
