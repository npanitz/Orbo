# Learning Modules

Read this when working on anything in `src/learn/` or adding a new lesson.

## What a "module" and a "lesson" are

- A **module** is a thematic unit, like "Atomic Structure & the Periodic Table." It contains multiple lessons plus optional reference views. Module 1 is the only one live so far.
- A **lesson** is a single guided experience that takes a student through one concept. A typical lesson runs 5–15 minutes.

The product hierarchy:

```
Learning Modules (index)
  ├── Module 1: Atomic Structure & the Periodic Table
  │     ├── Lesson 1: Build an Atom
  │     ├── Lesson 2: How Electrons Fill Shells
  │     ├── Lesson 3: Periodic Trends
  │     └── Reference: Periodic Table
  └── Module 2: Covalent Bonding & VSEPR Geometry
        ├── Lesson 1: Why Atoms Bond
        └── Lesson 2: Lewis Structures   [Lessons 3–4 stubbed]
```

## File layout

```
src/learn/
  PeriodicTable.tsx          Standalone page + reusable PeriodicTableGrid + Legend
  PeriodicTableModal.tsx     Consult-the-table overlay with trend-toggle UI
  ElementDetail.tsx          The "click an element" detail overlay
  modules/
    AtomicStructureModule.tsx    Module 1 hub (lists lessons, opens them)
    BondingModule.tsx            Module 2 hub
  lessons/
    BuildAnAtom/
      BuildAnAtomLesson.tsx      Phase runner
      AtomBuilder.tsx            Interactive scene (SVG nucleus + shells + +/-)
      challenges.ts              Challenge definitions (predicate-based)
      shellModel.ts              Shell distribution, nucleus packing, isotope notation
    ShellFilling/
      ShellFillingLesson.tsx     Phase runner
      GuidedBuilder.tsx          Split-screen atom+table with narrative beats
      MCQCard.tsx                Reusable multiple-choice card
      narrativeBeats.ts          Z → optional narrative card
      quizQuestions.ts           MCQ data
    PeriodicTrends/
      PeriodicTrendsLesson.tsx   Phase runner
      TrendExplorer.tsx          Heat-mapped table + property toggle + narrative
      trends.ts                  Trend schema (id, accessor, narrative, color)
      atomicRadii.ts             Vendored atomic-radius data in pm
      quizQuestions.ts           MCQ data
    WhyAtomsBond/
      WhyAtomsBondLesson.tsx     Phase runner
      EnergyExplorer.tsx         Atom pair + slider + Morse-curve energy graph
      morsePotential.ts          Math util (potential energy sampling)
      pairs.ts                   Pair definitions (H-H, He-He, Cl-Cl, Na-Cl)
      quizQuestions.ts           MCQ data
    LewisStructures/
      LewisStructuresLesson.tsx  Phase runner
      AlgorithmWalkthrough.tsx   Molecule picker + canvas + step list + counter
      LewisCanvas.tsx            SVG renderer (atoms + bonds + lone-pair dots)
      molecules.ts               Pre-scripted molecules (H₂O, NH₃, CO₂) with steps
      state.ts                   LewisState type + applyStep reducer
      quizQuestions.ts           MCQ data
```

## The lesson-runner pattern

Every lesson is a small state machine. The top-level lesson component owns a `phase` string, and switches between phase subcomponents:

```tsx
type Phase = "intro" | "interactive" | "quiz" | "wrap";

function MyLesson({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  // ...
  return (
    <div className="lesson-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Module
      </button>
      <div className="lesson-content">
        {phase === "intro" && <Intro onStart={() => setPhase("interactive")} />}
        {phase === "interactive" && <Interactive onComplete={() => setPhase("quiz")} />}
        {phase === "quiz" && <Quiz onAnswered={...} />}
        {phase === "wrap" && <Wrap score={score} onExit={onExit} />}
      </div>
    </div>
  );
}
```

Each phase is its own small component. Lesson state (current phase, score, etc.) is in the lesson root. Phases are pure functions of props.

### Why this pattern (rather than a routing library)

- Lessons are short and self-contained — the entire state machine fits on one screen of code
- Phase transitions are rarely if ever back-navigable, so we don't need router history
- Adding a new lesson means copying this skeleton, not editing a route config

## Reusable primitives

These are the components you should reach for first when building a new lesson:

### `MCQCard` — multiple-choice questions

```tsx
<MCQCard
  key={q.id}                       // forces remount per question — prevents picked-state carryover
  question={q}                     // QuizQuestion: prompt + choices with per-choice explanations
  onContinue={(wasCorrect) => ...} // called when student clicks "Continue →" after answering
/>
```

