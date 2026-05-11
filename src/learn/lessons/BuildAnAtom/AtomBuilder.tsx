import { useMemo } from "react";
import { ELEMENTS_BY_NUMBER } from "../../../data/periodicTable";
import {
  chargeLabel,
  distributeElectrons,
  isotopeNotation,
  packNucleus,
} from "./shellModel";

export interface AtomState {
  p: number; // protons
  n: number; // neutrons
  e: number; // electrons
}

interface Props {
  state: AtomState;
  onChange: (s: AtomState) => void;
  /** Optional max counts (used in challenge mode to cap controls). */
  caps?: { p?: number; n?: number; e?: number };
  /** When true, hide the +/− controls — the scene + readouts become a passive display. */
  readOnly?: boolean;
}

const PROTON_COLOR = "#ff5966";
const NEUTRON_COLOR = "#9aa6b8";
const ELECTRON_COLOR = "#7398ff";

const VIEWBOX = 480;
const NUCLEUS_BASE_R = 26; // baseline nucleus radius (scales up with nucleon count)
const PARTICLE_R = 6.5;
const SHELL_GAP = 40;
const SHELL_R0 = 70;

export function AtomBuilder({ state, onChange, caps, readOnly }: Props) {
  const { p, n, e } = state;
  const A = p + n;
  const Z = p;
  const charge = p - e;
  const element = Z > 0 ? ELEMENTS_BY_NUMBER.get(Z) ?? null : null;
  const shells = useMemo(() => distributeElectrons(e, element ? Z : null), [e, Z, element]);

  // Scale nucleus blob to size of nucleon count
  const nucleusR = NUCLEUS_BASE_R + Math.sqrt(Math.max(A, 1)) * 6;
  const nucleons = useMemo(() => packNucleus(A), [A]);

  return (
    <div className="atom-builder">
      <div className="ab-scene">
        <svg
          viewBox={`-${VIEWBOX / 2} -${VIEWBOX / 2} ${VIEWBOX} ${VIEWBOX}`}
          className="ab-svg"
        >
          {/* Shells */}
          {shells.map((occ, i) => {
            const r = SHELL_R0 + i * SHELL_GAP;
            return (
              <g key={`shell-${i}`}>
                <circle
                  r={r}
                  fill="none"
                  stroke="rgba(115, 153, 255, 0.22)"
                  strokeDasharray="3 4"
                />
                {Array.from({ length: occ }).map((_, k) => {
                  const angle = (k / occ) * Math.PI * 2 - Math.PI / 2;
                  const x = r * Math.cos(angle);
                  const y = r * Math.sin(angle);
                  return (
                    <circle
                      key={k}
                      cx={x}
                      cy={y}
                      r={PARTICLE_R}
                      fill={ELECTRON_COLOR}
                      stroke="#0a0f1f"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Nucleus boundary glow */}
          {A > 0 && (
            <circle
              r={nucleusR + 6}
              fill="rgba(255, 89, 102, 0.06)"
              stroke="rgba(255, 89, 102, 0.18)"
            />
          )}

          {/* Nucleons */}
          {nucleons.map((pt, i) => {
            const isProton = i < p;
            return (
              <circle
                key={`nucleon-${i}`}
                cx={pt.x * nucleusR}
                cy={pt.y * nucleusR}
                r={PARTICLE_R}
                fill={isProton ? PROTON_COLOR : NEUTRON_COLOR}
                stroke="#0a0f1f"
                strokeWidth="1"
              />
            );
          })}

          {A === 0 && (
            <text
              x="0"
              y="0"
              fill="rgba(180, 200, 235, 0.45)"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="central"
            >
              Add a proton to start
            </text>
          )}
        </svg>
      </div>

      <div className="ab-side">
        <Readouts
          p={p}
          n={n}
          e={e}
          A={A}
          Z={Z}
          charge={charge}
          element={element}
        />
        {!readOnly && <Controls state={state} onChange={onChange} caps={caps} />}
      </div>
    </div>
  );
}

function Readouts({
  p,
  n,
  e,
  A,
  Z,
  charge,
  element,
}: {
  p: number;
  n: number;
  e: number;
  A: number;
  Z: number;
  charge: number;
  element: ReturnType<typeof ELEMENTS_BY_NUMBER.get> | null;
}) {
  return (
    <div className="ab-readouts">
      <div className="ab-element-card">
        {element ? (
          <>
            <div className="ab-element-symbol">
              {isotopeNotation(element.symbol, A)}
              <sup className="ab-charge">{chargeLabel(charge)}</sup>
            </div>
            <div className="ab-element-name">{element.name}</div>
            <div className="ab-element-meta">
              {charge === 0
                ? "Neutral atom"
                : charge > 0
                  ? "Cation"
                  : "Anion"}
            </div>
          </>
        ) : (
          <div className="ab-element-empty">No element yet</div>
        )}
      </div>

      <div className="ab-stat-grid">
        <Stat label="Protons (Z)" value={p} color={PROTON_COLOR} />
        <Stat label="Neutrons" value={n} color={NEUTRON_COLOR} />
        <Stat label="Electrons" value={e} color={ELECTRON_COLOR} />
        <Stat label="Mass (A)" value={A} />
        <Stat label="Charge" value={charge > 0 ? `+${charge}` : `${charge}`} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="ab-stat">
      <div className="ab-stat-label">
        {color && <span className="ab-swatch" style={{ background: color }} />}
        {label}
      </div>
      <div className="ab-stat-value">{value}</div>
    </div>
  );
}

function Controls({
  state,
  onChange,
  caps,
}: {
  state: AtomState;
  onChange: (s: AtomState) => void;
  caps?: { p?: number; n?: number; e?: number };
}) {
  const { p, n, e } = state;
  const set = (patch: Partial<AtomState>) => onChange({ ...state, ...patch });
  const canAdd = (k: keyof AtomState) => {
    const cap = caps?.[k];
    return cap === undefined || state[k] < cap;
  };
  return (
    <div className="ab-controls">
      <Row
        label="Proton"
        color={PROTON_COLOR}
        value={p}
        onAdd={() => canAdd("p") && set({ p: p + 1 })}
        onSub={() => p > 0 && set({ p: Math.max(0, p - 1) })}
      />
      <Row
        label="Neutron"
        color={NEUTRON_COLOR}
        value={n}
        onAdd={() => canAdd("n") && set({ n: n + 1 })}
        onSub={() => n > 0 && set({ n: Math.max(0, n - 1) })}
      />
      <Row
        label="Electron"
        color={ELECTRON_COLOR}
        value={e}
        onAdd={() => canAdd("e") && set({ e: e + 1 })}
        onSub={() => e > 0 && set({ e: Math.max(0, e - 1) })}
      />
      <button
        className="ab-clear"
        onClick={() => onChange({ p: 0, n: 0, e: 0 })}
      >
        Clear
      </button>
    </div>
  );
}

function Row({
  label,
  color,
  value,
  onAdd,
  onSub,
}: {
  label: string;
  color: string;
  value: number;
  onAdd: () => void;
  onSub: () => void;
}) {
  return (
    <div className="ab-row">
      <div className="ab-row-label">
        <span className="ab-swatch" style={{ background: color }} />
        {label}
      </div>
      <div className="ab-row-buttons">
        <button onClick={onSub}>−</button>
        <span className="ab-row-value">{value}</span>
        <button onClick={onAdd}>+</button>
      </div>
    </div>
  );
}
