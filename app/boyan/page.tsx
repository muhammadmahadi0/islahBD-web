"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { usePlayer } from "../../components/audio/player";
import {
  boyanToTrack, timeAgoBn, bnNum,
  type BoyanAudio, type BoyanCategory,
} from "../../lib/audio";

// Bayan section — ported from beta BoyanView + /api/boyan, restyled to the
// modern design system. MP3 lectures from api.islahbd.com/api/audios/.
export default function BoyanPage() {
  const [audios, setAudios] = useState<BoyanAudio[]>([]);
  const [categories, setCategories] = useState<BoyanCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [cat, setCat] = useState("all");
  const { play, track, isPlaying } = usePlayer();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/boyan");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "load failed");
      setAudios((prev) => {
        if (silent && prev.length) {
          const ids = new Set(prev.map((a) => a.id));
          const fresh = data.audios.filter((a: BoyanAudio) => !ids.has(a.id));
          return fresh.length ? [...fresh, ...prev] : prev;
        }
        return data.audios;
      });
      if (Array.isArray(data.categories)) setCategories(data.categories);
      setError("");
    } catch (e) {
      if (!silent) setError("বয়ান তালিকা লোড করা যাচ্ছে না — ইন্টারনেট চেক করুন।");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Silent background refresh like beta (new bayans surface without reload)
    refreshTimer.current = setInterval(() => load(true), 5 * 60 * 1000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [load]);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    return audios.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (!q) return true;
      return [a.title, a.speaker, a.location, a.category].some((s) => s.toLowerCase().includes(q));
    });
  }, [audios, submitted, cat]);

  const playAll = () => {
    if (!results.length) return;
    const tracks = results.map(boyanToTrack);
    play(tracks[0], tracks);
  };

  return (
    <div className="animate-fade-up">
      <PageHead
        title="বয়ান"
        subtitle={`সরাসরি MP3 লেকচার • ${bnNum(audios.length)}টি বয়ান`}
        icon="mic"
        action={
          results.length > 0 ? (
            <button onClick={playAll} className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-ink transition hover:bg-gold-600 hover:text-white active:scale-95">
              <Icon name="playfill" size={14} /> সব চালান
            </button>
          ) : undefined
        }
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
          placeholder="বয়ান, বক্তা বা স্থান খুঁজুন…"
          className="input !pl-11 !shadow-card"
        />
      </form>

      {categories.length > 0 && (
        <div className="rail -mx-3 flex gap-2 overflow-x-auto px-3 py-3">
          <button onClick={() => setCat("all")} className={`chip shrink-0 !px-4 !py-2 ${cat === "all" ? "chip-active" : ""}`}>
            সব
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.name)}
              className={`chip shrink-0 !px-4 !py-2 ${cat === c.name ? "chip-active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 mt-1 text-xs font-bold text-ink-faint">
        {bnNum(results.length)}টি ফলাফল
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
        <EmptyState icon="mic" title={error} hint="পুনরায় চেষ্টা করুন" />
      ) : results.length === 0 ? (
        <EmptyState icon="search" title="কিছু পাওয়া যায়নি" hint="অন্য শব্দে খুঁজে দেখুন" />
      ) : (
        <div className="space-y-2">
          {results.slice(0, 150).map((a) => {
            const active = track?.id === `boyan-${a.id}`;
            const sub = [a.speaker, a.location, timeAgoBn(a.uploadDate)].filter(Boolean).join(" • ");
            return (
              <div
                key={a.id}
                onClick={() => play(boyanToTrack(a), results.map(boyanToTrack))}
                className={`card card-hover flex cursor-pointer items-center gap-3 p-3 ${
                  active ? "!border-primary-600/40 !bg-primary-50" : ""
                }`}
              >
                <span className={`icon-tile shrink-0 ${active ? "bg-primary-600 text-white" : "bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100"}`}>
                  <Icon name="mic" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-bold leading-snug ${active ? "text-primary-700" : ""}`}>
                    {a.title}
                  </div>
                  {sub && <div className="mt-0.5 truncate text-xs text-ink-faint">{sub}</div>}
                  {a.category && <span className="chip mt-1 !py-0.5 !text-[10px]">{a.category}</span>}
                </div>
                {a.duration && a.duration !== "00:00" && (
                  <span className="shrink-0 text-xs font-bold tabular-nums text-ink-faint">
                    {a.duration}
                  </span>
                )}
                {active && isPlaying ? (
                  <span className="flex h-4 items-end gap-[3px] pr-1 text-primary-600">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="eq-bar h-full" style={{ animationDelay: `${i * 0.22}s` }} />
                    ))}
                  </span>
                ) : (
                  <a
                    href={a.audioUrl} download
                    onClick={(e) => e.stopPropagation()}
                    aria-label="download"
                    className="shrink-0 rounded-xl p-2 text-ink-faint transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Icon name="download" size={17} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
