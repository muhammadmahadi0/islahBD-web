"use client";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function DonatePage() {
  const copy = (t: string) => navigator.clipboard?.writeText(t);
  return (
    <div className="animate-fade-up">
      <PageHead title="ডোনেট" subtitle="দ্বীনি খেদমতে শরিক হোন" icon="gift" />
      <div className="card mt-3 space-y-2.5 p-4 text-sm leading-relaxed">
        <p className="text-ink-soft">আপনার দান দ্বীন প্রচারের কাজে ব্যয় হয়। নিচের তথ্যে পাঠিয়ে কপি চাপুন।</p>
        {[
          { label: "বিকাশ / নগদ (মোবাইল)", value: "—" },
          { label: "ব্যাংক হিসাব", value: "—" },
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-2 rounded-2xl bg-sand p-3">
            <div className="flex-1">
              <div className="text-xs font-bold text-ink-faint">{a.label}</div>
              <div className="font-bold">{a.value}</div>
            </div>
            <button className="btn-ghost !p-2.5" aria-label="copy" onClick={() => copy(`${a.label}: ${a.value}`)}>
              <Icon name="copy" size={17} />
            </button>
          </div>
        ))}
        <Link href="/member" className="btn-gold w-full">
          <Icon name="star" size={16} /> লাইফটাইম মেম্বার হোন
        </Link>
      </div>
    </div>
  );
}