The `QuizQuestion` schema is in `src/learn/lessons/ShellFilling/quizQuestions.ts` and re-exported by trending lessons. Each choice has its own `explanation` that's shown after that specific choice is picked — letting students explore wrong answers without being punished.

**Important:** always pass `key={q.id}` so the component remounts per question. Without it, the student's prior `picked` index persists across questions.

### `PeriodicTableGrid` — the table itself

```tsx
<PeriodicTableGrid
  onPick={(el) => ...}             // optional click handler
  highlightedZ={11}                // optional: this cell pulses
  passive                          // optional: ignore clicks (consultation mode)
  colorOverride={(el) => "..."}    // optional: per-cell heat-map color
  titleFor={(el) => "..."}         // optional: per-cell tooltip text
/>
```

This is the core reusable. Three lessons already use it in different ways:

- Lesson 2 (`ShellFilling`): `highlightedZ` for the current element + `passive` for read-only
- Lesson 3 (`PeriodicTrends`): `colorOverride` for the heat map + `titleFor` for value tooltips
- `PeriodicTableModal`: combines both depending on the toggle

### `PeriodicTableModal` — consult-the-table overlay

```tsx
<PeriodicTableModal
  open={tableOpen}
  onClose={() => setTableOpen(false)}
  initialTrend="electronegativity"   // optional: open with this trend pre-selected
  showTrendToggle={true}             // default; set false to hide internal toggle
/>
```

The modal owns its own trend-toggle state — students can switch between categories, radius, electronegativity, and ionization energy without dismissing. This is the unit students use for "look up the answer while answering a quiz."

### `AtomBuilder` — the atomic-structure visualization

```tsx
<AtomBuilder
  state={{ p, n, e }}              // protons, neutrons, electrons
  onChange={setState}              // wired in interactive mode; ignored in readOnly
  caps={{ p: 6 }}                  // optional max counts (used by Lesson 1 challenges)
  readOnly                         // optional: hide +/- controls, just show the visualization
/>
```

Lesson 1 uses it interactively. Lesson 2 uses it in `readOnly` mode as the left panel of its split screen.

### Heat-map trends (`trends.ts`)

Adding a new colorable property to the table is a one-entry change:

```ts
// in src/learn/lessons/PeriodicTrends/trends.ts
export const TRENDS: Trend[] = [
  // ...existing
  {
    id: "density",
    label: "Density",
    unit: "g/cm³",
    get: (el) => el.density,
    pattern: "...",
    mechanism: "...",
    extremes: "...",
  },
];
```

It appears in the `TrendExplorer` toggle and in the `PeriodicTableModal`'s consult toggle automatically.

## Existing lessons at a glance

### Lesson 1: Build an Atom (`BuildAnAtom/`)

- **Phases:** intro → free play → 6 challenges (auto-advance on solve) → completion
- **Interactive:** `AtomBuilder` SVG scene + readouts + +/- controls. Side panel shows element identification, isotope notation (`¹²C`), charge label
- **Challenges:** Hydrogen → Deuterium (same element, different mass) → Helium → Lithium (new shell!) → Carbon-14 → Sodium cation
- **Key pedagogical moves:** deuterium right after hydrogen so the isotope concept lands; lithium triggers the second shell appearing so students see rows-mean-shells before lesson 2 teaches it explicitly

### Lesson 2: How Electrons Fill Shells (`ShellFilling/`)

- **Phases:** intro → guided build (Z=1→18 with narrative beats) → 5-question quiz → wrap
- **Interactive:** `GuidedBuilder` — split-screen atom (readOnly) + periodic table (`highlightedZ` pulse), single "Next element →" button at the bottom, progress bar showing current Z and name
- **Narrative beats:** modal cards at H, He, Li, F, Ne, Na, Ar — require dismissal before button re-enables
- **Quiz:** five multiple-choice questions testing the column/row pattern, with "📖 Consult the periodic table" button in the header

### Lesson 3: Periodic Trends (`PeriodicTrends/`)

- **Phases:** intro → free-form explore → 5-question quiz → wrap
- **Interactive:** `TrendExplorer` — three property toggles, heat-mapped periodic table, narrative panel with "pattern / mechanism / extremes" blocks per trend
- **Quiz:** five predict-from-position questions, with "📖 Consult the periodic table" button that opens a modal with the same trend toggles inside (Categories / Radius / EN / Ionization)

### Module 2, Lesson 1: Why Atoms Bond (`WhyAtomsBond/`)

