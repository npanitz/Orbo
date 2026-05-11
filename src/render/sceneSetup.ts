import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

export interface SceneBundle {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

export function createScene(canvas: HTMLCanvasElement): SceneBundle {
  const scene = new Scene();
  scene.background = new Color(0x04040e);
  scene.fog = new Fog(0x04040e, 18, 40);

  const camera = new PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(8, 7, 14);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMappingExposure = 1.1;

  const key = new DirectionalLight(0xe6f0ff, 1.3);
  key.position.set(6, 10, 8);
  scene.add(key);

  const fill = new DirectionalLight(0x6080c0, 0.5);
  fill.position.set(-8, 4, -6);
  scene.add(fill);

  scene.add(new AmbientLight(0x405070, 0.4));

  return { scene, camera, renderer };
}

export function resizeToWindow(bundle: SceneBundle) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  bundle.renderer.setSize(w, h, false);
  bundle.camera.aspect = w / h;
  bundle.camera.updateProjectionMatrix();
}
