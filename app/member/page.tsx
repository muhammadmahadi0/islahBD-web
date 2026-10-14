import Link from "next/link";
export default function MemberPage() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">👑 লাইফটাইম মেম্বার</h1>
      <p className="text-sm text-stone-500">LifetimeMemberWebviewScreen — অ্যাপের ওয়েবভিউ-এর ওয়েব সংস্করণ</p>
      <iframe src="https://islahbd.com/lifetime-member?isApp=true" className="w-full h-[70vh] card mt-3" title="Lifetime member" />
    </div>
  );
}
