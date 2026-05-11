import { useState } from "react";
import type { QuizQuestion } from "./quizQuestions";

interface Props {
  question: QuizQuestion;
  /** Called once the student has clicked "Continue" after seeing the explanation. */
  onContinue: (wasCorrect: boolean) => void;
}

/**
 * A multiple-choice card. Reusable for future quiz lessons.
 *
 * Flow: student clicks a choice → instant feedback color + per-choice
 * explanation appears below → Continue button enables. The student can pick
 * additional choices to see their explanations (helpful pedagogically) but
 * the first answer is what we record.
 */
export function MCQCard({ question, onContinue }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [firstWasCorrect, setFirstWasCorrect] = useState<boolean | null>(null);

  const pick = (idx: number) => {
    const choice = question.choices[idx];
    if (firstWasCorrect === null) {
      setFirstWasCorrect(choice.correct);
    }
    setPicked(idx);
  };

  return (
    <div className="mcq-card">
      <div className="mcq-prompt">{question.prompt}</div>
      <div className="mcq-choices">
        {question.choices.map((c, i) => {
          const state =
            picked === null
              ? "idle"
              : picked === i
                ? c.correct
                  ? "correct"
                  : "incorrect"
                : "dim";
          return (
            <button
              key={i}
              className={`mcq-choice mcq-choice-${state}`}
              onClick={() => pick(i)}
              disabled={picked !== null && picked === i}
            >
              <span className="mcq-bullet" aria-hidden>
                {state === "correct" ? "✓" : state === "incorrect" ? "✗" : ""}
              </span>
              {c.text}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div
          className={
            "mcq-explanation " +
            (question.choices[picked].correct ? "mcq-explanation-good" : "mcq-explanation-bad")
          }
        >
          {question.choices[picked].explanation}
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
