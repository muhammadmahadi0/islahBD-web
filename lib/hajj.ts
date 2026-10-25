// Hajj & Umrah guide data — extracted from IslahBD APK v1.3.0.
// Source: lib/features/hajj/data/hajj_week_data.dart and
// lib/features/hajj/data/hajj_pilgrimage_data.dart.
//
// Content is Bengali-only in the app; the surrounding UI chrome is localized
// through `useTx()` and falls back to these Bengali strings when a translation
// is not available yet.
import weekGuideJson from "../public/data/hajj/week-guide.json";
import pilgrimageJson from "../public/data/hajj/pilgrimage.json";

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
