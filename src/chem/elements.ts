import { Vector3 } from "three";

// Element data. Bond/lone directions are unit vectors in each atom's local frame,
// drawn from the four corners of a tetrahedron — real VSEPR geometry.

const T = 1 / Math.sqrt(3);
const TET_A = new Vector3(T, T, T);
const TET_B = new Vector3(T, -T, -T);
const TET_C = new Vector3(-T, T, -T);
const TET_D = new Vector3(-T, -T, T);

export interface ElementConfig {
  color: number;
  radius: number;
  bonds: Vector3[];
  lone: Vector3[];
}

export const ELEMENTS: Record<string, ElementConfig> = {
  H: {
    color: 0xeaf2ff,
    radius: 0.32,
    bonds: [new Vector3(1, 0, 0)],
    lone: [],
  },
  C: {
    color: 0x474d5c,
    radius: 0.45,
    bonds: [TET_A, TET_B, TET_C, TET_D],
    lone: [],
  },
  N: {
    color: 0x7398ff,
    radius: 0.45,
    bonds: [TET_A, TET_B, TET_C],
    lone: [TET_D],
  },
  O: {
    color: 0xff5966,
    radius: 0.45,
    bonds: [TET_A, TET_B],
    lone: [TET_C, TET_D],
  },
};

export const ELEMENT_SYMBOLS = ["H", "C", "N", "O"];

const NAMED_FORMULAS: Record<string, string> = {
  H2O: "H₂O",
  H3N: "NH₃",
  CH4: "CH₄",
  CH4O: "CH₃OH",
  H2: "H₂",
  N2: "N₂",
  O2: "O₂",
  C2H6: "C₂H₆",
  C2H4: "C₂H₄",
  CHN: "HCN",
  CH2O: "CH₂O",
  CH4N: "CH₃NH₂",
  H4N2: "N₂H₄",
  H2O2: "H₂O₂",
};

const SUBS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

export function subscript(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUBS[Number(c)])
    .join("");
}

export function formulaFor(component: { element: string }[]): string {
  const counts = new Map<string, number>();
  for (const a of component) counts.set(a.element, (counts.get(a.element) ?? 0) + 1);
  const keys = [...counts.keys()].sort();
  let key = "";
  for (const k of keys) {
    key += k;
    if (counts.get(k)! > 1) key += counts.get(k);
  }
  if (NAMED_FORMULAS[key]) return NAMED_FORMULAS[key];
  let pretty = "";
  for (const k of keys) {
    pretty += k;
    if (counts.get(k)! > 1) pretty += subscript(counts.get(k)!);
  }
  return pretty;
}
