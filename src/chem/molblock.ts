import type { Atom } from "./atom";

/**
 * Serialize a connected component of atoms into a V2000 molblock that RDKit
 * can ingest. Bond orders are recovered by counting how many shared bond
 * entries connect each pair (our current model collapses double bonds into
 * two separate slot↔slot links — close enough for v1).
 *
 * RDKit will compute its own 2D coords; we omit positions (set to 0).
 */
export function componentToMolblock(component: Atom[]): string {
  const index = new Map<Atom, number>();
  component.forEach((a, i) => index.set(a, i));

  const bondPairs = new Map<string, number>(); // "i-j" (i<j) → order
  for (const a of component) {
    const ai = index.get(a)!;
    for (const ref of a.bonds.values()) {
      const bj = index.get(ref.atom);
      if (bj === undefined) continue;
      const lo = Math.min(ai, bj);
      const hi = Math.max(ai, bj);
      if (lo === hi) continue;
      const key = `${lo}-${hi}`;
      bondPairs.set(key, (bondPairs.get(key) ?? 0) + 1);
    }
  }
  // Each undirected bond was counted twice (once from each endpoint).
  for (const [k, v] of bondPairs) bondPairs.set(k, v / 2);

  const atomLines = component.map((a) => {
    const sym = a.element.padEnd(3);
    return `    0.0000    0.0000    0.0000 ${sym} 0  0  0  0  0  0  0  0  0  0  0  0`;
  });

  const bondLines: string[] = [];
  for (const [key, order] of bondPairs) {
    const [lo, hi] = key.split("-").map(Number);
    // Molblock indices are 1-based, 3-wide fields
    const a1 = String(lo + 1).padStart(3);
    const a2 = String(hi + 1).padStart(3);
    const ord = String(order).padStart(3);
    bondLines.push(`${a1}${a2}${ord}  0  0  0  0`);
  }

  const counts =
    String(component.length).padStart(3) +
    String(bondLines.length).padStart(3) +
    "  0  0  0  0  0  0  0  0999 V2000";

  return [
    "",
    "  Orbo  2D",
    "",
    counts,
    ...atomLines,
    ...bondLines,
    "M  END",
  ].join("\n");
}

/** Group atoms by connected component (BFS via Atom.bonds graph). */
export function connectedComponents(atoms: Atom[]): Atom[][] {
  const seen = new Set<Atom>();
  const out: Atom[][] = [];
  for (const root of atoms) {
    if (seen.has(root)) continue;
    const stack = [root];
    const group: Atom[] = [];
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      group.push(cur);
      for (const ref of cur.bonds.values()) stack.push(ref.atom);
    }
    out.push(group);
  }
  return out;
}
