// Recipe library. Recipes are generated from SMILES strings at module load.
// To add a molecule: drop a new entry into SMILES_LIBRARY below.
//
// Bond tuples are [atomIndexA, slotA, atomIndexB, slotB]. The SMILES adapter
// emits them in DFS order so the rigid `formBond` aligner places each new
// atom against an already-anchored sub-molecule.

import { smilesToRecipe } from "./smiles";

export interface Recipe {
  name: string;
  atoms: string[];
  bonds: [number, number, number, number][];
}

export const SMILES_LIBRARY: Record<string, string> = {
  methane: "C",
  ethane: "CC",
  propane: "CCC",
  butane: "CCCC",
  isobutane: "CC(C)C",
  water: "O",
  ammonia: "N",
  methanol: "CO",
  ethanol: "CCO",
  methylamine: "CN",
  "dimethyl ether": "COC",
};

export const RECIPES: Record<string, Recipe> = Object.fromEntries(
  Object.entries(SMILES_LIBRARY).map(([name, smi]) => [name, smilesToRecipe(smi, name)]),
);

export const RECIPE_ORDER = Object.keys(RECIPES);
