import { Box3, Vector3 } from "three";
import { Atom } from "./atom";

export const ATTRACTION_RANGE = 4.0;
export const ATTRACTION_STRENGTH = 18.0;
export const SNAP_DISTANCE = 0.55;
export const FRICTION_PER_SEC = 0.55;
export const BOUNCE = 0.55;

const _tmpForce = new Vector3();
const _tmpToSlot = new Vector3();
const _tmpCorr = new Vector3();

export function findMolecules(atoms: Atom[]): Atom[][] {
  const visited = new Set<Atom>();
  const out: Atom[][] = [];
  for (const a of atoms) {
    if (visited.has(a)) continue;
    const comp = a.getMolecule();
    for (const m of comp) visited.add(m);
    out.push(comp);
  }
  return out;
}

export function stepAll(atoms: Atom[], bounds: Box3, dt: number): void {
  const molecules = findMolecules(atoms);
  for (const mol of molecules) {
    if (mol.some((a) => a.aimActive)) continue;
    stepMolecule(mol, atoms, bounds, dt);
  }
  tryFormOneBond(atoms);
}

function stepMolecule(mol: Atom[], atoms: Atom[], bounds: Box3, dt: number) {
  const v = mol[0].velocity.clone();
  _tmpForce.set(0, 0, 0);

  for (const atom of mol) {
    const pull = nearestOpenSlot(atom, atoms, mol);
    if (pull) {
      _tmpToSlot.copy(pull.pos).sub(atom.position);
      const dist = _tmpToSlot.length();
      const falloff = 1.0 - dist / ATTRACTION_RANGE;
      _tmpForce.add(_tmpToSlot.normalize().multiplyScalar(ATTRACTION_STRENGTH * falloff));
    }
  }

  v.add(_tmpForce.divideScalar(mol.length).multiplyScalar(dt));
  v.multiplyScalar(Math.pow(FRICTION_PER_SEC, dt));

  const dpos = v.clone().multiplyScalar(dt);
  for (const atom of mol) {
    atom.position.add(dpos);
    atom.velocity.copy(v);
  }
  clampMolecule(mol, v, bounds);
}

function nearestOpenSlot(
  atom: Atom,
  atoms: Atom[],
  exclude: Atom[],
): { pos: Vector3; dist: number } | null {
  if (atom.firstOpenSlot() === -1) return null;
  let bestDist = ATTRACTION_RANGE;
  let bestPos: Vector3 | null = null;
  for (const other of atoms) {
    if (exclude.includes(other)) continue;
    for (let i = 0; i < other.bondDirections.length; i++) {
      if (other.bonds.has(i)) continue;
      const sp = other.slotWorldPos(i);
      const d = atom.position.distanceTo(sp);
      if (d < bestDist) {
        bestDist = d;
        bestPos = sp;
      }
    }
  }
  return bestPos ? { pos: bestPos, dist: bestDist } : null;
}

function clampMolecule(mol: Atom[], vel: Vector3, bounds: Box3) {
  const { min: lo, max: hi } = bounds;
  _tmpCorr.set(0, 0, 0);
  let hitX = false;
  let hitY = false;
  let hitZ = false;
  for (const atom of mol) {
    const r = atom.radius;
    const p = atom.position;
    if (p.x - r < lo.x) {
      _tmpCorr.x = Math.max(_tmpCorr.x, lo.x - (p.x - r));
      hitX = true;
    } else if (p.x + r > hi.x) {
      _tmpCorr.x = Math.min(_tmpCorr.x, hi.x - (p.x + r));
      hitX = true;
    }
    if (p.y - r < lo.y) {
      _tmpCorr.y = Math.max(_tmpCorr.y, lo.y - (p.y - r));
      hitY = true;
    } else if (p.y + r > hi.y) {
      _tmpCorr.y = Math.min(_tmpCorr.y, hi.y - (p.y + r));
      hitY = true;
    }
    if (p.z - r < lo.z) {
      _tmpCorr.z = Math.max(_tmpCorr.z, lo.z - (p.z - r));
      hitZ = true;
    } else if (p.z + r > hi.z) {
      _tmpCorr.z = Math.min(_tmpCorr.z, hi.z - (p.z + r));
      hitZ = true;
    }
  }
  if (!hitX && !hitY && !hitZ) return;
  const bounced = vel.clone();
  if (hitX) bounced.x = -vel.x * BOUNCE;
  if (hitY) bounced.y = -vel.y * BOUNCE;
  if (hitZ) bounced.z = -vel.z * BOUNCE;
  for (const atom of mol) {
    atom.position.add(_tmpCorr);
    atom.velocity.copy(bounced);
  }
}

function tryFormOneBond(atoms: Atom[]) {
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];
    const aMol = a.getMolecule();
    for (let j = i + 1; j < atoms.length; j++) {
      const b = atoms[j];
      if (aMol.includes(b)) continue;
      for (let s1 = 0; s1 < a.bondDirections.length; s1++) {
        if (a.bonds.has(s1)) continue;
        for (let s2 = 0; s2 < b.bondDirections.length; s2++) {
          if (b.bonds.has(s2)) continue;
          const d = a.slotWorldPos(s1).distanceTo(b.slotWorldPos(s2));
          if (d < SNAP_DISTANCE) {
            a.formBond(s1, b, s2);
            return;
          }
        }
      }
    }
  }
}
