import { ELEMENTS_BY_NUMBER } from "../../../data/periodicTable";

/**
 * Pedagogical shell-filling order (NOT strict quantum order — matches what an
 * intro chem class teaches and what the periodic table data shows).
 *
 * Shell capacities follow the period structure: 2, 8, 8, 18, 18, 32, 32.
 */
const TEACHING_CAPACITIES = [2, 8, 8, 18, 18, 32, 32];

/** For a given electron count, return per-shell occupancy. Prefers the real
 * dataset values when the count matches a known neutral element + Z. */
export function distributeElectrons(eCount: number, z: number | null): number[] {
  if (z !== null && eCount === z) {
    // Neutral atom of a known element — use authoritative shells from the dataset.
    const el = ELEMENTS_BY_NUMBER.get(z);
    if (el) return el.shells.slice();
  }
  const out: number[] = [];
  let rem = eCount;
  for (const cap of TEACHING_CAPACITIES) {
    if (rem <= 0) break;
    const placed = Math.min(cap, rem);
    out.push(placed);
    rem -= placed;
  }
  if (rem > 0) out.push(rem);
  return out;
}

/** Sunflower spiral packing — gives a tight blob of nucleons that grows
 * smoothly with count. Returns unit-circle-relative positions. */
export function packNucleus(count: number): { x: number; y: number }[] {
  if (count <= 0) return [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    const theta = i * golden;
    points.push({ x: r * Math.cos(theta), y: r * Math.sin(theta) });
  }
  return points;
}

/** Pretty isotope notation: e.g. ¹²C or ²³⁵U.  */
export function isotopeNotation(symbol: string, mass: number): string {
  return toSuperscript(String(mass)) + symbol;
}

const SUPER_DIGITS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
function toSuperscript(s: string): string {
  return s
    .split("")
    .map((c) => SUPER_DIGITS[c] ?? c)
    .join("");
}

/** Ion suffix: e.g. "+", "2-", "" for neutral. */
export function chargeLabel(charge: number): string {
  if (charge === 0) return "";
  const sign = charge > 0 ? "+" : "−";
  const mag = Math.abs(charge);
  return mag === 1 ? sign : `${mag}${sign}`;
}
