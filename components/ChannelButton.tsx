"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { CHANNELS, channelLabel } from "../lib/channels";
import { useLang, useTx } from "../store/language-store";

/**
 * Single "চ্যানেল" button for the Others page — both channels live inside it
 * (stacked avatars + names) and it opens the channel directory at `/channels`.
 */
export default function ChannelButton() {
  const tx = useTx();
  const lang = useLang();
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        CHANNELS.map(async (c) => {
          try {
            const res = await fetch(`/api/channel/${c.id}/meta`);
            const data = await res.json();
            if (data.success && data.channel?.avatar) {
              return [c.id, data.channel.avatar as string] as const;
            }
          } catch {
            // monogram fallback below
          }
          return [c.id, ""] as const;
        })
      );
      if (!cancelled) setAvatars(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href="/channels" className="card card-hover mt-3 flex items-center gap-3 p-4">
      <span className="flex -space-x-3">
        {CHANNELS.map((c) => (
          <span
            key={c.id}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100 dark:border-slate-800"
          >
            {avatars[c.id] ? (
              <img src={avatars[c.id]} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <Icon name="youtube" size={18} />
            )}
          </span>
        ))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-bold">
          <Icon name="youtube" size={16} className="text-primary-600" />
          {tx("চ্যানেল")}
        </span>
        <span className="block truncate text-xs text-ink-faint">
          {CHANNELS.map((c) => channelLabel(c, lang)).join(" • ")}
        </span>
      </span>
      <Icon name="chevron" size={18} className="text-ink-faint" />
    </Link>
  );
}
