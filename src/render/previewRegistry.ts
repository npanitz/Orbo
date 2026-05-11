import {
  AmbientLight,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Atom } from "../chem/atom";
import { buildMolecule, moleculeRadius, recenterMolecule } from "../chem/builder";

/**
 * Single-renderer card preview system.
 *
 * One WebGLRenderer drives every card on the page. For each registered
 * preview, we set a scissor box to the card's screen rect and render that
 * card's scene into it. This scales to many cards on screen without
 * spawning a renderer (and a GPU context) per card.
 */

interface PreviewEntry {
  hostEl: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  rotor: Group;       // wraps the molecule so we can spin it
  atoms: Atom[];
}

const PREVIEW_FOV = 38;
const PREVIEW_PADDING = 1.5;
const SPIN_SPEED = 0.45; // rad/s
const TILT = 0.35;       // initial pitch on the rotor

class PreviewRegistry {
  private renderer: WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private entries = new Map<number, PreviewEntry>();
  private nextId = 1;
  private rafId = 0;
  private lastTime = 0;

  attach(canvas: HTMLCanvasElement): void {
    if (this.renderer) return;
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setScissorTest(true);
    this.lastTime = performance.now();
    this.startLoop();
  }

  detach(): void {
    this.stopLoop();
    this.renderer?.dispose();
    this.renderer = null;
    this.canvas = null;
  }

  register(hostEl: HTMLElement, recipeKey: string): number {
    const id = this.nextId++;
    this.entries.set(id, this.buildEntry(hostEl, recipeKey));
    return id;
  }

  unregister(id: number): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    for (const atom of entry.atoms) atom.dispose();
    this.entries.delete(id);
  }

  // ---------- Internals ----------

  private buildEntry(hostEl: HTMLElement, recipeKey: string): PreviewEntry {
    const scene = new Scene();
    scene.add(new AmbientLight(0x4a5a80, 0.5));
    const key = new DirectionalLight(0xe6f0ff, 1.1);
    key.position.set(4, 6, 5);
    scene.add(key);
    const fill = new DirectionalLight(0x5070a0, 0.4);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const rotor = new Group();
    rotor.rotation.x = TILT;
    scene.add(rotor);

    const atoms = buildMolecule(recipeKey);
    recenterMolecule(atoms);
    for (const a of atoms) rotor.add(a.group);

    const radius = Math.max(moleculeRadius(atoms), 0.6);
    const camera = new PerspectiveCamera(PREVIEW_FOV, 1, 0.1, 100);
    const fov = (camera.fov * Math.PI) / 180;
    const distance = (radius / Math.tan(fov * 0.5)) * PREVIEW_PADDING;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);

    return { hostEl, scene, camera, rotor, atoms };
  }

  private startLoop(): void {
    const loop = (now: number) => {
      this.rafId = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.renderFrame(dt);
    };
    loop(performance.now());
  }

  private stopLoop(): void {
    cancelAnimationFrame(this.rafId);
  }

  private renderFrame(dt: number): void {
    const renderer = this.renderer;
    const canvas = this.canvas;
    if (!renderer || !canvas || this.entries.size === 0) return;

    this.syncCanvasSize();
    renderer.setClearColor(0x000000, 0);
    renderer.clear();

    const winH = window.innerHeight;
    for (const entry of this.entries.values()) {
      entry.rotor.rotation.y += SPIN_SPEED * dt;
      const rect = entry.hostEl.getBoundingClientRect();
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.bottom < 0 ||
        rect.top > winH ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        continue;
      }
      const x = rect.left;
      const y = winH - rect.bottom;
      renderer.setViewport(x, y, rect.width, rect.height);
      renderer.setScissor(x, y, rect.width, rect.height);
      entry.camera.aspect = rect.width / rect.height;
      entry.camera.updateProjectionMatrix();
      renderer.render(entry.scene, entry.camera);
    }
  }

  private syncCanvasSize(): void {
    const renderer = this.renderer;
    const canvas = this.canvas;
    if (!renderer || !canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
      renderer.setSize(w, h, false);
    }
  }
}

export const previewRegistry = new PreviewRegistry();
export const POSITION_TARGET = new Vector3(); // re-exported for convenience
