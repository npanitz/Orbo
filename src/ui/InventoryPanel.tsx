import { useEffect, useRef } from "react";
import { RECIPE_ORDER, RECIPES } from "../chem/molecules";
import { recipeFormula } from "../chem/builder";
import { previewRegistry } from "../render/previewRegistry";
import { MoleculePreview } from "./MoleculePreview";

interface Props {
  open: boolean;
  onPick: (key: string) => void;
  onClose: () => void;
}

export function InventoryPanel({ open, onPick, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    previewRegistry.attach(canvasRef.current);
    return () => previewRegistry.detach();
  }, [open]);

  if (!open) return null;

  return (
    <div className="inventory-overlay">
      <canvas ref={canvasRef} className="inventory-canvas" />

      <header className="inventory-header">
        <div>
          <h1>Molecule Library</h1>
          <p className="subtitle">Click a card to spawn  ·  press I or Esc to close</p>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      <div className="inventory-grid">
        {RECIPE_ORDER.map((key) => (
          <MoleculeCard
            key={key}
            recipeKey={key}
            name={RECIPES[key].name}
            formula={recipeFormula(key)}
            onClick={() => {
              onPick(key);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  recipeKey: string;
  name: string;
  formula: string;
  onClick: () => void;
}

function MoleculeCard({ recipeKey, name, formula, onClick }: CardProps) {
  return (
    <button className="molecule-card" onClick={onClick}>
      <MoleculePreview recipeKey={recipeKey} />
      <div className="card-label">
        <div className="card-formula">{formula}</div>
        <div className="card-name">{name}</div>
      </div>
    </button>
  );
}
