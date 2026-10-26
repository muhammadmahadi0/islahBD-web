"use client";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { homeGrid } from "../../lib/features";
import { mapPlaces, places } from "../../lib/hajj";
import ChannelButton from "../../components/ChannelButton";
import { useNum, useTx } from "../../store/language-store";

export default function OthersPage() {
  const tx = useTx();
  const num = useNum();

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("সব ফিচার")} subtitle={tx("ইসলাহ-এর সম্পূর্ণ সংগ্রহ")} icon="grid" />

      {/* Channels — both channels live inside this one button (master registry) */}
      <ChannelButton />

      {/* Seerah Maps — historical places guide + its Map of Locations subsection */}
      <section className="mt-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span aria-hidden className="h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary-500 to-gold-500" />
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
              {tx("সীরাত মানচিত্র")}
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-faint">
              {tx("ঐতিহাসিক স্থান ও পবিত্র মক্কা-মদিনার মানচিত্র")}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/seerah#places" className="card card-hover flex items-center gap-3 p-4">
            <span className="icon-tile bg-indigo-50 text-indigo-500">
              <Icon name="mountain" size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">{tx("ঐতিহাসিক স্থানসমূহ")}</span>
              <span className="block text-xs text-ink-faint">
                {num(places.total)} {tx("টি স্থান")} · {num(places.regions.length)} {tx("টি অঞ্চল")}
              </span>
            </span>
            <Icon name="chevron" size={18} className="text-ink-faint" />
          </Link>

          <Link href="/seerah/map" className="card card-hover flex items-center gap-3 p-4">
            <span className="icon-tile bg-sky-50 text-sky-600">
              <Icon name="compass" size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">{tx("স্থানসমূহের মানচিত্র")}</span>
              <span className="block text-xs text-ink-faint">
                {num(mapPlaces.total)} {tx("টি স্থান")} · {tx("মক্কা, মদিনা ও হিজাজ")}
              </span>
            </span>
            <Icon name="chevron" size={18} className="text-ink-faint" />
          </Link>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {homeGrid.map((f) => (
          <Link key={f.route} href={f.route} className="card card-hover flex flex-col items-center gap-1.5 p-3 text-center">
            <span className={`icon-tile !h-11 !w-11 ${f.tint} ${f.color}`}>
              <Icon name={f.icon} size={22} />
            </span>
            <span className="text-[11px] font-bold leading-tight">{tx(f.titleBn)}</span>
          </Link>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {[
          { href: "/notifications", icon: "bell", tint: "bg-amber-50", color: "text-gold-600", t: tx("নোটিফিকেশন"), d: tx("সব আপডেট এক জায়গায়") },
          { href: "/donate", icon: "gift", tint: "bg-rose-50", color: "text-rose-500", t: tx("ডোনেট"), d: tx("দ্বীনি খেদমতে শরিক হোন") },
          { href: "/support", icon: "help", tint: "bg-sky-50", color: "text-sky-600", t: tx("সাপোর্ট সেন্টার"), d: tx("সাহায্য ও জিজ্ঞাসা") },
          { href: "/member", icon: "star", tint: "bg-amber-50", color: "text-gold-600", t: tx("লাইফটাইম মেম্বার"), d: tx("বিশেষ সদস্যপদ") },
          { href: "/settings", icon: "gear", tint: "bg-primary-50", color: "text-primary-600", t: tx("সেটিংস"), d: tx("থিম, ফন্ট ও ভাষা") },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover flex items-center gap-3 p-4">
            <span className={`icon-tile ${c.tint} ${c.color}`}>
              <Icon name={c.icon} size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">{c.t}</span>
              <span className="block text-xs text-ink-faint">{c.d}</span>
            </span>
            <Icon name="chevron" size={18} className="text-ink-faint" />
          </Link>
        ))}
      </div>
    </div>
  );
}
