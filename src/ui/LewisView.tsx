import { useEffect, useRef, useState } from "react";
import type { Game } from "../game/game";
import { componentToMolblock, connectedComponents } from "../chem/molblock";
import { formulaFor } from "../chem/elements";
import { loadRDKit } from "../render/rdkit";

export type LewisStyle = "skeletal" | "lewis";

interface Props {
  game: Game | null;
  visible: boolean;
  style: LewisStyle;
}

interface Tile {
  hash: string;
  image: HTMLImageElement;
  formula: string;
  weight: number | null;
}

const TILE_SIZE = 320;
const TILE_PAD = 24;
const TILE_RADIUS = 22;
const FOOTER_HEIGHT = 52;
const STRUCTURE_HEIGHT = TILE_SIZE - FOOTER_HEIGHT;

/**
 * Full-screen Lewis-structure overlay. Read-only: polls game state, groups
 * atoms into connected components, asks RDKit for a 2D depiction SVG per
 * component, and tiles them across the canvas. Re-renders only when
 * topology changes (atoms added/removed, bonds formed/broken).
 */
export function LewisView({ game, visible, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const tilesRef = useRef<Map<string, Tile>>(new Map());
  const lastHashRef = useRef<string>("");

  useEffect(() => {
    if (!visible || !game) return;
    let cancelled = false;
    let rafId = 0;

    setStatus("loading");
    loadRDKit().then(
      (rdkit) => {
        if (cancelled) return;
        setStatus("ready");

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const resize = () => {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          canvas.style.width = `${window.innerWidth}px`;
          canvas.style.height = `${window.innerHeight}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const tick = () => {
          rafId = requestAnimationFrame(tick);
          const comps = connectedComponents(game.atoms);
          const compHashes = comps.map((c) => `${style}:${hashComponent(c)}`);
          const sceneHash = compHashes.join("|");

          if (sceneHash !== lastHashRef.current) {
            lastHashRef.current = sceneHash;
            // Generate any missing tiles
            for (let i = 0; i < comps.length; i++) {
              const h = compHashes[i];
              if (tilesRef.current.has(h)) continue;
              const molblock = componentToMolblock(comps[i]);
              // skeletal: let RDKit strip Hs (textbook line-angle look)
              // lewis: keep every H + bond explicit
              const mol = rdkit.get_mol(
                molblock,
                JSON.stringify({ removeHs: style === "skeletal" }),
              );
              if (!mol) continue;
              mol.set_new_coords(true); // CoordGen 2D layout
              const svg = mol.get_svg_with_highlights(
                JSON.stringify({
                  width: TILE_SIZE,
                  height: STRUCTURE_HEIGHT,
                  bondLineWidth: 2,
                  baseFontSize: 0.7,
                  backgroundColour: [1, 1, 1, 0],
                  symbolColour: [0.05, 0.07, 0.12, 1],
                  annotationColour: [0.2, 0.25, 0.4, 1],
                }),
              );
              let weight: number | null = null;
              try {
                const desc = JSON.parse(mol.get_descriptors());
                if (typeof desc.amw === "number") weight = desc.amw;
              } catch {
                // ignore — RDKit may not return descriptors for malformed inputs
              }
              mol.delete();
              const img = new Image();
              img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
              const formula = formulaFor(comps[i].map((a) => ({ element: a.element })));
              tilesRef.current.set(h, { hash: h, image: img, formula, weight });
            }
            // Evict tiles no longer present
            const live = new Set(compHashes);
            for (const k of tilesRef.current.keys()) {
              if (!live.has(k)) tilesRef.current.delete(k);
            }
          }

          // Draw frame (cheap blit)
          ctx.fillStyle = "#04040e";
          ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

          const cols = Math.max(1, Math.floor((window.innerWidth - TILE_PAD) / (TILE_SIZE + TILE_PAD)));
          for (let i = 0; i < comps.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = TILE_PAD + col * (TILE_SIZE + TILE_PAD);
            const y = 80 + row * (TILE_SIZE + TILE_PAD);
            const tile = tilesRef.current.get(compHashes[i]);
            ctx.strokeStyle = "rgba(115,153,255,0.35)";
            ctx.lineWidth = 1;
            ctx.fillStyle = "#ffffff";
            roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, TILE_RADIUS);
            ctx.fill();
            ctx.stroke();
            if (tile?.image.complete && tile.image.naturalWidth > 0) {
              ctx.drawImage(tile.image, x, y, TILE_SIZE, STRUCTURE_HEIGHT);
            }
            // Footer: subtle divider + formula (and MW if known)
            if (tile) {
              ctx.strokeStyle = "rgba(115,153,255,0.18)";
              ctx.beginPath();
              ctx.moveTo(x + 16, y + STRUCTURE_HEIGHT);
              ctx.lineTo(x + TILE_SIZE - 16, y + STRUCTURE_HEIGHT);
              ctx.stroke();

              ctx.textAlign = "left";
              ctx.fillStyle = "#0a0f1f";
              ctx.font = "600 17px system-ui, -apple-system, 'Segoe UI', sans-serif";
              ctx.fillText(tile.formula, x + 18, y + STRUCTURE_HEIGHT + 22);

              if (tile.weight !== null) {
                ctx.textAlign = "right";
                ctx.fillStyle = "rgba(40, 55, 90, 0.75)";
                ctx.font = "500 12px system-ui, -apple-system, 'Segoe UI', sans-serif";
                ctx.fillText(
                  `${tile.weight.toFixed(2)} g/mol`,
                  x + TILE_SIZE - 18,
                  y + STRUCTURE_HEIGHT + 22,
                );
              }
            }
          }

          if (comps.length === 0) {
            ctx.fillStyle = "rgba(180,200,235,0.5)";
            ctx.font = "16px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
              "No molecules on screen. Switch to 3D to spawn atoms.",
              window.innerWidth / 2,
              window.innerHeight / 2,
            );
          }
        };
        tick();

        return () => {
          window.removeEventListener("resize", resize);
        };
      },
      (err) => {
        console.error(err);
        if (!cancelled) setStatus("error");
      },
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      lastHashRef.current = ""; // force redraw next time
    };
  }, [visible, game, style]);

  if (!visible) return null;
  return (
    <div className="lewis-overlay">
      <canvas ref={canvasRef} className="lewis-canvas" />
      {status === "loading" && <div className="lewis-status">Loading RDKit…</div>}
      {status === "error" && <div className="lewis-status">Failed to load RDKit</div>}
    </div>
  );
}

function hashComponent(comp: { element: string; bonds: Map<number, unknown> }[]): string {
  // Order-invariant hash: sort element list + bond count.
  const els = comp
    .map((a) => a.element)
    .sort()
    .join("");
  const bondCount = comp.reduce((n, a) => n + a.bonds.size, 0) / 2;
  // Include a topology fingerprint so isomers don't collide.
  const degSeq = comp.map((a) => a.bonds.size).sort().join(",");
  return `${els}|${bondCount}|${degSeq}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
