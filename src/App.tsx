import { useEffect, useMemo, useState } from "react";
import {
  loadModel,
  predictRevenue,
  type CafeDecisions,
  type ModelPayload,
  type StoreDesign,
} from "./lib/model";
import { firebaseReady } from "./firebase";

const DEFAULT_DECISIONS: CafeDecisions = {
  avg_price: 6.5,
  menu_item_count: 8,
  baker_count: 2,
  cashier_count: 2,
  manager_count: 1,
  baker_tier_max: 2,
  avg_emp_pay: 22,
  ad_slots_won: 2,
  oven_tier: 2,
  register_tier: 2,
  fridge_tier: 2,
  espresso_tier: 2,
  competitor_count: 15,
  store_design: "cozy",
};

export default function App() {
  const [model, setModel] = useState<ModelPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<CafeDecisions>(DEFAULT_DECISIONS);

  useEffect(() => {
    loadModel()
      .then(setModel)
      .catch((e) => setError(String(e)));
  }, []);

  const revenue = useMemo(
    () => (model ? predictRevenue(model, decisions) : null),
    [model, decisions],
  );

  const topCoefficients = useMemo(() => {
    if (!model) return [];
    return model.feature_names
      .map((name, i) => ({ name, coef: model.coefficients[i] }))
      .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
      .slice(0, 6);
  }, [model]);

  return (
    <div className="min-h-full bg-cream text-espresso">
      <header className="border-b border-espresso/10 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Bakery Bash</h1>
            <p className="text-sm text-espresso/60">
              Phase 0 — model foundation is live
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div className={firebaseReady ? "text-sage" : "text-espresso/40"}>
              Firebase: {firebaseReady ? "connected" : "not configured"}
            </div>
            <div className={model ? "text-sage" : "text-espresso/40"}>
              Model: {model ? `R² ${model.r2.toFixed(3)}` : "loading…"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-2">
        {error && (
          <div className="col-span-full rounded-lg bg-berry/10 p-4 text-berry">
            Error loading model: {error}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-espresso/5">
          <h2 className="font-display text-xl font-semibold">Your café</h2>
          <p className="mb-4 text-sm text-espresso/60">
            Sandbox — move the sliders to see how the regression model scores
            your decisions. Revenue updates live.
          </p>

          <div className="space-y-3 text-sm">
            <Slider
              label="Average price ($)"
              value={decisions.avg_price}
              min={3.5}
              max={12}
              step={0.25}
              onChange={(v) => setDecisions({ ...decisions, avg_price: v })}
            />
            <Slider
              label="Menu items"
              value={decisions.menu_item_count}
              min={3}
              max={12}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, menu_item_count: v })
              }
            />
            <Slider
              label="Bakers"
              value={decisions.baker_count}
              min={0}
              max={4}
              step={1}
              onChange={(v) => setDecisions({ ...decisions, baker_count: v })}
            />
            <Slider
              label="Cashiers"
              value={decisions.cashier_count}
              min={0}
              max={4}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, cashier_count: v })
              }
            />
            <Slider
              label="Managers"
              value={decisions.manager_count}
              min={0}
              max={2}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, manager_count: v })
              }
            />
            <Slider
              label="Top chef tier"
              value={decisions.baker_tier_max}
              min={1}
              max={3}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, baker_tier_max: v })
              }
            />
            <Slider
              label="Average employee pay ($/hr)"
              value={decisions.avg_emp_pay}
              min={15}
              max={35}
              step={0.5}
              onChange={(v) => setDecisions({ ...decisions, avg_emp_pay: v })}
            />
            <Slider
              label="Ad slots won"
              value={decisions.ad_slots_won}
              min={0}
              max={6}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, ad_slots_won: v })
              }
            />
            <Slider
              label="Espresso machine tier"
              value={decisions.espresso_tier}
              min={1}
              max={3}
              step={1}
              onChange={(v) =>
                setDecisions({ ...decisions, espresso_tier: v })
              }
            />

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-espresso/60">
                Store design
              </label>
              <div className="flex gap-2">
                {(
                  ["modern", "cozy", "industrial", "classic"] as StoreDesign[]
                ).map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setDecisions({ ...decisions, store_design: d })
                    }
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs capitalize transition ${
                      decisions.store_design === d
                        ? "bg-espresso text-cream"
                        : "bg-espresso/5 text-espresso hover:bg-espresso/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl bg-espresso p-6 text-cream shadow-sm">
            <div className="text-xs uppercase tracking-wide text-cream/60">
              Predicted weekly revenue
            </div>
            <div className="mt-2 font-display text-5xl font-bold">
              {revenue !== null
                ? revenue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })
                : "…"}
            </div>
            <div className="mt-2 text-xs text-cream/60">
              Scored by {model?.feature_names.length ?? 0} features from the
              exported regression model
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-espresso/5">
            <h3 className="font-display text-lg font-semibold">
              Top coefficients
            </h3>
            <p className="mb-3 text-sm text-espresso/60">
              The biggest levers in the current model. The post-game debrief
              will reveal these.
            </p>
            <ul className="space-y-1.5 font-mono text-sm">
              {topCoefficients.map(({ name, coef }) => (
                <li
                  key={name}
                  className="flex justify-between border-b border-espresso/5 pb-1"
                >
                  <span className="text-espresso/80">{name}</span>
                  <span
                    className={coef >= 0 ? "text-sage" : "text-berry"}
                  >
                    {coef >= 0 ? "+" : ""}
                    {coef.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-espresso/40">
        Synthetic dataset (N=500). Phase 0 of 5 — see ROADMAP.md for the full
        build plan.
      </footer>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wide text-espresso/60">
          {label}
        </label>
        <span className="font-mono text-xs">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-caramel"
      />
    </div>
  );
}
