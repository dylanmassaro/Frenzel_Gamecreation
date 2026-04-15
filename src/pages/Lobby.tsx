import { useNavigate } from "react-router-dom";
import { COMPETITORS } from "../game/competitors";
import { useGame } from "../game/store";

export default function Lobby() {
  const startGame = useGame((s) => s.startGame);
  const hasSave = useGame(
    (s) => s.phase !== "lobby" && s.currentRound > 0 && s.phase !== "post_game",
  );
  const resetGame = useGame((s) => s.resetGame);
  const navigate = useNavigate();

  const handleStart = () => {
    startGame();
    navigate("/game");
  };

  const handleResume = () => {
    navigate("/game");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl font-bold text-espresso">
          Bakery Bash
        </h1>
        <p className="mt-2 text-espresso/60">
          A café simulation where your decisions are scored by a regression
          model trained on real café data.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-espresso/5">
        <h2 className="font-display text-2xl font-semibold text-espresso">
          How it works
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-espresso/80">
          <li>
            <span className="font-mono font-semibold text-caramel">1 ▸</span>{" "}
            Set your prices, hire staff, buy ad slots, and pick your store
            design.
          </li>
          <li>
            <span className="font-mono font-semibold text-caramel">2 ▸</span>{" "}
            Submit your round. Four AI cafés submit theirs too.
          </li>
          <li>
            <span className="font-mono font-semibold text-caramel">3 ▸</span>{" "}
            A regression model scores everyone. Leaderboard updates.
          </li>
          <li>
            <span className="font-mono font-semibold text-caramel">4 ▸</span>{" "}
            Repeat for 3 rounds. At the end, the model reveals the actual
            coefficients driving the game.
          </li>
        </ol>

        <h3 className="mt-8 font-display text-lg font-semibold text-espresso">
          Your rivals
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COMPETITORS.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg bg-cream px-3 py-2"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.colorClass}`}
              />
              <div className="min-w-0">
                <div className="truncate font-medium text-espresso">
                  {c.name}
                </div>
                <div className="truncate text-xs text-espresso/60">
                  {c.persona}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          {hasSave ? (
            <>
              <button
                onClick={handleResume}
                className="flex-1 rounded-xl bg-espresso px-6 py-3 font-semibold text-cream shadow-sm transition hover:bg-espresso/90"
              >
                Resume game
              </button>
              <button
                onClick={() => {
                  resetGame();
                  handleStart();
                }}
                className="rounded-xl bg-espresso/10 px-6 py-3 text-sm font-medium text-espresso hover:bg-espresso/20"
              >
                Start over
              </button>
            </>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 rounded-xl bg-espresso px-6 py-3 font-semibold text-cream shadow-sm transition hover:bg-espresso/90"
            >
              Start game
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-espresso/40">
        Phase 1 of 5 · classroom-edition build for Prof. Frenzel's MGSC 220/310
      </p>
    </div>
  );
}
