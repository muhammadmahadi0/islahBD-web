"use client";
import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useTx } from "../../store/language-store";

const FAQS: [string, string][] = [
  ["অডিও / ভিডিও চলে না?", "ইন্টারনেট ও স্টোরেজ চেক করুন। ডাউনলোড আটকে গেলে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।"],
  ["কিবলা ভুল দেখায়?", "লোকেশন অনুমতি দিন, ফোন সমতলে রেখে 8-আকৃতিতে ঘুরিয়ে ক্যালিব্রেট করুন।"],
  ["নামাজের সময় ভুল?", "GPS লোকেশন সেট করুন — হানাফি মাযহাব ও করাচি পদ্ধতি ব্যবহার হয়।"],
  ["বয়ান ডাউনলোড করব কীভাবে?", "বয়ান বা হামদ-নাত তালিকায় প্রতিটি আইটেমের ডাউনলোড বোতাম চাপুন।"],
];

export default function SupportPage() {
  const tx = useTx();
  return (
    <div className="animate-fade-up">
      <PageHead title={tx("সাপোর্ট সেন্টার")} subtitle={tx("সাহায্য ও যোগাযোগ")} icon="help" />
      <div className="mt-3 space-y-2">
        {FAQS.map(([t, d]) => (
          <details key={t} className="card group p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-bold [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-sm">{tx(t)}</span>
              <span className="rounded-full bg-primary-50 p-1.5 text-primary-600 transition-transform group-open:rotate-90">
                <Icon name="chevron" size={15} />
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tx(d)}</p>
          </details>
        ))}
        <div className="card flex flex-wrap gap-2 p-4">
          <a className="btn-outline flex-1 !text-[13px]" href="https://islahbd.com" target="_blank" rel="noreferrer">
            <Icon name="globe" size={15} /> {tx("ওয়েবসাইট")}
          </a>
          <a className="btn-outline flex-1 !text-[13px]" href="https://www.youtube.com/@islahbd" target="_blank" rel="noreferrer">
            <Icon name="playfill" size={15} /> YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
