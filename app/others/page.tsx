import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { homeGrid } from "../../lib/features";
import ChannelButton from "../../components/ChannelButton";

export default function OthersPage() {
  return (
    <div className="animate-fade-up">
      <PageHead title="সব ফিচার" subtitle="ইসলাহ-এর সম্পূর্ণ সংগ্রহ" icon="grid" />

      {/* Channels — both channels live inside this one button (master registry) */}
      <ChannelButton />

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {homeGrid.map((f) => (
          <Link key={f.route} href={f.route} className="card card-hover flex flex-col items-center gap-1.5 p-3 text-center">
            <span className={`icon-tile !h-11 !w-11 ${f.tint} ${f.color}`}>
              <Icon name={f.icon} size={22} />
            </span>
            <span className="text-[11px] font-bold leading-tight">{f.titleBn}</span>
          </Link>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {[
          { href: "/notifications", icon: "bell", tint: "bg-amber-50", color: "text-gold-600", t: "নোটিফিকেশন", d: "সব আপডেট এক জায়গায়" },
          { href: "/donate", icon: "gift", tint: "bg-rose-50", color: "text-rose-500", t: "ডোনেট", d: "দ্বীনি খেদমতে শরিক হোন" },
          { href: "/support", icon: "help", tint: "bg-sky-50", color: "text-sky-600", t: "সাপোর্ট সেন্টার", d: "সাহায্য ও জিজ্ঞাসা" },
          { href: "/member", icon: "star", tint: "bg-amber-50", color: "text-gold-600", t: "লাইফটাইম মেম্বার", d: "বিশেষ সদস্যপদ" },
          { href: "/settings", icon: "gear", tint: "bg-primary-50", color: "text-primary-600", t: "সেটিংস", d: "থিম, ফন্ট ও ভাষা" },
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
