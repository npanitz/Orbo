import { useEffect, useState } from "react";
import { AtomBuilder, type AtomState } from "./AtomBuilder";
import { CHALLENGES } from "./challenges";

type Phase = "intro" | "free" | "challenges" | "complete";

interface Props {
  onExit: () => void;
}

const EMPTY: AtomState = { p: 0, n: 0, e: 0 };

export function BuildAnAtomLesson({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [state, setState] = useState<AtomState>(EMPTY);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [completedSymbols, setCompletedSymbols] = useState<string[]>([]);

  // Auto-advance when the current challenge is satisfied
  useEffect(() => {
    if (phase !== "challenges") return;
    const c = CHALLENGES[challengeIdx];
    if (!c) return;
    if (c.check(state)) {
      // Mark completion, wait a moment, advance
      if (c.elementSymbol && !completedSymbols.includes(c.elementSymbol)) {
        setCompletedSymbols((prev) => [...prev, c.elementSymbol!]);
      }
      const t = setTimeout(() => {
        if (challengeIdx + 1 >= CHALLENGES.length) {
          setPhase("complete");
        } else {
          setChallengeIdx((i) => i + 1);
        }
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [state, phase, challengeIdx, completedSymbols]);

  return (
    <div className="lesson-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Module
      </button>

      <div className="lesson-content">
        {phase === "intro" && <Intro onStart={() => setPhase("free")} />}

        {phase === "free" && (
          <FreePlay
            state={state}
            onChange={setState}
            onNext={() => {
              setState(EMPTY);
              setChallengeIdx(0);
              setPhase("challenges");
            }}
          />
        )}

        {phase === "challenges" && (
          <Challenges
            state={state}
            onChange={setState}
            idx={challengeIdx}
          />
        )}

        {phase === "complete" && (
          <Complete
            symbols={completedSymbols}
            onReplay={() => {
              setState(EMPTY);
              setChallengeIdx(0);
              setCompletedSymbols([]);
              setPhase("free");
            }}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="lesson-intro">
      <div className="lesson-eyebrow">Lesson 1</div>
      <h1>Build an Atom</h1>
      <p className="lesson-lede">
        Every element on the periodic table is just a count of protons. Add one,
        and you change the element entirely. In this lesson you'll build atoms
        from scratch and see how their structure determines their identity.
      </p>
      <ul className="lesson-objectives">
        <li>Tell protons, neutrons, and electrons apart by what they do</li>
        <li>See why atomic number is the only thing that defines an element</li>
        <li>Build isotopes and ions of the same element</li>
      </ul>
      <button className="lesson-start" onClick={onStart}>
        Start →
      </button>
    </div>
  );
}

function FreePlay({
  state,
  onChange,
  onNext,
}: {
  state: AtomState;
  onChange: (s: AtomState) => void;
  onNext: () => void;
}) {
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">Free play</div>
          <h2>Poke around</h2>
          <p>
            Add and remove particles. Watch the element name change. Notice what
            happens to the charge when protons and electrons don't match.
          </p>
        </div>
        <button className="lesson-next" onClick={onNext}>
          I'm ready for challenges →
        </button>
      </header>
      <AtomBuilder state={state} onChange={onChange} />
    </>
  );
}

function Challenges({
  state,
  onChange,
  idx,
}: {
  state: AtomState;
  onChange: (s: AtomState) => void;
  idx: number;
}) {
  const c = CHALLENGES[idx];
  const isSolved = c.check(state);
  return (
    <>
      <header className="lesson-phase-header">
        <div>
          <div className="lesson-eyebrow">
            Challenge {idx + 1} of {CHALLENGES.length}
          </div>
          <h2>{c.prompt}</h2>
          <p>{c.detail}</p>
        </div>
        <div className="lesson-status">
          {isSolved ? (
            <div className="lesson-solved">✓ Got it — advancing…</div>
          ) : (
            <div className="lesson-hint">{c.hint}</div>
          )}
        </div>
      </header>
      <AtomBuilder state={state} onChange={onChange} />
    </>
  );
}

function Complete({
  symbols,
  onReplay,
  onExit,
}: {
  symbols: string[];
  onReplay: () => void;
  onExit: () => void;
}) {
  return (
    <div className="lesson-complete">
      <div className="lesson-eyebrow">Lesson complete</div>
      <h1>Nice work.</h1>
      <p className="lesson-lede">
        You built {symbols.length} elements from scratch — and saw that
        isotopes and ions are just variations of the same proton count.
      </p>
      <div className="lesson-trophy-row">
        {symbols.map((s) => (
          <div className="lesson-trophy" key={s}>
            {s}
          </div>
        ))}
      </div>
      <p className="lesson-lede">
        Every one of these lives somewhere on the periodic table. Open it from
        the module page to see where.
      </p>
      <div className="lesson-actions">
        <button className="lesson-next" onClick={onExit}>
          Back to module →
        </button>
        <button className="lesson-replay" onClick={onReplay}>
          Replay
        </button>
      </div>
    </div>
  );
}
