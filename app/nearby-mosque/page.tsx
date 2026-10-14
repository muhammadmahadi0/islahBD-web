"use client";
import { useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";

export default function NearbyMosque() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("GPS দিয়ে কাছের মসজিদ খুঁজুন");
  const [busy, setBusy] = useState(false);

  const find = () => {
    setBusy(true);
    navigator.geolocation?.getCurrentPosition(async (p) => {
      const { latitude: la, longitude: lo } = p.coords;
      setMsg("খোঁজা হচ্ছে…");
      try {
        const q = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${la},${lo});way["building"="mosque"](around:5000,${la},${lo}););out 20;`;
        const r = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) });
        const j = await r.json();
        setItems(j.elements || []);
        setMsg(`${j.elements?.length || 0}টি মসজিদ পাওয়া গেছে`);
      } catch {
        setMsg("লোড ব্যর্থ — ইন্টারনেট চেক করুন");
      } finally {
        setBusy(false);
      }
    }, () => { setMsg("লোকেশন অনুমতি দিন"); setBusy(false); });
  };

  return (
    <div className="animate-fade-up">
      <PageHead title="কাছের মসজিদ" subtitle={msg} icon="mosque" />
      <button onClick={find} disabled={busy} className="btn-primary mt-3 w-full disabled:opacity-60">
        <Icon name="pin" size={16} /> {busy ? "খোঁজা হচ্ছে…" : "মসজিদ খুঁজুন"}
      </button>
      {items.length === 0 ? (
        <div className="mt-3"><EmptyState icon="mosque" title="এখনো খোঁজা হয়নি" hint="উপরের বোতাম চাপুন" /></div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((m: any, i: number) => (
            <a key={i} target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`} className="card card-hover flex items-center gap-3 p-4">
              <span className="icon-tile bg-emerald-50 text-primary-600"><Icon name="mosque" size={22} /></span>
              <span className="flex-1">
                <span className="block font-bold">{m.tags?.name || "মসজিদ"}</span>
                <span className="block text-xs text-ink-faint">{m.lat?.toFixed(4)}, {m.lon?.toFixed(4)}</span>
              </span>
              <Icon name="chevron" size={18} className="text-ink-faint" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
