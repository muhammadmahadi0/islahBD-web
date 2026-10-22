"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PageHead, EmptyState } from "../../../components/ui";
import { Icon } from "../../../components/icons";
import { usePlayerStore, type Track } from "../../../store/player-store";
import { getChannelById } from "../../../lib/channels";
import { bnNum } from "../../../lib/audio";
import {
  fmtDuration,
  fmtPublishedBn,
  fmtViewsBn,
  type ChannelVideo,
} from "../../../lib/channel-videos";
import AddToPlaylistMenu from "../../../components/audio/AddToPlaylistMenu";
import { useNum, useTx } from "../../../store/language-store";

// Channel browser — keyless YouTube listings (InnerTube via /api/channel),
// ported from the master branch and restyled for the emerald/gold theme.
// Videos play through the existing YouTube engine.

type Filter = "all" | "bayan" | "short";
type Sort = "newest" | "popular" | "oldest";

const SHORT_MAX_SECONDS = 5 * 60;

export default function ChannelPage() {
  const tx = useTx();
  const num = useNum();
  const params = useParams<{ id: string }>();
  const channelId = decodeURIComponent(params?.id ?? "");
  const registry = getChannelById(channelId);

  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [indexing, setIndexing] = useState(false);
  // The indexer can load 1000+ uploads; render them in windows of 60 so the
  // DOM stays light on phones.
  const [visible, setVisible] = useState(60);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  // Background indexer (refs, not state — no re-renders) so Popular/Oldest
  // rank the WHOLE catalog, not just the first 100 uploads.
  const indexingRef = useRef(false);
  const indexedForRef = useRef<string | null>(null);
  const videosRef = useRef<ChannelVideo[]>(videos);
  const tokenRef = useRef<string | null>(nextToken);
  videosRef.current = videos;
  tokenRef.current = nextToken;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    indexedForRef.current = null;
    try {
      const res = await fetch(`/api/channel/${encodeURIComponent(channelId)}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.videos)) throw new Error("load failed");
      setVideos(data.videos as ChannelVideo[]);
      setNextToken(data.nextPageToken || null);
      if (data.channel?.avatar) setAvatar(data.channel.avatar);
    } catch {
      setError(tx("চ্যানেলের ভিডিও লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।"));
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    load();
  }, [load]);

  // Popular/Oldest — and any title search — must cover every upload, not just
  // the first page. Newest with no query is the native API order, so it needs
  // no indexing; otherwise we walk the continuation tokens in the background.
  useEffect(() => {
    if (loading || (sort === "newest" && !query.trim())) return;
    if (indexingRef.current) return;
    if (indexedForRef.current === channelId) return;
    const startToken = tokenRef.current;
    if (!startToken) {
      indexedForRef.current = channelId;
      return;
    }
    indexingRef.current = true;
    let cancelled = false;
    (async () => {
      setIndexing(true);
      const seen = new Set(videosRef.current.map((v) => v.videoId || v.id));
      let token: string | null = startToken;
      while (token && !cancelled) {
        let page: {
          success?: boolean;
          videos?: ChannelVideo[];
          nextPageToken?: string;
        } | null = null;
        try {
          const response: Response = await fetch(
            `/api/channel/${encodeURIComponent(channelId)}/more/${encodeURIComponent(token)}`
          );
          page = await response.json();
        } catch {
          break;
        }
        if (!page?.success || !Array.isArray(page.videos)) break;
        const fresh = page.videos.filter((v) => !seen.has(v.videoId || v.id));
        fresh.forEach((v) => seen.add(v.videoId || v.id));
        token = page.nextPageToken || null;
        if (cancelled) break;
        if (fresh.length > 0) setVideos((prev) => [...prev, ...fresh]);
        setNextToken(token);
      }
      if (!cancelled) indexedForRef.current = channelId;
      indexingRef.current = false;
      setIndexing(false);
    })();
    return () => {
      cancelled = true;
      indexingRef.current = false;
    };
  }, [sort, channelId, loading, query]);

  const results = useMemo(() => {
    let list = videos;
    if (filter === "bayan") list = list.filter((v) => (v.duration || 0) > SHORT_MAX_SECONDS);
    else if (filter === "short") list = list.filter((v) => (v.duration || 0) <= SHORT_MAX_SECONDS);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((v) => (v.title || "").toLowerCase().includes(q));
    if (sort === "popular") return [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    // Uploads arrive in exact newest-first order, so oldest is just reversed.
    if (sort === "oldest") return [...list].reverse();
    return list;
  }, [videos, filter, sort, query]);

  const toTrack = useCallback(
    (video: ChannelVideo): Track => ({
      id: video.videoId || video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration || 0,
      channelName: registry.nameBn,
      videoId: video.videoId || video.id,
      publishedAt: video.publishedAt || "",
      sharePath: `/channels/${channelId}?play=${encodeURIComponent(video.videoId || video.id)}`,
    }),
    [channelId, registry.nameBn]
  );

  const tracks = useMemo(() => results.map(toTrack), [results, toTrack]);
  const shown = useMemo(() => results.slice(0, visible), [results, visible]);

  // A new channel/filter/sort/search starts the window over.
  useEffect(() => {
    setVisible(60);
  }, [filter, sort, channelId, query]);

  const playAt = (index: number) => {
    if (!tracks[index]) return;
    playTrack(tracks[index], tracks, index);
  };

  // Shared link (/channels/<id>?play=<videoId>) auto-plays that clip once.
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

  const loadMore = async () => {
    if (!nextToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/channel/${encodeURIComponent(channelId)}/more/${encodeURIComponent(nextToken)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v.videoId || v.id));
          const fresh = (data.videos as ChannelVideo[]).filter((v) => !seen.has(v.videoId || v.id));
          return [...prev, ...fresh];
        });
        setNextToken(data.nextPageToken || null);
      }
    } catch {
      // keep the already-loaded list
    } finally {
      setLoadingMore(false);
    }
  };

  const bayanCount = videos.filter((v) => (v.duration || 0) > SHORT_MAX_SECONDS).length;
  const shortCount = videos.length - bayanCount;

  return (
    <div className="animate-fade-up">
      <PageHead
        title={registry.nameBn}
        subtitle={`${registry.handle} • ${num(results.length)}${tx("টি ভিডিও")}`}
        backHref="/channels"
        icon="youtube"
        action={
          avatar ? (
            <span className="h-11 w-11 overflow-hidden rounded-full border border-white/30 shadow">
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            </span>
          ) : undefined
        }
      />

      {showSearch && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-[rgba(30,41,59,0.65)]">
          <Icon name="search" size={18} className="shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx("এই চ্যানেলের ভিডিও খুঁজুন…")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label={tx("মুছুন")}
              className="shrink-0 rounded-full p-1 text-ink-faint transition hover:text-ink"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      )}

      <div className="-mx-3 mt-3 flex items-center gap-2 px-3">
        <div className="rail flex flex-1 items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: "all", label: `${tx("সব")} (${num(videos.length)})` },
              { id: "bayan", label: `${tx("বয়ান")} (${num(bayanCount)})` },
              { id: "short", label: `${tx("ক্লিপস")} (${num(shortCount)})` },
            ] as { id: Filter; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`chip shrink-0 !px-4 !py-2 ${filter === f.id ? "chip-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-slate-200 dark:bg-white/10" />
          {(
            [
              { id: "newest", label: tx("নতুন") },
              { id: "popular", label: tx("জনপ্রিয়") },
              { id: "oldest", label: tx("পুরনো") },
            ] as { id: Sort; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`chip shrink-0 !px-4 !py-2 ${sort === s.id ? "chip-active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setShowSearch((open) => {
              if (open) setQuery("");
              return !open;
            })
          }
          aria-label={tx("ভিডিও খুঁজুন")}
          aria-pressed={showSearch}
          className={`chip shrink-0 !px-3 !py-2 ${showSearch ? "chip-active" : ""}`}
        >
          <Icon name="search" size={16} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse overflow-hidden">
              <div className="aspect-video bg-sand-dark" />
              <div className="space-y-2 p-3">
                <div className="h-3.5 w-11/12 rounded-full bg-sand-dark" />
                <div className="h-3 w-1/2 rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState icon="youtube" title={error} hint={tx("পুনরায় চেষ্টা করুন")} />
      ) : results.length === 0 && !indexing ? (
        <EmptyState
          icon="search"
          title={
            query.trim()
              ? `“${query.trim()}” ${tx("লিখে কোনো ভিডিও পাওয়া যায়নি")}`
              : tx("কোনো ভিডিও পাওয়া যায়নি")
          }
          hint={query.trim() ? tx("অন্য শব্দ দিয়ে খুঁজুন") : tx("অন্য ফিল্টার চেষ্টা করুন")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((video, i) => {
              const id = video.videoId || video.id;
              const active = currentTrack?.videoId === id;
              const meta = [fmtViewsBn(video.views), fmtPublishedBn(video.publishedAt)]
                .filter(Boolean)
                .join(" • ");
              const duration = fmtDuration(video.duration);
              return (
                <div key={id} className={`card overflow-hidden ${active ? "!border-primary-600/40 !bg-primary-50/60" : ""}`}>
                  <button onClick={() => playAt(i)} className="group block w-full text-left" aria-label={video.title}>
                    <span className="relative block aspect-video overflow-hidden bg-sand">
                      <img
                        src={video.thumbnail}
                        alt=""
                        loading={i < 4 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow">
                          <Icon name="playfill" size={20} />
                        </span>
                      </span>
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                          {isPlaying ? (
                            <span className="flex h-4 items-end gap-[3px] text-primary-100">
                              {[0, 1, 2].map((k) => (
                                <span key={k} className="eq-bar h-full" style={{ animationDelay: `${k * 0.22}s` }} />
                              ))}
                            </span>
                          ) : (
                            <Icon name="pause" size={22} className="text-white" />
                          )}
                        </span>
                      )}
                      {duration && (
                        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                          {duration}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="flex items-start gap-2 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-bold leading-snug">{video.title}</p>
                      {meta && <p className="mt-1 text-[11px] text-ink-faint">{meta}</p>}
                    </div>
                    <button
                      onClick={() => setMenuTrack(tracks[i])}
                      aria-label={tx("প্লেলিস্টে রাখুন")}
                      className="shrink-0 rounded-xl p-1.5 text-ink-faint transition hover:bg-primary-50 hover:text-primary-700"
                    >
                      <Icon name="plus" size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {indexing && (
            <p className="mt-5 text-center text-xs font-semibold text-primary-700">
              {query.trim() ? tx("সব ভিডিওতে খোঁজা হচ্ছে…") : tx("সব ভিডিও সাজানো হচ্ছে…")} (
              {bnNum(videos.length)})
            </p>
          )}
          {(visible < results.length || (sort === "newest" && !!nextToken)) && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => {
                  const canReveal = visible < results.length;
                  setVisible((v) => v + 60);
                  if (!canReveal && sort === "newest") loadMore();
                }}
                disabled={loadingMore}
                className="btn-outline !px-6 !py-2.5 text-[13px] disabled:opacity-60"
              >
                {loadingMore ? tx("লোড হচ্ছে…") : tx("আরও দেখুন")}
              </button>
            </div>
          )}
        </>
      )}

      {menuTrack && <AddToPlaylistMenu track={menuTrack} onClose={() => setMenuTrack(null)} />}
    </div>
  );
}
