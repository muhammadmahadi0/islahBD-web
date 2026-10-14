import Link from "next/link";
import { FeatureListPage } from "../../components/FeatureList";
import { Icon } from "../../components/icons";

export default function AmalPage() {
  return (
    <FeatureListPage
      file="amal.json"
      title="আমল"
      subtitle="কোরআন ও হাদীছ থেকে গুরুত্বপূর্ণ আমলসমূহ"
      icon="moon"
      extra={
        <Link href="/tasbeeh" className="card card-hover flex items-center gap-3 p-4">
          <span className="icon-tile bg-violet-50 text-violet-600">
            <Icon name="beads" size={24} />
          </span>
          <span className="flex-1">
            <span className="block font-bold">আমার দৈনিক আমল</span>
            <span className="block text-xs text-ink-faint">তাসবীহ কাউন্টার দিয়ে আমল ট্র্যাক করুন</span>
          </span>
          <Icon name="chevron" size={18} className="text-ink-faint" />
        </Link>
      }
    />
  );
}
