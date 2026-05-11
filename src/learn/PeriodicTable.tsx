import { useState } from "react";
import {
  ELEMENTS_DATA,
  type PeriodicElement,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  categoryKey,
  type CategoryKey,
} from "../data/periodicTable";
import { ElementDetail } from "./ElementDetail";

interface Props {
  onExit: () => void;
}

export function PeriodicTable({ onExit }: Props) {
  const [selected, setSelected] = useState<PeriodicElement | null>(null);

  return (
    <div className="periodic-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Modules
      </button>

      <header className="periodic-header">
        <h1>The Periodic Table</h1>
        <p className="periodic-sub">
          Click any element to see its properties, electron configuration, and
          place in the family of matter.
        </p>
      </header>

      <PeriodicTableGrid onPick={setSelected} />
      <Legend />

      {selected && (
        <ElementDetail element={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

interface GridProps {
  onPick?: (el: PeriodicElement) => void;
  /** Atomic number to visually highlight (pulses). */
  highlightedZ?: number;
  /** Disable click interactions — useful in passive lesson view. */
  passive?: boolean;
  /** Optional override for each cell's accent color. Returning null falls back
   * to the category color. Used by trend heat maps. */
  colorOverride?: (el: PeriodicElement) => string | null;
  /** Optional override for the per-cell title/tooltip. */
  titleFor?: (el: PeriodicElement) => string;
}

/** The element grid itself, no page chrome. Reusable in lessons. */
export function PeriodicTableGrid({
  onPick,
  highlightedZ,
  passive,
  colorOverride,
  titleFor,
}: GridProps) {
  return (
    <div className="periodic-table">
      {ELEMENTS_DATA.map((el) => {
        const key = categoryKey(el.category);
        const color = colorOverride?.(el) ?? CATEGORY_COLORS[key];
        const isHighlighted = highlightedZ === el.number;
        return (
          <button
            key={el.number}
            className={"pt-cell" + (isHighlighted ? " pt-cell-pulse" : "")}
            style={{
              gridColumn: el.xpos,
              gridRow: el.ypos,
              ["--accent" as string]: color,
            }}
            onClick={() => !passive && onPick?.(el)}
            tabIndex={passive ? -1 : 0}
            title={titleFor ? titleFor(el) : `${el.name} · ${el.category}`}
          >
            <div className="pt-num">{el.number}</div>
            <div className="pt-sym">{el.symbol}</div>
            <div className="pt-mass">{formatMass(el.atomic_mass)}</div>
          </button>
        );
      })}

      <div className="pt-placeholder" style={{ gridColumn: 3, gridRow: 6 }}>
        57–71
      </div>
      <div className="pt-placeholder" style={{ gridColumn: 3, gridRow: 7 }}>
        89–103
      </div>
    </div>
  );
}

function formatMass(m: number): string {
  if (m >= 100) return m.toFixed(0);
  if (m >= 10) return m.toFixed(1);
  return m.toFixed(2);
}

export function Legend() {
  const keys: CategoryKey[] = [
    "alkali-metal",
    "alkaline-earth-metal",
    "transition-metal",
    "post-transition-metal",
    "metalloid",
    "diatomic-nonmetal",
    "polyatomic-nonmetal",
    "noble-gas",
    "lanthanide",
    "actinide",
    "unknown",
  ];
  return (
    <div className="pt-legend">
      {keys.map((k) => (
        <div key={k} className="pt-legend-item">
          <span
            className="pt-legend-swatch"
            style={{ background: CATEGORY_COLORS[k] }}
          />
          {CATEGORY_LABELS[k]}
        </div>
      ))}
    </div>
  );
}
