import { useState } from "react";
import { WhyAtomsBondLesson } from "../lessons/WhyAtomsBond/WhyAtomsBondLesson";
import { LewisStructuresLesson } from "../lessons/LewisStructures/LewisStructuresLesson";

type View = "hub" | "lesson-why" | "lesson-lewis";

interface Props {
  onExit: () => void;
}

export function BondingModule({ onExit }: Props) {
  const [view, setView] = useState<View>("hub");

  if (view === "lesson-why") {
    return <WhyAtomsBondLesson onExit={() => setView("hub")} />;
  }
  if (view === "lesson-lewis") {
    return <LewisStructuresLesson onExit={() => setView("hub")} />;
  }

  return (
    <div className="modules-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Modules
      </button>
      <div className="modules-content">
        <div className="lesson-eyebrow">Module 2</div>
        <h1>Covalent Bonding &amp; VSEPR Geometry</h1>
        <p className="modules-lede">
          Why do atoms bond? When they do, how do they arrange themselves in
          3D? This module starts at the energy that drives bonding and ends
          with the geometric shapes molecules adopt.
        </p>

        <div className="track-grid">
          <button
            className="track-card available"
            onClick={() => setView("lesson-why")}
          >
            <div className="track-card-tag-inline">Lesson 1</div>
            <div className="track-card-title">Why Atoms Bond</div>
            <div className="track-card-blurb">
              The real answer: energy. Slide atoms together and watch the
              system's energy fall into a well — or stay flat, if no bond
              wants to form.
            </div>
            <div className="track-card-cta">Start →</div>
          </button>

          <button
            className="track-card available"
            onClick={() => setView("lesson-lewis")}
          >
            <div className="track-card-tag-inline">Lesson 2</div>
            <div className="track-card-title">Lewis Structures</div>
            <div className="track-card-blurb">
              The bookkeeping. Watch the six-step algorithm build a molecule's
              electron diagram, dot by dot, bond by bond.
            </div>
            <div className="track-card-cta">Start →</div>
          </button>

          <div className="track-card disabled">
            <div className="track-card-tag-inline">Lesson 3</div>
            <div className="track-card-title">Polarity &amp; Bond Character</div>
            <div className="track-card-blurb">
              When sharing isn't equal. Electronegativity differences turn
              bonds polar, and polar enough turns covalent into ionic.
            </div>
            <div className="track-card-tag">Coming soon</div>
          </div>

          <div className="track-card disabled">
            <div className="track-card-tag-inline">Lesson 4</div>
            <div className="track-card-title">VSEPR: Predicting Shape</div>
            <div className="track-card-blurb">
              Bonds and lone pairs repel each other in 3D. From that single
              rule, every molecular geometry follows.
            </div>
            <div className="track-card-tag">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
