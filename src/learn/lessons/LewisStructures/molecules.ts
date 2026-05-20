/**
 * Pre-scripted molecules for the Lewis-structure walkthrough.
 *
 * Each molecule has:
 *  - a list of atoms with positions and pre-computed lone-pair "slots"
 *  - a list of bonds (skeleton only — orders come from running steps)
 *  - an ordered list of steps that build the structure
 *
 * The renderer reads a `LewisState` derived from running the first N steps.
 */

export interface LewisAtomDef {
  id: string;
  symbol: string;
  /** Center-of-text coordinate (SVG units). */
  x: number;
  y: number;
  /** Atomic valence electron count — used to display "+N" when this atom
   *  is counted during step 1. */
  valence: number;
  /** Where lone-pair dots appear, in order. The renderer reads atom.lonePairs
   *  and fills the first N slots. List enough slots for the *maximum* lone
   *  pairs this atom will ever hold during the build sequence. */
  lonePairSlots: { x: number; y: number }[];
}

export interface LewisBondDef {
  /** atom ids */
  a: string;
  b: string;
}

export type Step =
  /** Count this atom's valence into the running total. */
  | { kind: "count"; atomId: string; narrative: string }
  /** Reveal all skeleton bonds at order 1. Consumes 2 e⁻ per bond. */
  | { kind: "skeleton"; narrative: string }
  /** Add one lone pair to this atom. Consumes 2 e⁻. */
  | { kind: "add-lone-pair"; atomId: string; narrative: string }
  /** Promote a bond's order by 1, using a lone pair from `donor`. No new e⁻
   *  consumed — we're re-allocating an existing pair from a lone pair into a
   *  bonding pair. */
  | { kind: "promote-bond"; bondIdx: number; donorAtomId: string; narrative: string }
  /** Final wrap-up step. */
  | { kind: "done"; narrative: string };

export interface MoleculeDef {
  id: string;
  formula: string;
  name: string;
  /** What this example is meant to teach — shown alongside the structure. */
  teachingPoint: string;
  atoms: LewisAtomDef[];
  bonds: LewisBondDef[];
  totalValence: number;
  steps: Step[];
}

// ============================================================================
// H2O — the easy case. No multi-bonds. Builds confidence.
// ============================================================================
const H2O: MoleculeDef = {
  id: "h2o",
  formula: "H₂O",
  name: "Water",
  teachingPoint:
    "The simplest case: place bonds, then drop the leftover electrons as lone pairs on the only atom that can take them.",
  atoms: [
    {
      id: "H1",
      symbol: "H",
      x: 120,
      y: 160,
      valence: 1,
      lonePairSlots: [],
    },
    {
      id: "O",
      symbol: "O",
      x: 220,
      y: 160,
      valence: 6,
      lonePairSlots: [
        { x: 220, y: 110 }, // above
        { x: 220, y: 210 }, // below
      ],
    },
    {
      id: "H2",
      symbol: "H",
      x: 320,
      y: 160,
      valence: 1,
      lonePairSlots: [],
    },
  ],
  bonds: [
    { a: "H1", b: "O" },
    { a: "O", b: "H2" },
  ],
  totalValence: 8,
  steps: [
    {
      kind: "count",
      atomId: "H1",
      narrative: "Hydrogen brings 1 valence electron.",
    },
    {
      kind: "count",
      atomId: "H2",
      narrative: "And so does the second hydrogen.",
    },
    {
      kind: "count",
      atomId: "O",
      narrative: "Oxygen contributes 6 more. Total: 8 valence electrons to place.",
    },
    {
      kind: "skeleton",
      narrative:
        "Connect the atoms with single bonds. Each bond is 2 shared electrons — we've used 4 of our 8.",
    },
    {
      kind: "add-lone-pair",
      atomId: "O",
      narrative:
        "Drop the remaining 4 electrons onto oxygen as lone pairs. Hydrogens already have 2 electrons each (their 'duet' — happy).",
    },
    {
      kind: "add-lone-pair",
      atomId: "O",
      narrative:
        "Oxygen now has 8 electrons total: 4 from the two bonds, 4 from the two lone pairs. Full octet.",
    },
    {
      kind: "done",
      narrative:
        "That's water. Two single bonds, two lone pairs on oxygen — the bent shape you've seen in textbooks comes directly from this structure.",
    },
  ],
};

