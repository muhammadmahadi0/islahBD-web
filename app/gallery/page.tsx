"use client";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";
import { useLang, useNum, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

type Photo = { id: number; url: string; order: number };
type Album = { id: number; title?: string; coverUrl?: string | null; photos?: Photo[]; imageCount?: number };
type Wallpaper = { id: number; url?: string; image?: string; file?: string; title?: string };

const cover = (a: Album) =>
  a.coverUrl || a.photos?.slice().sort((x, y) => x.order - y.order)[0]?.url || "";
const wallpaperUrl = (w: Wallpaper) => w.url || w.image || w.file || "";

export default function GalleryPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [walls, setWalls] = useState<Wallpaper[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingWalls, setLoadingWalls] = useState(true);
  const [open, setOpen] = useState<Album | null>(null);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/gallery-albums/?ordering=-createdAt")
      .then((r) => r.json())
      .then((d) => setAlbums(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
      .finally(() => setLoadingAlbums(false));
    fetch("https://api.islahbd.com/api/wallpapers/?ordering=-createdAt")
      .then((r) => r.json())
      .then((d) => setWalls(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
      .finally(() => setLoadingWalls(false));
  }, []);

  const albumsL = useLocalizedData(albums, lang);
  const wallsL = useLocalizedData(walls, lang);
  const openL = useLocalizedData(open, lang);

  return (
    <>
    <div className="animate-fade-up">
      <PageHead
        title={tx("গ্যালারি ও ওয়ালপেপার")}
        subtitle={`${tx("অ্যালবাম")} ${num(albumsL.length)} • ${tx("ওয়ালপেপার")} ${num(wallsL.length)}`}
        icon="image"
      />

      <div className="mb-2 mt-5 text-sm font-bold">{tx("অ্যালবাম")}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {albumsL.slice(0, 18).map((a) => {
          const src = cover(a);
          const count = a.photos?.length ?? a.imageCount ?? 0;
          return (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className="card card-hover overflow-hidden text-left"
            >
              {src ? (
                <img src={src} alt="" loading="lazy" className="h-28 w-full object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center bg-sand text-ink-faint">
                  <Icon name="image" size={26} />
                </div>
              )}
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="truncate text-xs font-bold">{a.title || `${tx("অ্যালবাম")} ${num(a.id)}`}</span>
                {count > 0 && <span className="flex-shrink-0 text-[10px] text-ink-faint">{num(count)}{tx("টি ছবি")}</span>}
              </div>
            </button>
          );
        })}
        {loadingAlbums && (
          <div className="card col-span-full p-4 text-center text-sm text-ink-faint">{tx("লোড হচ্ছে…")}</div>
        )}
        {!loadingAlbums && albumsL.length === 0 && (
          <div className="card col-span-full p-4 text-center text-sm text-ink-faint">{tx("কোনো অ্যালবাম নেই")}</div>
        )}
      </div>

      <div className="mb-2 mt-5 text-sm font-bold">{tx("ওয়ালপেপার")}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {wallsL.slice(0, 18).map((w) => {
          const src = wallpaperUrl(w);
          return (
            <div key={w.id} className="card card-hover overflow-hidden">
              {src ? (
                <img src={src} alt={w.title || ""} loading="lazy" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-sand text-ink-faint">
                  <Icon name="mountain" size={26} />
                </div>
              )}
              {src && (
                <a
                  href={src}
                  download
                  className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50"
                >
                  <Icon name="download" size={14} /> {tx("ডাউনলোড")}
                </a>
              )}
            </div>
          );
        })}
        {loadingWalls && (
          <div className="card col-span-full p-4 text-center text-sm text-ink-faint">{tx("লোড হচ্ছে…")}</div>
        )}
        {!loadingWalls && wallsL.length === 0 && (
          <div className="card col-span-full p-4 text-center text-sm text-ink-faint">{tx("কোনো ওয়ালপেপার নেই")}</div>
        )}
      </div>
      </div>

      {openL && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl dark:bg-[#0f172a] sm:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold">{openL.title || `${tx("অ্যালবাম")} ${num(openL.id)}`}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">
                  {num(openL.photos?.length ?? 0)}{tx("টি ছবি")}
                </div>
              </div>
              <button
                onClick={() => setOpen(null)}
                aria-label={tx("বন্ধ করুন")}
                className="rounded-full bg-sand p-2 text-ink-soft transition hover:text-ink"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(openL.photos || []).slice().sort((x, y) => x.order - y.order).map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl">
                  <img src={p.url} alt="" loading="lazy" className="h-32 w-full object-cover transition hover:scale-105" />
                </a>
              ))}
            </div>
            {(openL.photos?.length ?? 0) === 0 && (
              <div className="rounded-xl bg-sand p-4 text-center text-sm text-ink-faint">{tx("এই অ্যালবামে ছবি নেই")}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
