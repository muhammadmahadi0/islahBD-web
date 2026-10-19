import { PageHead } from "../../components/ui";
import ChannelGrid from "../../components/ChannelGrid";

export default function ChannelsPage() {
  return (
    <div className="animate-fade-up">
      <PageHead
        title="চ্যানেল"
        subtitle="ইউটিউব চ্যানেলের বয়ান ও ভিডিও"
        backHref="/others"
        icon="youtube"
      />
      <div className="mt-3">
        <ChannelGrid />
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        প্রতিটি চ্যানেলের সর্বশেষ ভিডিও সরাসরি এখানেই শুনুন ও দেখুন।
      </p>
    </div>
  );
}
