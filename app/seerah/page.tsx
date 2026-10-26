"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Icon } from "../../components/icons";
import {
  filterPlaces,
  googleDirectionsUrl,
  mapPlaces,
  places,
  type Place,
} from "../../lib/hajj";
import { useLang, useNum, useTx } from "../../store/language-store";

// Seerah Maps — the historical-places guide plus its "Map of Locations"
// subsection. Lives in the Others (অন্যান্য) hub; the map opens full-screen
// at /seerah/map for deep links from cards and the checklist.

const SeerahMap = dynamic(() => import("../../components/hajj/HajjMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  const tx = useTx();
  return (
    <div className="flex h-[340px] flex-col items-center justify-center gap-2 rounded-3xl border border-primary-900/10 bg-[#e8eef2] sm:h-[430px] lg:h-[520px] dark:border-white/10 dark:bg-[#0b1120]">
      <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-300">
        <Icon name="compass" size={20} />
      </span>
      <p className="text-[11.5px] font-bold text-ink-faint">{tx("মানচিত্র লোড হচ্ছে…")}</p>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const tx = useTx();
  const lang = useLang();
  const [expanded, setExpanded] = useState(false);

  const primary = lang === "bn" ? place.title : place.titleEn || place.title;
  const secondary = lang === "bn" ? place.titleEn : place.title;
  const mapHref = `/seerah/map?lat=${place.lat}&lng=${place.lng}&title=${encodeURIComponent(
    place.title
  )}`;
  const long = place.description.length > 150;

  return (
    <article className="card overflow-hidden">
      <div className="p-3.5">
        <h3 className="text-[13.5px] font-extrabold leading-snug tracking-tight text-ink">
          {primary}
        </h3>
        {secondary && secondary !== primary && (
          <p className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">{secondary}</p>
        )}

        <p
          className={`mt-1.5 text-[12px] leading-relaxed text-ink-soft ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {place.description}
        </p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[10.5px] font-extrabold text-primary-700 transition hover:text-primary-800 dark:text-primary-300"
          >
            {expanded ? tx("সংক্ষেপ করুন") : tx("বিস্তারিত পড়ুন")}
          </button>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold tabular-nums text-ink-faint">
          <Icon name="pin" size={11} className="shrink-0 text-primary-600/70 dark:text-primary-300/70" />
          <span dir="ltr">
            {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="flex items-stretch divide-x divide-primary-900/[0.06] border-t border-primary-900/[0.06] dark:divide-white/[0.08] dark:border-white/[0.08]">
        <Link
          href={mapHref}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-extrabold text-primary-700 transition hover:bg-primary-50/60 dark:text-primary-300 dark:hover:bg-primary-500/[0.06]"
        >
          <Icon name="compass" size={13} />
          {tx("মানচিত্রে দেখুন")}
        </Link>
        <a
          href={googleDirectionsUrl(place.lat, place.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-extrabold text-sky-700 transition hover:bg-sky-50/60 dark:text-sky-300 dark:hover:bg-sky-500/[0.06]"
        >
          <Icon name="external" size={13} />
          {tx("যেভাবে যাবেন")}
        </a>
      </div>
    </article>
  );
}

export default function SeerahPage() {
  const tx = useTx();
  const num = useNum();
  const lang = useLang();
  const [filter, setFilter] = useState(places.filters[0] || "সব");

  const visible = useMemo(() => filterPlaces(filter), [filter]);
  const count = visible.reduce((sum, region) => sum + region.places.length, 0);

  return (
    <div className="animate-fade-up">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3D2C] via-primary-700 to-[#083B2A] p-4 text-white shadow-lift sm:p-5">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(230,202,101,0.35),transparent_65%)]"
        />
        <div className="relative">
          <Link
            href="/others"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            <Icon name="back" size={13} />
            {tx("অন্যান্য")}
          </Link>

          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-gold-100 ring-1 ring-inset ring-white/15">
              <Icon name="mountain" size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[19px] font-extrabold leading-tight tracking-tight">
                {tx("সীরাত মানচিত্র")}
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45">
                Historical Places &amp; Islamic Heritage
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white/85 ring-1 ring-inset ring-white/10">
              <Icon name="pin" size={11} className="text-gold-100" />
              {num(places.total)} {tx("টি স্থান")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white/85 ring-1 ring-inset ring-white/10">
              <Icon name="mountain" size={11} className="text-gold-100" />
              {num(places.regions.length)} {tx("টি অঞ্চল")}
            </span>
            <Link
              href="/seerah/map"
              className="ms-auto inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/25"
            >
              <Icon name="compass" size={11} className="text-gold-100" />
              {tx("মানচিত্র")}
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Map of Locations ---------- */}
      <section id="map" className="mt-4 scroll-mt-3">
        <div className="mb-2 flex items-end justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight text-ink">
              <Icon name="compass" size={15} className="text-primary-600 dark:text-primary-300" />
              {tx("স্থানসমূহের মানচিত্র")}
            </h2>
            <p className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">
              {tx("মক্কা, মদিনা ও হিজাজের পবিত্র স্থান")}
            </p>
          </div>
          <Link
            href="/seerah/map"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-extrabold text-primary-700 transition hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300"
          >
            {tx("বড় মানচিত্রে দেখুন")}
            <Icon name="chevron" size={11} />
          </Link>
        </div>
        <SeerahMap
          places={mapPlaces.places}
          filters={mapPlaces.filters}
          variant="section"
          backHref="/seerah"
        />
      </section>

      {/* ---------- Historical places ---------- */}
      <section id="places" className="mt-6 scroll-mt-3">
        <div className="mb-2 px-0.5">
          <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight text-ink">
            <Icon name="mountain" size={15} className="text-primary-600 dark:text-primary-300" />
            {tx("ঐতিহাসিক স্থানসমূহ")}
          </h2>
          <p className="mt-0.5 text-[10.5px] font-semibold text-ink-faint">
            {tx("অঞ্চল ও বিষয় অনুযায়ী ফিল্টার করুন")}
          </p>
        </div>

        <div className="filter-bar sticky top-0 z-20 -mx-1 bg-brand-light/85 px-1 py-1.5 backdrop-blur dark:bg-brand-dark/85">
          <div className="rail flex gap-1.5 overflow-x-auto pb-0.5">
            {places.filters.map((item) => {
              const active = item === filter;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item)}
                  className={`chip shrink-0 !px-3 !py-1.5 ${active ? "chip-active" : ""}`}
                >
                  {tx(item)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 px-0.5">
          <p className="text-[10.5px] font-bold text-ink-faint">
            {tx("ফিল্টার")}: {tx(filter)}
          </p>
          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
            {num(count)} {tx("টি")}
          </span>
        </div>

        {lang !== "bn" && (
          <p className="mt-1 px-0.5 text-[10px] font-semibold text-ink-faint">
            {tx("স্থানসমূহের বিবরণ বাংলায় দেওয়া হয়েছে")}
          </p>
        )}

        {count === 0 && (
          <div className="card mt-2.5 p-6 text-center">
            <Icon name="search" size={22} className="mx-auto text-ink-faint" />
            <p className="mt-2 text-[12.5px] font-bold text-ink">{tx("কোনো স্থান পাওয়া যায়নি")}</p>
            <button
              type="button"
              onClick={() => setFilter(places.filters[0] || "সব")}
              className="btn-outline mt-2.5 !py-2 text-[11.5px]"
            >
              {tx("সব দেখুন")}
            </button>
          </div>
        )}

        <div className="mt-2 space-y-4">
          {visible.map((region) => (
            <section key={region.title}>
              <div
                className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl p-3 text-white shadow-card"
                style={{
                  background: `linear-gradient(135deg, ${region.color} 0%, ${region.color}CC 55%, ${region.color}99 100%)`,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-lg"
                />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-inset ring-white/25">
                  <Icon name="mountain" size={19} />
                </span>
                <div className="relative min-w-0 flex-1">
                  <h2 className="text-[13.5px] font-extrabold leading-snug">
                    {lang === "bn" ? region.title : region.titleEn || region.title}
                  </h2>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-white/75">
                    {lang === "bn" ? region.subtitle : region.title}
                  </p>
                </div>
                <span className="relative shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tabular-nums ring-1 ring-inset ring-white/20">
                  {num(region.places.length)}
                </span>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {region.places.map((place) => (
                  <PlaceCard key={`${region.title}-${place.title}`} place={place} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {count > 0 && (
          <p className="mt-4 px-2 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
            {tx("মোট")} {num(count)} {tx("টি স্থান")}
          </p>
        )}
      </section>

      <p className="mt-3 px-2 text-center text-[10px] font-semibold leading-relaxed text-ink-faint">
        {tx("সূত্র")}: দারসে মানসূর (darsemansoor.com) · Mobile App: Islami Jendegi
      </p>
    </div>
  );
}
