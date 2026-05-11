import type { AtomState } from "./AtomBuilder";

export interface Challenge {
  id: string;
  prompt: string;
  detail: string;
  /** Returns true when this challenge's goal is satisfied. */
  check: (s: AtomState) => boolean;
  /** Optional hint after a wrong attempt. */
  hint?: string;
  /** Element symbol associated with the answer — used for the connection screen. */
  elementSymbol?: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "hydrogen",
    prompt: "Build a neutral hydrogen atom",
    detail: "The simplest atom. 1 proton, 1 electron, 0 neutrons.",
    check: (s) => s.p === 1 && s.n === 0 && s.e === 1,
    hint: "Hydrogen has atomic number 1, so 1 proton — and a neutral atom has matching electrons.",
    elementSymbol: "H",
  },
  {
    id: "deuterium",
    prompt: "Now add one neutron",
    detail:
      "You just made deuterium — an isotope of hydrogen. Same element (still hydrogen), different mass.",
    check: (s) => s.p === 1 && s.n === 1 && s.e === 1,
    elementSymbol: "H",
  },
  {
    id: "helium",
    prompt: "Build a neutral helium atom",
    detail:
      "Helium has 2 protons. To stay neutral and stable, give it 2 neutrons and 2 electrons.",
    check: (s) => s.p === 2 && s.n === 2 && s.e === 2,
    hint: "Atomic number 2 means 2 protons. Match the electrons.",
    elementSymbol: "He",
  },
  {
    id: "lithium",
    prompt: "Build a neutral lithium atom",
    detail:
      "Lithium starts a new row on the periodic table — its 3rd electron goes into a second shell.",
    check: (s) => s.p === 3 && s.n === 4 && s.e === 3,
    hint: "Lithium has 3 protons and a mass number of about 7, so 4 neutrons.",
    elementSymbol: "Li",
  },
  {
    id: "carbon-14",
    prompt: "Make carbon-14",
    detail:
      "Carbon-14 is the famous radioactive isotope used for dating. Carbon has 6 protons; the '14' tells you the mass number.",
    check: (s) => s.p === 6 && s.n === 8 && s.e === 6,
    hint: "Mass number = protons + neutrons. 14 − 6 = 8 neutrons.",
    elementSymbol: "C",
  },
  {
    id: "sodium-ion",
    prompt: "Build a sodium cation (Na⁺)",
    detail:
      "Sodium readily loses one electron to form a +1 ion — that's how it bonds with chlorine to make salt.",
    check: (s) => s.p === 11 && s.n === 12 && s.e === 10,
    hint: "Sodium has 11 protons and 12 neutrons. A +1 ion means one fewer electron than protons.",
    elementSymbol: "Na",
  },
];
