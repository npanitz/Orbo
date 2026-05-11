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

      <div className="periodic-table">
        {ELEMENTS_DATA.map((el) => {
          const key = categoryKey(el.category);
          const color = CATEGORY_COLORS[key];
          return (
            <button
              key={el.number}
              className="pt-cell"
              style={{
                gridColumn: el.xpos,
                gridRow: el.ypos,
                ["--accent" as string]: color,
              }}
              onClick={() => setSelected(el)}
              title={`${el.name} · ${el.category}`}
            >
              <div className="pt-num">{el.number}</div>
              <div className="pt-sym">{el.symbol}</div>
              <div className="pt-mass">{formatMass(el.atomic_mass)}</div>
            </button>
          );
        })}

        {/* Visual placeholder cells linking main table to f-block strip */}
        <div className="pt-placeholder" style={{ gridColumn: 3, gridRow: 6 }}>
          57–71
        </div>
        <div className="pt-placeholder" style={{ gridColumn: 3, gridRow: 7 }}>
          89–103
        </div>
      </div>

      <Legend />

      {selected && (
        <ElementDetail element={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function formatMass(m: number): string {
  if (m >= 100) return m.toFixed(0);
  if (m >= 10) return m.toFixed(1);
  return m.toFixed(2);
}

function Legend() {
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
