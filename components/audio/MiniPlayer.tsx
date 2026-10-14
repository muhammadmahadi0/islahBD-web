"use client";
import { useState } from "react";
import { usePlayer } from "./player";
import { Icon } from "../icons";
import { formatSecs } from "../../lib/audio";

function EqBars() {
  return (
    <span className="flex h-4 items-end gap-[3px] text-primary-600">
      {[0, 1, 2].map((i) => (
        <span key={i} className="eq-bar h-full" style={{ animationDelay: `${i * 0.22}s` }} />
      ))}
    </span>
  );
}

/** Global mini-player — ported from beta MiniPlayer. Sits above bottom nav. */
export default function MiniPlayer() {
  const { track, queue, isPlaying, isLoading, currentTime, duration, toggle, next, prev, seek, close, play } =
    usePlayer();
  const [open, setOpen] = useState(false);

  if (!track) return null;
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <div className="fixed inset-x-0 bottom-[76px] z-40 px-3 sm:px-5">
        <div className="card mx-auto max-w-5xl overflow-hidden !rounded-2xl">
          <div className="flex cursor-pointer items-center gap-3 p-2.5" onClick={() => setOpen(true)}>
            <span className="icon-tile !h-11 !w-11 bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100">
              <Icon name="music" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold leading-snug">{track.title}</div>
              {track.subtitle && <div className="truncate text-[11px] text-ink-faint">{track.subtitle}</div>}
            </div>
            {isPlaying ? <EqBars /> : null}
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-ink-faint">
              {formatSecs(currentTime)}{duration > 0 ? ` / ${formatSecs(duration)}` : ""}
            </span>
            <button
              aria-label="previous"
              className="rounded-xl p-2 text-ink-soft transition hover:bg-primary-50 active:scale-95"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <Icon name="prev" size={18} />
            </button>
            <button
              aria-label="play-pause"
              className="rounded-2xl bg-primary-600 p-2.5 text-white shadow-card transition hover:bg-primary-700 active:scale-95"
              onClick={(e) => { e.stopPropagation(); toggle(); }}
            >
              {isLoading ? (
                <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Icon name={isPlaying ? "pause" : "playfill"} size={18} />
              )}
            </button>
            <button
              aria-label="next"
              className="rounded-xl p-2 text-ink-soft transition hover:bg-primary-50 active:scale-95"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <Icon name="next" size={18} />
            </button>
          </div>
          <div className="h-1 bg-primary-50">
            <div className="h-full bg-gradient-to-r from-primary-600 to-gold transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <span className="icon-tile h-14 w-14 bg-gradient-to-br from-primary-700 to-primary-900 text-gold-100">
                <Icon name="music" size={26} />
              </span>
              <button aria-label="close" className="rounded-xl p-2 text-ink-faint hover:bg-sand" onClick={() => setOpen(false)}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <h3 className="mt-3 text-lg font-bold leading-snug">{track.title}</h3>
            {track.subtitle && <p className="text-sm text-ink-faint">{track.subtitle}</p>}
            <input
              type="range" min={0} max={duration || 0} step={1} value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="mt-4 w-full" aria-label="seek"
            />
            <div className="flex justify-between text-[11px] font-bold tabular-nums text-ink-faint">
              <span>{formatSecs(currentTime)}</span>
              <span>{formatSecs(duration)}</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <button aria-label="previous" className="btn-ghost !rounded-full !p-3" onClick={prev}>
                <Icon name="prev" size={20} />
              </button>
              <button aria-label="play-pause" className="btn-primary !rounded-full !p-4" onClick={toggle}>
                <Icon name={isPlaying ? "pause" : "playfill"} size={22} />
              </button>
              <button aria-label="next" className="btn-ghost !rounded-full !p-3" onClick={next}>
                <Icon name="next" size={20} />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {track.audioUrl && (
                <a href={track.audioUrl} download className="btn-outline flex-1 !py-2 text-[13px]">
                  <Icon name="download" size={16} /> ডাউনলোড
                </a>
              )}
              <button className="btn-ghost flex-1 !py-2 text-[13px]" onClick={close}>
                বন্ধ করুন
              </button>
            </div>
            {queue.length > 1 && (
              <div className="mt-4 max-h-48 overflow-auto">
                <div className="mb-1 text-xs font-bold text-ink-faint">পরবর্তী ({queue.length})</div>
                {queue.slice(0, 20).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => play(q)}
                    className={`block w-full truncate rounded-xl px-3 py-2 text-left text-[13px] font-bold ${
                      q.id === track.id ? "bg-primary-50 text-primary-700" : "hover:bg-sand"
                    }`}
                  >
                    {q.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
