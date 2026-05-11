import type { PeriodicElement } from "../../../data/periodicTable";
import { atomicRadius } from "./atomicRadii";

/**
 * Heat-mappable trend definitions. Each trend is a {accessor, narrative}
 * bundle. The accessor returns a numeric value per element (or null when
 * unknown / undefined for that element).
 */

export type TrendId = "radius" | "electronegativity" | "ionization";

export interface Trend {
  id: TrendId;
  label: string;
  unit: string;
  get(el: PeriodicElement): number | null;
  /** Headline pattern statement. */
  pattern: string;
  /** Mechanism explanation. */
  mechanism: string;
  /** Memorable extreme cases. */
  extremes: string;
}

export const TRENDS: Trend[] = [
  {
    id: "radius",
    label: "Atomic Radius",
    unit: "pm",
    get: (el) => atomicRadius(el.number),
    pattern:
      "Atoms get smaller as you go right across a row, and bigger as you go down a column.",
    mechanism:
      "More protons in the same shell pull harder, shrinking the electron cloud. New shells reach farther from the nucleus, growing the atom. Two competing effects — nuclear pull and shell distance — and the trend is the score.",
    extremes:
      "Cesium (Cs) is the largest stable atom. Helium (He) is among the smallest. Both make sense from the single rule above.",
  },
  {
    id: "electronegativity",
    label: "Electronegativity",
    unit: "Pauling",
    get: (el) => el.electronegativity_pauling,
    pattern:
      "Electron-greediness peaks in the top right corner of the table and drops toward the bottom left.",
    mechanism:
      "Nuclei that pull hard on their own electrons also pull hard on shared electrons in a bond. Small, proton-dense atoms are greedy. Big, diffuse atoms with electrons far from the nucleus barely tug.",
    extremes:
      "Fluorine (F) is the most electronegative element on the table. Cesium (Cs) and francium (Fr) are among the least. Noble gases aren't ranked — they don't bond.",
  },
  {
    id: "ionization",
    label: "First Ionization Energy",
    unit: "kJ/mol",
    get: (el) => el.ionization_energies?.[0] ?? null,
    pattern:
      "The energy to yank off an electron rises as you go right across a row, and falls as you go down a column.",
    mechanism:
      "Same rule, flipped perspective. If the nucleus pulls hard, the outer electron is reluctant to leave. Loosely-held electrons (far from a weak pull) leave easily.",
    extremes:
      "Helium (He) has the highest first ionization energy — full shell, hard to disturb. Cesium (Cs) is near the bottom — one lonely valence electron, far from the nucleus.",
  },
];

export const TRENDS_BY_ID: Record<TrendId, Trend> =
  Object.fromEntries(TRENDS.map((t) => [t.id, t])) as Record<TrendId, Trend>;

/**
 * Cool→warm gradient from low to high values. Cells with no data render in a
 * muted neutral.
 */
export function trendColor(value: number | null, min: number, max: number): string {
  if (value === null || !isFinite(value)) return "rgba(40, 50, 70, 0.5)";
  const t = max > min ? (value - min) / (max - min) : 0.5;
  return lerpColor(COOL, WARM, t);
}

// Two-stop gradient — cool indigo to warm orange. Both are reasonably distinct
// from the dark page background and from each other across the middle.
const COOL: [number, number, number] = [60, 110, 200];   // cool indigo
const WARM: [number, number, number] = [255, 130, 80];   // warm orange-red

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string {
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(a[0] + (b[0] - a[0]) * u);
  const g = Math.round(a[1] + (b[1] - a[1]) * u);
  const bl = Math.round(a[2] + (b[2] - a[2]) * u);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Helper: compute min/max across all elements for a trend, ignoring nulls. */
export function trendRange(
  trend: Trend,
  elements: PeriodicElement[],
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const el of elements) {
    const v = trend.get(el);
    if (v === null || !isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}
