import raw from "./elements.json";

/**
 * Typed access layer for the Bowserinator periodic-table dataset (MIT).
 * Source: https://github.com/Bowserinator/Periodic-Table-JSON
 */
export interface PeriodicElement {
  number: number;
  symbol: string;
  name: string;
  appearance: string | null;
  atomic_mass: number;
  boil: number | null;
  melt: number | null;
  density: number | null;
  molar_heat: number | null;
  phase: "Solid" | "Liquid" | "Gas" | "Unknown" | string;
  category: string;
  period: number;
  group: number;
  xpos: number;
  ypos: number;
  block: "s" | "p" | "d" | "f" | string;
  shells: number[];
  electron_configuration: string;
  electron_configuration_semantic: string;
  electron_affinity: number | null;
  electronegativity_pauling: number | null;
  ionization_energies: number[];
  discovered_by: string | null;
  named_by: string | null;
  source: string;
  summary: string;
  "cpk-hex": string | null;
  bohr_model_image: string | null;
  bohr_model_3d: string | null;
  spectral_img: string | null;
  image: { title: string; url: string; attribution: string } | null;
}

export const ELEMENTS_DATA: PeriodicElement[] = (raw as { elements: PeriodicElement[] }).elements;

export const ELEMENTS_BY_NUMBER: Map<number, PeriodicElement> = new Map(
  ELEMENTS_DATA.map((e) => [e.number, e]),
);

/** Broad category buckets we color-code by. Collapses Bowserinator's
 * "unknown, predicted to be …" labels into their parent family so the
 * legend stays short. */
export type CategoryKey =
  | "alkali-metal"
  | "alkaline-earth-metal"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "diatomic-nonmetal"
  | "polyatomic-nonmetal"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export function categoryKey(category: string): CategoryKey {
  const c = category.toLowerCase();
  if (c.includes("alkali metal") && !c.includes("alkaline")) return "alkali-metal";
  if (c.includes("alkaline earth")) return "alkaline-earth-metal";
  if (c.includes("post-transition")) return "post-transition-metal";
  if (c.includes("transition metal")) return "transition-metal";
  if (c.includes("metalloid")) return "metalloid";
  if (c.includes("diatomic")) return "diatomic-nonmetal";
  if (c.includes("polyatomic")) return "polyatomic-nonmetal";
  if (c.includes("noble gas")) return "noble-gas";
  if (c.includes("lanthanide")) return "lanthanide";
  if (c.includes("actinide")) return "actinide";
  return "unknown";
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  "alkali-metal": "Alkali metal",
  "alkaline-earth-metal": "Alkaline earth metal",
  "transition-metal": "Transition metal",
  "post-transition-metal": "Post-transition metal",
  metalloid: "Metalloid",
  "diatomic-nonmetal": "Diatomic nonmetal",
  "polyatomic-nonmetal": "Polyatomic nonmetal",
  "noble-gas": "Noble gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  unknown: "Unknown / predicted",
};

export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  "alkali-metal": "#ff7676",
  "alkaline-earth-metal": "#ffb16e",
  "transition-metal": "#ffd66e",
  "post-transition-metal": "#9be08a",
  metalloid: "#6ee0c8",
  "diatomic-nonmetal": "#6ec3ff",
  "polyatomic-nonmetal": "#7a8cff",
  "noble-gas": "#c388ff",
  lanthanide: "#ff8cd9",
  actinide: "#ff6eb0",
  unknown: "#7c8597",
};
