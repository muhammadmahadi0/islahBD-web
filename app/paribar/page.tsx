"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { FAMILY_PROFILE, SOCIALS } from "../../lib/family-profile";

// Family hub — ported from beta FamilyView (welcome, biography expander,
// mission, applications, connect, socials) on the Islah design system.
export default function ParibarPage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="animate-fade-up">
      <PageHead title="পরিবার" subtitle="ইসলাহ পরিবারে আপনাকে স্বাগতম" icon="users" />

      {/* Welcome */}
      <div className="card mt-3 p-6 text-center sm:p-8">
        <span className="icon-tile mx-auto bg-primary-600 text-white">
          <Icon name="heart" size={24} />
        </span>
        <p className="mt-3 text-sm font-medium text-ink-faint">ইসলাহ পরিবারে আপনাকে স্বাগতম</p>
        <div className="gold-text mt-1 text-[26px] font-bold leading-tight">
          মাওলানা তৈয়্যেব আশরাফ সাহেব
        </div>
        <p className="mt-1 text-xs text-ink-faint">দামাত বারাকাতুহুম</p>
        <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
          <Icon name="star" size={14} className="text-gold-600" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-soft">
          তারজুমান-এ-আকাবির আরিফবিল্লাহ হযরত মাওলানা শাহ আব্দুল মতিন বিন হুসাইন
          সাহেবের খলিফা — মাদরাসা মারকাযুল ইহসান ঢাকার প্রতিষ্ঠাতা প্রিন্সিপাল
          ও বাইতুল আমান জামে মসজিদের সম্মানিত খতীব।
        </p>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          className="btn-gold mt-5 inline-flex !rounded-full px-7 py-3 text-sm"
        >
          {profileOpen ? "কম দেখুন" : "আরও জানুন"}
          <Icon name="chevron" size={16} className={`transition-transform ${profileOpen ? "-rotate-90" : "rotate-90"}`} />
        </button>
      </div>

      {/* Biography expander */}
      <div className={`grid transition-all duration-300 ${profileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="card mt-2 p-5 text-left sm:p-6">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
              হযরতের পরিচিতি
            </p>
            <div className="mt-4 space-y-5">
              {FAMILY_PROFILE.map((s) => (
                <div key={s.heading}>
                  <p className="text-sm font-bold text-primary-700">{s.heading}:</p>
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{p}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <Link href="/mission" className="card card-hover mt-2 flex items-center gap-3.5 p-4">
        <span className="icon-tile shrink-0 bg-gold-light text-gold-600">
          <Icon name="book" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">শায়খের মিশন</span>
          <span className="block text-xs text-ink-faint">আল্লাহর মহব্বত, আত্মশুদ্ধি ও মানুষ গড়ার মহান মিশন</span>
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-ink-faint" />
      </Link>

      {/* Applications */}
      <div className="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
        আবেদনসমূহ
      </div>
      <div className="card p-4">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile bg-primary-50 text-primary-600">
            <Icon name="doc" size={22} />
          </span>
          <div>
            <div className="font-bold">বাইআতের আবেদন</div>
            <div className="text-xs text-ink-faint">আধ্যাত্মিক বাইআত ও দিকনির্দেশনা</div>
          </div>
        </div>
        {!sent ? (
          <form
            className="mt-3 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.target as HTMLFormElement);
              await fetch("https://api.islahbd.com/api/paribar/apply/", { method: "POST", body: f }).catch(() => {});
              setSent(true);
            }}
          >
            <input name="name" required placeholder="আপনার নাম" className="input" />
            <input name="phone" required placeholder="মোবাইল নম্বর" className="input" />
            <textarea name="message" placeholder="বার্তা (ঐচ্ছিক)" className="input" rows={3} />
            <button className="btn-primary w-full">
              <Icon name="check" size={16} /> আবেদন পাঠান
            </button>
          </form>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary-50 p-3.5 text-sm font-bold text-primary-700">
            <Icon name="check" size={18} /> আবেদন পৌঁছেছে — যোগাযোগ করা হবে ইনশাআল্লাহ
          </div>
        )}
      </div>

      {/* Connect */}
      <div className="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">
        যোগাযোগ করুন
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href="https://islahbd.com" target="_blank" rel="noreferrer" className="card card-hover flex flex-col items-center gap-1 p-4 text-center">
          <Icon name="globe" size={22} className="text-gold-600" />
          <span className="text-sm font-bold">ইসলাহ বিডি</span>
          <span className="text-[11px] text-ink-faint">islahbd.com</span>
        </a>
        <a href="https://markazulihsan.com" target="_blank" rel="noreferrer" className="card card-hover flex flex-col items-center gap-1 p-4 text-center">
          <Icon name="moon" size={22} className="text-gold-600" />
          <span className="truncate text-sm font-bold">মারকাজুল ইহসান</span>
          <span className="truncate text-[11px] text-ink-faint">markazulihsan.com</span>
        </a>
      </div>
      <div className="card mt-2 px-2 py-4">
        <div className="grid grid-cols-4 gap-1">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="flex flex-col items-center gap-1.5 rounded-2xl py-2 transition hover:bg-sand active:scale-95"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-sand ${s.color}`}>
                <Icon name="share" size={20} />
              </span>
              <span className="text-[10px] font-semibold text-ink-faint">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
