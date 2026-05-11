import { useState } from "react";
import { GuidedBuilder } from "./GuidedBuilder";
import { MCQCard } from "./MCQCard";
import { QUIZ } from "./quizQuestions";
import { PeriodicTableModal } from "../../PeriodicTableModal";

type Phase = "intro" | "guided" | "quiz" | "wrap";

interface Props {
  onExit: () => void;
}

export function ShellFillingLesson({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);

  return (
    <div className="lesson-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Module
      </button>
      <div className="lesson-content">
        {phase === "intro" && <Intro onStart={() => setPhase("guided")} />}

        {phase === "guided" && (
          <Guided
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
      <div className="lesson-eyebrow">Lesson 2</div>
      <h1>How Electrons Fill Shells</h1>
      <p className="lesson-lede">
        Why is the periodic table the shape it is? Why does helium end the first
        row? Why is fluorine so reactive while neon refuses to react with
        anything? In this lesson we'll build elements one electron at a time and
        watch the table's logic emerge from a single rule: electrons fill the
        innermost shell first.
      </p>
      <ul className="lesson-objectives">
        <li>See how a full outer shell creates a noble gas</li>
        <li>Learn why rows on the table correspond to shells</li>
        <li>Understand why columns of elements behave the same way</li>
      </ul>
      <button className="lesson-start" onClick={onStart}>
        Start →
      </button>
    </div>
  );
}

function Guided({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">Guided build · Z = 1 → 18</div>
          <h2>Click your way across two rows of the periodic table.</h2>
          <p>
            Each click walks you to the next element on the table — one more
            proton, plus the electron and neutrons to keep it neutral and
            stable. Watch where electrons land in the shells, and pause when
            something interesting happens.
          </p>
        </div>
      </header>
      <GuidedBuilder maxZ={18} onComplete={onComplete} />
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
            <h2>Apply what you saw.</h2>
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
      <h1>{greatRun ? "Excellent." : "Nice work."}</h1>
      <p className="lesson-lede">
        You got {score} out of {total} questions right on the first try. More
        importantly, you saw why the periodic table's shape isn't arbitrary —
        it's a direct map of how shells fill.
      </p>
      <p className="lesson-lede">
        From here, every other chemistry concept downstream — bonding, ions,
        reactivity — flows from the structure you just walked through.
      </p>
      <div className="lesson-actions">
        <button className="lesson-next" onClick={onExit}>
          Back to module →
        </button>
      </div>
    </div>
  );
}
