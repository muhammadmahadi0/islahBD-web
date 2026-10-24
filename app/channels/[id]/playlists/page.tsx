"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHead, EmptyState } from "../../../../components/ui";
import { Icon } from "../../../../components/icons";
import { usePlayerStore, type Track } from "../../../../store/player-store";
import { useLang, useNum, useTx } from "../../../../store/language-store";
import { channelLabel, getChannelById } from "../../../../lib/channels";
import {
  fmtDuration,
  fmtPublished,
  fmtViews,
  type ChannelVideo,
} from "../../../../lib/channel-videos";
import { useLocalizedData, translateDeep } from "../../../../lib/content-translate";

interface ChannelPlaylist {
  id: string;
  title: string;
  thumbnail: string;
  itemCount: number;
}

const EMPTY_PLAYLISTS: ChannelPlaylist[] = [];
const EMPTY_VIDEOS: ChannelVideo[] = [];

export default function ChannelPlaylistsPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const params = useParams<{ id: string }>();
  const channelId = decodeURIComponent(params?.id ?? "");
  const registry = getChannelById(channelId);

  const [playlists, setPlaylists] = useState<ChannelPlaylist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/playlists/${encodeURIComponent(channelId)}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.playlists)) throw new Error("load failed");
      setPlaylists(data.playlists as ChannelPlaylist[]);
    } catch {
      setError("চ্যানেলের প্লেলিস্ট লোড করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    load();
  }, [load]);

  const playlistsL = useLocalizedData(playlists ?? EMPTY_PLAYLISTS, lang);

  return (
    <div className="animate-fade-up">
      <PageHead
        title={tx("চ্যানেলের প্লেলিস্ট")}
        subtitle={`${channelLabel(registry, lang)}${
          playlistsL.length ? ` • ${num(playlistsL.length)}${tx("টি প্লেলিস্ট")}` : ""
        }`}
        backHref={`/channels/${encodeURIComponent(channelId)}`}
        icon="playlist"
      />

      {loading ? (
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card flex animate-pulse items-center gap-3 p-3">
              <div className="h-16 w-24 shrink-0 rounded-xl bg-sand-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-4/5 rounded-full bg-sand-dark" />
                <div className="h-3 w-1/2 rounded-full bg-sand-dark" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card mt-3 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Icon name="playlist" size={22} />
          </span>
          <p className="mt-3 text-sm font-bold">{tx(error)}</p>
          <button onClick={load} className="btn-outline mt-3 !py-2 text-[13px]">
            {tx("আবার চেষ্টা করুন")}
          </button>
        </div>
      ) : playlistsL.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            icon="playlist"
            title={tx("এই চ্যানেলে এখনো কোনো পাবলিক প্লেলিস্ট নেই।")}
          />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {playlistsL.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              channelId={channelId}
              channelName={channelLabel(registry, lang)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistCard({
  playlist,
  channelId,
  channelName,
}: {
  playlist: ChannelPlaylist;
  channelId: string;
  channelName: string;
}) {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [expanded, setExpanded] = useState(false);
  const [videos, setVideos] = useState<ChannelVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  const videosL = useLocalizedData(videos ?? EMPTY_VIDEOS, lang);

  const load = useCallback(async (): Promise<ChannelVideo[]> => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/playlist-items/${encodeURIComponent(playlist.id)}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.videos)) throw new Error("load failed");
      const next = data.videos as ChannelVideo[];
      setVideos(next);
      return next;
    } catch {
      setError("প্লেলিস্টের ভিডিও লোড করা যাচ্ছে না।");
      setVideos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [playlist.id]);

  const toTrack = useCallback(
    (video: ChannelVideo): Track => ({
      id: video.videoId || video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration || 0,
      channelName,
      videoId: video.videoId || video.id,
      publishedAt: video.publishedAt || "",
      sharePath: `/channels/${channelId}/playlists`,
    }),
    [channelId, channelName]
  );

  const tracks = useMemo(() => videosL.map(toTrack), [videosL, toTrack]);

  const toggle = () => {
    if (!expanded && !videos && !loading) void load();
    setExpanded((open) => !open);
  };

  const playAll = async () => {
    let list = videosL;
    if (!videos || videosL.length === 0) {
      const loaded = await load();
      if (loaded.length === 0) return;
      list = await translateDeep(loaded, lang);
    }
    const queue = list.map(toTrack);
    if (queue.length === 0) return;
    setExpanded(true);
    playTrack(queue[0], queue, 0);
  };

  const playOne = (index: number) => {
    const track = tracks[index];
    if (!track) return;
    if (currentTrack?.videoId === track.videoId) setIsPlaying(!isPlaying);
    else playTrack(track, tracks, index);
  };

  const retry = () => {
    setVideos(null);
    setError("");
    void load();
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 to-primary-900">
          {playlist.thumbnail ? (
            <img
              src={playlist.thumbnail}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-gold-100">
              <Icon name="playlist" size={24} />
            </span>
          )}
          {playlist.itemCount > 0 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white">
              {num(playlist.itemCount)}
            </span>
          )}
        </div>

        <button onClick={toggle} className="min-w-0 flex-1 text-left">
          <p className="line-clamp-2 text-[13px] font-bold leading-snug">{playlist.title}</p>
          <p className="mt-1 text-[11px] text-ink-faint">
            YouTube • {num(playlist.itemCount)}{tx("টি ভিডিও")}
          </p>
        </button>

        <button
          onClick={playAll}
          disabled={loading}
          aria-label={tx("সব চালান")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow transition hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Icon name="playfill" size={15} />
        </button>
        <button
          onClick={toggle}
          aria-label={expanded ? tx("বন্ধ করুন") : tx("প্লেলিস্ট")}
          className="shrink-0 rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
        >
          <Icon
            name="chevron"
            size={17}
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-200/70 dark:border-white/10">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs font-bold text-ink-faint">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              {tx("লোড হচ্ছে…")}
            </div>
          ) : error ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[12px] font-semibold text-ink-faint">{tx(error)}</p>
              <button onClick={retry} className="btn-outline mt-2.5 !px-5 !py-1.5 text-xs">
                {tx("আবার চেষ্টা করুন")}
              </button>
            </div>
          ) : videosL.length === 0 ? (
            <p className="px-4 py-5 text-center text-[12px] font-semibold text-ink-faint">
              {tx("প্লেলিস্টটি খালি বা পাওয়া যায়নি।")}
            </p>
          ) : (
            <div>
              {videosL.map((video, index) => {
                const id = video.videoId || video.id;
                const active = currentTrack?.videoId === id;
                const duration = fmtDuration(video.duration);
                const meta = [fmtViews(video.views, lang), fmtPublished(video.publishedAt, lang)]
                  .filter(Boolean)
                  .join(" • ");
                return (
                  <button
                    key={id}
                    onClick={() => playOne(index)}
                    className={`flex w-full items-center gap-3 border-t border-slate-200/70 p-3 text-left transition first:border-t-0 dark:border-white/10 ${
                      active
                        ? "bg-primary-50/60 dark:bg-primary-900/20"
                        : "hover:bg-sand/60 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center text-[11px] font-bold tabular-nums text-ink-faint">
                      {num(index + 1)}
                    </span>
                    <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                      {duration && (
                        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold tabular-nums text-white">
                          {num(duration)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[12px] font-bold leading-snug">
                        {video.title}
                      </span>
                      {meta && (
                        <span className="mt-0.5 block text-[10px] text-ink-faint">{meta}</span>
                      )}
                    </span>
                    {active && isPlaying && (
                      <span className="flex h-4 shrink-0 items-end gap-[3px] text-primary-600">
                        {[0, 1, 2].map((k) => (
                          <span
                            key={k}
                            className="eq-bar h-full"
                            style={{ animationDelay: `${k * 0.22}s` }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
