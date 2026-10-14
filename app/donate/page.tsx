"use client";
import Link from "next/link";
export default function DonatePage() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">💝 ডোনেট (DonateScreen)</h1>
      <div className="card p-4 mt-3 text-sm space-y-2">
        <p>দ্বীনি এই খেদমতে শরিক হোন। নিচের তথ্য কপি করে বিকাশ/ব্যাংকে পাঠান।</p>
        <div className="bg-ivory rounded-xl p-3"><b>বিকাশ (মোবাইল):</b> <span>— অ্যাপের Donate পেজের নম্বর বসান —</span> <button className="chip ml-2" onClick={() => alert("কপি ✓")}>কপি</button></div>
        <div className="bg-ivory rounded-xl p-3"><b>ব্যাংক:</b> <span>— অ্যাপের Donate পেজের হিসাব বসান —</span></div>
        <Link href="/member" className="btn-primary block text-center">👑 লাইফটাইম মেম্বার →</Link>
      </div>
    </div>
  );
}
