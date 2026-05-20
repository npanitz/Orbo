import { useMemo, useState } from "react";
import { LewisCanvas } from "./LewisCanvas";
import { MOLECULES, MOLECULES_BY_ID } from "./molecules";
import { stateAtStep } from "./state";

interface Props {
  onComplete: () => void;
}

/**
 * The walkthrough phase. Pick a molecule, click "Next step" to build the
 * Lewis structure one stage at a time. Counter on the side tracks how many
 * electrons are accounted for.
 *
 * Free-form: switch molecules anytime, replay any sequence.
 */
export function AlgorithmWalkthrough({ onComplete }: Props) {
  const [moleculeId, setMoleculeId] = useState(MOLECULES[0].id);
  const molecule = MOLECULES_BY_ID[moleculeId];
  // stepIndex is "how many steps have been applied"
  // 0 = empty initial state, molecule.steps.length = fully built.
  const [stepIndex, setStepIndex] = useState(0);

  const switchMolecule = (id: string) => {
    setMoleculeId(id);
    setStepIndex(0);
  };

  const state = useMemo(
    () => stateAtStep(molecule, stepIndex),
    [molecule, stepIndex],
  );

  const currentStep = stepIndex > 0 ? molecule.steps[stepIndex - 1] : null;
  const highlightAtomId =
    currentStep?.kind === "count" ? currentStep.atomId : undefined;

  const remaining = molecule.totalValence - state.usedElectrons;
  const atEnd = stepIndex >= molecule.steps.length;

  return (
    <div className="lewis-walkthrough">
      <div className="lewis-mol-picker">
        {MOLECULES.map((m) => (
          <button
            key={m.id}
            className={
              "trend-toggle-button" + (m.id === moleculeId ? " active" : "")
            }
            onClick={() => switchMolecule(m.id)}
          >
            {m.formula} · {m.name}
          </button>
        ))}
      </div>

      <div className="lewis-main">
        <div className="lewis-stage">
          <LewisCanvas
            molecule={molecule}
            state={state}
            highlightAtomId={highlightAtomId}
          />
          <div className="lewis-counter">
            <Counter label="Counted" value={state.countedElectrons} />
            <Counter label="Used" value={state.usedElectrons} />
            <Counter
              label="Remaining"
              value={Math.max(0, remaining)}
              warn={remaining < 0}
            />
            <Counter label="Total" value={molecule.totalValence} muted />
          </div>
        </div>

        <div className="lewis-steps">
          <div className="lewis-teaching">
            <div className="trend-narrative-eyebrow">What this teaches</div>
            <p>{molecule.teachingPoint}</p>
          </div>

          <div className="lewis-step-list">
            {molecule.steps.map((step, i) => {
              const idx = i + 1;
              const isPast = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <div
                  key={i}
                  className={
                    "lewis-step" +
                    (isPast ? " past" : "") +
                    (isCurrent ? " current" : "")
                  }
                >
                  <div className="lewis-step-num">
                    {isPast ? "✓" : idx}
                  </div>
                  <div className="lewis-step-body">{step.narrative}</div>
                </div>
              );
            })}
          </div>

          <div className="lewis-controls">
            <button
              className="lesson-replay"
              onClick={() => setStepIndex(0)}
              disabled={stepIndex === 0}
            >
              Reset
            </button>
            <button
              className="lesson-replay"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
            >
              ← Prev
            </button>
            <button
              className="lesson-start"
              onClick={() =>
                setStepIndex((i) => Math.min(molecule.steps.length, i + 1))
              }
              disabled={atEnd}
            >
              {atEnd ? "Done" : "Next step →"}
            </button>
          </div>
        </div>
      </div>

      <div className="bond-action">
        <button className="lesson-next" onClick={onComplete}>
          Continue to practice →
        </button>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  muted,
  warn,
}: {
  label: string;
  value: number;
  muted?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={"lewis-counter-item" + (muted ? " muted" : "") + (warn ? " warn" : "")}>
      <div className="lewis-counter-label">{label}</div>
      <div className="lewis-counter-value">{value}</div>
    </div>
  );
}
