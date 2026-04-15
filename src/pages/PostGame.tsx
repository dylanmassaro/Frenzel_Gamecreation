import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, cumulativeRevenue } from "../game/store";
import { loadModel, type ModelPayload } from "../lib/model";
import Leaderboard from "../components/Leaderboard";
import RevenueChart from "../components/RevenueChart";

function formatCurrency(n: number, opts: Intl.NumberFormatOptions = {}) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...opts,
  });
}

export default function PostGame() {
  const navigate = useNavigate();
  const history = useGame((s) => s.history);
  const totalRounds = useGame((s) => s.totalRounds);
  const resetGame = useGame((s) => s.resetGame);
  const cumulative = cumulativeRevenue(history);
  const [model, setModel] = useState<ModelPayload | null>(null);

  useEffect(() => {
    loadModel().then(setModel).catch(() => {});
  }, []);

  useEffect(() => {
    if (history.length === 0) navigate("/", { replace: true });
  }, [history.length, navigate]);

  if (history.length === 0) return null;

  // Final cumulative ranking across all rounds
  const cumulativeByCafe: Record<
    string,
    { id: string; name: string; total: number; isPlayer: boolean }
  > = {};
  history.forEach((h) =>
    h.results.forEach((r) => {
      if (!cumulativeByCafe[r.id]) {
        cumulativeByCafe[r.id] = {
          id: r.id,
          name: r.name,
          total: 0,
          isPlayer: r.isPlayer,
        };
      }
      cumulativeByCafe[r.id].total += r.revenue;
    }),
  );
  const finalRanking = Object.values(cumulativeByCafe).sort(
    (a, b) => b.total - a.total,
  );
  const playerFinalRank = finalRanking.findIndex((c) => c.isPlayer) + 1;

  const handleReset = () => {
    resetGame();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-espresso/50">
          Game complete · {history.length} rounds
        </div>
        <h1 className="mt-1 font-display text-5xl font-bold text-espresso">
          Final debrief
        </h1>
        <p className="mt-3 text-espresso/60">
          Cumulative revenue:{" "}
          <span className="font-mono font-semibold text-espresso">
            {formatCurrency(cumulative)}
          </span>{" "}
          · Final rank:{" "}
          <span className="font-semibold text-espresso">
            #{playerFinalRank}
          </span>{" "}
          of {finalRanking.length}
        </p>
      </header>

      {/* Final cumulative ranking */}
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-espresso/5">
        <h2 className="font-display text-xl font-semibold text-espresso">
          Final cumulative ranking
        </h2>
        <p className="text-xs text-espresso/60">
          Total revenue across all {history.length} rounds.
        </p>
        <ol className="mt-4 space-y-2">
          {finalRanking.map((c, i) => (
            <li
              key={c.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${
                c.isPlayer
                  ? "bg-golden/20 font-semibold text-espresso"
                  : "bg-espresso/5 text-espresso"
              }`}
            >
              <span className="font-mono text-sm">#{i + 1}</span>
              <span className="flex-1">
                {c.name}
                {c.isPlayer && (
                  <span className="ml-2 rounded-full bg-golden/30 px-2 py-0.5 text-xs font-normal">
                    you
                  </span>
                )}
              </span>
              <span className="font-mono">{formatCurrency(c.total)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Revenue chart */}
      <section className="mt-6">
        <RevenueChart history={history} totalRounds={totalRounds} />
      </section>

      {/* Last round leaderboard with decisions revealed */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-xl font-semibold text-espresso">
          Round {history[history.length - 1].round} — decisions revealed
        </h2>
        <Leaderboard showInsights />
      </section>

      {/* THE BIG REVEAL: actual model coefficients */}
      {model && <CoefficientReveal model={model} />}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleReset}
          className="rounded-xl bg-espresso px-8 py-3 font-semibold text-cream shadow-sm hover:bg-espresso/90"
        >
          Play again →
        </button>
      </div>
    </div>
  );
}

function CoefficientReveal({ model }: { model: ModelPayload }) {
  // Separate continuous vs categorical
  const rows = model.feature_names.map((name, i) => ({
    name,
    coef: model.coefficients[i],
  }));
  const maxMag = Math.max(...rows.map((r) => Math.abs(r.coef)));
  const sorted = [...rows].sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef));

  return (
    <section className="mt-6 rounded-2xl bg-espresso p-6 text-cream shadow-sm">
      <div className="mb-1 font-mono text-xs uppercase tracking-widest text-cream/60">
        The reveal
      </div>
      <h2 className="font-display text-2xl font-semibold">
        This is the model that was scoring you
      </h2>
      <p className="mt-2 text-sm text-cream/80">
        Every round's revenue came from a multiple linear regression fit on{" "}
        {model.n_rows} café-weeks (R² = {model.r2.toFixed(3)}). These are the
        actual coefficients — the bigger the bar, the more that feature
        mattered.
      </p>

      <ul className="mt-6 space-y-2">
        {sorted.map((r) => (
          <li
            key={r.name}
            className="grid grid-cols-[140px_1fr_80px] items-center gap-3 font-mono text-xs sm:grid-cols-[200px_1fr_100px]"
          >
            <span className="truncate text-cream/70">{r.name}</span>
            <div className="relative h-3 rounded-full bg-cream/10">
              <div
                className="absolute top-0 h-full rounded-full"
                style={{
                  width: `${(Math.abs(r.coef) / maxMag) * 100}%`,
                  background: r.coef >= 0 ? "#E6B655" : "#A24A5F",
                  left: r.coef >= 0 ? 0 : undefined,
                  right: r.coef < 0 ? 0 : undefined,
                }}
              />
            </div>
            <span
              className={`text-right ${
                r.coef >= 0 ? "text-golden" : "text-berry"
              }`}
            >
              {r.coef >= 0 ? "+" : ""}
              {r.coef.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-cream/10 p-4 text-sm text-cream/85">
        <strong className="font-semibold text-cream">Intercept:</strong>{" "}
        ${model.intercept.toFixed(0)} (baseline revenue before any decisions) ·{" "}
        <strong className="font-semibold text-cream">R²:</strong>{" "}
        {model.r2.toFixed(3)} (fraction of revenue variance the model explains)
      </div>
    </section>
  );
}
