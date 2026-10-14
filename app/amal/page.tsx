import { FeatureListPage } from "../../components/FeatureList";

export default function AmalPage() {
  return (
    <FeatureListPage
      file="amal.json"
      title="আমল"
      subtitle="কোরআন ও হাদীছ থেকে গুরুত্বপূর্ণ আমলসমূহ + সালেকীন আমল + কাস্টম আমল লগ"
      backHref="/"
      extra={<CustomAmal />}
    />
  );
}

function CustomAmal() {
  return (
    <a href="/tasbeeh" className="card p-4 block">
      <div className="font-bold">➕ আমার আমল (SalikeenAmal)</div>
      <div className="text-sm text-stone-500">
        দৈনিক আমল লগ, হিটলিস্ট ভিউ, টাচ-কাউন্ট ও টার্গেট — তাসবীহ পেজে কাউন্টার ব্যবহার করুন।
      </div>
    </a>
  );
}
