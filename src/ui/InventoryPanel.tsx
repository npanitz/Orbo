import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getAllRecipes, getRecipeOrder, isCustomRecipe } from "../chem/molecules";
import { recipeFormula } from "../chem/builder";
import { smilesToRecipe } from "../chem/smiles";
import { previewRegistry } from "../render/previewRegistry";
import { inventoryStore } from "../storage/inventoryStore";
import { MoleculePreview } from "./MoleculePreview";

interface Props {
  open: boolean;
  onPick: (key: string) => void;
  onClose: () => void;
}

/** Re-render whenever the inventory store changes. */
function useInventoryVersion(): number {
  return useSyncExternalStore(
    (cb) => inventoryStore.subscribe(cb),
    () => inventoryStore.list().length, // cheap version snapshot
    () => 0,
  );
}

export function InventoryPanel({ open, onPick, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useInventoryVersion(); // re-render on add/remove

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    previewRegistry.attach(canvasRef.current);
    return () => previewRegistry.detach();
  }, [open]);

  if (!open) return null;

  const order = getRecipeOrder();
  const recipes = getAllRecipes();

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

      <AddMoleculeBar />

      <div className="inventory-grid">
        {order.map((key) => (
          <MoleculeCard
            key={key}
            recipeKey={key}
            name={recipes[key].name}
            formula={recipeFormula(key)}
            removable={isCustomRecipe(key)}
            onClick={() => {
              onPick(key);
              onClose();
            }}
            onRemove={() => inventoryStore.remove(key)}
          />
        ))}
      </div>
    </div>
  );
}

function AddMoleculeBar() {
  const [smiles, setSmiles] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const smi = smiles.trim();
    if (!smi) {
      setError("SMILES is required.");
      return;
    }
    try {
      // Validate by parsing — same path the renderer will use later.
      smilesToRecipe(smi, name.trim() || smi);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse SMILES.");
      return;
    }
    inventoryStore.add(name, smi);
    setSmiles("");
    setName("");
  };

  return (
    <div className="add-molecule-bar">
      <div className="add-fields">
        <input
          type="text"
          placeholder="SMILES (e.g. CCO)"
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className="add-input add-input-smiles"
        />
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className="add-input add-input-name"
        />
        <button className="add-button" onClick={submit}>
          Add to library
        </button>
      </div>
      {error && <div className="add-error">{error}</div>}
    </div>
  );
}

interface CardProps {
  recipeKey: string;
  name: string;
  formula: string;
  removable: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function MoleculeCard({ recipeKey, name, formula, removable, onClick, onRemove }: CardProps) {
  return (
    <div className="molecule-card-wrapper">
      <button className="molecule-card" onClick={onClick}>
        <MoleculePreview recipeKey={recipeKey} />
        <div className="card-label">
          <div className="card-formula">{formula}</div>
          <div className="card-name">{name}</div>
        </div>
      </button>
      {removable && (
        <button
          className="card-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove from library"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}
