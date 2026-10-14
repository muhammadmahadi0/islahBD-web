"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GalleryWallpaper({ params }: any) {
  return <GalleryClient />;
}

function GalleryClient() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [walls, setWalls] = useState<any[]>([]);
  useEffect(() => {
    fetch("https://api.islahbd.com/api/gallery-albums/?ordering=-createdAt").then((r) => r.json()).then((d) => setAlbums(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    fetch("https://api.islahbd.com/api/wallpapers/?ordering=-createdAt").then((r) => r.json()).then((d) => setWalls(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">🖼️ গ্যালারি ও ওয়ালপেপার</h1>
      <h2 className="font-bold mt-3">অ্যালবাম ({albums.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {albums.slice(0, 18).map((a: any, i: number) => (
          <div key={i} className="card overflow-hidden">
            {a.cover && <img src={a.cover} alt="" className="w-full h-28 object-cover" />}
            <div className="p-2 text-xs font-bold">{a.title || `অ্যালবাম ${i + 1}`}</div>
          </div>
        ))}
      </div>
      <h2 className="font-bold mt-4">🌄 ওয়ালপেপার ({walls.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
        {walls.slice(0, 18).map((w: any, i: number) => (
          <div key={i} className="card overflow-hidden">
            {(w.image || w.file) && <img src={w.image || w.file} alt="" className="w-full h-36 object-cover" />}
            <a href={w.image || w.file} download className="block p-2 text-xs font-bold text-primary text-center">⬇ সেট / ডাউনলোড</a>
          </div>
        ))}
      </div>
    </div>
  );
}
