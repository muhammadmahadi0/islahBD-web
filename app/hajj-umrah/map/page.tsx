"use client";
import dynamic from "next/dynamic";
import { Icon } from "../../../components/icons";
import { mapPlaces } from "../../../lib/hajj";
import { useTx } from "../../../store/language-store";

// The map is client-only (Leaflet touches window at runtime).
const HajjMap = dynamic(() => import("../../../components/hajj/HajjMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  const tx = useTx();
  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[430px] flex-col items-center justify-center gap-2 rounded-3xl border border-primary-900/10 bg-[#e8eef2] dark:border-white/10 dark:bg-[#0b1120]">
      <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-300">
        <Icon name="compass" size={20} />
      </span>
      <p className="text-[11.5px] font-bold text-ink-faint">{tx("মানচিত্র লোড হচ্ছে…")}</p>
    </div>
  );
}

export default function HajjMapPage() {
  return <HajjMap places={mapPlaces.places} filters={mapPlaces.filters} />;
}