// ============================================================================
// NH3 — central atom with a lone pair. Slightly less symmetric.
// ============================================================================
const NH3: MoleculeDef = {
  id: "nh3",
  formula: "NH₃",
  name: "Ammonia",
  teachingPoint:
    "Same algorithm, central atom now has 3 bonds and 1 lone pair. That lone pair is what makes ammonia a base.",
  atoms: [
    {
      id: "N",
      symbol: "N",
      x: 220,
      y: 170,
      valence: 5,
      lonePairSlots: [
        { x: 220, y: 115 }, // above
      ],
    },
    {
      id: "H1",
      symbol: "H",
      x: 150,
      y: 240,
      valence: 1,
      lonePairSlots: [],
    },
    {
      id: "H2",
      symbol: "H",
      x: 220,
      y: 260,
      valence: 1,
      lonePairSlots: [],
    },
    {
      id: "H3",
      symbol: "H",
      x: 290,
      y: 240,
      valence: 1,
      lonePairSlots: [],
    },
  ],
  bonds: [
    { a: "N", b: "H1" },
    { a: "N", b: "H2" },
    { a: "N", b: "H3" },
  ],
  totalValence: 8,
  steps: [
    {
      kind: "count",
      atomId: "N",
      narrative:
        "Nitrogen contributes 5 valence electrons — it's in group 15 (column 5 of main-group elements).",
    },
    { kind: "count", atomId: "H1", narrative: "Hydrogen 1 brings 1 more." },
    { kind: "count", atomId: "H2", narrative: "Hydrogen 2 brings 1 more." },
    {
      kind: "count",
      atomId: "H3",
      narrative: "Hydrogen 3 brings 1 more. Total: 8 valence electrons.",
    },
    {
      kind: "skeleton",
      narrative:
        "Three single bonds — one from N to each hydrogen. That uses 6 of our 8 electrons.",
    },
    {
      kind: "add-lone-pair",
      atomId: "N",
      narrative:
        "The remaining 2 electrons sit as a lone pair on nitrogen. N now has 3 bonds + 1 lone pair = 8 electrons.",
    },
    {
      kind: "done",
      narrative:
        "Ammonia, complete. That lone pair on nitrogen is reactive — it's what lets NH₃ grab a proton from acids to form NH₄⁺.",
    },
  ],
};

// ============================================================================
// CO2 — the "aha" molecule. Single bonds don't satisfy the carbon, so we
// promote both bonds to double. The most pedagogically important case.
// ============================================================================
const CO2: MoleculeDef = {
  id: "co2",
  formula: "CO₂",
  name: "Carbon Dioxide",
  teachingPoint:
    "After distributing lone pairs, carbon is still short of an octet. The fix: promote single bonds to double bonds. This is when multi-bonds appear in the algorithm.",
  atoms: [
    {
      id: "O1",
      symbol: "O",
      x: 110,
      y: 160,
      valence: 6,
      lonePairSlots: [
        { x: 110, y: 110 }, // above
        { x: 110, y: 210 }, // below
        { x: 65, y: 160 }, // outward (left) — the one that gets pulled into the double bond
      ],
    },
    {
      id: "C",
      symbol: "C",
      x: 220,
      y: 160,
      valence: 4,
      lonePairSlots: [],
    },
    {
      id: "O2",
      symbol: "O",
      x: 330,
      y: 160,
      valence: 6,
      lonePairSlots: [
        { x: 330, y: 110 }, // above
        { x: 330, y: 210 }, // below
        { x: 375, y: 160 }, // outward (right)
      ],
    },
  ],
  bonds: [
    { a: "O1", b: "C" },
    { a: "C", b: "O2" },
  ],
  totalValence: 16,
  steps: [
    { kind: "count", atomId: "O1", narrative: "Oxygen brings 6 electrons." },
    { kind: "count", atomId: "C", narrative: "Carbon brings 4 — group 14, 4 valence electrons." },
    { kind: "count", atomId: "O2", narrative: "Second oxygen brings another 6. Total: 16." },
    {
      kind: "skeleton",
      narrative:
        "Carbon is the central atom (least electronegative non-H here). Two single bonds: O–C and C–O. That uses 4 electrons.",
    },
    {
      kind: "add-lone-pair",
      atomId: "O1",
      narrative:
        "Distribute remaining electrons to the outer atoms first. First lone pair onto the left oxygen.",
    },
    { kind: "add-lone-pair", atomId: "O1", narrative: "Second lone pair on the left oxygen." },
    {
      kind: "add-lone-pair",
      atomId: "O1",
      narrative:
        "Third lone pair. The left oxygen now has 6 lone-pair electrons + 2 bonding = 8. Octet complete.",
    },
    { kind: "add-lone-pair", atomId: "O2", narrative: "Now the right oxygen, same way." },
    { kind: "add-lone-pair", atomId: "O2", narrative: "Another lone pair on the right oxygen." },
    {
      kind: "add-lone-pair",
      atomId: "O2",
      narrative:
        "Third lone pair on the right. All 16 electrons placed. But now check carbon — only 4 electrons (2 bonds × 2). Not a full octet!",
    },
    {
      kind: "promote-bond",
      bondIdx: 0,
      donorAtomId: "O1",
      narrative:
        "Promote the left bond to a double bond by pulling a lone pair from the left oxygen into the bond. No new electrons — we're re-using.",
    },
    {
      kind: "promote-bond",
      bondIdx: 1,
      donorAtomId: "O2",
      narrative:
        "Same on the right: lone pair from the right oxygen becomes the second bonding pair. Carbon now has 4 bonds × 2 = 8 electrons. Octet satisfied.",
    },
    {
      kind: "done",
      narrative:
        "O=C=O. Each atom has a full octet, all 16 electrons accounted for. The double bonds are why CO₂ is linear — and why it's such a stable molecule.",
    },
  ],
};

