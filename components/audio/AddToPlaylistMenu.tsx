"use client";
import { useState } from "react";
import type { Track } from "../../store/player-store";
import { usePlaylistStore } from "../../store/playlist-store";
import { Icon } from "../icons";

// Simplified port of beta AddToPlaylistMenu — save any track into a
// named playlist (persisted in localStorage).
export default function AddToPlaylistMenu({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const { playlists, createPlaylist, addTrack } = usePlaylistStore();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const save = (id: string) => {
    const r = addTrack(id, track);
    setMsg(r === "added" ? "প্লেলিস্টে যোগ হয়েছে ✓" : "আগেই আছে");
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="card w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <div className="font-bold">প্লেলিস্টে রাখুন</div>
          <button aria-label="close" onClick={onClose} className="rounded-xl p-1.5 text-ink-faint hover:bg-sand">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="max-h-56 space-y-1.5 overflow-auto">
          {playlists.length === 0 && (
            <p className="rounded-2xl bg-sand p-3 text-center text-[13px] text-ink-faint">
              এখনো প্লেলিস্ট নেই — নিচে নাম লিখে বানান
            </p>
          )}
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => save(p.id)}
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-bold hover:bg-sand"
            >
              <Icon name="music" size={17} className="text-primary-600" />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-[11px] text-ink-faint">{p.tracks.length}</span>
            </button>
          ))}
        </div>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            save(createPlaylist(name));
            setName("");
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নতুন প্লেলিস্টের নাম…" className="input" />
          <button className="btn-primary shrink-0" type="submit">
            <Icon name="plus" size={16} />
          </button>
        </form>
        {msg && <p className="mt-2 text-center text-[13px] font-bold text-primary-700">{msg}</p>}
      </div>
    </div>
  );
}
