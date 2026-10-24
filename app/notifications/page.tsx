"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { markSeen } from "../../lib/push";
import {
  getReadIds,
  markRead,
  notifDay,
  notifHref,
  notifIcon,
  notifTint,
  notifTypeLabel,
  parseNotifications,
  type AppNotification,
} from "../../lib/notifications";
import { useLang, useNum, useTimeAgo, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

const PAGE = 30;

export default function NotificationsPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const timeAgo = useTimeAgo();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unread, setUnread] = useState(0);
  const [unreadIds, setUnreadIds] = useState<Set<number>>(new Set());
  const [visible, setVisible] = useState(PAGE);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!data.success || !Array.isArray(data.notifications)) throw new Error("failed");
      setItems(parseNotifications(data.notifications));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Opening the feed clears the badge: snapshot what WAS unread for the dots,
  // then mark everything read and tell the worker not to re-alert the backlog.
  useEffect(() => {
    if (loading || items.length === 0) return;
    const before = getReadIds();
    const fresh = items.filter((n) => !before.has(n.id)).map((n) => n.id);
    setUnreadIds(new Set(fresh));
    setUnread(fresh.length);
    markRead(items.map((n) => n.id));
    markSeen(items[0].id);
  }, [items, loading]);

  const itemsL = useLocalizedData(items, lang);
  const shown = useMemo(() => itemsL.slice(0, visible), [itemsL, visible]);

  const groups = useMemo(() => {
    const out: { label: string; items: AppNotification[] }[] = [];
    for (const n of shown) {
      const label = notifDay(n.createdAt, lang);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    }
    return out;
  }, [shown, lang]);

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("নোটিফিকেশন")}
        subtitle={
          loading
            ? tx("লোড হচ্ছে…")
            : error
              ? tx("লোড করা যায়নি")
              : unread > 0
                ? `${num(unread)}${tx("টি নতুন")}`
                : tx("সব আপডেট এক জায়গায়")
        }
        icon="bell"
        action={
          <button
            onClick={load}
            aria-label={tx("রিফ্রেশ")}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="search" size={13} />
            {tx("রিফ্রেশ")}
          </button>
        }
      />

      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="h-4 w-2/3 rounded-full bg-sand-dark" />
              <div className="mt-2 h-3 w-full rounded-full bg-sand-dark" />
              <div className="mt-1.5 h-3 w-1/3 rounded-full bg-sand-dark" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-3">
          <EmptyState icon="bell" title={tx("নোটিফিকেশন লোড করা যায়নি")} hint={tx("ইন্টারনেট চেক করে আবার চেষ্টা করুন")} />
        </div>
      ) : itemsL.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon="bell" title={tx("কোনো নোটিফিকেশন নেই")} hint={tx("নতুন আপডেট এলে এখানে দেখা যাবে")} />
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                {group.label}
                <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/10" />
              </h2>
              <div className="space-y-2">
                {group.items.map((n) => {
                  const href = notifHref(n);
                  const isUnread = unreadIds.has(n.id);
                  const inner = (
                    <>
                      <span className={`icon-tile !h-10 !w-10 shrink-0 ${notifTint(n.type)}`}>
                        <Icon name={notifIcon(n.type)} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="block truncate text-sm font-bold">{n.title}</span>
                          {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block whitespace-pre-line text-[13px] leading-snug text-ink-soft line-clamp-3">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
                          <span className="rounded-full bg-slate-200/60 px-1.5 py-0.5 font-semibold dark:bg-white/10">
                            {tx(notifTypeLabel(n.type))}
                          </span>
                          {n.createdAt && <span>{timeAgo(n.createdAt)}</span>}
                        </span>
                      </span>
                      {n.imageUrl && (
                        <img
                          src={n.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        />
                      )}
                      {href && <Icon name="chevron" size={18} className="shrink-0 text-ink-faint" />}
                    </>
                  );

                  return href ? (
                    <Link key={n.id} href={href} className="card card-hover flex items-start gap-3 p-4">
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className="card flex items-start gap-3 p-4">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {visible < itemsL.length && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setVisible((v) => v + PAGE)}
                className="btn-outline !px-6 !py-2.5 text-[13px]"
              >
                {tx("পুরনো নোটিফিকেশন")} ({num(itemsL.length - visible)})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
