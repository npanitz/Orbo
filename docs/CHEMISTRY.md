# Chemistry Engine

This is the substrate for the sandbox and (eventually) any lesson that drives molecules. Read this when working on `src/chem/`, `src/render/`, `src/game/`, or `src/ui/InventoryPanel.tsx` / `src/ui/LewisView.tsx`.

## Mental model

The engine has three layers, each built on the previous:

1. **Element data** — static config per element (color, radius, bond directions, lone-pair directions). Pure data.
2. **Atoms** — runtime objects with chemistry state (which slots are bonded) and a Three.js scene graph.
3. **Recipes** — declarative descriptions of molecules: atom list + bond list. Materialized into atoms via `buildMolecule`.

Plus two adjacent concerns:

4. **SMILES** — text-format adapter that parses SMILES strings into recipes. Lets us add molecules to the library by pasting standard chemistry notation.
5. **Physics solver** — moves atoms around the sandbox, detects when atoms are close enough to bond, attaches them via the rigid-body `formBond` operation.

```
ElementConfig  →  Atom (Three.js Group + chemistry state)
                       ↑
        Recipe  →  buildMolecule  →  Atom[]
          ↑
      SMILES   →  smilesToRecipe
```

## Files

```
src/chem/
  elements.ts          ELEMENTS table (H/C/N/O/Cl/Br configs) + formula prettifier
  atom.ts              Atom class — slots, bond graph, formBond rigid alignment
  molecules.ts         Recipe type, SMILES_LIBRARY, getAllRecipes() (merges custom)
  builder.ts           buildMolecule(key) — recipe → Atom[]
  smiles.ts            Minimal SMILES → Recipe parser
  solver.ts            stepAll() — physics integration + bond formation detection
  molblock.ts          Atoms → V2000 molblock (consumed by RDKit for 2D)
```

## Element model (`elements.ts`)

Each element is a static config:

```ts
interface ElementConfig {
  color: number;          // hex 0xRRGGBB
  radius: number;         // visual radius in world units
  bonds: Vector3[];       // unit vectors for bond slots (in atom's local frame)
  lone: Vector3[];        // unit vectors for lone pairs
}
```

Bond and lone-pair directions come from VSEPR geometry: for sp³ atoms (C, N, O), the four tetrahedron corners at `(±1/√3, ±1/√3, ±1/√3)` with appropriate signs. H has one bond direction along `+x`.

The number of bond slots equals the element's typical valence: C has 4, N has 3 (with 1 lone pair), O has 2 (with 2 lone pairs), H has 1.

`formulaFor(atoms)` is the only function here — it counts atoms by element and returns a pretty Unicode string like `C₂H₆O` for the inventory cards and Lewis tiles.

## Atom model (`atom.ts`)

The `Atom` class wraps a `THREE.Group` and adds chemistry state:

- **Slots** — `bondDirections: Vector3[]` and `bonds: Map<slotIdx, BondRef>`. A slot is "occupied" if it has an entry in the bond map.
- **Bond graph** — each `BondRef` points to the partner atom and its slot index on the other end. Bonds are symmetric: forming one writes both endpoints.
- **Visuals** — small translucent spheres at each slot position, lone-pair markers, cylinder bond stubs that appear when the slot fills.

### The `formBond` method (most subtle code in the engine)

`formBond(mySlot, otherAtom, otherSlot)` is a *rigid alignment* — it moves this atom (and everything bonded to it) so that the specified slots meet collinearly with the partner's slot.

Algorithm:

