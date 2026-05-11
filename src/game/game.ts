import {
  Box3,
  Clock,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Atom } from "../chem/atom";
import { ELEMENTS, formulaFor } from "../chem/elements";
import { findMolecules, stepAll } from "../chem/solver";
import { buildMolecule } from "../chem/builder";

const BOUNDS = new Box3(new Vector3(-9, -5, -9), new Vector3(9, 5, 9));

export interface StatusInfo {
  text: string;
  openSlots: number;
}

export class Game {
  readonly atoms: Atom[] = [];
  private spawnCount = 0;
  private clock = new Clock();
  private raycaster = new Raycaster();
  private mouseNdc = new Vector2();
  private cameraRight = new Vector3();
  private cameraUp = new Vector3();
  private controls: OrbitControls;
  private rafId = 0;
  private onStatusChange: (s: StatusInfo) => void = () => {};

  constructor(
    private scene: Scene,
    private camera: PerspectiveCamera,
    private renderer: WebGLRenderer,
  ) {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.mouseButtons = {
      LEFT: null as unknown as number,
      MIDDLE: 0, // THREE.MOUSE.ROTATE = 0 — swapped to PAN (2) while Shift is held
      RIGHT: null as unknown as number,
    };
    this.controls.minDistance = 4;
    this.controls.maxDistance = 30;
    this.controls.screenSpacePanning = true;
    this.controls.panSpeed = 1.0;
    // Arrow keys also pan, as a keyboard fallback.
    this.controls.listenToKeyEvents(window);

    this.installInput();
  }

  setStatusListener(cb: (s: StatusInfo) => void) {
    this.onStatusChange = cb;
    this.publishStatus();
  }

  start() {
    let lastBondCount = 0;
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 1 / 30);
      stepAll(this.atoms, BOUNDS, dt);
      const bondCount = this.atoms.reduce((n, a) => n + a.bonds.size, 0);
      if (bondCount !== lastBondCount) {
        lastBondCount = bondCount;
        this.publishStatus();
      }
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    this.controls.dispose();
  }

  // ---------- Spawn ----------

  spawnAtom(element: string): Atom {
    const a = this.makeAtom(element, this.spawnPosition());
    this.publishStatus();
    return a;
  }

  spawnMolecule(key: string) {
    const created = buildMolecule(key);
    if (created.length === 0) return;
    const delta = this.spawnPosition().sub(created[0].position);
    for (const a of created) {
      a.position.add(delta);
      this.scene.add(a.group);
      this.atoms.push(a);
      this.spawnCount++;
    }
    this.publishStatus();
  }

  clearAll() {
    for (const a of [...this.atoms]) this.deleteAtom(a);
  }

  private makeAtom(element: string, pos: Vector3): Atom {
    const cfg = ELEMENTS[element];
    const a = new Atom(element, cfg);
    a.group.position.copy(pos);
    this.scene.add(a.group);
    this.atoms.push(a);
    this.spawnCount++;
    return a;
  }

  private deleteAtom(atom: Atom) {
    atom.breakAllBonds();
    const i = this.atoms.indexOf(atom);
    if (i !== -1) this.atoms.splice(i, 1);
    atom.group.removeFromParent();
    this.publishStatus();
  }

  private spawnPosition(): Vector3 {
    const ox = ((this.spawnCount * 47) % 60) * 0.05 - 1.5;
    const oy = ((this.spawnCount * 31) % 30) * 0.05 - 0.75;
    const oz = ((this.spawnCount * 23) % 60) * 0.05 - 1.5;
    return new Vector3(ox, 2.5 + oy, oz);
  }

  // ---------- Input ----------

  private installInput() {
    const dom = this.renderer.domElement;
    dom.addEventListener("pointerdown", this.onPointerDown);
    dom.addEventListener("pointerup", this.onPointerUp);
    dom.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  uninstallInput() {
    const dom = this.renderer.domElement;
    dom.removeEventListener("pointerdown", this.onPointerDown);
    dom.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.button === 0) {
      const pick = this.pickAtom(e.clientX, e.clientY);
      if (pick) pick.startAim(e.clientX, e.clientY);
    } else if (e.button === 2) {
      const pick = this.pickAtom(e.clientX, e.clientY);
      if (pick) {
        pick.breakAllBonds();
        this.publishStatus();
      }
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.camera.matrixWorld.extractBasis(this.cameraRight, this.cameraUp, new Vector3());
    for (const a of this.atoms) {
      if (a.aimActive) {
        a.releaseAim(e.clientX, e.clientY, this.cameraRight, this.cameraUp);
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      this.controls.mouseButtons.MIDDLE = 2; // THREE.MOUSE.PAN
    } else if (e.key === "r" || e.key === "R") {
      this.clearAll();
    } else if (e.key === "c" || e.key === "C") {
      this.clearAll();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      this.controls.mouseButtons.MIDDLE = 0; // back to ROTATE
    }
  };

  private pickAtom(clientX: number, clientY: number): Atom | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseNdc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const ray = this.raycaster.ray;
    let best: Atom | null = null;
    let bestT = Infinity;
    const oc = new Vector3();
    for (const a of this.atoms) {
      oc.copy(ray.origin).sub(a.position);
      const b = oc.dot(ray.direction);
      const c = oc.dot(oc) - a.radius * a.radius;
      const disc = b * b - c;
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      if (t > 0 && t < bestT) {
        bestT = t;
        best = a;
      }
    }
    return best;
  }

  // ---------- Status ----------

  private publishStatus() {
    const molecules = findMolecules(this.atoms);
    const pieces = molecules.map((m) => formulaFor(m));
    const openSlots = this.atoms.reduce(
      (n, a) => n + a.bondDirections.length - a.bonds.size,
      0,
    );
    const text = pieces.length === 0 ? "—" : pieces.join("  +  ");
    this.onStatusChange({ text, openSlots });
  }
}
