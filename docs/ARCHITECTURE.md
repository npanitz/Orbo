# Architecture

## What Orbo is

Orbo is an interactive chemistry learning app targeted at universities. It's a client-side React + Three.js + TypeScript SPA built with Vite. There is currently **no backend** — all persistence is via `localStorage` behind an interface that's designed to be swapped for Supabase later (see "Persistence" below).

The product has two pillars:

1. **Learning Modules** — guided lessons that walk students through chemistry concepts using interactive primitives. Currently: Module 1 (Atomic Structure & the Periodic Table) with three lessons live.
2. **Sandbox** — an open-ended 3D molecule builder with 2D Lewis-structure rendering, intended as the "graduation" experience after lessons.

The strategic frame: PhET has spent 20+ years building isolated chemistry sims. Orbo's differentiation is the **curriculum layer above** them — narrative pacing, cross-lesson state, modern UX, and primitives that connect (atom builder ↔ periodic table ↔ molecule builder). See the conversation transcripts and `LEARNING_MODULES.md` for more.

## Top-level structure

```
src/
  main.tsx              Entry point: mounts <App/>
  App.tsx               Top-level view router (home | sandbox | modules)
  App.css               All styles, single file
  pages/                Top-level pages (Home, Sandbox, LearningModules)
  game/                 Sandbox-mode game class (3D scene, input, lifecycle)
  chem/                 Chemistry engine: atoms, bonds, recipes, SMILES, solver
  render/               Three.js scene setup + preview registry + RDKit loader
  ui/                   Sandbox UI components (Toolbar, InventoryPanel, etc.)
  learn/                Learning Modules — lessons + module hubs + reference views
  data/                 Static data (vendored periodic table JSON, typed wrappers)
  storage/              Persistence abstraction (currently localStorage)
docs/                   This documentation
public/                 RDKit WASM + JS (lazy-loaded by 2D Lewis renderer)
```

The single `App.tsx` is a thin view-router — three top-level views (`home`, `sandbox`, `modules`), persisted to localStorage. Pages own their own state; there's no global store.

## Major subsystems

### Sandbox (3D)

- **Entry:** `src/pages/Sandbox.tsx` → mounts `Game` from `src/game/game.ts`
- **Engine:** `src/game/game.ts` — orchestrates a `THREE.Scene`, `OrbitControls`, raycasting for atom picking, slingshot input, and the physics solver
- **Chemistry primitives:** `src/chem/` — see `CHEMISTRY.md` for the deep dive
- **Inventory UI:** `src/ui/InventoryPanel.tsx` — grid of cards with shared-renderer 3D previews; supports adding custom molecules from SMILES strings
- **2D mode:** `src/ui/LewisView.tsx` — reads live sandbox state, serializes to molblock, sends to RDKit for 2D depiction

### Learning Modules

- **Entry:** `src/pages/LearningModules.tsx` → opens a module hub (e.g., `AtomicStructureModule`)
- **Modules:** `src/learn/modules/` — each module is a hub page that lists its lessons and reference tools
- **Lessons:** `src/learn/lessons/<LessonName>/` — each lesson is a self-contained folder with its own phase runner, interactive component, and data
- **Reusable primitives:** `src/learn/` — `PeriodicTable.tsx`, `PeriodicTableGrid`, `PeriodicTableModal`, `ElementDetail` — used both by the standalone Periodic Table reference and by lessons
- **The lesson runner pattern** (`intro / phase / phase / wrap` with `MCQCard` for quiz phases) is documented in `LEARNING_MODULES.md`

### Persistence

- **Interface:** `src/storage/inventoryStore.ts` — `InventoryStore` interface with `list / add / remove / subscribe`. Today's implementation is `LocalStorageInventory`. When we add a backend, swap the singleton export to a `SupabaseInventory` class; nothing else changes.
- **Why it's behind an interface:** the consumer code (`InventoryPanel`, `getAllRecipes()` in `chem/molecules.ts`) doesn't know or care where data lives. Backend migration is a one-file change, not a refactor.
- **What's stored today:** user-added custom SMILES entries. Lesson progress is **not** persisted yet — when we add the backend, we'll add a parallel store for that.
- **Future schema (Supabase):** `inventory(id, user_id, name, smiles, created_at)` with RLS policy `user_id = auth.uid()`. Lesson progress would be its own table.

### Rendering

