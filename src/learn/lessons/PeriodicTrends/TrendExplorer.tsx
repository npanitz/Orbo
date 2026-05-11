import { useMemo, useState } from "react";
import { ELEMENTS_DATA } from "../../../data/periodicTable";
import { PeriodicTableGrid } from "../../PeriodicTable";
import { TRENDS, TRENDS_BY_ID, trendColor, trendRange, type TrendId } from "./trends";

interface Props {
  onComplete: () => void;
}

/**
 * Heat-mapped periodic table + property toggle + narrative panel.
 * Free-exploration phase — no required ordering, student flips between
 * trends and reads the narrative until they're ready to move on.
 */
export function TrendExplorer({ onComplete }: Props) {
  const [trendId, setTrendId] = useState<TrendId>("radius");
  const trend = TRENDS_BY_ID[trendId];

  const range = useMemo(() => trendRange(trend, ELEMENTS_DATA), [trend]);

  return (
    <div className="trend-explorer">
      <div className="trend-toggle">
        {TRENDS.map((t) => (
          <button
            key={t.id}
            className={"trend-toggle-button" + (t.id === trendId ? " active" : "")}
            onClick={() => setTrendId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="trend-table">
        <PeriodicTableGrid
          passive
          colorOverride={(el) => trendColor(trend.get(el), range.min, range.max)}
          titleFor={(el) => {
            const v = trend.get(el);
            return `${el.name} · ${trend.label}: ${v === null ? "—" : v.toFixed(2)} ${trend.unit}`;
          }}
        />
        <TrendLegend trend={trend} min={range.min} max={range.max} />
      </div>

      <div className="trend-narrative">
        <div className="trend-narrative-section">
          <div className="trend-narrative-eyebrow">The pattern</div>
          <p>{trend.pattern}</p>
        </div>
        <div className="trend-narrative-section">
          <div className="trend-narrative-eyebrow">The mechanism</div>
          <p>{trend.mechanism}</p>
        </div>
        <div className="trend-narrative-section">
          <div className="trend-narrative-eyebrow">Extremes</div>
          <p>{trend.extremes}</p>
        </div>
      </div>

      <div className="trend-action">
        <button className="lesson-next" onClick={onComplete}>
          Continue to challenges →
        </button>
      </div>
    </div>
  );
}

function TrendLegend({
  trend,
  min,
  max,
}: {
  trend: { label: string; unit: string };
  min: number;
  max: number;
}) {
  return (
    <div className="trend-legend">
      <span className="trend-legend-min">
        {min.toFixed(min < 10 ? 2 : 0)} {trend.unit}
      </span>
      <span className="trend-legend-bar" />
      <span className="trend-legend-max">
        {max.toFixed(max < 10 ? 2 : 0)} {trend.unit}
      </span>
    </div>
  );
}
