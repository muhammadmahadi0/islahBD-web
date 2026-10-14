import Link from "next/link";
export default function NasheedRedirect() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🎧 নাশীদ</h1>
      <p className="text-sm text-stone-500">NasheedScreen + History + Downloads — এখন /media ট্যাবে একীভূত।</p>
      <Link href="/media" className="btn-primary block text-center mt-3">মিডিয়া খুলুন →</Link>
    </div>
  );
}
