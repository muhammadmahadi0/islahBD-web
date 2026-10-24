"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHead, EmptyState } from "../../components/ui";
import { Icon } from "../../components/icons";
import { detectLocation } from "../../lib/prayer";
import { bnNum } from "../../lib/audio";
import { useLang, useNum, useTx } from "../../store/language-store";
import { useLocalizedData } from "../../lib/content-translate";

interface Mosque {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  address: string;
  phone: string;
  hours: string;
}

type Status = "loading" | "ready" | "error";

function fmtDistance(meters: number, num: (n: number | string) => string, mLabel: string, kmLabel: string): string {
  if (meters < 1000) return `${num(meters)} ${mLabel}`;
  return `${num(Number((meters / 1000).toFixed(1)))} ${kmLabel}`;
}

function fmtRadius(meters: number, num: (n: number | string) => string, kmLabel: string): string {
  return `${num(Number((meters / 1000).toFixed(1)))} ${kmLabel}`;
}

export default function NearbyMosque() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [items, setItems] = useState<Mosque[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [place, setPlace] = useState("");
  const [radius, setRadius] = useState(0);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [note, setNote] = useState("");
  const lastCoords = useRef<{ lat: number; lon: number; label: string } | null>(null);

  const load = useCallback(async (lat: number, lon: number, label: string) => {
    lastCoords.current = { lat, lon, label };
    setPlace(label);
    setStatus("loading");
    try {
      const res = await fetch(`/api/mosques?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setItems(data.results as Mosque[]);
        setRadius(data.radius || 0);
        setStatus("ready");
      } else if (res.status === 404) {
        // Valid lookup, genuinely nothing nearby — not an error.
        setItems([]);
        setRadius(0);
        setStatus("ready");
      } else {
        throw new Error("failed");
      }
    } catch {
      setStatus("error");
    }
  }, []);

  // Auto-load with the IP-detected location so the section is useful on open;
  // the GPS button then refines it to an exact fix.
  useEffect(() => {
    let dead = false;
    (async () => {
      const loc = await detectLocation();
      if (!dead) await load(loc.lat, loc.lng, loc.city);
    })();
    return () => {
      dead = true;
    };
  }, [load]);

  const useGps = () => {
    if (!navigator.geolocation) {
      setNote("এই ডিভাইসে জিপিএস নেই।");
      return;
    }
    setGpsBusy(true);
    setNote("");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGpsBusy(false);
        load(p.coords.latitude, p.coords.longitude, tx("আপনার অবস্থান"));
      },
      () => {
        setGpsBusy(false);
        setNote("লোকেশন পাওয়া যায়নি — অনুমতি দিন।");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const itemsL = useLocalizedData(items, lang);
  const subtitle =
    status === "loading"
      ? tx("খোঁজা হচ্ছে…")
      : status === "error"
        ? tx("লোড করা যায়নি")
        : place
          ? `${tx(place)} • ${num(itemsL.length)}${tx("টি মসজিদ")}`
          : tx("কাছের মসজিদ");

  return (
    <div className="animate-fade-up">
      <PageHead title={tx("কাছের মসজিদ")} subtitle={subtitle} icon="mosque" />

      <div className="mt-3 flex gap-2">
        <button
          onClick={useGps}
          disabled={gpsBusy}
          className="btn-primary flex-1 disabled:opacity-60"
        >
          <Icon name="pin" size={16} /> {gpsBusy ? tx("খোঁজা হচ্ছে…") : tx("জিপিএস দিয়ে খুঁজুন")}
        </button>
        <button
          onClick={() => {
            const last = lastCoords.current;
            if (last) load(last.lat, last.lon, last.label);
          }}
          disabled={status === "loading" || !lastCoords.current}
          className="btn-outline shrink-0 disabled:opacity-60"
        >
          <Icon name="search" size={16} /> {tx("আবার")}
        </button>
      </div>

      {note && <p className="mt-2 text-center text-xs text-rose-500">{tx(note)}</p>}
      {radius > 0 && status === "ready" && (
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          {fmtRadius(radius, num, tx("কিমি"))} {tx("পরিসরে, নিকটতম আগে")}
        </p>
      )}

      {status === "loading" ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card flex animate-pulse items-center gap-3 p-4">
              <span className="icon-tile bg-sand-dark" />
              <span className="flex-1 space-y-2">
                <span className="block h-3.5 w-2/3 rounded-full bg-sand-dark" />
                <span className="block h-3 w-1/3 rounded-full bg-sand-dark" />
              </span>
            </div>
          ))}
        </div>
      ) : status === "error" ? (
        <div className="mt-3">
          <EmptyState
            icon="mosque"
            title={tx("মসজিদের তথ্য পাওয়া যায়নি")}
            hint={tx("আবার চেষ্টা করুন বা জিপিএস ব্যবহার করুন")}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            icon="mosque"
            title={tx("আশেপাশে মসজিদ পাওয়া যায়নি")}
            hint={tx("জিপিএস দিয়ে নির্ভুল অবস্থান দিয়ে খুঁজুন")}
          />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {itemsL.map((m) => {
            const meta = [m.address, m.hours].filter(Boolean).join(" • ");
            return (
              <a
                key={m.id}
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
                className="card card-hover flex items-center gap-3 p-4"
              >
                <span className="icon-tile bg-emerald-50 text-primary-600 dark:bg-emerald-500/10">
                  <Icon name="mosque" size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{m.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-faint">
                    {meta || `${num(Number(m.lat.toFixed(4)))}, ${num(Number(m.lon.toFixed(4)))}`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs font-bold text-primary-700">
                    {fmtDistance(m.distance, num, tx("মিটার"), tx("কিমি"))}
                  </span>
                  <span className="block text-[10px] text-ink-faint">{tx("দিকনির্দেশনা")}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
