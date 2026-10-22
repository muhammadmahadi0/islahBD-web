"use client";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { toBn } from "../../lib/prayer";
import { useTx } from "../../store/language-store";

const BENEFITS = [
  "উলামায়ে কেরাম ও তালিবুল ইলমদের সাথে জুড়ে থাকা যায়।",
  "মাদরাসার বিশেষ রেজিস্ট্রি খাতায় তাঁর নাম রেকর্ড হয়ে যায়।",
  "বছরে কমপক্ষে একবার আজীবন সদস্য সম্মেলনে অংশগ্রহণের মাধ্যমে উলামায়ে কেরাম ও তালিবুল ইলমদের সাথে উঠা-বসা, খাওয়া-দাওয়া ও বিশেষ দোয়ায় শরীক থাকা যায়।",
  "প্রতিদিন শত শত হাফেয ও আলেম মাদরাসার বিশেষ দোয়ায় সদস্যদের সার্বিক কল্যাণে দোয়া করতে থাকেন।",
  "কোনো সদস্য বা তাঁর আপনজন অসুস্থ হলে বা বিপদে পড়লে তাঁর জন্য বিশেষ দোয়ার ব্যবস্থা করা হয়।",
  "কোনো সদস্য বা তাঁর ঘনিষ্ঠজন মারা গেলে কুরআন খতম করে সওয়াব রেসানী করা হয়।",
  "মৃত্যুর পরও সদকায়ে জারিয়ারূপে মাদরাসার দ্বীনি খেদমতের একটা অংশ তাঁর আমলনামায় যেতে থাকবে।",
  "আলেম-উলামাদের সাথে মহব্বতের কারণে হাদীসের ভাষ্য অনুযায়ী নায়েবে রাসূলদের সাথে হাশর হওয়ার সৌভাগ্য অর্জন হতে পারে।",
];

const HELPLINES = [
  { num: "+880 1916-387935", label: "প্রধান হেল্পলাইন", wa: "https://wa.me/8801916387935" },
  { num: "+880 1718-763978", label: "সদস্য সংগ্রহ উইং", wa: "https://wa.me/8801718763978" },
  { num: "+880 1314-803334", label: "সম্মেলন তথ্যকেন্দ্র", wa: "https://wa.me/8801314803334" },
];

const EVENT_DATE = new Date("2026-12-05T09:00:00+06:00").getTime();

function useCountdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, EVENT_DATE - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        done: diff <= 0,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function MemberPage() {
  const tx = useTx();
  const cd = useCountdown();

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("আজীবন সদস্য")} subtitle={tx("জামেআ মারকাযুল ইহসান ঢাকা")} icon="star" />

      {/* Event banner */}
      <div className="page-hero mt-3 p-5 text-center">
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-wide text-gold-100">{tx("★ বিশেষ এলান ও দাওয়াত ★")}</p>
          <h2 className="mt-1 text-xl font-bold">{tx("৫ই ডিসেম্বর ২০২৬ (শনিবার)")}</h2>
          <p className="text-[13px] text-white/80">{tx("চলতি বছর আজীবন সদস্য সম্মেলন অনুষ্ঠিত হবে ইনশাআল্লাহ")}</p>
          <p className="mt-1 text-[11px] text-white/70">
            {tx("স্থান: গুলশানে আল্লামা শাহ আব্দুল মতীন কমপ্লেক্স, পাইটি, ডেমরা, ঢাকা।")}
          </p>
          {!cd.done ? (
            <div className="mx-auto mt-3 flex max-w-xs items-center justify-center gap-2">
              {(
                [
                  [cd.d, tx("দিন")],
                  [cd.h, tx("ঘণ্টা")],
                  [cd.m, tx("মিনিট")],
                  [cd.s, tx("সেকেন্ড")],
                ] as const
              ).map(([v, l]) => (
                <div key={l} className="min-w-[64px] rounded-2xl bg-white/15 px-2 py-2 backdrop-blur">
                  <div className="text-xl font-bold tabular-nums">{toBn(v)}</div>
                  <div className="text-[10px] text-white/75">{l} {tx("বাকি")}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 font-bold text-gold-100">{tx("সম্মেলন চলছে — শরীক হোন!")}</p>
          )}
        </div>
      </div>

      {/* About */}
      <div className="card mt-2 p-4 text-sm leading-relaxed text-ink-soft">
        {tx("আমাদের পরম শ্রদ্ধেয় শায়েখ হযরত মাওলানা শাহ তৈয়্যেব আশরাফ সাহেব (দামাত বারাকাতুহুম) এর প্রতিষ্ঠিত ও পরিচালিত দ্বীনি প্রতিষ্ঠান “জামেআ মারকাযুল ইহসান ঢাকা (গুলশানে আল্লামা শাহ আব্দুল মতীন কমপ্লেক্স)”। প্রতিষ্ঠানটির সামগ্রিক উন্নতি-অগ্রগতি এবং শত শত তালিবুল ইলম ও কুরআনের হাফেজদের আর্থিক খেদমতের সহযোগিতাকে বেগবান করার লক্ষ্যে যাঁরা বাৎসরিক নির্দিষ্ট অনুদান প্রদানের অঙ্গীকার করেন, তাঁরাই হলেন এই জামেআর সম্মানিত আজীবন সদস্য। এটি দুনিয়া ও আখেরাতের এক চিরন্তন সদকায়ে জারিয়া।")}
      </div>

      {/* Portal */}
      <div className="card mt-2 p-4">
        <div className="font-bold">{tx("আজীবন সদস্য সেবা ও অনুদান পোর্টাল")}</div>
        <p className="mt-0.5 text-[13px] text-ink-faint">
          {tx("নতুন আবেদন অথবা বিদ্যমান সদস্যের অনুদান ও রসিদ")}
        </p>
        <div className="mt-3 grid gap-2">
          <a href="https://islahbd.com/lifetime-member" target="_blank" rel="noreferrer" className="btn-primary w-full">
            <Icon name="plus" size={16} /> {tx("নতুন আজীবন সদস্য হতে আবেদন করুন")}
          </a>
          <a href="https://islahbd.com/lifetime-member" target="_blank" rel="noreferrer" className="btn-ghost w-full">
            {tx("পুরাতন সদস্য (হিসাব ও অনুদান প্রদান)")}
          </a>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-2 mt-5 px-1 text-[15px] font-bold">{tx("আজীবন সদস্য হওয়ার ফায়দা")}</div>
      <div className="space-y-2">
        {BENEFITS.map((b, i) => (
          <div key={i} className="card flex items-start gap-2.5 p-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-xs font-bold text-white">
              {toBn(i + 1)}
            </span>
            <p className="text-[13px] leading-relaxed">{tx(b)}</p>
          </div>
        ))}
      </div>

      {/* Fikir */}
      <div className="card mt-2 border-gold/30 bg-gold-light/50 p-4">
        <div className="font-bold text-gold-dark">{tx("আমাদের ফিকির ও দোয়া")}</div>
        <p className="mt-1 text-[13px] leading-relaxed">
          {tx("দ্বীনি এ খেদমতে অংশগ্রহণ করার লক্ষ্যে আমরা নিজেরা সদস্য হওয়ার ও নিজেদের আপনজন প্রিয়জনদেরকে সদস্য করার ফিকির করবো ইনশাআল্লাহ। সেই সাথে দোয়া করবো, মহান আল্লাহ রাব্বুল আলামীন নিজ দয়া ও অনুগ্রহে খুব বেশি কবুল করুন এবং সফল করুন। আমীন।")}
        </p>
      </div>

      {/* Helplines */}
      <div className="mb-2 mt-5 px-1 text-[15px] font-bold">{tx("জরুরি হেল্পলাইন ও যোগাযোগ")}</div>
      <div className="space-y-2">
        {HELPLINES.map((h) => (
          <div key={h.num} className="card flex items-center gap-3 p-3.5">
            <span className="icon-tile shrink-0 bg-green-50 text-green-600">
              <Icon name="chat" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold tabular-nums" dir="ltr">{h.num}</span>
              <span className="block text-xs text-ink-faint">{tx(h.label)}</span>
            </span>
            <a href={h.wa} target="_blank" rel="noreferrer" className="btn-ghost shrink-0 !rounded-xl !px-3 !py-2.5 text-[13px]" aria-label="whatsapp">
              WhatsApp
            </a>
            <a href={`tel:${h.num.replace(/[^+\d]/g, "")}`} className="btn-primary shrink-0 !rounded-xl !p-2.5" aria-label="call">
              <Icon name="phone" size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