// ============================================================================
// CH4 — no lone pairs at all. Shows that not every center has them.
// ============================================================================
const CH4: MoleculeDef = {
  id: "ch4",
  formula: "CH₄",
  name: "Methane",
  teachingPoint:
    "Methane fills carbon's octet entirely through bonds — no lone pairs anywhere. Four single bonds is itself an octet.",
  atoms: [
    { id: "C", symbol: "C", x: 220, y: 170, valence: 4, lonePairSlots: [] },
    { id: "H1", symbol: "H", x: 220, y: 95, valence: 1, lonePairSlots: [] },   // top
    { id: "H2", symbol: "H", x: 295, y: 170, valence: 1, lonePairSlots: [] },  // right
    { id: "H3", symbol: "H", x: 220, y: 245, valence: 1, lonePairSlots: [] },  // bottom
    { id: "H4", symbol: "H", x: 145, y: 170, valence: 1, lonePairSlots: [] },  // left
  ],
  bonds: [
    { a: "C", b: "H1" },
    { a: "C", b: "H2" },
    { a: "C", b: "H3" },
    { a: "C", b: "H4" },
  ],
  totalValence: 8,
  steps: [
    { kind: "count", atomId: "C", narrative: "Carbon brings 4 valence electrons." },
    { kind: "count", atomId: "H1", narrative: "One hydrogen, 1 electron." },
    { kind: "count", atomId: "H2", narrative: "Another hydrogen." },
    { kind: "count", atomId: "H3", narrative: "And another." },
    { kind: "count", atomId: "H4", narrative: "And the fourth. Total: 8 valence electrons." },
    {
      kind: "skeleton",
      narrative:
        "Four single bonds from C to each H. That uses all 8 electrons. Every atom is satisfied: each H has 2 electrons, C has 8.",
    },
    {
      kind: "done",
      narrative:
        "Methane, done. No lone pairs — carbon's octet is filled entirely by its four bonds. This is why CH₄ is so chemically inert.",
    },
  ],
};

