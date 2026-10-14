"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function ParibarPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="animate-fade-up">
      <PageHead title="পরিবার / বাইআত" subtitle="দ্বীনি পরিবারের সাথে যুক্ত হোন" icon="users" />
      <div className="card mt-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile bg-orange-50 text-orange-500">
            <Icon name="doc" size={22} />
          </span>
          <div className="font-bold">বাইআত আবেদন ফর্ম</div>
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
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Link href="/support" className="card card-hover flex items-center gap-3 p-4">
          <span className="icon-tile bg-gold-light text-gold-600"><Icon name="star" size={22} /></span>
          <span><span className="block font-bold">শায়খ মিশন</span><span className="block text-xs text-ink-faint">লক্ষ্য ও কর্মসূচি</span></span>
        </Link>
        <Link href="/support" className="card card-hover flex items-center gap-3 p-4">
          <span className="icon-tile bg-primary-50 text-primary-600"><Icon name="users" size={22} /></span>
          <span><span className="block font-bold">হযরত পরিচিতি</span><span className="block text-xs text-ink-faint">জীবনী ও অবদান</span></span>
        </Link>
      </div>
    </div>
  );
}
