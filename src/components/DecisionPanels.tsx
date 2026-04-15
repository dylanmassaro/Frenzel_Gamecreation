import { useGame } from "../game/store";
import { menuStats, PRODUCTS, CATEGORY_LABELS } from "../game/products";
import type { ProductCategory, CafeDecisions } from "../game/types";
import type { StoreDesign } from "../lib/model";

export default function DecisionPanels() {
  const decisions = useGame((s) => s.decisions);
  const updateDecisions = useGame((s) => s.updateDecisions);
  const updateMenuItem = useGame((s) => s.updateMenuItem);

  const stats = menuStats(decisions.menu);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-espresso">
              Menu
            </h2>
            <p className="text-xs text-espresso/60">
              Toggle items on or off and set their prices. Must include at least
              one sweet, savory, and drink.
            </p>
          </div>
          <div className="text-right text-xs font-mono text-espresso/60">
            <div>
              {stats.menu_item_count}{" "}
              {stats.menu_item_count === 1 ? "item" : "items"}
            </div>
            <div>
              avg{" "}
              <span className="text-espresso">
                ${stats.avg_price.toFixed(2)}
              </span>
            </div>
          </div>
        </header>

        {(["sweet", "savory", "drink"] as ProductCategory[]).map((cat) => (
          <div key={cat} className="mb-4">
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-espresso/50">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRODUCTS.filter((p) => p.category === cat).map((p) => {
                const item = decisions.menu.items[p.id];
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                      item.enabled
                        ? "border-caramel/40 bg-caramel/5"
                        : "border-espresso/10 bg-espresso/5 opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) =>
                        updateMenuItem(p.id, { enabled: e.target.checked })
                      }
                      className="h-4 w-4 shrink-0 accent-caramel"
                    />
                    <span className="text-lg">{p.emoji}</span>
                    <span className="flex-1 truncate text-sm text-espresso">
                      {p.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-xs text-espresso/40">$</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        step={0.25}
                        value={item.price}
                        disabled={!item.enabled}
                        onChange={(e) =>
                          updateMenuItem(p.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-16 rounded border border-espresso/10 bg-white px-1.5 py-0.5 text-right font-mono text-xs text-espresso disabled:bg-espresso/5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="space-y-4">
        <StaffPanel
          decisions={decisions}
          onChange={(patch: Partial<CafeDecisions>) => updateDecisions(patch)}
        />
        <OperationsPanel
          decisions={decisions}
          onChange={(patch: Partial<CafeDecisions>) => updateDecisions(patch)}
        />
      </div>
    </div>
  );
}

function StaffPanel({
  decisions,
  onChange,
}: {
  decisions: CafeDecisions;
  onChange: (patch: Partial<CafeDecisions>) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
      <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
        Staff
      </h2>
      <div className="space-y-3 text-sm">
        <Stepper
          label="Bakers"
          value={decisions.baker_count}
          min={0}
          max={4}
          onChange={(v) => onChange({ baker_count: v })}
        />
        <Stepper
          label="Cashiers"
          value={decisions.cashier_count}
          min={0}
          max={4}
          onChange={(v) => onChange({ cashier_count: v })}
        />
        <Stepper
          label="Managers"
          value={decisions.manager_count}
          min={0}
          max={2}
          onChange={(v) => onChange({ manager_count: v })}
        />
        <TierPicker
          label="Top chef tier"
          value={decisions.baker_tier_max}
          onChange={(v) => onChange({ baker_tier_max: v })}
        />
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label className="text-xs uppercase tracking-wide text-espresso/60">
              Avg hourly pay
            </label>
            <span className="font-mono text-xs text-espresso">
              ${decisions.avg_emp_pay.toFixed(2)}/hr
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={35}
            step={0.5}
            value={decisions.avg_emp_pay}
            onChange={(e) =>
              onChange({ avg_emp_pay: Number(e.target.value) })
            }
            className="w-full accent-caramel"
          />
        </div>
      </div>
    </section>
  );
}

function OperationsPanel({
  decisions,
  onChange,
}: {
  decisions: CafeDecisions;
  onChange: (patch: Partial<CafeDecisions>) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5">
      <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
        Operations
      </h2>
      <div className="space-y-3 text-sm">
        <Stepper
          label="Ad slots"
          value={decisions.ad_slots_won}
          min={0}
          max={6}
          onChange={(v) => onChange({ ad_slots_won: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <TierPicker
            label="Oven"
            value={decisions.oven_tier}
            onChange={(v) => onChange({ oven_tier: v })}
          />
          <TierPicker
            label="Register"
            value={decisions.register_tier}
            onChange={(v) => onChange({ register_tier: v })}
          />
          <TierPicker
            label="Fridge"
            value={decisions.fridge_tier}
            onChange={(v) => onChange({ fridge_tier: v })}
          />
          <TierPicker
            label="Espresso"
            value={decisions.espresso_tier}
            onChange={(v) => onChange({ espresso_tier: v })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-espresso/60">
            Store design
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              ["modern", "cozy", "industrial", "classic"] as StoreDesign[]
            ).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ store_design: d })}
                className={`rounded-md px-2 py-1.5 text-xs capitalize transition ${
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
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wide text-espresso/60">
          {label}
        </label>
        <span className="font-mono text-xs text-espresso">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-7 w-7 rounded-md bg-espresso/5 text-espresso hover:bg-espresso/10 disabled:opacity-30"
        >
          −
        </button>
        <div className="flex-1 text-center font-mono text-sm">{value}</div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-7 w-7 rounded-md bg-espresso/5 text-espresso hover:bg-espresso/10 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function TierPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-espresso/60">
        {label}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`flex-1 rounded-md py-1 text-xs transition ${
              value === t
                ? "bg-caramel text-cream"
                : "bg-espresso/5 text-espresso hover:bg-espresso/10"
            }`}
          >
            T{t}
          </button>
        ))}
      </div>
    </div>
  );
}
