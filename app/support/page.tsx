import Link from "next/link";
export default function SupportPage() {
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🛟 সাপোর্ট সেন্টার</h1>
      <div className="space-y-2 mt-3 text-sm">
        {[
          ["🔊 অডিও/ভিডিও চলে না?", "ইন্টারনেট ও স্টোরেজ চেক করুন। ডাউনলোড আটকে গেলে অ্যাপ বন্ধ করে আবার চেষ্টা করুন।"],
          ["🧭 কিবলা ভুল দেখায়?", "লোকেশন অনুমতি দিন, ফোন সমতলে রেখে 8-আকৃতিতে ঘুরান।"],
          ["🔔 নোটিফিকেশন আসে না?", "Settings › Apps › IslahBD › Notifications অন করুন। ব্যাটারি সেভার অফ করুন।"],
          ["🌐 নামাজের সময় ভুল?", "GPS লোকেশন সেট করুন, হানাফি/করাচি পদ্ধতি যাচাই করুন।"],
        ].map(([t, d]) => (
          <details key={t} className="card p-3.5"><summary className="font-bold cursor-pointer">{t}</summary><p className="mt-1">{d}</p></details>
        ))}
        <div className="card p-4">
          <b>যোগাযোগ:</b> <a className="text-primary font-bold" href="https://islahbd.com" target="_blank">islahbd.com ↗</a> • <a className="text-primary font-bold" href="https://www.facebook.com/islahiboyanBD" target="_blank">Facebook ↗</a> • <a className="text-primary font-bold" href="https://www.youtube.com/@islahbd" target="_blank">YouTube ↗</a>
        </div>
      </div>
    </div>
  );
}
