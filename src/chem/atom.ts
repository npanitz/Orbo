import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import type { ElementConfig } from "./elements";

export const SLOT_DISTANCE = 0.85;
export const SLOT_VIS_RADIUS = 0.11;
export const BOND_RADIUS = 0.07;
export const LONE_RADIUS = 0.07;

export const MAX_LAUNCH_SPEED = 18;
export const LAUNCH_MULT = 0.04;
export const MIN_PULL_SCREEN = 8;

export interface BondRef {
  atom: Atom;
  slot: number;
  energy: number;
}

const UP = new Vector3(0, 1, 0);
const _v3 = new Vector3();
const _q = new Quaternion();

/**
 * A single atom: chemistry state + its scene graph.
 * The atom's Object3D is `group`; position/quaternion live there.
 */
export class Atom {
  readonly group: Group;
  readonly element: string;
  readonly color: number;
  readonly radius: number;
  readonly bondDirections: Vector3[];
  readonly lonePairDirections: Vector3[];

  defaultBondEnergy = 1.0;
  bonds = new Map<number, BondRef>();
  velocity = new Vector3();

  aimActive = false;
  aimOriginScreen = { x: 0, y: 0 };

  private slotMeshes: Mesh<SphereGeometry, MeshStandardMaterial>[] = [];
  private bondStubs: Mesh[] = [];

