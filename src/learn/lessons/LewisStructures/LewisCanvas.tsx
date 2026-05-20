import type { MoleculeDef } from "./molecules";
import type { LewisState } from "./state";

interface Props {
  molecule: MoleculeDef;
  state: LewisState;
  /** Atom id to flash (highlight on the count step). */
  highlightAtomId?: string;
}

const ATOM_INSET = 22;        // gap between bond-line endpoints and atom center
const BOND_PARALLEL_OFFSET = 4; // perpendicular spacing for multi-bond lines
const LP_DOT_R = 2.4;
const LP_DOT_GAP = 5;          // distance between the two dots in a lone pair

/**
 * SVG renderer for a partial Lewis structure. Pure: render reflects the
 * current `state` and nothing more. Animation comes from React re-rendering
 * when the state changes between steps.
 */
export function LewisCanvas({ molecule, state, highlightAtomId }: Props) {
  return (
    <svg viewBox="0 0 440 320" className="lewis-structure-svg">
      {/* Bonds first so atoms render on top */}
      {state.bonds.map((bond, i) => {
        if (bond.order === 0) return null;
        const def = molecule.bonds[i];
        const a = molecule.atoms.find((x) => x.id === def.a)!;
        const b = molecule.atoms.find((x) => x.id === def.b)!;
        return (
          <BondLines
            key={i}
            ax={a.x}
            ay={a.y}
            bx={b.x}
            by={b.y}
            order={bond.order}
          />
        );
      })}

      {/* Atom labels */}
      {molecule.atoms.map((atom) => {
        const isHighlighted = atom.id === highlightAtomId;
        return (
          <g key={atom.id}>
            {isHighlighted && (
              <circle
                cx={atom.x}
                cy={atom.y}
                r="22"
                fill="rgba(255, 200, 100, 0.18)"
                stroke="rgba(255, 200, 100, 0.7)"
                strokeWidth="1.5"
              />
            )}
            <text
              x={atom.x}
              y={atom.y}
              fill={isHighlighted ? "#fff5db" : "#e6f2ff"}
              fontSize="22"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {atom.symbol}
            </text>
          </g>
        );
      })}

      {/* Lone-pair dots — placed in the atom's pre-defined slots, in order */}
      {state.atoms.map((atomState) => {
        const def = molecule.atoms.find((a) => a.id === atomState.id)!;
        return Array.from({ length: atomState.lonePairs }).map((_, lpIdx) => {
          const slot = def.lonePairSlots[lpIdx];
          if (!slot) return null;
          // Dots are arranged perpendicular to the atom→slot direction.
          // Slot above/below atom (vertical offset) → dots side-by-side horizontally.
          // Slot left/right of atom (horizontal offset) → dots stacked vertically.
          const dx = slot.x - def.x;
          const dy = slot.y - def.y;
          const horiz = Math.abs(dy) >= Math.abs(dx);
          return (
            <LonePair
              key={`${atomState.id}-${lpIdx}`}
              cx={slot.x}
              cy={slot.y}
              horizontal={horiz}
            />
          );
        });
      })}
    </svg>
  );
}

function LonePair({
  cx,
  cy,
  horizontal,
}: {
  cx: number;
  cy: number;
  horizontal: boolean;
}) {
  const ox = horizontal ? LP_DOT_GAP : 0;
  const oy = horizontal ? 0 : LP_DOT_GAP;
  return (
    <g className="lp-dots">
      <circle cx={cx - ox} cy={cy - oy} r={LP_DOT_R} fill="#ffd86b" />
      <circle cx={cx + ox} cy={cy + oy} r={LP_DOT_R} fill="#ffd86b" />
    </g>
  );
}

function BondLines({
  ax,
  ay,
  bx,
  by,
  order,
}: {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  order: 1 | 2 | 3;
}) {
  // Unit vector along the bond
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;

  // Inset endpoints so the line doesn't overlap atom symbols
  const x1 = ax + ux * ATOM_INSET;
  const y1 = ay + uy * ATOM_INSET;
  const x2 = bx - ux * ATOM_INSET;
  const y2 = by - uy * ATOM_INSET;

  // Perpendicular unit vector (for multi-bond offsetting)
  const px = -uy;
  const py = ux;

  const stroke = "#cdd6f4";
  const strokeW = 2.2;

  if (order === 1) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
    );
  }
  if (order === 2) {
    const o = BOND_PARALLEL_OFFSET;
    return (
      <g>
        <line
          x1={x1 + px * o}
          y1={y1 + py * o}
          x2={x2 + px * o}
          y2={y2 + py * o}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        <line
          x1={x1 - px * o}
          y1={y1 - py * o}
          x2={x2 - px * o}
          y2={y2 - py * o}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
      </g>
    );
  }
  // order === 3
  const o = BOND_PARALLEL_OFFSET + 1;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <line
        x1={x1 + px * o}
        y1={y1 + py * o}
        x2={x2 + px * o}
        y2={y2 + py * o}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <line
        x1={x1 - px * o}
        y1={y1 - py * o}
        x2={x2 - px * o}
        y2={y2 - py * o}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
    </g>
  );
}
