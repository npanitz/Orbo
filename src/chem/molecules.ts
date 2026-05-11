// Recipe library. Built-in entries are generated from SMILES at module load.
// User custom entries live in the inventoryStore and are merged in by
// `getAllRecipes()`. The rest of the app should call `getAllRecipes()` and
// `getRecipeOrder()` rather than reading RECIPES / RECIPE_ORDER directly.

import { smilesToRecipe } from "./smiles";
import { inventoryStore } from "../storage/inventoryStore";

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

const BUILTIN_RECIPES: Record<string, Recipe> = Object.fromEntries(
  Object.entries(SMILES_LIBRARY).map(([name, smi]) => [name, smilesToRecipe(smi, name)]),
);
const BUILTIN_ORDER = Object.keys(BUILTIN_RECIPES);

/** Built-in recipes (read-only). Kept exported so legacy callers still work. */
export const RECIPES = BUILTIN_RECIPES;
export const RECIPE_ORDER = BUILTIN_ORDER;

/** Returns built-ins merged with the user's custom inventory. Failed-to-parse
 * custom entries are silently skipped (the UI shows the parse error inline at
 * add-time, so we don't surface it again here). */
export function getAllRecipes(): Record<string, Recipe> {
  const out: Record<string, Recipe> = { ...BUILTIN_RECIPES };
  for (const entry of inventoryStore.list()) {
    try {
      out[entry.id] = smilesToRecipe(entry.smiles, entry.name);
    } catch {
      // skip malformed (shouldn't happen — validated on add)
    }
  }
  return out;
}

/** Order: built-ins first, then custom in insertion order. */
export function getRecipeOrder(): string[] {
  return [...BUILTIN_ORDER, ...inventoryStore.list().map((e) => e.id)];
}

/** True if the given key is a user-added entry (vs. a built-in). */
export function isCustomRecipe(key: string): boolean {
  return key.startsWith("custom_");
}