// ============================================================================
// HCN — needs a triple bond. Same logic as CO₂ but on a less symmetric layout.
// ============================================================================
const HCN: MoleculeDef = {
  id: "hcn",
  formula: "HCN",
  name: "Hydrogen Cyanide",
  teachingPoint:
    "When the central atom needs a lot more electrons, the algorithm can promote a bond all the way to a triple bond. HCN is the cleanest example.",
  atoms: [
    { id: "H", symbol: "H", x: 110, y: 160, valence: 1, lonePairSlots: [] },
    { id: "C", symbol: "C", x: 220, y: 160, valence: 4, lonePairSlots: [] },
    {
      id: "N",
      symbol: "N",
      x: 330,
      y: 160,
      valence: 5,
      lonePairSlots: [
        { x: 330, y: 110 }, // above
        { x: 330, y: 210 }, // below
        { x: 385, y: 160 }, // right — gets pulled in on triple-bond promotion
      ],
    },
  ],
  bonds: [
    { a: "H", b: "C" },
    { a: "C", b: "N" },
  ],
  totalValence: 10,
  steps: [
    { kind: "count", atomId: "H", narrative: "Hydrogen contributes 1 electron." },
    { kind: "count", atomId: "C", narrative: "Carbon adds 4 more." },
    { kind: "count", atomId: "N", narrative: "Nitrogen adds 5. Total: 10 valence electrons." },
    {
      kind: "skeleton",
      narrative:
        "Carbon is the central atom (H is always outer). Two single bonds: H–C and C–N. Uses 4 electrons.",
    },
    {
      kind: "add-lone-pair",
      atomId: "N",
      narrative: "Distribute leftovers to N (H is already satisfied with its bond). First lone pair.",
    },
    { kind: "add-lone-pair", atomId: "N", narrative: "Second lone pair on N." },
    {
      kind: "add-lone-pair",
      atomId: "N",
      narrative:
        "Third lone pair on N. All 10 electrons placed — but check carbon. Only 4 electrons! Not an octet.",
    },
    {
      kind: "promote-bond",
      bondIdx: 1,
      donorAtomId: "N",
      narrative:
        "Promote the C–N bond by pulling a lone pair from N into the bond. Now it's a double bond. C has 6 electrons.",
    },
    {
      kind: "promote-bond",
      bondIdx: 1,
      donorAtomId: "N",
      narrative:
        "Still short — promote again. Another lone pair from N becomes part of the bond. Now C–N is a triple bond. C: 2 (H bond) + 6 (triple bond) = 8 ✓. N: 2 (lone pair) + 6 (triple bond) = 8 ✓.",
    },
    {
      kind: "done",
      narrative:
        "H–C≡N. One lone pair on nitrogen, a triple bond between C and N. The triple bond is what makes cyanide so chemically distinct.",
    },
  ],
};

// ============================================================================
// N₂ — symmetric triple-bond case. Both atoms equivalent.
// ============================================================================
const N2: MoleculeDef = {
  id: "n2",
  formula: "N₂",
  name: "Nitrogen Gas",
  teachingPoint:
    "Both atoms equivalent. Each ends up contributing one lone pair to the triple bond. This is what makes N₂ one of the most stable molecules in nature.",
  atoms: [
    {
      id: "N1",
      symbol: "N",
      x: 170,
      y: 160,
      valence: 5,
      lonePairSlots: [
        { x: 170, y: 110 }, // above
        { x: 115, y: 160 }, // left — donated during first promotion
      ],
    },
    {
      id: "N2",
      symbol: "N",
      x: 270,
      y: 160,
      valence: 5,
      lonePairSlots: [
        { x: 270, y: 110 }, // above
        { x: 325, y: 160 }, // right — donated during second promotion
      ],
    },
  ],
  bonds: [{ a: "N1", b: "N2" }],
  totalValence: 10,
  steps: [
    { kind: "count", atomId: "N1", narrative: "First nitrogen contributes 5 electrons." },
    { kind: "count", atomId: "N2", narrative: "Second nitrogen contributes 5. Total: 10." },
    {
      kind: "skeleton",
      narrative: "A single N–N bond. Uses 2 of the 10 electrons.",
    },
    { kind: "add-lone-pair", atomId: "N1", narrative: "Place a lone pair on N1." },
    { kind: "add-lone-pair", atomId: "N2", narrative: "Place a lone pair on N2." },
    { kind: "add-lone-pair", atomId: "N1", narrative: "Another lone pair on N1." },
    {
      kind: "add-lone-pair",
      atomId: "N2",
      narrative:
        "Fourth lone pair, on N2. All 10 electrons placed. But each N has only 6 electrons (1 bond + 2 LPs) — short by 2.",
    },
    {
      kind: "promote-bond",
      bondIdx: 0,
      donorAtomId: "N1",
      narrative:
        "N1 contributes a lone pair to the bond — it becomes a double bond. N1 has 1 LP + 4 (double bond) = 6. N2 has 2 LPs + 4 = 8 ✓. N1 still short.",
    },
    {
      kind: "promote-bond",
      bondIdx: 0,
      donorAtomId: "N2",
      narrative:
        "Now N2 contributes a lone pair. Triple bond. Each N: 1 LP + 6 (triple bond) = 8 ✓. Symmetric. Done.",
    },
    {
      kind: "done",
      narrative:
        "N≡N. A triple bond and one lone pair on each nitrogen. This bond is enormously strong — over 900 kJ/mol — which is why N₂ is the dominant form of nitrogen in the atmosphere.",
    },
  ],
};

export const MOLECULES: MoleculeDef[] = [H2O, NH3, CO2, CH4, HCN, N2];

export const MOLECULES_BY_ID: Record<string, MoleculeDef> = Object.fromEntries(
  MOLECULES.map((m) => [m.id, m]),
);
