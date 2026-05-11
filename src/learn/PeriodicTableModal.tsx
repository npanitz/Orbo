import { useEffect, useMemo, useState } from "react";
import { PeriodicTableGrid, Legend } from "./PeriodicTable";
import { ELEMENTS_DATA } from "../data/periodicTable";
import {
  TRENDS,
  TRENDS_BY_ID,
  trendColor,
  trendRange,
  type TrendId,
} from "./lessons/PeriodicTrends/trends";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Starting trend selection. The modal itself owns a toggle so the student
   * can swap views without dismissing. Pass `null` (or omit) to start in the
   * plain category view. */
  initialTrend?: TrendId | null;
  /** When false, hide the trend toggle (used e.g. on the standalone Periodic
   * Table reference page in the future). Defaults to true. */
  showTrendToggle?: boolean;
}

type View = "category" | TrendId;

/**
 * Reusable "consult the table" overlay for use inside lessons.
 * Passive: clicks on cells do nothing — it's a reference, not a chooser.
 */
export function PeriodicTableModal({
  open,
  onClose,
  initialTrend,
  showTrendToggle = true,
}: Props) {
  const [view, setView] = useState<View>(initialTrend ?? "category");

  // When the modal opens, reset to its initial view so re-opening picks up
  // the caller's intent rather than the last toggle the user clicked.
  useEffect(() => {
    if (open) setView(initialTrend ?? "category");
  }, [open, initialTrend]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const t = view !== "category" ? TRENDS_BY_ID[view] : null;
  const range = useMemo(
    () => (t ? trendRange(t, ELEMENTS_DATA) : { min: 0, max: 1 }),
    [t],
  );

  if (!open) return null;
  return (
    <div className="pt-modal-overlay" onClick={onClose}>
      <div
        className={"pt-modal" + (t ? " pt-heatmap" : "")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pt-modal-header">
          <div>
            <h2>Periodic Table{t ? ` · ${t.label}` : ""}</h2>
            <p>For reference while you answer. ESC or click outside to close.</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {showTrendToggle && (
          <div className="pt-modal-toggle">
            <button
              className={"trend-toggle-button" + (view === "category" ? " active" : "")}
              onClick={() => setView("category")}
            >
              Categories
            </button>
            {TRENDS.map((tr) => (
              <button
                key={tr.id}
                className={"trend-toggle-button" + (view === tr.id ? " active" : "")}
                onClick={() => setView(tr.id)}
              >
                {tr.label}
              </button>
            ))}
          </div>
        )}

        <PeriodicTableGrid
          passive
          colorOverride={
            t ? (el) => trendColor(t.get(el), range.min, range.max) : undefined
          }
          titleFor={
            t
              ? (el) => {
                  const v = t.get(el);
                  return `${el.name} · ${t.label}: ${v === null ? "—" : v.toFixed(2)} ${t.unit}`;
                }
              : undefined
          }
        />
        {!t && <Legend />}
        {t && (
          <div className="pt-modal-trend-legend">
            <span>
              {range.min.toFixed(range.min < 10 ? 2 : 0)} {t.unit}
            </span>
            <span className="trend-legend-bar" />
            <span>
              {range.max.toFixed(range.max < 10 ? 2 : 0)} {t.unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
