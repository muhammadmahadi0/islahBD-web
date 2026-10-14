"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomTabs } from "../lib/features";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto">
      <header className="sticky top-0 z-40 bg-primary text-white shadow">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src="/images/logo.png" alt="Islah" className="w-9 h-9 rounded-xl bg-white object-cover" />
          <div className="flex-1">
            <div className="font-bold leading-tight">ইসলাহ</div>
            <div className="text-[11px] opacity-80 leading-tight">দ্বীন জীবনের সঙ্গী • v1.3.0</div>
          </div>
          <Link href="/notifications" className="text-xl" aria-label="notifications">🔔</Link>
          <Link href="/settings" className="text-xl" aria-label="settings">⚙️</Link>
        </div>
      </header>
      <main className="flex-1 px-3 sm:px-4 pb-24 pt-3">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-emerald-900/10">
        <div className="max-w-5xl mx-auto grid grid-cols-5">
          {bottomTabs.map((t) => {
            const active = path === t.route || (t.route !== "/" && path.startsWith(t.route));
            return (
              <Link
                key={t.route}
                href={t.route}
                className={`flex flex-col items-center py-2 text-[11px] font-semibold ${
                  active ? "text-primary" : "text-stone-500"
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
