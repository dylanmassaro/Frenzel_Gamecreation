import { useGame, cumulativeRevenue } from "../game/store";
import { COMPETITORS } from "../game/competitors";
import { menuStats } from "../game/products";
import type { CafeRoundResult } from "../game/types";

const COMPETITOR_BY_ID = Object.fromEntries(COMPETITORS.map((c) => [c.id, c]));

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function Leaderboard({
  showInsights = false,
}: {
  showInsights?: boolean;
}) {
  const history = useGame((s) => s.history);
  const latest = history[history.length - 1];
  if (!latest) return null;

  return (
    <div className="space-y-3">
      {latest.results.map((r, i) => (
        <ResultRow key={r.id} result={r} rank={i + 1} showInsights={showInsights} />
      ))}

      {showInsights && (
        <div className="mt-4 rounded-xl bg-sage/10 p-4 text-sm text-sage">
          <strong className="font-semibold">Your ranking:</strong>{" "}
          {latest.playerRank} of {latest.results.length}. Cumulative revenue
          across the game:{" "}
          <span className="font-mono">
            {formatCurrency(cumulativeRevenue(history))}
          </span>
          .
        </div>
      )}
    </div>
  );
}

function ResultRow({
  result,
  rank,
  showInsights,
}: {
  result: CafeRoundResult;
  rank: number;
  showInsights: boolean;
}) {
  const competitor = !result.isPlayer ? COMPETITOR_BY_ID[result.id] : undefined;
  const colorClass = result.isPlayer ? "bg-golden" : competitor?.colorClass ?? "bg-espresso/30";
  const m = menuStats(result.decisions.menu);

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ring-1 transition ${
        result.isPlayer
          ? "border-golden ring-golden/40"
          : "border-espresso/5 ring-espresso/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-espresso/5 font-mono text-sm font-semibold text-espresso">
          {rank}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorClass}`} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-espresso">
              {result.name}
              {result.isPlayer && (
                <span className="ml-2 rounded-full bg-golden/30 px-2 py-0.5 text-xs font-normal text-espresso">
                  you
                </span>
              )}
            </div>
            {competitor && (
              <div className="truncate text-xs text-espresso/60">
                {competitor.persona}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold text-espresso">
            {formatCurrency(result.revenue)}
          </div>
        </div>
      </div>

      {showInsights && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-espresso/5 pt-3 text-xs text-espresso/60 sm:grid-cols-4">
          <Stat label="Menu" value={`${m.menu_item_count} items`} />
          <Stat label="Avg price" value={`$${m.avg_price.toFixed(2)}`} />
          <Stat label="Staff" value={`${result.decisions.baker_count + result.decisions.cashier_count + result.decisions.manager_count}`} />
          <Stat label="Ads" value={`${result.decisions.ad_slots_won}`} />
          <Stat label="Top chef" value={`T${result.decisions.baker_tier_max}`} />
          <Stat label="Oven" value={`T${result.decisions.oven_tier}`} />
          <Stat label="Espresso" value={`T${result.decisions.espresso_tier}`} />
          <Stat
            label="Design"
            value={result.decisions.store_design}
            capitalize
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <span className="font-mono uppercase tracking-wide text-espresso/40">
        {label}
      </span>{" "}
      <span className={`text-espresso/80 ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}