1. Compute the world position of the partner's slot — this is the meeting point
2. Compute the desired direction of `my` slot in world space (opposite of the partner's outward slot vector)
3. Compute current direction of `my` slot
4. Build a quaternion rotating "current" onto "desired", with `this.group.position` as pivot
5. Apply that rotation to every atom in `this`'s connected molecule (rotating positions around the pivot, multiplying quaternions for orientation)
6. Translate the whole molecule so `my` slot lands on the meeting point
7. Mark both slots bonded; refresh visuals

This is the only way a molecule gets larger than 2 atoms — `buildMolecule` calls `formBond` in DFS order so every bond after the first attaches one new atom (with no internal flex) to an already-anchored sub-molecule.

**Why rigid:** the alternative is springy bonds with continuous relaxation. We deliberately picked rigid because it's an order of magnitude simpler, and visually most small molecules look fine. The cost (chains curl unphysically) is flagged in "Future work."

## Recipes (`molecules.ts`)

A `Recipe` is a declarative molecule:

```ts
interface Recipe {
  name: string;
  atoms: string[];                                  // element symbols
  bonds: [number, number, number, number][];        // [atomA, slotA, atomB, slotB]
}
```

`SMILES_LIBRARY` holds the built-in entries as SMILES strings; recipes are generated at module load by parsing them through `smilesToRecipe`. Custom user-added entries live in `inventoryStore` (see `ARCHITECTURE.md` → Persistence) and are merged at lookup time:

- `getAllRecipes(): Record<string, Recipe>` — built-ins + custom
- `getRecipeOrder(): string[]` — built-in order first, custom in insertion order
- `isCustomRecipe(key)` — does this key belong to a user-added entry?

The legacy `RECIPES` and `RECIPE_ORDER` exports remain for backward compat but only contain built-ins; new code should use the functions.

**Adding a built-in molecule:** add one line to `SMILES_LIBRARY`. The recipe builds at module load and shows up in the inventory automatically.

**Adding a custom molecule:** the user types it in the sandbox inventory's "Add to library" bar; goes through `inventoryStore.add()`.

## SMILES parser (`smiles.ts`)

A minimal SMILES parser. **In scope:**

- Organic atoms in `ELEMENTS` (H, C, N, O, with Cl/Br two-letter recognition)
- Branches `( ... )`
- Bond markers `-` `=` `#` `:` (multi-bonds parse correctly for valence; render as single stubs — see TODO at bottom of `smiles.ts`)
- Stereo markers `/` `\` (ignored, treated as single bonds)
- Implicit hydrogen filling based on element valence

**Out of scope (parser throws):**

- Ring closures (digits, `%nn`)
- Bracket atoms (`[X]`)
- Charges, isotopes, stereo specification

This is intentional — the use case is "let me paste in standard SMILES for educational small molecules" and that subset covers most of intro chem. If we ever need rings, we'd add a ring-closure DFS pass, not switch parsers.

The parser emits bonds in DFS order, which matters: `buildMolecule` materializes them in that order, and `formBond` only works correctly when each bond attaches exactly one new atom to the sub-molecule already in place.

## Physics solver (`solver.ts`)

`stepAll(atoms, bounds, dt)` does the per-frame simulation:

- For each connected molecule (via `findMolecules`), apply velocity integration to all atoms as a single rigid body
- Bounce off the bounds box
- For each pair of close, opposite-sex slots (i.e., open slots within snap distance), attempt to bond via `tryFormOneBond`
- Long-range attraction: open slots feel a pull toward nearby compatible open slots — gives the sandbox its "atoms slowly drift toward each other" feel

Constants worth knowing about (in `solver.ts`):

- `SNAP_DISTANCE` — how close slot tips have to be before a bond forms
- `ATTRACTION_RANGE` — how far apart slots can be and still pull on each other
- `ATTRACTION_STRENGTH` — magnitude of that pull

**Limitation: rigid-body.** A connected molecule moves as one. There's no internal flex; bond angles and dihedrals are baked at spawn time. This is why butane spawns with the curl that `buildMolecule` happened to produce — it never relaxes. Fix path is documented in "Future work" below.

## 2D Lewis rendering (`molblock.ts` + `src/ui/LewisView.tsx`)

For 2D mode, we need to depict molecules in Lewis form. Doing this from scratch is hard (atom positioning, double-bond parallel lines, etc.), so we delegate to RDKit:

1. `connectedComponents(atoms)` walks the bond graph and groups atoms per molecule
2. `componentToMolblock(component)` serializes each component to a V2000 molblock string — RDKit's preferred input format. Bond order is recovered by counting shared slot↔slot links (our model collapses double bonds into two single-bond entries; we restore that to a bond-order-2 in the molblock).
3. `LewisView` calls `rdkit.get_mol(molblock, { removeHs: false })` (keeps explicit hydrogens for Lewis style; defaults to skeletal/textbook style with `removeHs: true`)
4. Calls `mol.set_new_coords(true)` to generate 2D coordinates via RDKit's CoordGen
5. Calls `mol.get_svg_with_highlights({ width, height, bondLineWidth, ... })` to get an SVG
6. Computes a per-component topology hash (`element set + bond count + degree sequence`) — caches the resulting SVG image. Only re-renders when topology changes.

The cache key includes the current `style` (`skeletal` / `lewis`) so flipping the style toggle regenerates the SVGs.

**Why this approach:** RDKit is a tank. We get textbook-quality depictions with correct geometry for free, including double-bond parallel lines, lone pair dots, ion labels, etc. The cost is the ~7MB WASM payload, which we lazy-load only when the user first opens 2D mode.

## Future work

Listed roughly in priority order if/when we return to the sandbox:

### Flexible-bond solver (the big one)

The rigid-body solver makes chains curl unphysically. A staged upgrade path:

1. **Bond-angle springs.** For each atom with ≥2 neighbors, add a force pulling the bond angles toward their natural value (109.5° for sp³, 120° for sp², 180° for sp). Bonds stay rigid in length; angles relax. Mostly fixes butane-like chain awkwardness.
2. **Dihedral torsion terms.** Add cosine-form torsion forces for 4-atom chains so sp³ chains prefer anti dihedrals. Butane straightens into the zig-zag.
3. **Springy bonds + Lennard-Jones repulsion.** Bonds become springs at rest length; non-bonded atoms feel L-J. Now it's a real small-scale MD sim. Conformations *change* under perturbation.

Each stage is genuinely useful on its own. Stage 1 alone probably fixes 80% of the visual awkwardness.

### Better SMILES support

Ring closures unlock most of the rest of intro organic chem (benzene, cyclohexane). Bracket atoms unlock ions and isotopes. Both would be straightforward additions to the existing parser; we just haven't needed them.

### Double-bond visual stubs

Currently a `C=O` recipe consumes two slots on the carbon and renders two parallel single-bond stubs at slot positions, not a proper double bond visualization. The TODO comment in `smiles.ts` describes the fix: introduce slot reservations (atom marks a slot as "this is the second half of a double bond") and have the renderer draw a proper offset cylinder pair.

### Canonical-SMILES dedup in inventory

The inventory currently dedupes by string equality, so `CCO` and `OCC` both make it in. Canonical-form dedup would mean a round-trip through RDKit: `rdkit.get_mol(smi).get_smiles()`. The cost is loading RDKit on the inventory panel (today only 2D mode loads it). Punted until duplicates become an actual annoyance.
