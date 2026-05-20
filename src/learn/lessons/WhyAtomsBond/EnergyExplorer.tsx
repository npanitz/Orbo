import { useEffect, useMemo, useRef, useState } from "react";
import { ELEMENTS_BY_NUMBER } from "../../../data/periodicTable";
import { potentialEnergy, samplePotential, type Potential } from "./morsePotential";
import { PAIRS, PAIRS_BY_ID, type PairId } from "./pairs";

interface Props {
  onComplete: () => void;
}

/** Numerical slope dE/dr at r — small symmetric difference. */
function slopeAt(r: number, params: Potential): number {
  const eps = 0.5; // pm
  return (potentialEnergy(r + eps, params) - potentialEnergy(r - eps, params)) / (2 * eps);
}

const RELAX_STEP_GAIN = 60;   // step size per frame in pm per (eV/pm)
const RELAX_MAX_STEP_PM = 4;  // cap per frame — keeps steep walls from launching atoms
const RELAX_MAX_FRAMES = 300; // safety cap (~5 seconds at 60fps)

/** Epsilon for "settled" (|slope| below this stops the loop). Morse curves
 *  cross slope=0 cleanly at r0 so a tight threshold settles right at the
 *  minimum. Pure-repulsion curves only *approach* zero slope asymptotically,
 *  so we use a looser threshold that stops atoms right when the wall fades
 *  rather than letting them drift to the boundary. */
function relaxEpsilonFor(kind: "morse" | "repulsion"): number {
  return kind === "morse" ? 5e-4 : 5e-3;
}

const E_MIN = -5;
const E_MAX = 3;

const SCENE_W = 600;
const SCENE_H = 140;
const GRAPH_W = 520;
const GRAPH_H = 240;

const ATOM_VIS_RADIUS_BASE = 22; // px

