import { ELEMENTS } from "./elements";
import type { Recipe } from "./molecules";

/**
 * Minimal SMILES → Recipe adapter.
 *
 * Supported subset:
 *   - organic atoms: H, C, N, O (extend by adding to ELEMENTS)
 *   - branches: ( )
 *   - bond markers: -, =, #, :  (multi-bonds are recognized for valence
 *     accounting but currently emit a single bond stub each; double-bonded
 *     atoms may show a leftover unused slot — see TODO at bottom of file)
 *
 * Not yet supported (parser throws a helpful error):
 *   - ring closures (digits, %nn)
 *   - bracket atoms [X], charges, isotopes, stereo markers
 *
 * Design: we treat SMILES as a tree-shaped graph rooted at atom 0. The parser
 * emits bonds in DFS order so each subsequent bond attaches exactly one new
 * atom to the already-placed sub-molecule — which is exactly what the rigid
 * `formBond` aligner expects.
 */

interface ParsedAtom {
  element: string;
}

type ParsedBond = readonly [a: number, b: number, order: number];

interface ParsedMolecule {
  atoms: ParsedAtom[];
  bonds: ParsedBond[];
}

const VALENCE: Record<string, number> = {
  H: 1,
  C: 4,
  N: 3,
  O: 2,
};

export function smilesToRecipe(smiles: string, name: string): Recipe {
  const parsed = parseSmiles(smiles);
  addImplicitHydrogens(parsed);
  return assemble(parsed, name);
}

// ---------- Parser ----------

function parseSmiles(smi: string): ParsedMolecule {
  const atoms: ParsedAtom[] = [];
  const bonds: ParsedBond[] = [];
  const branchStack: number[] = [];
  let pos = 0;
  let lastAtom = -1;
  let pendingOrder = 1;

  const fail = (msg: string): never => {
    throw new Error(`SMILES "${smi}": ${msg} (at position ${pos})`);
  };

  while (pos < smi.length) {
    const ch = smi[pos];

    if (ch === "(") {
      if (lastAtom < 0) fail("unexpected '('");
      branchStack.push(lastAtom);
      pos++;
    } else if (ch === ")") {
      const top = branchStack.pop();
      if (top === undefined) fail("unmatched ')'");
      lastAtom = top!;
      pos++;
    } else if (ch === "-" || ch === "=" || ch === "#" || ch === ":") {
      pendingOrder = ch === "=" ? 2 : ch === "#" ? 3 : 1;
      pos++;
    } else if (ch === "/" || ch === "\\") {
      // stereo bond markers — ignore for now, treat as single
      pos++;
    } else if (/[0-9%]/.test(ch)) {
      fail("ring closures are not yet supported");
    } else if (ch === "[") {
      fail("bracket atoms ([X]) are not yet supported");
    } else if (/[A-Za-z]/.test(ch)) {
      const element = readAtom(smi, pos);
      pos += element.length;
      const newIdx = atoms.length;
      atoms.push({ element });
      if (lastAtom >= 0) {
        bonds.push([lastAtom, newIdx, pendingOrder] as const);
      }
      lastAtom = newIdx;
      pendingOrder = 1;
    } else if (/\s/.test(ch)) {
      pos++;
    } else {
      fail(`unrecognized character '${ch}'`);
    }
  }

  if (branchStack.length > 0) fail("unmatched '('");
  return { atoms, bonds };
}

/** Read a one- or two-letter element symbol starting at `pos`. */
function readAtom(smi: string, pos: number): string {
  const c0 = smi[pos];
  const c1 = smi[pos + 1];
  // Two-letter elements that start with these
  if (c0 === "C" && c1 === "l") return "Cl";
  if (c0 === "B" && c1 === "r") return "Br";
  // Aromatic notation: c, n, o → treat as ordinary C, N, O (input must be
  // kekulized; explicit double bonds let valence math work).
  return c0.toUpperCase();
}

// ---------- Implicit hydrogens ----------

function addImplicitHydrogens(mol: ParsedMolecule): void {
  const heavyCount = mol.atoms.length;
  const used = new Array<number>(heavyCount).fill(0);
  for (const [a, b, order] of mol.bonds) {
    used[a] += order;
    used[b] += order;
  }
  for (let i = 0; i < heavyCount; i++) {
    const el = mol.atoms[i].element;
    if (el === "H") continue;
    const v = VALENCE[el];
    if (v === undefined) continue;
    const need = Math.max(0, v - used[i]);
    for (let k = 0; k < need; k++) {
      const hIdx = mol.atoms.length;
      mol.atoms.push({ element: "H" });
      mol.bonds.push([i, hIdx, 1] as const);
    }
  }
}

// ---------- Assembly into Recipe ----------

function assemble(mol: ParsedMolecule, name: string): Recipe {
  const elements = mol.atoms.map((a) => a.element);

  for (const el of elements) {
    if (!ELEMENTS[el]) {
      throw new Error(`SMILES contains unsupported element: ${el}`);
    }
  }

  const usedSlots = elements.map(() => new Set<number>());
  const bonds: [number, number, number, number][] = [];

  for (const [a, b /*, order */] of mol.bonds) {
    const sa = claimNextSlot(elements[a], usedSlots[a]);
    const sb = claimNextSlot(elements[b], usedSlots[b]);
    bonds.push([a, sa, b, sb]);
  }

  return { name, atoms: elements, bonds };
}

function claimNextSlot(element: string, used: Set<number>): number {
  const total = ELEMENTS[element].bonds.length;
  for (let i = 0; i < total; i++) {
    if (!used.has(i)) {
      used.add(i);
      return i;
    }
  }
  throw new Error(`${element} has no remaining bond slots`);
}

// TODO(double-bonds): emit (order - 1) additional slot reservations per
// multi-bond so the carbonyl carbon doesn't show a dangling empty slot.
// Requires adding a `reservedSlots` set to Atom and honoring it in
// firstOpenSlot() + bond visuals. Punted until needed.
