"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { usePlayer } from "../../components/audio/player";
import {
  hamdNaatToTrack, timeAgoBn, bnNum,
  type HamdNaatItem, type HamdNaatType,
} from "../../lib/audio";

// Hamd/Naat section — ported from beta HamdNaatView + /api/hamdnaat,
// restyled to the modern design system. Source: api.islahbd.com/api/nasheeds/
// Audio items play in the global player; video items open YouTube.
type TypeFilter = "all" | HamdNaatType;

export default function HamdNaatPage() {
  const [items, setItems] = useState<HamdNaatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const { play, track, isPlaying } = usePlayer();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hamdnaat");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "load failed");
      setItems(data.items);
      setError("");
    } catch (e) {
      setError("হামদ-নাত তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    return items.filter((it) => {
      if (type !== "all" && it.type !== type) return false;
      if (!q) return true;
      return [it.title, it.artist, it.lyricist, it.composer, it.writingPlace]
        .some((s) => s.toLowerCase().includes(q));
    });
  }, [items, submitted, type]);

  const audioCount = items.filter((i) => i.type === "audio").length;
  const videoCount = items.filter((i) => i.type === "video").length;

  return (
    <div className="animate-fade-up">
      <PageHead
        title="হামদ ও নাত"
        subtitle={`অডিও ${bnNum(audioCount)} • ভিডিও ${bnNum(videoCount)}`}
        icon="music"
      />

      <form
        className="relative mt-3"
        onSubmit={(e) => { e.preventDefault(); setSubmitted(query); }}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="হামদ, নাত বা শিল্পী খুঁজুন…"
          className="input !pl-11 !shadow-card"
        />
      </form>

      <div className="flex gap-2 py-3">
        {(
          [
            { id: "all", label: `সব (${bnNum(items.length)})` },
            { id: "audio", label: `অডিও (${bnNum(audioCount)})` },
            { id: "video", label: `ভিডিও (${bnNum(videoCount)})` },
          ] as { id: TypeFilter; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setType(f.id)}
            className={`chip !px-4 !py-2 ${type === f.id ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="card flex animate-pulse items-center gap-3 p-3">
              <div className="h-12 w-12 rounded-2xl bg-sand-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded-full bg-sand-dark" />
                <div className="h-3 w-1/2 rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState icon="music" title={error} />
      ) : results.length === 0 ? (
        <EmptyState icon="search" title="কিছু পাওয়া যায়নি" hint="অন্য শব্দে খুঁজে দেখুন" />
      ) : (
        <div className="space-y-2">
          {results.slice(0, 150).map((it) => {
            const isVideo = it.type === "video";
            const active = track?.id === `hamd-${it.id}`;
            const sub = [it.artist, it.writingPlace, timeAgoBn(it.createdAt)].filter(Boolean).join(" • ");
            const credits = [it.lyricist, it.composer].filter(Boolean).join(" • ");
            return (
              <div
                key={it.id}
                onClick={() => { if (!isVideo) play(hamdNaatToTrack(it), results.filter((r) => r.type === "audio").map(hamdNaatToTrack)); }}
                className={`card card-hover flex items-center gap-3 p-3 ${
                  isVideo ? "" : "cursor-pointer"
                } ${active ? "!border-primary-600/40 !bg-primary-50" : ""}`}
              >
                <span className="icon-tile shrink-0 overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100">
                  {isVideo && it.youtubeId ? (
                    <img src={`https://i.ytimg.com/vi/${it.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="music" size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold leading-snug">{it.title}</div>
                  {sub && <div className="mt-0.5 truncate text-xs text-ink-faint">{sub}</div>}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`rounded-md px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${isVideo ? "bg-red-50 text-red-500" : "bg-primary-50 text-primary-700"}`}>
                      {isVideo ? "ভিডিও" : "অডিও"}
                    </span>
                    {credits && <span className="truncate text-[11px] text-ink-faint">{credits}</span>}
                  </div>
                </div>
                {isVideo && it.youtubeId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${it.youtubeId}`}
                    target="_blank" rel="noreferrer"
                    aria-label="watch"
                    className="btn-ghost shrink-0 !rounded-xl !p-2.5"
                  >
                    <Icon name="playfill" size={16} />
                  </a>
                ) : active && isPlaying ? (
                  <span className="flex h-4 items-end gap-[3px] pr-1 text-primary-600">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="eq-bar h-full" style={{ animationDelay: `${i * 0.22}s` }} />
                    ))}
                  </span>
                ) : it.audioUrl ? (
                  <a
                    href={it.audioUrl} download
                    onClick={(e) => e.stopPropagation()}
                    aria-label="download"
                    className="shrink-0 rounded-xl p-2 text-ink-faint transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Icon name="download" size={17} />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
