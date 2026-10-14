"use client";
import { useEffect, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/notifications/")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : d.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHead title="নোটিফিকেশন" subtitle="সব আপডেট এক জায়গায়" icon="bell" />
      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-4"><div className="h-4 w-2/3 rounded-full bg-sand-dark" /></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-3"><EmptyState icon="bell" title="কোনো নোটিফিকেশন নেই" /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.slice(0, 40).map((n: any, i: number) => (
            <div key={i} className="card flex gap-3 p-4">
              <span className="icon-tile !h-10 !w-10 shrink-0 bg-primary-50 text-primary-600">
                <Icon name="bell" size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{n.title}</div>
                <div className="mt-0.5 text-[13px] text-ink-soft">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
