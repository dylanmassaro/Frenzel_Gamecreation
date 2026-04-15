// Simple SVG line chart showing per-round revenue trajectories for player + AI rivals.
// No chart library dependency — keeps the bundle small.

import type { RoundHistory } from "../game/types";
import { COMPETITORS } from "../game/competitors";

interface Props {
  history: RoundHistory[];
  totalRounds: number;
  /** Optional height override */
  height?: number;
}

const COMPETITOR_COLORS: Record<string, string> = {
  player: "#C28A4A", // caramel
  budget_betty: "#8AA380", // sage
  posh_pierre: "#A24A5F", // berry
  ad_queen_ava: "#E6B655", // golden
  menu_madness_max: "#3E2C23", // espresso
};

const NAME_BY_ID: Record<string, string> = {
  player: "You",
  ...Object.fromEntries(COMPETITORS.map((c) => [c.id, c.name])),
};

export default function RevenueChart({ history, totalRounds, height = 240 }: Props) {
  if (history.length === 0) return null;

  // Collect all unique café IDs across history
  const allIds = new Set<string>();
  history.forEach((h) => h.results.forEach((r) => allIds.add(r.id)));
  const ids = Array.from(allIds);

  // Build series: for each ID, [revenue per round]
  const series = ids.map((id) => ({
    id,
    color: COMPETITOR_COLORS[id] ?? "#999",
    name: NAME_BY_ID[id] ?? id,
    values: history.map(
      (h) => h.results.find((r) => r.id === id)?.revenue ?? 0,
    ),
    isPlayer: id === "player",
  }));

  const maxRevenue = Math.max(
    ...series.flatMap((s) => s.values),
    1,
  );
  const width = 560;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xStep = totalRounds > 1 ? innerW / (totalRounds - 1) : 0;

  const xFor = (roundIdx: number) => padding.left + roundIdx * xStep;
  const yFor = (value: number) =>
    padding.top + innerH - (value / maxRevenue) * innerH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxRevenue);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
      <h3 className="mb-3 font-display text-lg font-semibold text-espresso">
        Revenue by round
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ maxWidth: width }}
        >
          {/* Y-axis gridlines + labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="#3E2C23"
                strokeOpacity={0.08}
                strokeDasharray={i === 0 ? undefined : "2 3"}
              />
              <text
                x={padding.left - 8}
                y={yFor(v) + 4}
                textAnchor="end"
                fontSize={10}
                fill="#3E2C23"
                fillOpacity={0.5}
                fontFamily="JetBrains Mono, monospace"
              >
                ${Math.round(v).toLocaleString()}
              </text>
            </g>
          ))}

          {/* X-axis round labels */}
          {Array.from({ length: totalRounds }, (_, i) => (
            <text
              key={i}
              x={xFor(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#3E2C23"
              fillOpacity={0.6}
              fontFamily="DM Sans, sans-serif"
            >
              R{i + 1}
            </text>
          ))}

          {/* Draw each line */}
          {series.map((s) => {
            const d = s.values
              .map(
                (v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`,
              )
              .join(" ");
            return (
              <g key={s.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.isPlayer ? 3 : 2}
                  strokeOpacity={s.isPlayer ? 1 : 0.55}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(v)}
                    r={s.isPlayer ? 4 : 3}
                    fill={s.color}
                    fillOpacity={s.isPlayer ? 1 : 0.7}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-5 rounded-full"
              style={{ background: s.color }}
            />
            <span
              className={
                s.isPlayer
                  ? "font-semibold text-espresso"
                  : "text-espresso/70"
              }
            >
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