export function EnergyExplorer({ onComplete }: Props) {
  const [pairId, setPairId] = useState<PairId>("h-h");
  const pair = PAIRS_BY_ID[pairId];
  const [r, setR] = useState(pair.displayDefaultR);
  const [isRelaxing, setIsRelaxing] = useState(false);
  const [relaxStatus, setRelaxStatus] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  // Cancel any running relax animation. Used when switching pairs, scrubbing
  // the slider, or unmounting.
  const cancelRelax = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsRelaxing(false);
  };

  useEffect(() => () => cancelRelax(), []); // cleanup on unmount

  // When the user picks a new pair, snap the slider to that pair's r0
  const switchPair = (id: PairId) => {
    cancelRelax();
    setRelaxStatus(null);
    setPairId(id);
    setR(PAIRS_BY_ID[id].displayDefaultR);
  };

  // Manual slider edits cancel an in-progress relax.
  const onSliderChange = (next: number) => {
    if (isRelaxing) cancelRelax();
    setRelaxStatus(null);
    setR(next);
  };

  const runRelax = () => {
    if (isRelaxing) {
      cancelRelax();
      setRelaxStatus("Stopped.");
      return;
    }
    setIsRelaxing(true);
    setRelaxStatus("Relaxing…");

    let frame = 0;
    let curR = r;
    const epsilon = relaxEpsilonFor(pair.potential.kind);

    const tick = () => {
      frame++;
      const slope = slopeAt(curR, pair.potential);
      const force = -slope; // atoms move down the energy gradient

      // Cap per-frame step — keeps a steep repulsion wall from launching the
      // atoms past the slider bounds in a single frame.
      let step = force * RELAX_STEP_GAIN;
      if (Math.abs(step) > RELAX_MAX_STEP_PM) {
        step = Math.sign(step) * RELAX_MAX_STEP_PM;
      }
      let next = curR + step;

      // Clamp to slider range
      const hitMin = next <= pair.rMin;
      const hitMax = next >= pair.rMax;
      if (hitMin) next = pair.rMin;
      if (hitMax) next = pair.rMax;

      curR = next;
      setR(curR);

      const settled = Math.abs(force) < epsilon;
      const stuck = hitMin || hitMax;

      if (settled || stuck || frame >= RELAX_MAX_FRAMES) {
        rafRef.current = null;
        setIsRelaxing(false);
        // Tailor the status copy to the situation — it's pedagogical.
        if (pair.bondType === "No bond") {
          setRelaxStatus("Settled. The curve is flat — no bond forms.");
        } else if (settled) {
          setRelaxStatus(`Settled at equilibrium (${curR.toFixed(0)} pm).`);
        } else if (stuck) {
          setRelaxStatus("Drifted to the boundary — no nearby well.");
        } else {
          setRelaxStatus("Stopped after time limit.");
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const samples = useMemo(
    () => samplePotential(pair.potential, pair.rMin, pair.rMax, 240),
    [pair],
  );

  const curEnergy = potentialEnergy(r, pair.potential);

  return (
    <div className="bond-explorer">
      <div className="bond-toggle">
        {PAIRS.map((p) => (
          <button
            key={p.id}
            className={"trend-toggle-button" + (p.id === pairId ? " active" : "")}
            onClick={() => switchPair(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bond-scene-wrap">
        <PairScene pair={pair} r={r} />
        <div className="bond-slider-row">
          <input
            type="range"
            className="bond-slider"
            min={pair.rMin}
            max={pair.rMax}
            step={1}
            value={r}
            disabled={isRelaxing}
            onChange={(e) => onSliderChange(Number(e.target.value))}
          />
          <button
            className={"bond-relax-button" + (isRelaxing ? " active" : "")}
            onClick={runRelax}
            title="Let physics take over — atoms move toward the energy minimum"
          >
            {isRelaxing ? "⏸ Stop" : "⚡ Relax"}
          </button>
        </div>
        <div className="bond-slider-labels">
          <span>Close ({pair.rMin} pm)</span>
          <span className="bond-distance">distance: {r.toFixed(0)} pm</span>
          <span>Far ({pair.rMax} pm)</span>
        </div>
        {relaxStatus && <div className="bond-relax-status">{relaxStatus}</div>}
      </div>

      <div className="bond-bottom">
        <EnergyGraph
          samples={samples}
          rMin={pair.rMin}
          rMax={pair.rMax}
          rCur={r}
          eCur={curEnergy}
          equilibriumR={pair.potential.kind === "morse" ? pair.potential.r0 : null}
          bondType={pair.bondType}
        />
        <div className="bond-narrative">
          <div className="trend-narrative-section">
            <div className="trend-narrative-eyebrow">Pattern</div>
            <p>{pair.pattern}</p>
          </div>
          <div className="trend-narrative-section">
            <div className="trend-narrative-eyebrow">Mechanism</div>
            <p>{pair.mechanism}</p>
          </div>
          <div className="trend-narrative-section">
            <div className="trend-narrative-eyebrow">Why it matters</div>
            <p>{pair.insight}</p>
          </div>
        </div>
      </div>

      <div className="bond-action">
        <button className="lesson-next" onClick={onComplete}>
          Continue to challenges →
        </button>
      </div>
    </div>
  );
}

function PairScene({ pair, r }: { pair: { zA: number; zB: number; symA: string; symB: string }; r: number }) {
  const elA = ELEMENTS_BY_NUMBER.get(pair.zA);
  const elB = ELEMENTS_BY_NUMBER.get(pair.zB);
  const colorA = elA ? `#${elA["cpk-hex"] ?? "cccccc"}` : "#cccccc";
  const colorB = elB ? `#${elB["cpk-hex"] ?? "cccccc"}` : "#cccccc";

  // Map distance to pixel separation. The scene spans about 500 pm of room.
  const cx = SCENE_W / 2;
  const cy = SCENE_H / 2;
  const pxPerPm = (SCENE_W - ATOM_VIS_RADIUS_BASE * 2 - 40) / 500;
  const half = (r * pxPerPm) / 2;
  const xA = cx - half;
  const xB = cx + half;

  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="bond-scene-svg">
      {/* Optional bond line — only show when atoms are roughly at bond distance */}
      <line
        x1={xA}
        y1={cy}
        x2={xB}
        y2={cy}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        strokeDasharray="3 4"
      />
      <Atom cx={xA} cy={cy} radius={ATOM_VIS_RADIUS_BASE} color={colorA} symbol={pair.symA} />
      <Atom cx={xB} cy={cy} radius={ATOM_VIS_RADIUS_BASE} color={colorB} symbol={pair.symB} />
    </svg>
  );
}

function Atom({
  cx,
  cy,
  radius,
  color,
  symbol,
}: {
  cx: number;
  cy: number;
  radius: number;
  color: string;
  symbol: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#0a0f1f" strokeWidth="1.5" />
      <text
        x={cx}
        y={cy}
        fill={pickTextColor(color)}
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {symbol}
      </text>
    </g>
  );
}

function pickTextColor(hex: string): string {
  // crude luminance check — light bg gets dark text, dark bg gets light text
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#0a0f1f";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 140 ? "#0a0f1f" : "#e6f2ff";
}

interface GraphProps {
  samples: { r: number; E: number }[];
  rMin: number;
  rMax: number;
  rCur: number;
  eCur: number;
  /** Equilibrium distance (well minimum). Null for no-bond pairs — we omit the
   *  vertical reference line in that case. */
  equilibriumR: number | null;
  bondType: string;
}

function EnergyGraph({
  samples,
  rMin,
  rMax,
  rCur,
  eCur,
  equilibriumR,
  bondType,
}: GraphProps) {
  const PAD_L = 50;
  const PAD_R = 16;
  const PAD_T = 14;
  const PAD_B = 32;
  const innerW = GRAPH_W - PAD_L - PAD_R;
  const innerH = GRAPH_H - PAD_T - PAD_B;

  const rToX = (r: number) => PAD_L + ((r - rMin) / (rMax - rMin)) * innerW;
  const eToY = (e: number) => {
    const clamped = Math.max(E_MIN, Math.min(E_MAX, e));
    return PAD_T + ((E_MAX - clamped) / (E_MAX - E_MIN)) * innerH;
  };

  const zeroY = eToY(0);
  const pathD = samples
    .map((s, i) => `${i === 0 ? "M" : "L"} ${rToX(s.r).toFixed(1)} ${eToY(s.E).toFixed(1)}`)
    .join(" ");

  const eTicks = [-5, -4, -3, -2, -1, 0, 1, 2, 3];
  const rTicks: number[] = [];
  for (let v = Math.ceil(rMin / 100) * 100; v <= rMax; v += 100) rTicks.push(v);

  return (
    <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="bond-graph-svg">
      {/* Y-axis grid + ticks */}
      {eTicks.map((t) => {
        const y = eToY(t);
        return (
          <g key={`y-${t}`}>
            <line
              x1={PAD_L}
              x2={GRAPH_W - PAD_R}
              y1={y}
              y2={y}
              stroke="rgba(115,153,255,0.10)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 6}
              y={y}
              fill="rgba(180,200,235,0.6)"
              fontSize="10"
              textAnchor="end"
              dominantBaseline="central"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* Zero-energy reference */}
      <line
        x1={PAD_L}
        x2={GRAPH_W - PAD_R}
        y1={zeroY}
        y2={zeroY}
        stroke="rgba(180,200,235,0.45)"
        strokeWidth="1"
      />

      {/* X-axis ticks */}
      {rTicks.map((t) => {
        const x = rToX(t);
        return (
          <g key={`x-${t}`}>
            <line
              x1={x}
              x2={x}
              y1={PAD_T}
              y2={GRAPH_H - PAD_B}
              stroke="rgba(115,153,255,0.08)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={GRAPH_H - PAD_B + 14}
              fill="rgba(180,200,235,0.6)"
              fontSize="10"
              textAnchor="middle"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text
        x={PAD_L + innerW / 2}
        y={GRAPH_H - 4}
        fill="rgba(216,236,255,0.85)"
        fontSize="11"
        textAnchor="middle"
      >
        distance (pm)
      </text>
      <text
        x={14}
        y={PAD_T + innerH / 2}
        fill="rgba(216,236,255,0.85)"
        fontSize="11"
        textAnchor="middle"
        transform={`rotate(-90, 14, ${PAD_T + innerH / 2})`}
      >
        energy (eV)
      </text>

      {/* Equilibrium-distance reference (only if there's an actual well) */}
      {equilibriumR !== null && (
        <line
          x1={rToX(equilibriumR)}
          x2={rToX(equilibriumR)}
          y1={PAD_T}
          y2={GRAPH_H - PAD_B}
          stroke="rgba(110, 224, 200, 0.5)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}

      {/* The Morse curve itself */}
      <path d={pathD} fill="none" stroke="rgb(255, 130, 80)" strokeWidth="2.2" />

      {/* Current-state marker */}
      <line
        x1={rToX(rCur)}
        x2={rToX(rCur)}
        y1={PAD_T}
        y2={GRAPH_H - PAD_B}
        stroke="rgba(216, 236, 255, 0.35)"
        strokeWidth="1"
      />
      <circle
        cx={rToX(rCur)}
        cy={eToY(eCur)}
        r={6}
        fill="#e6f2ff"
        stroke="#1a2030"
        strokeWidth="2"
      />

      {/* Caption box (top right) — bond type + current energy */}
      <g transform={`translate(${GRAPH_W - PAD_R - 138}, ${PAD_T + 6})`}>
        <rect width="138" height="38" rx="6" fill="rgba(15,18,32,0.85)" stroke="rgba(115,153,255,0.25)" />
        <text x="10" y="16" fill="rgba(180,200,235,0.6)" fontSize="10" letterSpacing="0.08em">
          {bondType.toUpperCase()}
        </text>
        <text x="10" y="32" fill="#e6f2ff" fontSize="13" fontWeight="600">
          E = {eCur.toFixed(2)} eV
        </text>
      </g>
    </svg>
  );
}
