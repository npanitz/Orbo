import { useEffect } from "react";
import { PeriodicTableGrid, Legend } from "./PeriodicTable";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Reusable "consult the table" overlay for use inside lessons.
 * Passive: clicks on cells do nothing — it's a reference, not a chooser.
 */
export function PeriodicTableModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="pt-modal-overlay" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <header className="pt-modal-header">
          <div>
            <h2>Periodic Table</h2>
            <p>For reference while you answer. ESC or click outside to close.</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <PeriodicTableGrid passive />
        <Legend />
      </div>
    </div>
  );
}
