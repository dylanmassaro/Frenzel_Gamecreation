import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadModel, type ModelPayload } from "../lib/model";
import { useGame, cumulativeRevenue } from "../game/store";
import { menuStats } from "../game/products";
import RoundTimer from "../components/RoundTimer";
import DecisionPanels from "../components/DecisionPanels";
import Leaderboard from "../components/Leaderboard";

export default function Game() {
  const navigate = useNavigate();
  const [model, setModel] = useState<ModelPayload | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  const phase = useGame((s) => s.phase);
  const currentRound = useGame((s) => s.currentRound);
  const totalRounds = useGame((s) => s.totalRounds);
  const phaseEndsAt = useGame((s) => s.phaseEndsAt);
  const decisions = useGame((s) => s.decisions);
  const history = useGame((s) => s.history);
  const submitRound = useGame((s) => s.submitRound);
  const advanceToNextRound = useGame((s) => s.advanceToNextRound);

  useEffect(() => {
    loadModel()
      .then(setModel)
      .catch((e) => setModelError(String(e)));
  }, []);

  // If user hits /game with no active game, bounce to lobby.
  useEffect(() => {
    if (phase === "lobby") navigate("/", { replace: true });
    if (phase === "post_game") navigate("/summary", { replace: true });
  }, [phase, navigate]);

  const stats = menuStats(decisions.menu);
  const canSubmit = model !== null && stats.hasAllCategories;
  const cumulative = cumulativeRevenue(history);
  const latestResult = history[history.length - 1];

  const handleSubmit = () => {
    if (!model || !stats.hasAllCategories) return;
    submitRound(model);
  };

  const handleTimerExpire = () => {
    if (phase === "closing_hours" && model) submitRound(model);
  };

  if (modelError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg bg-berry/10 p-4 text-berry">
          Failed to load regression model: {modelError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-espresso/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-bold text-espresso">
              Bakery Bash
            </h1>
            <div className="text-xs text-espresso/60">
              Round{" "}
              <span className="font-mono font-semibold text-espresso">
                {currentRound}
              </span>{" "}
              of {totalRounds} · Cumulative:{" "}
              <span className="font-mono font-semibold text-espresso">
                {cumulative.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {phase === "closing_hours" && (
              <RoundTimer
                endsAt={phaseEndsAt}
                onExpire={handleTimerExpire}
              />
            )}
            <PhaseBadge phase={phase} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {phase === "closing_hours" && (
          <ClosingHoursView
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            hasAllCategories={stats.hasAllCategories}
          />
        )}

        {phase === "round_results" && latestResult && (
          <RoundResultsView
            round={latestResult.round}
            onContinue={advanceToNextRound}
            isFinalRound={currentRound >= totalRounds}
          />
        )}
      </main>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const label = {
    closing_hours: "Closing Hours",
    open_for_business: "Open for Business",
    round_results: "Results",
    lobby: "Lobby",
    post_game: "Post-game",
  }[phase] ?? phase;
  return (
    <span className="rounded-full bg-caramel/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-caramel">
      {label}
    </span>
  );
}

function ClosingHoursView({
  onSubmit,
  canSubmit,
  hasAllCategories,
}: {
  onSubmit: () => void;
  canSubmit: boolean;
  hasAllCategories: boolean;
}) {
  return (
    <div className="space-y-6">
      <DecisionPanels />

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl bg-espresso p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="text-cream/80 text-sm">
              {hasAllCategories
                ? "Ready when you are. You can also wait out the timer."
                : "⚠ Menu needs at least one sweet, savory, and drink."}
            </div>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="rounded-xl bg-golden px-6 py-2.5 font-semibold text-espresso transition hover:bg-golden/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit round →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundResultsView({
  round,
  onContinue,
  isFinalRound,
}: {
  round: number;
  onContinue: () => void;
  isFinalRound: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-espresso/50">
          Round {round} complete
        </div>
        <h2 className="mt-1 font-display text-3xl font-bold text-espresso">
          Leaderboard
        </h2>
      </div>

      <Leaderboard />

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="rounded-xl bg-espresso px-8 py-3 font-semibold text-cream shadow-sm transition hover:bg-espresso/90"
        >
          {isFinalRound ? "See final debrief →" : "Next round →"}
        </button>
      </div>
    </div>
  );
}
