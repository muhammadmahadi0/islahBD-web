import Link from "next/link";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function MunajatPage() {
  return (
    <div className="animate-fade-up">
      <PageHead title="মুনাজাতে মাকবুল" subtitle="কবুল হওয়া মুনাজাতের সংকলন" icon="hands" backHref="/dua" />
      <div className="card mt-3 p-4 text-center">
        <p className="text-sm leading-relaxed text-ink-soft">
          মুনাজাতে মাকবুলের সম্পূর্ণ সংকলন দোআ বিভাগে সাজানো আছে।
        </p>
        <Link href="/dua" className="btn-primary mt-3 w-full">
          <Icon name="hands" size={16} /> দোআ সংকলন খুলুন
        </Link>
      </div>
    </div>
  );
}
