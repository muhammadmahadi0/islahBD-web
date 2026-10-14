"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("https://api.islahbd.com/api/notifications/").then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🔔 নোটিফিকেশন</h1>
      <div className="space-y-2 mt-3">
        {items.slice(0, 40).map((n: any, i: number) => (
          <div key={i} className="card p-3.5 text-sm"><b>{n.title}</b><div className="text-stone-500">{n.body}</div></div>
        ))}
        {items.length === 0 && <div className="card p-4 text-sm">কোনো নোটিফিকেশন নেই / লোড হচ্ছে…</div>}
      </div>
    </div>
  );
}
