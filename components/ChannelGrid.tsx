"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { useTx } from "../store/language-store";
import { CHANNELS } from "../lib/channels";

interface ChannelMeta {
  avatar: string;
}

/**
 * Channel cards for the Others section + `/channels`. Avatars come from the
 * featherweight meta endpoint (never the full video listing) and fall back to
 * an monogram when the lookup fails.
 */
export default function ChannelGrid() {
  const tx = useTx();
  const [meta, setMeta] = useState<Record<string, ChannelMeta>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        CHANNELS.map(async (c) => {
          try {
            const res = await fetch(`/api/channel/${c.id}/meta`);
            const data = await res.json();
            if (data.success && data.channel) {
              return [c.id, { avatar: data.channel.avatar || "" }] as const;
            }
          } catch {
            // monogram fallback below
          }
          return [c.id, { avatar: "" }] as const;
        })
      );
      if (!cancelled) setMeta(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {CHANNELS.map((c) => {
        const avatar = meta[c.id]?.avatar || "";
        return (
          <Link
            key={c.id}
            href={`/channels/${c.id}`}
            className="card card-hover flex items-center gap-3 p-3.5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-lg font-bold text-gold-100">
              {avatar ? (
                <img src={avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <Icon name="youtube" size={22} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{c.nameBn}</span>
              <span className="block truncate text-xs text-ink-faint">
                {c.handle} • {tx("ভিডিও দেখুন")}
              </span>
            </span>
            <Icon name="chevron" size={18} className="text-ink-faint" />
          </Link>
        );
      })}
    </div>
  );
}
