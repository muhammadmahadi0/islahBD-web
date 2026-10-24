"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { usePlayerStore, type Track } from "../../store/player-store";
import AddToPlaylistMenu from "../../components/audio/AddToPlaylistMenu";
import { shortToTrack, type ShortClip, type ShortClipType } from "../../lib/shorts";
import { useLang, useNum, useTimeAgo, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

// Short clips — audio clips play through the stream engine, video clips
// through the YouTube engine. Search, type filter, silent refresh, queue
// playback and playlist menu, mirroring beta's ShortsView.
type TypeFilter = "all" | ShortClipType;

export default function MediaPage() {
  const tx = useTx();
  const num = useNum();
  const timeAgo = useTimeAgo();
  const lang = useLang();
  const [clips, setClips] = useState<ShortClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/shorts");
      const data = await res.json();
      if (!data.success || !Array.isArray(data.clips)) throw new Error("load failed");
      setClips((prev) => {
        if (silent && prev.length) {
          const ids = new Set(prev.map((c) => c.id));
          const fresh = (data.clips as ShortClip[]).filter((c) => !ids.has(c.id));
          return fresh.length ? [...fresh, ...prev] : prev;
        }
        return data.clips;
      });
      setError("");
    } catch {
      if (!silent) setError("ক্লিপ তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    refreshTimer.current = setInterval(() => load(true), 5 * 60 * 1000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [load]);

  const clipsL = useLocalizedData(clips, lang);
  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    return clipsL.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q);
    });
  }, [clipsL, submitted, type]);

  const tracks = useMemo(() => results.map(shortToTrack), [results]);

  const playAt = (index: number) => {
    if (!tracks[index]) return;
    playTrack(tracks[index], tracks, index);
  };

  // Shared link (/media?play=short-123) auto-plays that exact clip once.
  const autoPlayed = useRef(false);
  useEffect(() => {
    if (autoPlayed.current || !tracks.length) return;
    const shared = new URLSearchParams(window.location.search).get("play");
    if (!shared) return;
    const idx = tracks.findIndex((t) => t.id === shared);
    if (idx < 0) return;
    autoPlayed.current = true;
    playTrack(tracks[idx], tracks, idx);
  }, [tracks, playTrack]);

  const audioCount = clipsL.filter((c) => c.type === "audio").length;
  const videoCount = clipsL.filter((c) => c.type === "video").length;

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("সংক্ষিপ্ত ক্লিপস")}
        subtitle={`${tx("হাইলাইটস")} • ${num(clipsL.length)}${tx("টি")}`}
        icon="play"
      />

      <form className="relative mt-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(query); }}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="search" size={18} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tx("ক্লিপের নাম খুঁজুন…")}
          className="input !pl-11 !shadow-card"
        />
      </form>

      <div className="rail -mx-3 flex items-center gap-2 overflow-x-auto px-3 py-3">
        {(
          [
            { id: "all", label: `${tx("সব")} (${num(clipsL.length)})` },
            { id: "audio", label: `${tx("অডিও")} (${num(audioCount)})` },
            { id: "video", label: `${tx("ভিডিও")} (${num(videoCount)})` },
          ] as { id: TypeFilter; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setType(f.id)}
            className={`chip shrink-0 !px-4 !py-2 ${type === f.id ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-2 mt-1 text-xs font-bold text-ink-faint">{num(results.length)}{tx("টি ফলাফল")}</div>

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
        <EmptyState icon="play" title={tx(error)} hint={tx("পুনরায় চেষ্টা করুন")} />
      ) : results.length === 0 ? (
        <EmptyState icon="search" title={tx("কিছু পাওয়া যায়নি")} hint={tx("অন্য শব্দে খুঁজে দেখুন")} />
      ) : (
        <div className="space-y-2">
          {results.slice(0, 150).map((clip, i) => {
            const active = currentTrack?.id === `short-${clip.id}`;
            const isVideo = clip.type === "video";
            return (
              <div
                key={clip.id}
                onClick={() => playAt(i)}
                className={`card card-hover flex cursor-pointer items-center gap-3 p-3 ${active ? "!border-primary-600/40 !bg-primary-50" : ""}`}
              >
                <span className={`icon-tile shrink-0 overflow-hidden ${active ? "bg-primary-600 text-white" : "bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100"}`}>
                  {isVideo && clip.youtubeId ? (
                    <img
                      src={`https://i.ytimg.com/vi/${clip.youtubeId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name={isVideo ? "playfill" : "mic"} size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-bold leading-snug ${active ? "text-primary-700" : ""}`}>{clip.title}</div>
                  {clip.createdAt && (
                    <div className="mt-0.5 truncate text-xs text-ink-faint">{timeAgo(clip.createdAt)}</div>
                  )}
                  <span className={`mt-1 inline-block rounded-md px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${isVideo ? "bg-red-50 text-red-500" : "bg-primary-50 text-primary-700"}`}>
                    {isVideo ? tx("ভিডিও") : tx("অডিও")}
                  </span>
                </div>
                {active && isPlaying ? (
                  <span className="flex h-4 items-end gap-[3px] pr-1 text-primary-600">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="eq-bar h-full" style={{ animationDelay: `${k * 0.22}s` }} />
                    ))}
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuTrack(tracks[i]); }}
                    aria-label={tx("প্লেলিস্টে রাখুন")}
                    className="shrink-0 rounded-xl p-2 text-ink-faint transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Icon name="plus" size={17} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {menuTrack && <AddToPlaylistMenu track={menuTrack} onClose={() => setMenuTrack(null)} />}
    </div>
  );
}
