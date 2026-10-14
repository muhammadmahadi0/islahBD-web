import Link from "next/link";
export default function MunajatPage() {
  return (
    <div>
      <Link href="/dua" className="text-primary text-sm font-semibold">← দোআ</Link>
      <h1 className="text-2xl font-bold mt-1">মুনাজাতে মাকবুল</h1>
      <p className="text-sm text-stone-500">MunajateMaqbulMain • Detail • Drawer • Bookmarks — দোআ পেজের বিশেষ সংকলন হিসেবে দেখুন।</p>
      <Link href="/dua" className="btn-primary block text-center mt-3">দোআ সংকলন খুলুন →</Link>
    </div>
  );
}
