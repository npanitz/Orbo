import { useEffect, useRef, useState } from "react";
import { Game, type StatusInfo } from "../game/game";
import { createScene, resizeToWindow } from "../render/sceneSetup";
import { Toolbar } from "../ui/Toolbar";
import { InventoryPanel } from "../ui/InventoryPanel";
import { StatusBar } from "../ui/StatusBar";
import { LewisView, type LewisStyle } from "../ui/LewisView";
import { ModeToggle } from "../ui/ModeToggle";
import { StyleToggle } from "../ui/StyleToggle";

interface Props {
  onExit: () => void;
}

/**
 * The original open-ended play area. All previous functionality lives here —
 * 3D physics sandbox, 2D Lewis view, inventory, slingshot input.
 */
export function Sandbox({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [status, setStatus] = useState<StatusInfo>({ text: "—", openSlots: 0 });
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [mode, setMode] = useState<"3d" | "2d">(
    () => (localStorage.getItem("orbo-mode") as "3d" | "2d") || "3d",
  );
  const [lewisStyle, setLewisStyle] = useState<LewisStyle>(
    () => (localStorage.getItem("orbo-lewis-style") as LewisStyle) || "skeletal",
  );

  useEffect(() => { localStorage.setItem("orbo-mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("orbo-lewis-style", lewisStyle); }, [lewisStyle]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const bundle = createScene(canvasRef.current);
    resizeToWindow(bundle);
    const onResize = () => resizeToWindow(bundle);
    window.addEventListener("resize", onResize);

    const game = new Game(bundle.scene, bundle.camera, bundle.renderer);
    game.setStatusListener(setStatus);
    game.start();
    gameRef.current = game;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "i" || e.key === "I") setInventoryOpen((v) => !v);
      else if (e.key === "Escape") setInventoryOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      game.stop();
      game.uninstallInput();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ visibility: mode === "3d" ? "visible" : "hidden" }} />
      <LewisView game={gameRef.current} visible={mode === "2d"} style={lewisStyle} />
      <div className="ui-layer">
        <button className="back-button" onClick={onExit} aria-label="Back to home">
          ← Home
        </button>
        <StatusBar text={status.text} openSlots={status.openSlots} />
        <ModeToggle mode={mode} onChange={setMode} />
        {mode === "2d" && <StyleToggle style={lewisStyle} onChange={setLewisStyle} />}
        {mode === "3d" && (
          <>
            <div className="instructions">
              L-drag atom to slingshot · R-click breaks bonds · M-drag orbits · Shift+M-drag
              or arrow keys pan · Scroll to zoom · I inventory · C clears
            </div>
            <Toolbar onPick={(el) => gameRef.current?.spawnAtom(el)} />
            <InventoryPanel
              open={inventoryOpen}
              onPick={(key) => gameRef.current?.spawnMolecule(key)}
              onClose={() => setInventoryOpen(false)}
            />
          </>
        )}
      </div>
    </>
  );
}
