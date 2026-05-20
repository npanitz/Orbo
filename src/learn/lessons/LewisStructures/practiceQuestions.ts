/**
 * "Pick the right Lewis structure" practice phase data.
 *
 * Each question references an existing MoleculeDef (for the atom/bond
 * skeleton) and provides 3-4 candidate states. One candidate is correct;
 * the others have characteristic errors that map back to specific
 * algorithm-step mistakes. Wrong-answer explanations diagnose the mistake.
 */

import { MOLECULES_BY_ID } from "./molecules";
import type { MoleculeDef } from "./molecules";
import type { LewisState } from "./state";

export interface PracticeCandidate {
  /** Lone-pair count per atom id. Defaults to 0 for omitted atoms. */
  lonePairs: Record<string, number>;
  /** Bond order per bond index (matches molecule.bonds order). */
  bondOrders: number[];
  correct: boolean;
  /** Diagnostic explanation shown after picking this option. */
  explanation: string;
}

export interface PracticeQuestion {
  id: string;
  /** moleculeId from MOLECULES — used for atoms/bonds skeleton + display name. */
  moleculeId: string;
  prompt: string;
  candidates: PracticeCandidate[];
}

export const PRACTICE: PracticeQuestion[] = [
  // ----- NH3 -----
  {
    id: "p-nh3",
    moleculeId: "nh3",
    prompt: "Which is the correct Lewis structure for ammonia (NH₃)?",
    candidates: [
      {
        lonePairs: { N: 0 },
        bondOrders: [1, 1, 1],
        correct: false,
        explanation:
          "Three bonds but no lone pair on N. The bonds give nitrogen only 6 electrons — it's two short of an octet. The extra 2 valence electrons (8 total − 6 used in bonds) have to sit somewhere: as a lone pair on N.",
      },
      {
        lonePairs: { N: 1 },
        bondOrders: [1, 1, 1],
        correct: true,
        explanation:
          "Correct. Three single bonds use 6 of the 8 valence electrons; the remaining 2 sit as a lone pair on N. N has 6 (bonds) + 2 (lone pair) = 8. Each H has 2.",
      },
      {
        lonePairs: { N: 2 },
        bondOrders: [1, 1, 1],
        correct: false,
        explanation:
          "Two lone pairs would mean 6 (bonds) + 4 (LPs) = 10 electrons on N. That's an over-stuffed octet. There aren't enough valence electrons in the molecule to support this anyway — total is only 8.",
      },
    ],
  },

  // ----- H2O -----
  {
    id: "p-h2o",
    moleculeId: "h2o",
    prompt: "Which is the correct Lewis structure for water (H₂O)?",
    candidates: [
      {
        lonePairs: { O: 0 },
        bondOrders: [1, 1],
        correct: false,
        explanation:
          "Two bonds but no lone pairs on O. That gives oxygen only 4 electrons — half an octet. Water has 8 valence electrons total; once 4 are used in bonds, the remaining 4 must sit as 2 lone pairs on O.",
      },
      {
        lonePairs: { O: 2 },
        bondOrders: [1, 1],
        correct: true,
        explanation:
          "Right. Two bonds (4 electrons), two lone pairs on O (4 more). O has a full octet, each H has its duet. The lone pairs are why water is bent, not linear.",
      },
      {
        lonePairs: { O: 1 },
        bondOrders: [1, 2],
        correct: false,
        explanation:
          "A double bond to a hydrogen is impossible — hydrogen has only 1 valence electron, so it can only form one shared pair (a single bond). Hs never double-bond in Lewis structures.",
      },
      {
        lonePairs: { O: 4 },
        bondOrders: [1, 1],
        correct: false,
        explanation:
          "Four lone pairs is too many. That's 8 electrons just on O, plus 4 in bonds — 12 total. Water has only 8 valence electrons to distribute.",
      },
    ],
  },

  // ----- CO2 -----
  {
    id: "p-co2",
    moleculeId: "co2",
    prompt: "Which is the correct Lewis structure for carbon dioxide (CO₂)?",
    candidates: [
      {
        lonePairs: { O1: 3, O2: 3 },
        bondOrders: [1, 1],
        correct: false,
        explanation:
          "All 16 electrons are accounted for, but carbon has only 4 electrons (just the two single bonds). Carbon's octet isn't satisfied. The fix: promote both bonds to doubles by pulling one lone pair from each oxygen into the bond.",
      },
      {
        lonePairs: { O1: 2, O2: 2 },
        bondOrders: [2, 2],
        correct: true,
        explanation:
          "Correct. Two double bonds give carbon 8 electrons (4 + 4). Each oxygen has 4 (double bond) + 4 (two lone pairs) = 8. All 16 valence electrons accounted for.",
      },
      {
        lonePairs: { O1: 3, O2: 1 },
        bondOrders: [1, 3],
        correct: false,
        explanation:
          "Asymmetric promotion. The single bond on the left leaves carbon short of an octet on that side. Symmetric molecules with equivalent atoms should have symmetric Lewis structures — both bonds should look the same.",
      },
      {
        lonePairs: { O1: 2, O2: 2, C: 1 },
        bondOrders: [2, 2],
        correct: false,
        explanation:
          "Carbon has 8 from the bonds + 2 more from the lone pair = 10 total. Over-stuffed. Carbon never has lone pairs in CO₂ — its octet comes entirely from the bonds.",
      },
    ],
  },

  // ----- CH4 -----
  {
    id: "p-ch4",
    moleculeId: "ch4",
    prompt: "Which is the correct Lewis structure for methane (CH₄)?",
    candidates: [
      {
        lonePairs: {},
        bondOrders: [1, 1, 1, 1],
        correct: true,
        explanation:
          "Yes. Four single bonds use all 8 valence electrons. Carbon gets a full octet from the bonds alone (4 × 2 = 8). Each hydrogen gets its duet. No lone pairs anywhere.",
      },
      {
        lonePairs: { C: 1 },
        bondOrders: [1, 1, 1, 1],
        correct: false,
        explanation:
          "An extra lone pair adds 2 electrons that don't exist. Methane has only 8 valence electrons (4 from C + 4 × 1 from each H). The four bonds use all 8.",
      },
      {
        lonePairs: {},
        bondOrders: [2, 1, 1, 2],
        correct: false,
        explanation:
          "Double bonds to hydrogens are impossible — H has only 1 valence electron, so it can only form a single bond. Anytime you see a double bond to an H, the structure is wrong.",
      },
      {
        lonePairs: { C: 2 },
        bondOrders: [1, 1, 1, 1],
        correct: false,
        explanation:
          "Two lone pairs on C plus four bonds = 8 + 4 = 12 electrons. Way over-stuffed. Carbon never has lone pairs in CH₄.",
      },
    ],
  },

  // ----- HCN -----
  {
    id: "p-hcn",
    moleculeId: "hcn",
    prompt: "Which is the correct Lewis structure for hydrogen cyanide (HCN)?",
    candidates: [
      {
        lonePairs: { N: 3 },
        bondOrders: [1, 1],
        correct: false,
        explanation:
          "All 10 electrons placed, but carbon is short: H–C single + C–N single gives C only 4 electrons. Need to promote the C–N bond — twice — to get carbon to a full octet.",
      },
      {
        lonePairs: { N: 2 },
        bondOrders: [1, 2],
        correct: false,
        explanation:
          "Halfway there. A C–N double bond gives carbon 6 electrons (2 from H bond + 4 from double bond) — still short of an octet. One more promotion needed.",
      },
      {
        lonePairs: { N: 1 },
        bondOrders: [1, 3],
        correct: true,
        explanation:
          "Right. A C–N triple bond. Carbon: 2 (H bond) + 6 (triple bond) = 8. Nitrogen: 6 (triple bond) + 2 (lone pair) = 8. The single remaining lone pair on N is why HCN is a Lewis base (it can use that pair to bond).",
      },
      {
        lonePairs: { N: 0 },
        bondOrders: [2, 3],
        correct: false,
        explanation:
          "H can't form a double bond — it only has 1 valence electron. Also, no lone pair on N means too many electrons are in bonds.",
      },
    ],
  },
];

/** Build a synthetic LewisState from a candidate for rendering. */
export function stateFromCandidate(
  molecule: MoleculeDef,
  candidate: PracticeCandidate,
): LewisState {
  return {
    atoms: molecule.atoms.map((a) => ({
      id: a.id,
      counted: true,
      lonePairs: candidate.lonePairs[a.id] ?? 0,
    })),
    bonds: molecule.bonds.map((_, i) => ({
      order: (candidate.bondOrders[i] ?? 1) as 0 | 1 | 2 | 3,
    })),
    countedElectrons: 0,
    usedElectrons: 0,
    done: true,
  };
}

export function getMoleculeForQuestion(q: PracticeQuestion): MoleculeDef {
  const m = MOLECULES_BY_ID[q.moleculeId];
  if (!m) throw new Error(`Practice question ${q.id} references unknown molecule ${q.moleculeId}`);
  return m;
}
