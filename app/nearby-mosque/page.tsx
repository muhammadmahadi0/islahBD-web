"use client";
import { useState } from "react";
import Link from "next/link";

export default function NearbyMosque() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("GPS দিয়ে কাছের মসজিদ খুঁজুন (OpenStreetMap Overpass)");
  const find = () => {
    navigator.geolocation?.getCurrentPosition(async (p) => {
      const { latitude: la, longitude: lo } = p.coords;
      setMsg("খোঁজা হচ্ছে…");
      try {
        const q = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${la},${lo});way["building"="mosque"](around:5000,${la},${lo}););out 20;`;
        const r = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) });
        const j = await r.json();
        setItems(j.elements || []);
        setMsg(`${j.elements?.length || 0}টি মসজিদ পাওয়া গেছে`);
      } catch { setMsg("লোড ব্যর্থ — ইন্টারনেট চেক করুন"); }
    }, () => setMsg("লোকেশন অনুমতি দিন"));
  };
  return (
    <div>
      <Link href="/" className="text-primary text-sm font-semibold">← হোম</Link>
      <h1 className="text-2xl font-bold mt-1">কাছের মসজিদ</h1>
      <p className="text-sm text-stone-500">{msg}</p>
      <button onClick={find} className="btn-primary w-full mt-3">📍 মসজিদ খুঁজুন</button>
      <div className="space-y-2 mt-3">
        {items.map((m: any, i: number) => (
          <a key={i} target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`} className="card p-3.5 block">
            <div className="font-bold">🕌 {m.tags?.name || "মসজিদ"}</div>
            <div className="text-xs text-stone-500">{m.lat?.toFixed(4)}, {m.lon?.toFixed(4)} • ম্যাপ খুলুন →</div>
          </a>
        ))}
      </div>
    </div>
  );
}