- **3D scene primitives:** `src/render/sceneSetup.ts` builds the shared `THREE.Scene` + `WebGLRenderer` + lighting + ground/floor
- **Preview registry:** `src/render/previewRegistry.ts` — a single-renderer multi-viewport system. For the inventory grid, every molecule card registers with the registry; one renderer drives all cards by setting scissor boxes to their `getBoundingClientRect()`s. Scales to ~50+ cards without spawning a renderer per card.
- **RDKit (2D):** `src/render/rdkit.ts` lazy-loads `@rdkit/rdkit` from `/public/`. Only loaded when 2D mode is first opened — the ~7MB WASM doesn't ship on initial paint.

### Routing

There's no router library. `App.tsx` switches on a `view` string. Each page may have its own internal view state machine (e.g., `LearningModules` switches between its index and module pages; `AtomicStructureModule` switches between hub, lessons, and reference; each lesson has phase state).

This is deliberate — three levels of trivial state machines are simpler to read and debug than a route config. If we add many more pages it might be worth introducing `react-router`, but not before.

## Cross-cutting patterns

### Phase-runner pattern (in lessons)

Every lesson is a state machine with named phases: typically `intro / interactive / quiz / wrap`. The lesson's top-level component owns the phase state, delegates rendering to phase subcomponents, and threads data (like quiz score) through them. See `LEARNING_MODULES.md` for examples and how to add a new lesson.

### Reusable lesson primitives

Anything that could be useful to a future lesson lives outside the lesson folder so it can be imported. Currently:

- `AtomBuilder` (with `readOnly` mode for passive viewing)
- `PeriodicTableGrid` (with `highlightedZ`, `passive`, `colorOverride`, `titleFor` props)
- `PeriodicTableModal` (consult-the-table overlay with built-in trend toggle)
- `MCQCard` (multiple-choice with per-choice explanation and continue gating)
- The `Trend` schema in `learn/lessons/PeriodicTrends/trends.ts` (any future "color the table by X" lesson plugs in here)

### Vendored static data

- `src/data/elements.json` — Bowserinator periodic table data (MIT-licensed; 118 elements)
- `src/data/periodicTable.ts` — typed wrapper + category-collapse logic + color palette
- `src/learn/lessons/PeriodicTrends/atomicRadii.ts` — hardcoded atomic radii in pm (Bowserinator's JSON doesn't include radii; vendored separately)

We choose vendoring over network fetches: cheaper, offline-capable, deterministic, no API key risk.

### Type-only imports for circular-dep-prone files

When two files reference each other's types but only one needs the value at runtime, the type-only import (`import type { ... }`) is preferred. Example: `chem/smiles.ts` imports `Recipe` as a type only from `chem/molecules.ts`, because `molecules.ts` imports `smilesToRecipe` as a value.

## Known limitations and "punted" items

Items we know about and chose to defer rather than build now:

- **Sandbox solver is rigid-body, not flexible.** Bonded molecules move as a single rigid body, so chains like butane curl and don't relax. Real fix is to add bond-angle + torsional spring terms to the solver (essentially small-scale molecular dynamics). Punted while focusing on Learning Modules — see `CHEMISTRY.md` "Future work" for the staged plan.
- **No backend yet.** All inventory is per-browser via localStorage. Migration path: Supabase, behind the existing `InventoryStore` interface.
- **Lesson progress isn't persisted.** Finish a lesson, refresh, you start over. Will be added with the backend.
- **No auth, no user accounts.** Same path: Supabase Auth, gated at the App level.
- **No assessment analytics.** A pedagogical product needs instructor-facing dashboards eventually. Not built yet.
- **No AI tutor.** Identified as a major differentiator vs PhET. Not built yet.
- **No mobile-specific layout.** Desktop-first; some breakpoints exist but mobile UX isn't audited.
- **SMILES parser is intentionally minimal.** No rings, no bracket atoms, single+double+triple parsed but multi-bonds emit single-slot stubs (cosmetic limitation). Bigger SMILES support deferred until needed.
- **2D Lewis rendering only fires when scene topology changes** (cached per-component). If we ever animate bond order changes that don't cross the cache key, we'd need a finer invalidation.

## Stack

- **React 18** with TypeScript 5, Vite 5
- **Three.js** r0.160 for 3D
- **RDKit-JS** for 2D depiction (lazy-loaded WASM)
- No state management library — `useState` / `useEffect` / `useSyncExternalStore` only
- No router — `App.tsx` switches on a view string
- No CSS framework — single `App.css` file with utility-ish naming

This is deliberately small. Adding a dependency is a real cost and we add them only when they earn it.

## Build / Run

```
npm install
npm run dev          # starts Vite dev server on http://localhost:5173
npx tsc --noEmit     # type-check (run from project root)
```

No tests yet. When we add them, they'd go under `src/**/__tests__/` with Vitest.
