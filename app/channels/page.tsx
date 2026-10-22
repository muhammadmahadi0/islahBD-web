"use client";
import { PageHead } from "../../components/ui";
import ChannelGrid from "../../components/ChannelGrid";
import { useTx } from "../../store/language-store";

export default function ChannelsPage() {
  const tx = useTx();
  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("চ্যানেল")}
        subtitle={tx("ইউটিউব চ্যানেলের বয়ান ও ভিডিও")}
        backHref="/others"
        icon="youtube"
      />
      <div className="mt-3">
        <ChannelGrid />
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {tx("প্রতিটি চ্যানেলের সর্বশেষ ভিডিও সরাসরি এখানেই শুনুন ও দেখুন।")}
      </p>
    </div>
  );
}
