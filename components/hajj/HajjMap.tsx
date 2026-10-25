"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "../icons";
import { googlePlaceUrl, mapRegionColor, type MapPlace } from "../../lib/hajj";
import { useLang, useNum, useTx } from "../../store/language-store";

// Leaflet + OpenStreetMap map — mirrors HajjMapScreen:
// OSM tiles, region-coloured pins, filter chips, a list sheet and a small
// info card for the selected place.

const REGION_ORDER = ["মক্কা", "মদিনা", "হিজাজ"];
const MAKKAH: [number, number] = [21.4225, 39.8262];

const keyOf = (place: MapPlace) => `${place.title}@${place.lat},${place.lng}`;

export default function HajjMap({
  places,
  filters,
}: {
  places: MapPlace[];
  filters: string[];
}) {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<globalThis.Map<string, LeafletMarker>>(new globalThis.Map());
  const pendingFocusRef = useRef<MapPlace | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState(filters[0] || "সব");
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const visible = useMemo(
    () => (filter === "সব" ? places : places.filter((p) => p.region.includes(filter))),
    [places, filter]
  );

  const focusPlace = useCallback((place: MapPlace) => {
    if (filter !== "সব" && !place.region.includes(filter)) {
      pendingFocusRef.current = place;
      setFilter("সব");
      return;
    }
    mapRef.current?.flyTo([place.lat, place.lng], 13, { duration: 0.8 });
    setSelected(place);
  }, [filter]);

  // Boot Leaflet once, client-side only.
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (disposed || !containerRef.current) return;
        const map = L.map(containerRef.current, {
          center: MAKKAH,
          zoom: 10,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        map.on("click", () => setSelected(null));
        map.getContainer().tabIndex = 0;
        map.on("focus", () => map.scrollWheelZoom.enable());
        map.on("blur", () => map.scrollWheelZoom.disable());
        mapRef.current = map;
        setReady(true);
      } catch {
        if (!disposed) setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Markers follow the active filter and the current selection.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (cancelled || !map) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      visible.forEach((place) => {
        const active = selected ? keyOf(selected) === keyOf(place) : false;
        const icon = L.divIcon({
          className: `hajj-pin-wrap${active ? " is-active" : ""}`,
          html: `<span class="hajj-pin" style="--pin:${mapRegionColor(place.region)}"></span>`,
          iconSize: [30, 40],
          iconAnchor: [15, 38],
        });
        const marker = L.marker([place.lat, place.lng], {
          icon,
          title: lang === "bn" ? place.title : place.titleEn || place.title,
          zIndexOffset: active ? 1000 : 0,
        })
          .addTo(map)
          .on("click", () => setSelected(place));
        markersRef.current.set(keyOf(place), marker);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, visible, selected, lang]);

  // Fit the visible pins, or fly to a place queued by the list sheet / URL.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (cancelled || !map) return;

      const pending = pendingFocusRef.current;
      if (pending) {
        pendingFocusRef.current = null;
        map.flyTo([pending.lat, pending.lng], 13, { duration: 0.8 });
        setSelected(pending);
        return;
      }
      if (!visible.length) return;
      const bounds = L.latLngBounds(visible.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [46, 46], maxZoom: 11 });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, filter]);

  // Deep link support: /hajj-umrah/map?lat=..&lng=..&title=.. or ?q=মক্কা
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));
    const title = params.get("title") || params.get("q");
    let target: MapPlace | null = null;

    if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
      target = places.reduce<MapPlace | null>((best, place) => {
        const d = (place.lat - lat) ** 2 + (place.lng - lng) ** 2;
        if (!best) return place;
        const bd = (best.lat - lat) ** 2 + (best.lng - lng) ** 2;
        return d < bd ? place : best;
      }, null);
    } else if (title) {
      const q = title.trim();
      if (q === "মক্কা") target = places.find((p) => p.title.includes("হারাম")) || null;
      else if (q === "মদিনা") target = places.find((p) => p.title.includes("নববী")) || null;
      else target = places.find((p) => p.title.includes(q) || p.titleEn.toLowerCase().includes(q.toLowerCase())) || null;
      if (!target) target = places.find((p) => p.region.includes(q)) || null;
    }

    if (target) {
      mapRef.current?.flyTo([target.lat, target.lng], 13, { duration: 0.6 });
      setSelected(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const selectedTitle = selected
    ? lang === "bn"
      ? selected.title
      : selected.titleEn || selected.title
    : null;

  const grouped = useMemo(() => {
    const order = [...REGION_ORDER, ...Array.from(new Set(places.map((p) => p.region)))].filter(
      (region, index, all) => all.indexOf(region) === index
    );
    return order
      .map((region) => ({ region, items: places.filter((p) => p.region === region) }))
      .filter((group) => group.items.length > 0);
  }, [places]);

  return (
    <div className="animate-fade-up">
      <div className="relative h-[calc(100dvh-13rem)] min-h-[430px] overflow-hidden rounded-3xl border border-primary-900/10 bg-[#e8eef2] shadow-card dark:border-white/10 dark:bg-[#0b1120]">
        <div
          ref={containerRef}
          className="hajj-map absolute inset-0 z-0"
          role="application"
          aria-label={tx("মানচিত্র")}
        />

        {!ready && !failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#e8eef2] dark:bg-[#0b1120]">
            <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-300">
              <Icon name="compass" size={20} />
            </span>
            <p className="text-[11.5px] font-bold text-ink-faint">{tx("মানচিত্র লোড হচ্ছে…")}</p>
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <Icon name="compass" size={24} className="text-ink-faint" />
            <p className="text-[12.5px] font-bold text-ink">{tx("মানচিত্র লোড করা যায়নি")}</p>
            <Link
              href="/hajj-umrah/places"
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-[11px] font-extrabold text-white"
            >
              <Icon name="pin" size={12} />
              {tx("স্থানসমূহের তালিকা")}
            </Link>
          </div>
        )}

        {/* ---------- top card + filters ---------- */}
        <div className="absolute inset-x-2 top-2 z-20 rounded-2xl border border-primary-900/10 bg-white/95 p-2 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#16202f]/95">
          <div className="flex items-center gap-2">
            <Link
              href="/hajj-umrah"
              aria-label={tx("হজ ও ওমরাহ")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300"
            >
              <Icon name="back" size={14} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[12.5px] font-extrabold leading-tight tracking-tight text-ink">
                {tx("ইসলামিক স্থানসমূহের মানচিত্র")}
              </h1>
              <p className="truncate text-[9.5px] font-semibold text-ink-faint">
                {tx("মক্কা, মদিনা ও হিজাজ অঞ্চলের পবিত্র স্থানসমূহ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="grid" size={11} />
              {tx("তালিকা")}
            </button>
          </div>

          <div className="rail mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
            {filters.map((item) => {
              const active = item === filter;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelected(null);
                    setFilter(item);
                  }}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition active:scale-95 ${
                    active
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-primary-900/10 bg-white text-ink-soft hover:border-primary-500/30 dark:border-white/10 dark:bg-white/[0.04]"
                  }`}
                >
                  {tx(item)}
                </button>
              );
            })}
            <span className="ms-auto shrink-0 self-center rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-black tabular-nums text-ink-faint dark:bg-white/10">
              {num(visible.length)} {tx("টি")}
            </span>
          </div>
        </div>

        {/* ---------- selected place card ---------- */}
        {selected && (
          <div className="absolute inset-x-2 bottom-3 z-20 rounded-2xl border border-primary-900/10 bg-white/95 p-2.5 shadow-lift backdrop-blur dark:border-white/10 dark:bg-[#16202f]/95">
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-0.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-white dark:ring-[#16202f]"
                style={{ backgroundColor: mapRegionColor(selected.region) }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-extrabold leading-snug text-ink">
                  {selectedTitle}
                </p>
                <p className="mt-0.5 truncate text-[9.5px] font-semibold text-ink-faint">
                  {tx(selected.region)} ·{" "}
                  <span dir="ltr">
                    {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={tx("বন্ধ করুন")}
                className="rounded-lg p-1 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
              >
                <Icon name="x" size={13} />
              </button>
            </div>
            <a
              href={googlePlaceUrl(selected.lat, selected.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2 text-[10.5px] font-extrabold text-white transition hover:bg-primary-700"
            >
              <Icon name="external" size={12} />
              {tx("Google Maps-এ দেখুন")}
            </a>
          </div>
        )}

        {/* ---------- zoom + attribution ---------- */}
        <div
          className={`absolute end-2 z-20 flex flex-col overflow-hidden rounded-xl border border-primary-900/10 bg-white shadow-card transition-[bottom] duration-200 dark:border-white/10 dark:bg-[#16202f] ${
            selected ? "bottom-[9.5rem]" : "bottom-3"
          }`}
        >
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label={tx("জুম ইন")}
            className="flex h-8 w-8 items-center justify-center text-ink transition hover:bg-sand dark:hover:bg-white/5"
          >
            <Icon name="plus" size={14} />
          </button>
          <span aria-hidden className="h-px bg-primary-900/10 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label={tx("জুম আউট")}
            className="flex h-8 w-8 items-center justify-center text-ink transition hover:bg-sand dark:hover:bg-white/5"
          >
            <Icon name="minus" size={14} />
          </button>
        </div>

        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1.5 start-2 z-20 rounded bg-white/80 px-1.5 py-0.5 text-[8.5px] font-semibold text-ink-soft backdrop-blur dark:bg-[#16202f]/80 dark:text-white/60"
        >
          © OpenStreetMap
        </a>
      </div>

      <p className="mt-2 px-2 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
        {tx("ম্যাপে পিনে চাপ দিয়ে স্থান দেখুন, অথবা তালিকা থেকে বেছে নিন")}
      </p>

      {/* ---------- list sheet ---------- */}
      {listOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setListOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={tx("গুরুত্বপূর্ণ স্থানসমূহ")}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-primary-900/10 bg-white p-4 shadow-lift dark:border-white/10 dark:bg-[#16202f] sm:rounded-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 dark:bg-white/20 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                    {tx("গুরুত্বপূর্ণ স্থানসমূহ")}
                  </h2>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">
                    {num(places.length)} {tx("টি স্থান")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setListOpen(false)}
                  aria-label={tx("বন্ধ করুন")}
                  className="rounded-xl p-1.5 text-ink-faint transition hover:bg-sand hover:text-ink dark:hover:bg-white/5"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {grouped.map((group) => (
                  <section key={group.region}>
                    <h3 className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-ink-faint">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: mapRegionColor(group.region) }}
                      />
                      {tx(group.region)}
                      <span className="rounded-full bg-sand px-1.5 text-[9px] font-black tabular-nums dark:bg-white/10">
                        {num(group.items.length)}
                      </span>
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {group.items.map((place) => (
                        <li key={keyOf(place)}>
                          <button
                            type="button"
                            onClick={() => {
                              setListOpen(false);
                              focusPlace(place);
                            }}
                            className="flex w-full items-center gap-2 rounded-2xl border border-primary-900/[0.06] bg-sand/40 p-2 text-start transition hover:border-primary-500/25 hover:bg-sand dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                          >
                            <span
                              aria-hidden
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                              style={{ backgroundColor: mapRegionColor(place.region) }}
                            >
                              <Icon name="pin" size={12} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11.5px] font-bold text-ink">
                                {lang === "bn" ? place.title : place.titleEn || place.title}
                              </span>
                              <span className="block truncate text-[9.5px] font-semibold text-ink-faint">
                                {lang === "bn" ? place.titleEn : place.title}
                              </span>
                            </span>
                            <Icon name="chevron" size={12} className="shrink-0 text-ink-faint" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
