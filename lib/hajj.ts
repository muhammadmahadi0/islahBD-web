// Hajj & Umrah guide data — extracted from IslahBD APK v1.3.0.
// Source: lib/features/hajj/data/hajj_week_data.dart and
// lib/features/hajj/data/hajj_pilgrimage_data.dart.
//
// Content is Bengali-only in the app; the surrounding UI chrome is localized
// through `useTx()` and falls back to these Bengali strings when a translation
// is not available yet.
import weekGuideJson from "../public/data/hajj/week-guide.json";
import pilgrimageJson from "../public/data/hajj/pilgrimage.json";
import placesJson from "../public/data/hajj/places.json";
import mapPlacesJson from "../public/data/hajj/map-places.json";

export type ObligationType = "farz" | "wajib" | "sunnat" | "mustahab";

export interface WeekTask {
  code: string;
  text: string;
}

export interface WeekGroup {
  type: string;
  label: string;
  color: string;
  tasks: WeekTask[];
}

export interface WeekDay {
  day: string;
  dayNumber: number;
  title: string;
  groups: WeekGroup[];
}

export interface WeekGuide {
  source: string;
  note: string;
  credit: string;
  types: { id: string; label: string; color: string }[];
  days: WeekDay[];
}

export interface PilgrimStep {
  title: string;
  hint: string;
  ruling: string;
  detail: string;
  location: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
}

export interface PilgrimPhase {
  title: string;
  iconCodePoint: string;
  steps: PilgrimStep[];
}

export interface PilgrimageType {
  id: string;
  name: string;
  arabic: string;
  tagline: string;
  summary: string;
  description: string;
  hasUmrah: boolean;
  opensIhram: boolean;
  qurbani: string;
  phases: PilgrimPhase[];
}

export interface ComparisonRow {
  label: string;
  tamattu: string;
  qiran: string;
  ifrad: string;
  umrah: string;
}

export interface Pilgrimage {
  source: string;
  comparisonRows: ComparisonRow[];
  tip: string;
  types: PilgrimageType[];
}

export const weekGuide = weekGuideJson as unknown as WeekGuide;
export const pilgrimage = pilgrimageJson as unknown as Pilgrimage;

/** Book categories shown on the hub, in the app's order. */
export const HAJJ_BOOK_ORDER = [
  "hajj_virtues",
  "umrah_guide",
  "hajj_guide",
  "hajj_guidelines",
] as const;

/** Ruling chip colours, measured from the APK. */
export const RULING_COLORS: Record<string, string> = {
  ফরয: "#EF4444",
  ওয়াজিব: "#F59E0B",
  সুন্নত: "#10B981",
  রুকন: "#6366F1",
  মুস্তাহাব: "#6366F1",
};

/** Colour for a step's ruling, falling back to slate. */
export function rulingColor(ruling: string): string {
  return RULING_COLORS[ruling] || "#64748B";
}

/** Stable checklist key: "<typeId>::<phaseIndex>::<stepIndex>". */
export function stepKey(typeId: string, phaseIndex: number, stepIndex: number): string {
  return `${typeId}::${phaseIndex}::${stepIndex}`;
}

export function totalSteps(type: PilgrimageType): number {
  return type.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
}

export function doneSteps(type: PilgrimageType, done: Set<string>): number {
  let count = 0;
  type.phases.forEach((phase, phaseIndex) => {
    phase.steps.forEach((_, stepIndex) => {
      if (done.has(stepKey(type.id, phaseIndex, stepIndex))) count += 1;
    });
  });
  return count;
}

export function phaseDoneCount(
  type: PilgrimageType,
  phase: PilgrimPhase,
  phaseIndex: number,
  done: Set<string>
): number {
  return phase.steps.reduce(
    (sum, _, stepIndex) => sum + (done.has(stepKey(type.id, phaseIndex, stepIndex)) ? 1 : 0),
    0
  );
}

export const PILGRIMAGE_STORAGE_KEYS = {
  typeIndex: "hajj_checklist_type_index",
  doneItems: "hajj_checklist_done_items",
} as const;

/* ------------------------------------------------------------------ */
/* Places guide + map                                                  */
/* ------------------------------------------------------------------ */

export interface Place {
  title: string;
  titleEn: string;
  description: string;
  lat: number;
  lng: number;
  iconCodePoint: string;
}

export interface PlaceRegion {
  title: string;
  titleEn: string;
  subtitle: string;
  color: string;
  iconCodePoint: string;
  places: Place[];
}

export interface PlacesData {
  source: string;
  filters: string[];
  regions: PlaceRegion[];
  total: number;
}

export interface MapPlace {
  title: string;
  titleEn: string;
  region: string;
  lat: number;
  lng: number;
}

export interface MapPlacesData {
  source: string;
  filters: string[];
  places: MapPlace[];
  total: number;
}

export const places = placesJson as unknown as PlacesData;
export const mapPlaces = mapPlacesJson as unknown as MapPlacesData;

/** Region pin colours used by the map (মক্কা gold, মদিনা green, হিজাজ brown). */
export const MAP_REGION_COLORS: Record<string, string> = {
  মক্কা: "#D4A957",
  মদিনা: "#2E7D32",
  হিজাজ: "#795548",
};

export function mapRegionColor(region: string): string {
  return MAP_REGION_COLORS[region] || "#0E7C5B";
}

/**
 * Filter the places guide the same way the app does: region chips match the
 * region title, keyword chips match place text and drop empty regions.
 */
export function filterPlaces(filter: string): PlaceRegion[] {
  if (!filter || filter === "সব") return places.regions;

  const keyword = (place: Place, ...needles: string[]) => {
    const hay = `${place.title} ${place.titleEn} ${place.description}`.toLowerCase();
    return needles.some((n) => hay.includes(n.toLowerCase()));
  };

  // Region chips match the region title; keyword chips match place text only.
  const regionFilters = ["সীরাত", "মক্কা", "মদিনা", "তায়েফ", "যুদ্ধ"];

  return places.regions
    .map((region) => {
      if (regionFilters.includes(filter) && region.title.includes(filter)) return region;

      let matches: (place: Place) => boolean = () => false;
      if (filter === "মসজিদ") matches = (p) => keyword(p, "মসজিদ", "masjid");
      else if (filter === "গুহা") matches = (p) => keyword(p, "গুহা", "গার", "cave");
      else if (filter === "মিকাত") matches = (p) => keyword(p, "মিকাত", "miqat");

      return { ...region, places: region.places.filter(matches) };
    })
    .filter((region) => region.places.length > 0);
}

/** Google Maps deep links used by the places cards. */
export function googlePlaceUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},16z/data=!3m1!1e3`;
}

export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},14z/data=!3m1!1e3`;
}
