import { Vector3 } from "three";
import { Atom } from "./atom";
import { ELEMENTS, formulaFor } from "./elements";
import { getAllRecipes } from "./molecules";

/**
 * Build a molecule from a recipe key.
 * Atoms are returned scene-detached — caller adds them to whichever scene they
 * want. Bond order in the recipe matters; earlier bonds anchor the geometry.
 */
export function buildMolecule(recipeKey: string): Atom[] {
  const recipe = getAllRecipes()[recipeKey];
  if (!recipe) return [];

  const atoms = recipe.atoms.map((el, i) => {
    const a = new Atom(el, ELEMENTS[el]);
    a.group.position.set(i * 3, 0, 0);
    return a;
  });

  for (const [ai, si, bi, sj] of recipe.bonds) {
    atoms[ai].formBond(si, atoms[bi], sj);
  }
  return atoms;
}

/** Translate all atoms so the molecule's bounding-box center is at `target`. */
export function recenterMolecule(atoms: Atom[], target = new Vector3()): void {
  if (atoms.length === 0) return;
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  for (const a of atoms) {
    min.min(a.position);
    max.max(a.position);
  }
  const center = min.clone().add(max).multiplyScalar(0.5);
  const delta = target.clone().sub(center);
  for (const a of atoms) a.position.add(delta);
}

/** Bounding sphere radius around origin — used to fit a camera around the molecule. */
export function moleculeRadius(atoms: Atom[]): number {
  let r = 0;
  for (const a of atoms) {
    const d = a.position.length() + a.radius;
    if (d > r) r = d;
  }
  return r;
}

/** Pretty formula for a recipe (uses the shared atom-counting prettifier). */
export function recipeFormula(recipeKey: string): string {
  const recipe = getAllRecipes()[recipeKey];
  if (!recipe) return "";
  return formulaFor(recipe.atoms.map((element) => ({ element })));
}
