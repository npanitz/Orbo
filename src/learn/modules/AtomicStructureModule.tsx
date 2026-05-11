import { useState } from "react";
import { PeriodicTable } from "../PeriodicTable";
import { BuildAnAtomLesson } from "../lessons/BuildAnAtom/BuildAnAtomLesson";
import { ShellFillingLesson } from "../lessons/ShellFilling/ShellFillingLesson";

type View = "hub" | "lesson-build" | "lesson-shells" | "ref-periodic";

interface Props {
  onExit: () => void;
}

export function AtomicStructureModule({ onExit }: Props) {
  const [view, setView] = useState<View>("hub");

  if (view === "lesson-build") {
    return <BuildAnAtomLesson onExit={() => setView("hub")} />;
  }
  if (view === "lesson-shells") {
    return <ShellFillingLesson onExit={() => setView("hub")} />;
  }
  if (view === "ref-periodic") {
    return <PeriodicTable onExit={() => setView("hub")} />;
  }

  return (
    <div className="modules-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Modules
      </button>
      <div className="modules-content">
        <div className="lesson-eyebrow">Module 1</div>
        <h1>Atomic Structure &amp; the Periodic Table</h1>
        <p className="modules-lede">
          Start with the atom itself, then meet the chart that organizes them all.
          Each lesson builds on the last.
        </p>

        <div className="track-grid">
          <button
            className="track-card available"
            onClick={() => setView("lesson-build")}
          >
            <div className="track-card-tag-inline">Lesson 1</div>
            <div className="track-card-title">Build an Atom</div>
            <div className="track-card-blurb">
              Hands-on: add protons, neutrons, and electrons one by one. See why
              the proton count is the only thing that defines an element.
            </div>
            <div className="track-card-cta">Start →</div>
          </button>

          <button
            className="track-card available"
            onClick={() => setView("ref-periodic")}
          >
            <div className="track-card-tag-inline">Reference</div>
            <div className="track-card-title">Periodic Table</div>
            <div className="track-card-blurb">
              Browse all 118 elements. Click any cell to see its properties,
              electron configuration, and place on the chart.
            </div>
            <div className="track-card-cta">Open →</div>
          </button>

          <button
            className="track-card available"
            onClick={() => setView("lesson-shells")}
          >
            <div className="track-card-tag-inline">Lesson 2</div>
            <div className="track-card-title">How Electrons Fill Shells</div>
            <div className="track-card-blurb">
              Build elements one electron at a time and watch the periodic
              table's shape emerge — rows, columns, noble gases, the lot.
            </div>
            <div className="track-card-cta">Start →</div>
          </button>

          <div className="track-card disabled">
            <div className="track-card-tag-inline">Lesson 3</div>
            <div className="track-card-title">Periodic Trends</div>
            <div className="track-card-blurb">
              Atomic radius, electronegativity, ionization energy — and why
              they march in patterns across the table.
            </div>
            <div className="track-card-tag">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
