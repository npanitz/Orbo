/**
 * Interatomic potentials used in the explore phase.
 *
 * Two shapes:
 *
 * - **Morse:** `E(r) = D · (1 - exp(-a·(r - r0)))² - D` — the classic
 *   bond-shaped well. Used for any pair that actually bonds (H–H, Cl–Cl,
 *   Na–Cl). At r = r0 the system is in its lowest energy state (E = -D);
 *   at r → ∞ E → 0; at r → 0 E → big positive (repulsion).
 *
 * - **Exponential repulsion:** `E(r) = ε · exp(-(r - r_wall) / scale)` —
 *   pure Pauli wall, no attractive well. Used for He–He: there's nothing to
 *   gain by sharing electrons, but bringing the atoms close still costs
 *   energy because of Pauli exclusion. Morse with D ≈ 0 doesn't model this
 *   right (its repulsion magnitude scales with D), so we use a separate
 *   shape that has a strong wall and no well.
 */

export interface MorseParams {
  kind: "morse";
  D: number;   // well depth (eV)
  r0: number;  // equilibrium distance (pm)
  a: number;   // width parameter (per pm)
}

export interface RepulsionParams {
  kind: "repulsion";
  rWall: number;    // pm — distance at which E = epsilon
  scale: number;    // pm — decay scale
  epsilon: number;  // eV — magnitude at rWall
}

export type Potential = MorseParams | RepulsionParams;

export function potentialEnergy(r: number, p: Potential): number {
  switch (p.kind) {
    case "morse": {
      const x = 1 - Math.exp(-p.a * (r - p.r0));
      return p.D * x * x - p.D;
    }
    case "repulsion": {
      return p.epsilon * Math.exp(-(r - p.rWall) / p.scale);
    }
  }
}

/** Backwards-compat alias for direct Morse-only callers (kept until any
 *  external usage migrates). New code should call `potentialEnergy`. */
export function morseEnergy(r: number, p: { D: number; r0: number; a: number }): number {
  return potentialEnergy(r, { kind: "morse", ...p });
}

/** Sample any potential uniformly across [rMin, rMax]. Returns (r, E) points. */
export function samplePotential(
  p: Potential,
  rMin: number,
  rMax: number,
  steps = 200,
): { r: number; E: number }[] {
  const out: { r: number; E: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const r = rMin + ((rMax - rMin) * i) / steps;
    out.push({ r, E: potentialEnergy(r, p) });
  }
  return out;
}

/** Legacy alias for the Morse-specific sampler. */
export function sampleMorse(
  p: { D: number; r0: number; a: number },
  rMin: number,
  rMax: number,
  steps = 200,
): { r: number; E: number }[] {
  return samplePotential({ kind: "morse", ...p }, rMin, rMax, steps);
}
