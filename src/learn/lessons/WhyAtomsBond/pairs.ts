import type { Potential } from "./morsePotential";

/**
 * Pre-defined atom pairs the explore phase walks the student through.
 *
 * Potential parameters are scaled to fit on shared axes (E ∈ [-5, +3] eV,
 * r ∈ [40, 500] pm) and to make the pedagogical comparisons crisp — they're
 * not literal experimental constants. The *shapes* match real chemistry
 * (deep H-H well, no He-He well but real repulsion, etc.); the numbers are
 * tuned for visualization.
 */

export type PairId = "h-h" | "he-he" | "cl-cl" | "na-cl";

export interface PairDef {
  id: PairId;
  symA: string;     // element symbol
  symB: string;
  zA: number;       // atomic number — used to look up CPK color
  zB: number;
  label: string;
  bondType: "Covalent" | "No bond" | "Ionic";

  potential: Potential;

  // Slider range in pm — wider for weaker / no-bond pairs
  rMin: number;
  rMax: number;
  /** Where to snap the slider when switching to this pair. For bonded pairs
   * this is the equilibrium distance; for no-bond pairs it's a position where
   * the student can see the curve still has a Pauli wall to climb. */
  displayDefaultR: number;

  // Narrative blocks shown beside the graph
  pattern: string;
  mechanism: string;
  insight: string;
}

export const PAIRS: PairDef[] = [
  {
    id: "h-h",
    symA: "H",
    symB: "H",
    zA: 1,
    zB: 1,
    label: "H – H · hydrogen",
    bondType: "Covalent",
    potential: { kind: "morse", D: 4.5, r0: 74, a: 0.025 },
    rMin: 40,
    rMax: 500,
    displayDefaultR: 74,
    pattern: "Both atoms have a half-empty shell.",
    mechanism:
      "When they share a pair of electrons, both end up with a full shell of 2. The system reaches lower energy bonded than apart — drag the slider close and watch the curve fall into a deep well at about 74 pm.",
    insight:
      "This is why hydrogen exists as H₂ in nature. Lone H atoms are rare; the energetic incentive to pair up is overwhelming.",
  },
  {
    id: "he-he",
    symA: "He",
    symB: "He",
    zA: 2,
    zB: 2,
    label: "He – He · helium",
    bondType: "No bond",
    // Pure Pauli repulsion — no attractive well at all. The "wall" sits
    // around 120 pm; below that, the energy climbs exponentially.
    potential: { kind: "repulsion", rWall: 120, scale: 18, epsilon: 3 },
    rMin: 40,
    rMax: 500,
    displayDefaultR: 200,
    pattern: "Both atoms already have full shells.",
    mechanism:
      "There's nothing to gain by sharing — both atoms are already at their most stable. The curve has no well to fall into. But there's still a repulsive wall on the close side: get them too near and Pauli exclusion shoves back.",
    insight:
      "This is the signature of a noble gas. No well → no thermodynamic incentive to bond. They'll always settle far apart, and they'll resist being forced close. Helium stays helium.",
  },
  {
    id: "cl-cl",
    symA: "Cl",
    symB: "Cl",
    zA: 17,
    zB: 17,
    label: "Cl – Cl · chlorine",
    bondType: "Covalent",
    potential: { kind: "morse", D: 2.5, r0: 199, a: 0.020 },
    rMin: 40,
    rMax: 500,
    displayDefaultR: 199,
    pattern: "Each Cl is one electron short of a full outer shell.",
    mechanism:
      "Sharing one electron pair fills both shells. A well forms — not as deep as H–H, but unambiguously a bond. Same shape, same idea, slightly different numbers.",
    insight:
      "Cl₂ is the form chlorine takes in nature. Same logic as H₂: atoms with empty valence seats will bond when partners are available.",
  },
  {
    id: "na-cl",
    symA: "Na",
    symB: "Cl",
    zA: 11,
    zB: 17,
    label: "Na – Cl · sodium chloride",
    bondType: "Ionic",
    potential: { kind: "morse", D: 4.1, r0: 236, a: 0.018 },
    rMin: 40,
    rMax: 500,
    displayDefaultR: 236,
    pattern:
      "Sodium has 1 valence electron to give. Chlorine has space for exactly 1.",
    mechanism:
      "The electron doesn't get shared — it transfers fully. Na becomes Na⁺, Cl becomes Cl⁻, and Coulomb attraction between opposite charges digs a deep well. This is an *ionic* bond.",
    insight:
      "Ionic bonds are often deeper than covalent ones because the electrostatic pull between full charges is strong. This is why table salt is so stable.",
  },
];

export const PAIRS_BY_ID: Record<PairId, PairDef> = Object.fromEntries(
  PAIRS.map((p) => [p.id, p]),
) as Record<PairId, PairDef>;
