import type { RDKitModule } from "@rdkit/rdkit";

let modulePromise: Promise<RDKitModule> | null = null;

/**
 * Lazy-load the RDKit WASM module. The .js + .wasm live in /public; we inject
 * the script tag on first call so the ~7MB payload only ships when 2D mode is
 * actually used.
 */
export function loadRDKit(): Promise<RDKitModule> {
  if (modulePromise) return modulePromise;
  modulePromise = new Promise((resolve, reject) => {
    if (window.initRDKitModule) {
      window.initRDKitModule().then(resolve, reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "/RDKit_minimal.js";
    script.async = true;
    script.onload = () => {
      window.initRDKitModule({ locateFile: () => "/RDKit_minimal.wasm" }).then(resolve, reject);
    };
    script.onerror = () => reject(new Error("Failed to load RDKit script"));
    document.head.appendChild(script);
  });
  return modulePromise;
}