- **Phases:** intro → free-form explore → 5-question quiz → wrap
- **Interactive:** `EnergyExplorer` — pair toggle (H-H / He-He / Cl-Cl / Na-Cl), atom scene with draggable distance slider, energy graph below with live position marker, narrative panel
- **Two potential shapes:** Morse for bonded pairs (well + repulsion), exponential for He-He (Pauli wall, no well). Picking pure-Morse with D≈0 wouldn't model the Pauli wall correctly.
- **⚡ Relax button:** gradient-descent animation that moves the marker along the slope until the force vanishes. He-He settles past the wall in the flat region — the pedagogical "no bond" lesson made literal.
- **Quiz:** predict-bonding questions plus a synthesis question on what an energy curve tells you (presence of a well, well depth, well position)

### Module 2, Lesson 2: Lewis Structures (`LewisStructures/`)

- **Phases:** intro → walkthrough (free-form) → **pick-the-right-structure practice** → 5-question quiz → wrap
- **Walkthrough — `AlgorithmWalkthrough`:** molecule picker (H₂O / NH₃ / CO₂ / CH₄ / HCN / N₂), SVG `LewisCanvas` showing partial structure, scrollable step list with current step highlighted, electron counter (counted / used / remaining / total), Prev/Next/Reset controls
- **State pattern:** each molecule has an ordered `Step[]`. `stateAtStep(molecule, N)` folds the first N steps over an initial empty state via `applyStep`. The canvas is a pure function of state. Easy to add more molecules later — just script the steps.
- **Practice phase — `PickTheStructure`:** between walkthrough and quiz, a sequence of "which is the correct Lewis structure?" questions. Each question shows 3-4 candidate structures (rendered via `LewisCanvas` from candidate state) — one correct, others with characteristic errors. Each wrong-answer explanation diagnoses the specific algorithm step that was skipped or done wrong.
- **Practice data shape:** `PracticeQuestion → PracticeCandidate[]`. A candidate is just `{ lonePairs: Record<atomId, count>, bondOrders: number[], correct, explanation }`. Renderer builds a synthetic `LewisState` via `stateFromCandidate`. Reuses existing molecule definitions.
- **Pedagogical centerpiece:** CO₂'s bond-promotion steps. After distributing all 16 electrons as lone pairs, carbon is short of an octet. The algorithm explicitly *re-allocates* a lone pair from each oxygen into a double bond. Students watch the lone-pair dots disappear and a second bond line appear in its place.
- **Quiz:** counts (CO₂ has 16 valence e⁻), structural rules (central atom = least electronegative non-H), interpretation (how many LPs on water's O?), diagnostic (which step was skipped?), and synthesis (when do you need to promote a bond?)
- **Deferred to "Lab mode" later:** draw-your-own Lewis structures (drag/click to place electrons, validation). Genuinely good idea, multi-day build because of UX + validation edge cases. Pick-the-right-structure covers the same pedagogy with lower cost.

## How to add a new lesson

1. Create `src/learn/lessons/<NewLesson>/`
2. Inside it, write:
   - `<NewLesson>Lesson.tsx` — the phase runner (copy a similar existing one)
   - The interactive component(s) for the lesson's middle phase
   - `quizQuestions.ts` if it has a quiz (use the `QuizQuestion` schema)
   - Any data files (e.g. `narrativeBeats.ts`, lesson-specific datasets)
3. In `src/learn/modules/<RelevantModule>.tsx`, add the lesson to the `View` union, add a routing branch, and add a track card to the hub
4. CSS goes in `src/App.css` (single-file convention). Add a section header comment for the new lesson's styles.

## Editorial guidelines for lesson copy

- **Address the student directly.** "You just saw..." not "The student then sees..."
- **Use the mechanism as the answer, not memorization.** When a quiz explanation is good, it re-states the underlying rule.
- **Italicize for emphasis sparingly** — overuse kills it.
- **Wrong-answer explanations teach, not punish.** They acknowledge what the student was probably thinking and redirect to the right model.
- **Each lesson's wrap explicitly bridges to the next module/lesson.** Curriculum thread should be visible.

## Reusable patterns across lessons

These compose well:

- "Free-explore phase → predict-MCQ phase → wrap" (Lessons 2 and 3)
- "Modal consult button beside the quiz prompt" (Lessons 2 and 3 both use `PeriodicTableModal`)
- "Narrative beats that pause the interactive at milestones" (Lesson 2; future bonding lessons could pause at specific molecular states)
- "Synthesis question at the end of the quiz testing the unifying mechanism" (Lesson 3's top-right question; a great final-question pattern in general)

## Out of scope today

- Persisting lesson progress / completion (waiting on backend)
- Achievement / streak tracking
- Cross-lesson state (e.g., "elements you've built")
- Instructor-facing analytics
- AI tutor on each lesson (identified as a future differentiator vs PhET)

These are all known and intentionally deferred.
