/**
 * Lewis-structure state model + reducer.
 *
 * The `MoleculeDef.steps` array describes a *trajectory*. To render the
 * structure as of "step N", we start from an initial empty state and fold
 * the first N steps over it via `applyStep`. This way the canvas is just a
 * pure function of the current state and the step index.
 */

import type { MoleculeDef, Step } from "./molecules";

export interface AtomState {
  id: string;
  /** True once this atom's valence has been counted in step 1. */
  counted: boolean;
  /** Number of lone pairs currently drawn on this atom. */
  lonePairs: number;
}

export interface BondState {
  /** 0 = not yet drawn, 1/2/3 = single/double/triple. */
  order: 0 | 1 | 2 | 3;
}

export interface LewisState {
  atoms: AtomState[];
  bonds: BondState[];
  /** Running total of valence electrons counted in step 1. */
  countedElectrons: number;
  /** Electrons used so far (bonds × 2 + lone-pair count × 2). */
  usedElectrons: number;
  /** True once the final "done" step has fired. */
  done: boolean;
}

export function initialState(molecule: MoleculeDef): LewisState {
  return {
    atoms: molecule.atoms.map((a) => ({
      id: a.id,
      counted: false,
      lonePairs: 0,
    })),
    bonds: molecule.bonds.map(() => ({ order: 0 })),
    countedElectrons: 0,
    usedElectrons: 0,
    done: false,
  };
}

/** Apply one step. Returns a new state (immutable update). */
export function applyStep(
  state: LewisState,
  step: Step,
  molecule: MoleculeDef,
): LewisState {
  switch (step.kind) {
    case "count": {
      const def = molecule.atoms.find((a) => a.id === step.atomId)!;
      return {
        ...state,
        atoms: state.atoms.map((a) =>
          a.id === step.atomId ? { ...a, counted: true } : a,
        ),
        countedElectrons: state.countedElectrons + def.valence,
      };
    }
    case "skeleton": {
      // Set every undrawn bond to order 1; count electrons used.
      const newBonds = state.bonds.map((b) =>
        b.order === 0 ? { order: 1 as const } : b,
      );
      const usedDelta = newBonds.reduce(
        (n, b, i) => n + (b.order - state.bonds[i].order) * 2,
        0,
      );
      return {
        ...state,
        bonds: newBonds,
        usedElectrons: state.usedElectrons + usedDelta,
      };
    }
    case "add-lone-pair": {
      return {
        ...state,
        atoms: state.atoms.map((a) =>
          a.id === step.atomId ? { ...a, lonePairs: a.lonePairs + 1 } : a,
        ),
        usedElectrons: state.usedElectrons + 2,
      };
    }
    case "promote-bond": {
      const bonds = state.bonds.map((b, i) =>
        i === step.bondIdx
          ? { order: Math.min(3, b.order + 1) as 0 | 1 | 2 | 3 }
          : b,
      );
      const atoms = state.atoms.map((a) =>
        a.id === step.donorAtomId ? { ...a, lonePairs: Math.max(0, a.lonePairs - 1) } : a,
      );
      // Promotion re-uses an existing lone pair: bond gains 2 e, donor loses 2.
      // Net usedElectrons unchanged.
      return { ...state, atoms, bonds };
    }
    case "done": {
      return { ...state, done: true };
    }
  }
}

/** Fold the first N steps to compute state at step index. */
export function stateAtStep(molecule: MoleculeDef, stepIndex: number): LewisState {
  let s = initialState(molecule);
  for (let i = 0; i < stepIndex && i < molecule.steps.length; i++) {
    s = applyStep(s, molecule.steps[i], molecule);
  }
  return s;
}
