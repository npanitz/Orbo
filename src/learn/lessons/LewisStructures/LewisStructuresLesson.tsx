import { useState } from "react";
import { AlgorithmWalkthrough } from "./AlgorithmWalkthrough";
import { PickTheStructure } from "./PickTheStructure";
import { MCQCard } from "../ShellFilling/MCQCard";
import { QUIZ } from "./quizQuestions";

type Phase = "intro" | "walkthrough" | "practice" | "quiz" | "wrap";

interface Props {
  onExit: () => void;
}

export function LewisStructuresLesson({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);

  return (
    <div className="lesson-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Module
      </button>
      <div className="lesson-content">
        {phase === "intro" && <Intro onStart={() => setPhase("walkthrough")} />}

        {phase === "walkthrough" && (
          <Walkthrough
            onComplete={() => setPhase("practice")}
          />
        )}

        {phase === "practice" && (
          <>
            <PickTheStructure
              onComplete={() => {
                setQuizIdx(0);
                setScore(0);
                setPhase("quiz");
              }}
            />
          </>
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
      <div className="lesson-eyebrow">Module 2 · Lesson 2</div>
      <h1>Lewis Structures</h1>
      <p className="lesson-lede">
        Lewis structures look like wizardry — dots and lines tucked in
        precisely the right places. But there's no magic. Every Lewis
        structure is the output of a six-step algorithm. Once you know the
        algorithm, you can derive any of them on demand.
      </p>
      <p className="lesson-lede">
        In this lesson, you'll watch the algorithm run, step by step, on real
        molecules. Click forward through the steps. See the structure get
        built. Replay with different molecules until the pattern clicks.
      </p>
      <ul className="lesson-objectives">
        <li>Run the Lewis-structure algorithm by hand for any small molecule</li>
        <li>Know when a single bond needs to become a double or triple</li>
        <li>Understand <em>why</em> lone pairs sit where they do</li>
      </ul>
      <button className="lesson-start" onClick={onStart}>
        Start →
      </button>
    </div>
  );
}

function Walkthrough({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">Walkthrough</div>
          <h2>Pick a molecule. Step through the algorithm.</h2>
          <p>
            Each click advances the algorithm by one stage. Watch the counter
            on the left tick down as electrons get placed. Switch molecules
            anytime — the same six steps work for all of them.
          </p>
        </div>
      </header>
      <AlgorithmWalkthrough onComplete={onComplete} />
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
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">
            Question {idx + 1} of {QUIZ.length}
          </div>
          <div className="quiz-title-row">
            <h2>Run the algorithm.</h2>
          </div>
        </div>
      </header>
      <MCQCard key={q.id} question={q} onContinue={onAnswered} />
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
      <h1>{greatRun ? "You can build Lewis structures from scratch now." : "Nice work."}</h1>
      <p className="lesson-lede">
        You got {score} out of {total} right on the first try. More importantly,
        you've got the algorithm: <em>count, connect, distribute, promote.</em>
        Any small molecule's Lewis structure falls out from those four moves.
      </p>
      <p className="lesson-lede">
        Next lesson: <em>shape</em>. The dots-and-lines diagram you just built
        is a 2D abstraction — but the lone pairs and bonds on it actually push
        each other around in 3D. That's VSEPR, and it determines everything
        from why water is bent to why proteins fold the way they do.
      </p>
      <div className="lesson-actions">
        <button className="lesson-next" onClick={onExit}>
          Back to module →
        </button>
      </div>
    </div>
  );
}
