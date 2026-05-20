import { useState } from "react";
import { EnergyExplorer } from "./EnergyExplorer";
import { MCQCard } from "../ShellFilling/MCQCard";
import { PeriodicTableModal } from "../../PeriodicTableModal";
import { QUIZ } from "./quizQuestions";

type Phase = "intro" | "explore" | "quiz" | "wrap";

interface Props {
  onExit: () => void;
}

export function WhyAtomsBondLesson({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);

  return (
    <div className="lesson-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Module
      </button>
      <div className="lesson-content">
        {phase === "intro" && <Intro onStart={() => setPhase("explore")} />}

        {phase === "explore" && (
          <Explore
            onComplete={() => {
              setQuizIdx(0);
              setScore(0);
              setPhase("quiz");
            }}
          />
        )}

        {phase === "quiz" && (
          <Quiz
            idx={quizIdx}
            onAnswered={(wasCorrect) => {
              if (wasCorrect) setScore((s) => s + 1);
              if (quizIdx + 1 >= QUIZ.length) setPhase("wrap");
              else setQuizIdx((i) => i + 1);
            }}
          />
        )}

        {phase === "wrap" && (
          <Wrap score={score} total={QUIZ.length} onExit={onExit} />
        )}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="lesson-intro">
      <div className="lesson-eyebrow">Module 2 · Lesson 1</div>
      <h1>Why Atoms Bond</h1>
      <p className="lesson-lede">
        Most textbooks say atoms bond to "complete their octet." That's a
        useful shortcut, but it's not really <em>why</em>. The real answer is
        simpler and more honest: atoms bond when the system reaches lower
        energy bonded than apart.
      </p>
      <p className="lesson-lede">
        In this lesson you'll see that energy. You'll drag two atoms together
        and watch a curve fall into a well — the energetic "valley" that
        makes a bond stable. And you'll see why noble gases have no such
        valley to fall into.
      </p>
      <ul className="lesson-objectives">
        <li>Read an interaction-energy curve like a chemist</li>
        <li>See why H₂ exists but He₂ doesn't</li>
        <li>Predict bonding behavior from atomic structure</li>
      </ul>
      <button className="lesson-start" onClick={onStart}>
        Start →
      </button>
    </div>
  );
}

function Explore({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">Explore</div>
          <h2>Pick a pair. Slide them together. Watch the energy.</h2>
          <p>
            Four pairs of atoms, four different energy stories. Drag the slider
            to bring them close, then far apart. The dot on the graph tracks
            your current state. The shape of the curve <em>is</em> the lesson.
          </p>
        </div>
      </header>
      <EnergyExplorer onComplete={onComplete} />
    </>
  );
}

function Quiz({
  idx,
  onAnswered,
}: {
  idx: number;
  onAnswered: (wasCorrect: boolean) => void;
}) {
  const q = QUIZ[idx];
  const [tableOpen, setTableOpen] = useState(false);
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">
            Question {idx + 1} of {QUIZ.length}
          </div>
          <div className="quiz-title-row">
            <h2>Read the curve.</h2>
            <button className="lesson-consult" onClick={() => setTableOpen(true)}>
              📖 Consult the periodic table
            </button>
          </div>
        </div>
      </header>
      <MCQCard key={q.id} question={q} onContinue={onAnswered} />
      <PeriodicTableModal open={tableOpen} onClose={() => setTableOpen(false)} />
    </>
  );
}

function Wrap({
  score,
  total,
  onExit,
}: {
  score: number;
  total: number;
  onExit: () => void;
}) {
  const greatRun = score >= total - 1;
  return (
    <div className="lesson-complete">
      <div className="lesson-eyebrow">Lesson complete</div>
      <h1>{greatRun ? "You're reading energy like a chemist." : "Nice work."}</h1>
      <p className="lesson-lede">
        You got {score} out of {total} right on the first try. More importantly,
        you've got a new mental model: <em>bonds are wells in an energy curve</em>.
        Presence of a well → a bond exists. Depth of the well → bond strength.
        Position of the well → bond length.
      </p>
      <p className="lesson-lede">
        Next lesson: how to <em>draw</em> which electrons go where in a bond.
        Lewis structures are the bookkeeping that lets you predict molecular
        structure from atom counts and valence rules.
      </p>
      <div className="lesson-actions">
        <button className="lesson-next" onClick={onExit}>
          Back to module →
        </button>
      </div>
    </div>
  );
}
