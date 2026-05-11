import { useMemo, useState } from "react";
import { ELEMENTS_BY_NUMBER } from "../../../data/periodicTable";
import { AtomBuilder, type AtomState } from "../BuildAnAtom/AtomBuilder";
import { PeriodicTableGrid } from "../../PeriodicTable";
import { beatFor, type NarrativeBeat } from "./narrativeBeats";

interface Props {
  /** Z range to walk through. Lesson 2 uses 1..18. */
  maxZ: number;
  onComplete: () => void;
}

/**
 * Split-screen guided build. The student presses one button to add an
 * electron (which also adds the matching proton + a sensible neutron count to
 * keep things neutral). The atom on the left, the periodic table on the
 * right, and the narrative banner all share the same Z.
 */
export function GuidedBuilder({ maxZ, onComplete }: Props) {
  const [z, setZ] = useState(0);
  const [dismissedBeats, setDismissedBeats] = useState<Set<number>>(new Set());

  const state: AtomState = useMemo(() => {
    if (z === 0) return { p: 0, n: 0, e: 0 };
    const el = ELEMENTS_BY_NUMBER.get(z);
    const neutrons = el ? Math.max(0, Math.round(el.atomic_mass) - z) : 0;
    return { p: z, n: neutrons, e: z };
  }, [z]);

  const pendingBeat: NarrativeBeat | null =
    z > 0 && !dismissedBeats.has(z) ? beatFor(z) : null;

  const advance = () => {
    if (z >= maxZ) {
      onComplete();
      return;
    }
    setZ((curr) => curr + 1);
  };

  const dismissBeat = (beat: NarrativeBeat) => {
    setDismissedBeats((prev) => {
      const next = new Set(prev);
      next.add(beat.z);
      return next;
    });
  };

  const atTheEnd = z >= maxZ;
  const currentElement = z > 0 ? ELEMENTS_BY_NUMBER.get(z) ?? null : null;

  return (
    <div className="guided-builder">
      <div className="gb-progress">
        <div
          className="gb-progress-bar"
          style={{ width: `${(z / maxZ) * 100}%` }}
        />
        <span className="gb-progress-label">
          {z === 0
            ? "Press Next element to start"
            : `Z = ${z}${currentElement ? ` · ${currentElement.name}` : ""}`}
        </span>
      </div>

      <div className="gb-split">
        <div className="gb-atom">
          <AtomBuilder state={state} onChange={() => {}} readOnly />
        </div>
        <div className="gb-table">
          <PeriodicTableGrid highlightedZ={z || undefined} passive />
        </div>
      </div>

      <div className="gb-action">
        <button
          className="lesson-start gb-add-button"
          onClick={advance}
          disabled={pendingBeat !== null}
        >
          {atTheEnd ? "Finish guided build →" : "Next element →"}
        </button>
      </div>

      {pendingBeat && (
        <NarrativeBanner
          beat={pendingBeat}
          onDismiss={() => dismissBeat(pendingBeat)}
        />
      )}
    </div>
  );
}

function NarrativeBanner({
  beat,
  onDismiss,
}: {
  beat: NarrativeBeat;
  onDismiss: () => void;
}) {
  return (
    <div className="narrative-banner">
      <div className="narrative-card">
        {beat.tag && <div className="narrative-tag">{beat.tag}</div>}
        <h3 className="narrative-title">{beat.title}</h3>
        <p className="narrative-body">{beat.body}</p>
        <button className="lesson-next" onClick={onDismiss}>
          Got it →
        </button>
      </div>
    </div>
  );
}
