import { useEffect } from "react";
import {
  type PeriodicElement,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  categoryKey,
} from "../data/periodicTable";

interface Props {
  element: PeriodicElement;
  onClose: () => void;
}

export function ElementDetail({ element, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const key = categoryKey(element.category);
  const accent = CATEGORY_COLORS[key];

  return (
    <div className="element-detail-overlay" onClick={onClose}>
      <div
        className="element-detail"
        onClick={(e) => e.stopPropagation()}
        style={{ ["--accent" as string]: accent }}
      >
        <button className="close-button element-detail-close" onClick={onClose}>
          ×
        </button>

        <div className="ed-header">
          <div className="ed-symbol-block">
            <div className="ed-number">{element.number}</div>
            <div className="ed-symbol">{element.symbol}</div>
            <div className="ed-mass">{element.atomic_mass.toFixed(3)}</div>
          </div>
          <div className="ed-title-block">
            <h2>{element.name}</h2>
            <div className="ed-category">{CATEGORY_LABELS[key]}</div>
            <div className="ed-shells">
              Shells: {element.shells.join(" · ")}
            </div>
          </div>
        </div>

        <p className="ed-summary">{element.summary}</p>

        <div className="ed-grid">
          <Stat label="Period" value={element.period} />
          <Stat label="Group" value={element.group || "—"} />
          <Stat label="Block" value={element.block} />
          <Stat label="Phase (STP)" value={element.phase} />
          <Stat
            label="Electron config"
            value={element.electron_configuration_semantic}
            mono
          />
          <Stat
            label="Electronegativity"
            value={
              element.electronegativity_pauling !== null
                ? `${element.electronegativity_pauling} (Pauling)`
                : "—"
            }
          />
          <Stat
            label="1st ionization"
            value={
              element.ionization_energies[0]
                ? `${element.ionization_energies[0]} kJ/mol`
                : "—"
            }
          />
          <Stat
            label="Electron affinity"
            value={
              element.electron_affinity !== null
                ? `${element.electron_affinity} kJ/mol`
                : "—"
            }
          />
          <Stat
            label="Density"
            value={element.density !== null ? `${element.density} g/cm³` : "—"}
          />
          <Stat
            label="Melting point"
            value={element.melt !== null ? `${element.melt} K` : "—"}
          />
          <Stat
            label="Boiling point"
            value={element.boil !== null ? `${element.boil} K` : "—"}
          />
          <Stat label="Appearance" value={element.appearance ?? "—"} />
          <Stat label="Discovered by" value={element.discovered_by ?? "—"} />
          <Stat label="Named by" value={element.named_by ?? "—"} />
        </div>

        <div className="ed-footer">
          <a href={element.source} target="_blank" rel="noreferrer">
            Read on Wikipedia ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="ed-stat">
      <div className="ed-stat-label">{label}</div>
      <div className={"ed-stat-value" + (mono ? " mono" : "")}>{value}</div>
    </div>
  );
}
