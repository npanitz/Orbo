import { useState } from "react";
import { MCQCard } from "../ShellFilling/MCQCard";
import { PeriodicTableModal } from "../../PeriodicTableModal";
import { TrendExplorer } from "./TrendExplorer";
import { QUIZ } from "./quizQuestions";

type Phase = "intro" | "explore" | "quiz" | "wrap";

interface Props {
  onExit: () => void;
}

export function PeriodicTrendsLesson({ onExit }: Props) {
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
      <div className="lesson-eyebrow">Lesson 3</div>
      <h1>Periodic Trends</h1>
      <p className="lesson-lede">
        We built atoms. We saw why the table is shaped the way it is. Now: every
        element property that follows a pattern across the table comes from a
        single rule — nuclear pull versus electron distance. Learn the rule,
        and you can <em>predict</em> properties of elements you've never seen.
      </p>
      <ul className="lesson-objectives">
        <li>See atomic radius, electronegativity, and ionization energy as visual patterns on the table</li>
        <li>Understand the one mechanism underneath all three</li>
        <li>Practice predicting properties from position on the table</li>
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
          <h2>Pick a property. Watch the pattern appear.</h2>
          <p>
            Each toggle re-colors the table by a different property. Hover any
            cell for its value. The pattern is the lesson — read the narrative
            beside the table to learn the <em>why</em>.
          </p>
        </div>
      </header>
      <TrendExplorer onComplete={onComplete} />
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
            <h2>Predict from position.</h2>
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
      <h1>{greatRun ? "You're predicting, not memorizing." : "Nice work."}</h1>
      <p className="lesson-lede">
        You got {score} out of {total} right on the first try. More importantly,
        you have a tool now: any element property that follows a pattern across
        the table comes from one rule — nuclear pull versus electron distance.
      </p>
      <p className="lesson-lede">
        That rule will keep paying off. The next module — covalent bonding —
        builds entirely on this. <em>Why</em> certain atoms bond, <em>how</em>{" "}
        electrons get shared or transferred: it's all downstream from what you
        just learned.
      </p>
      <div className="lesson-actions">
        <button className="lesson-next" onClick={onExit}>
          Back to module →
        </button>
      </div>
    </div>
  );
}