  /** Release all GPU resources owned by this atom. */
  dispose(): void {
    this.group.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      obj.geometry?.dispose?.();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else (mat as MeshStandardMaterial | undefined)?.dispose?.();
    });
    this.group.removeFromParent();
  }

  constructor(element: string, cfg: ElementConfig) {
    this.element = element;
    this.color = cfg.color;
    this.radius = cfg.radius;
    this.bondDirections = cfg.bonds.map((v) => v.clone());
    this.lonePairDirections = cfg.lone.map((v) => v.clone());
    this.group = new Group();
    this.group.userData.atom = this;
    this.buildVisuals();
  }

  // ---------- Geometry ----------

  get position(): Vector3 {
    return this.group.position;
  }

  slotWorldPos(idx: number): Vector3 {
    return this.group.localToWorld(
      _v3.copy(this.bondDirections[idx]).multiplyScalar(SLOT_DISTANCE),
    ).clone();
  }

  firstOpenSlot(): number {
    for (let i = 0; i < this.bondDirections.length; i++) {
      if (!this.bonds.has(i)) return i;
    }
    return -1;
  }

  // ---------- Bond graph ----------

  getMolecule(): Atom[] {
    const visited = new Set<Atom>();
    const out: Atom[] = [];
    const stack: Atom[] = [this];
    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      out.push(cur);
      for (const ref of cur.bonds.values()) stack.push(ref.atom);
    }
    return out;
  }

  breakAllBonds(): void {
    for (const ref of this.bonds.values()) {
      ref.atom.bonds.delete(ref.slot);
      ref.atom.refreshBondVisuals();
    }
    this.bonds.clear();
    this.velocity.set(0, 0, 0);
    this.refreshBondVisuals();
  }

  /** Rigid-body align so my chosen slot meets partner's slot collinearly. */
  formBond(mySlot: number, other: Atom, otherSlot: number): void {
    const meeting = other.slotWorldPos(otherSlot);
    const away = meeting.clone().sub(other.group.position).normalize();
    const desired = away.clone().negate();
    const current = this.slotWorldPos(mySlot).sub(this.group.position).normalize();
    const rotQ = new Quaternion().setFromUnitVectors(current, desired);
    const pivot = this.group.position.clone();

    const mol = this.getMolecule();
    for (const a of mol) {
      if (a !== this) {
        const offset = a.group.position.clone().sub(pivot).applyQuaternion(rotQ);
        a.group.position.copy(pivot).add(offset);
      }
      _q.copy(rotQ).multiply(a.group.quaternion);
      a.group.quaternion.copy(_q).normalize();
    }

    const translate = meeting.clone().sub(this.slotWorldPos(mySlot));
    for (const a of mol) {
      a.group.position.add(translate);
      a.velocity.set(0, 0, 0);
    }

    const energy = (this.defaultBondEnergy + other.defaultBondEnergy) * 0.5;
    this.bonds.set(mySlot, { atom: other, slot: otherSlot, energy });
    other.bonds.set(otherSlot, { atom: this, slot: mySlot, energy });

    this.refreshBondVisuals();
    other.refreshBondVisuals();
  }

  // ---------- Aim ----------

  startAim(screenX: number, screenY: number): void {
    this.aimActive = true;
    this.aimOriginScreen = { x: screenX, y: screenY };
    for (const a of this.getMolecule()) a.velocity.set(0, 0, 0);
  }

  releaseAim(
    screenX: number,
    screenY: number,
    cameraRight: Vector3,
    cameraUp: Vector3,
  ): void {
    if (!this.aimActive) return;
    this.aimActive = false;
    const dx = this.aimOriginScreen.x - screenX;
    const dy = this.aimOriginScreen.y - screenY;
    const pullLen = Math.hypot(dx, dy);
    if (pullLen <= MIN_PULL_SCREEN) {
      for (const a of this.getMolecule()) a.velocity.set(0, 0, 0);
      return;
    }
    const world = cameraRight
      .clone()
      .multiplyScalar(dx)
      .add(cameraUp.clone().multiplyScalar(-dy));
    world.multiplyScalar(LAUNCH_MULT);
    if (world.length() > MAX_LAUNCH_SPEED) {
      world.setLength(MAX_LAUNCH_SPEED);
    }
    for (const a of this.getMolecule()) a.velocity.copy(world);
  }

  // ---------- Visuals ----------

  private buildVisuals(): void {
    const colVec = colorVec(this.color);

    const core = new Mesh(
      new SphereGeometry(this.radius, 32, 24),
      new MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 0.35,
        roughness: 0.45,
        metalness: 0.15,
      }),
    );
    this.group.add(core);

    for (const dir of this.bondDirections) {
      const m = new Mesh(
        new SphereGeometry(SLOT_VIS_RADIUS, 16, 12),
        new MeshStandardMaterial({
          color: 0xd8ecff,
          emissive: 0x4060b0,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.55,
        }),
      );
      m.position.copy(dir).multiplyScalar(SLOT_DISTANCE);
      this.group.add(m);
      this.slotMeshes.push(m);
    }

    for (const dir of this.lonePairDirections) {
      const m = new Mesh(
        new SphereGeometry(LONE_RADIUS, 16, 12),
        new MeshStandardMaterial({
          color: 0xff8cd9,
          emissive: 0xff8cd9,
          emissiveIntensity: 0.7,
        }),
      );
      m.position.copy(dir).multiplyScalar(SLOT_DISTANCE);
      this.group.add(m);
    }

    // suppress unused
    void colVec;
  }

  refreshBondVisuals(): void {
    for (const stub of this.bondStubs) {
      stub.removeFromParent();
      (stub.geometry as CylinderGeometry).dispose();
      (stub.material as MeshStandardMaterial).dispose();
    }
    this.bondStubs.length = 0;

    for (let i = 0; i < this.bondDirections.length; i++) {
      const mesh = this.slotMeshes[i];
      const mat = mesh.material;
      if (this.bonds.has(i)) {
        mat.opacity = 1.0;
        mat.transparent = false;
        mat.emissiveIntensity = 0.6;
        this.bondStubs.push(this.makeStub(this.bondDirections[i]));
      } else {
        mat.opacity = 0.55;
        mat.transparent = true;
        mat.emissiveIntensity = 0.4;
      }
    }
  }

  private makeStub(direction: Vector3): Mesh {
    const cyl = new Mesh(
      new CylinderGeometry(BOND_RADIUS, BOND_RADIUS, SLOT_DISTANCE, 16),
      new MeshStandardMaterial({
        color: 0xd8ecff,
        emissive: 0x6080c0,
        emissiveIntensity: 0.5,
        roughness: 0.5,
      }),
    );
    cyl.position.copy(direction).multiplyScalar(SLOT_DISTANCE * 0.5);
    cyl.quaternion.setFromUnitVectors(UP, direction.clone().normalize());
    this.group.add(cyl);
    return cyl;
  }
}

function colorVec(hex: number): Vector3 {
  return new Vector3(
    ((hex >> 16) & 0xff) / 255,
    ((hex >> 8) & 0xff) / 255,
    (hex & 0xff) / 255,
  );
}
