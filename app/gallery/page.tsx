"use client";
import { useEffect, useState } from "react";
import { PageHead } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [walls, setWalls] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.islahbd.com/api/gallery-albums/?ordering=-createdAt")
      .then((r) => r.json()).then((d) => setAlbums(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    fetch("https://api.islahbd.com/api/wallpapers/?ordering=-createdAt")
      .then((r) => r.json()).then((d) => setWalls(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHead title="গ্যালারি ও ওয়ালপেপার" subtitle={`অ্যালবাম ${albums.length} • ওয়ালপেপার ${walls.length}`} icon="image" />
      <div className="mb-2 mt-5 text-sm font-bold">অ্যালবাম</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {albums.slice(0, 18).map((a: any, i: number) => (
          <div key={i} className="card card-hover overflow-hidden">
            {a.cover
              ? <img src={a.cover} alt="" loading="lazy" className="h-28 w-full object-cover" />
              : <div className="flex h-28 items-center justify-center bg-sand text-ink-faint"><Icon name="image" size={26} /></div>}
            <div className="truncate p-2.5 text-xs font-bold">{a.title || `অ্যালবাম ${i + 1}`}</div>
          </div>
        ))}
        {albums.length === 0 && <div className="card col-span-full p-4 text-center text-sm text-ink-faint">লোড হচ্ছে…</div>}
      </div>
      <div className="mb-2 mt-5 text-sm font-bold">ওয়ালপেপার</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {walls.slice(0, 18).map((w: any, i: number) => (
          <div key={i} className="card card-hover overflow-hidden">
            {(w.image || w.file)
              ? <img src={w.image || w.file} alt="" loading="lazy" className="h-40 w-full object-cover" />
              : <div className="flex h-40 items-center justify-center bg-sand text-ink-faint"><Icon name="mountain" size={26} /></div>}
            {(w.image || w.file) && (
              <a href={w.image || w.file} download className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50">
                <Icon name="download" size={14} /> ডাউনলোড
              </a>
            )}
          </div>
        ))}
        {walls.length === 0 && <div className="card col-span-full p-4 text-center text-sm text-ink-faint">লোড হচ্ছে…</div>}
      </div>
    </div>
  );
}
