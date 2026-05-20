import { useState } from "react";
import { LewisCanvas } from "./LewisCanvas";
import {
  PRACTICE,
  type PracticeQuestion,
  getMoleculeForQuestion,
  stateFromCandidate,
} from "./practiceQuestions";

interface Props {
  /** Called when the student finishes the last question. */
  onComplete: (firstTryCorrectCount: number) => void;
}

/**
 * "Pick the right Lewis structure" practice phase. Shows a prompt plus 3-4
 * candidate structures rendered with LewisCanvas. Clicking a candidate
 * reveals correct/incorrect colors and the per-candidate explanation; a
 * Continue button advances. First-try score is reported on completion.
 */
export function PickTheStructure({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const q = PRACTICE[idx];

  const onAnswered = (wasCorrect: boolean) => {
    const nextScore = score + (wasCorrect ? 1 : 0);
    if (idx + 1 >= PRACTICE.length) {
      onComplete(nextScore);
      return;
    }
    setScore(nextScore);
    setIdx((i) => i + 1);
  };

  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">
            Practice {idx + 1} of {PRACTICE.length}
          </div>
          <div className="quiz-title-row">
            <h2>Pick the right structure.</h2>
          </div>
        </div>
      </header>
      <PracticeCard key={q.id} question={q} onContinue={onAnswered} />
    </>
  );
}

function PracticeCard({
  question,
  onContinue,
}: {
  question: PracticeQuestion;
  onContinue: (wasCorrect: boolean) => void;
}) {
  const molecule = getMoleculeForQuestion(question);
  const [picked, setPicked] = useState<number | null>(null);
  const [firstWasCorrect, setFirstWasCorrect] = useState<boolean | null>(null);

  const pick = (i: number) => {
    const isCorrect = question.candidates[i].correct;
    if (firstWasCorrect === null) setFirstWasCorrect(isCorrect);
    setPicked(i);
  };

  return (
    <div className="practice-card">
      <div className="practice-prompt">{question.prompt}</div>

      <div className="practice-grid">
        {question.candidates.map((c, i) => {
          const state =
            picked === null
              ? "idle"
              : picked === i
                ? c.correct
                  ? "correct"
                  : "incorrect"
                : c.correct && picked !== null
                  ? "reveal-correct"
                  : "dim";
          return (
            <button
              key={i}
              className={`practice-option practice-option-${state}`}
              onClick={() => pick(i)}
              disabled={picked === i}
              aria-label={`Option ${String.fromCharCode(65 + i)}`}
            >
              <div className="practice-option-letter">
                {String.fromCharCode(65 + i)}
              </div>
              <div className="practice-option-canvas">
                <LewisCanvas
                  molecule={molecule}
                  state={stateFromCandidate(molecule, c)}
                />
              </div>
              <div className="practice-option-badge">
                {state === "correct" && "✓ Correct"}
                {state === "incorrect" && "✗ Incorrect"}
                {state === "reveal-correct" && "✓ This was correct"}
              </div>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          className={
            "practice-explanation " +
            (question.candidates[picked].correct
              ? "mcq-explanation-good"
              : "mcq-explanation-bad")
          }
        >
          {question.candidates[picked].explanation}
        </div>
      )}

      {firstWasCorrect !== null && (
        <div className="mcq-footer">
          <button
            className="lesson-next"
            onClick={() => onContinue(firstWasCorrect)}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
