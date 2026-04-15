// Runtime interface to the exported regression model.
// The model.json file lives in /public so it's fetched at runtime, not bundled.

export type StoreDesign = "modern" | "cozy" | "industrial" | "classic";

export interface ModelPayload {
  version: number;
  generated_at: string;
  source: string;
  n_rows: number;
  feature_names: string[];
  coefficients: number[];
  intercept: number;
  r2: number;
  categorical: {
    field: string;
    baseline: StoreDesign;
    levels: StoreDesign[];
  };
  notes: string;
}

export interface CafeDecisions {
  avg_price: number;
  menu_item_count: number;
  baker_count: number;
  cashier_count: number;
  manager_count: number;
  baker_tier_max: number;
  avg_emp_pay: number;
  ad_slots_won: number;
  oven_tier: number;
  register_tier: number;
  fridge_tier: number;
  espresso_tier: number;
  competitor_count: number;
  store_design: StoreDesign;
}

let cached: ModelPayload | null = null;

export async function loadModel(): Promise<ModelPayload> {
  if (cached) return cached;
  const res = await fetch("/model.json");
  if (!res.ok) throw new Error(`model.json fetch failed: ${res.status}`);
  cached = (await res.json()) as ModelPayload;
  return cached;
}

/** Predict revenue from a single café's decisions using the exported betas. */
export function predictRevenue(
  model: ModelPayload,
  decisions: CafeDecisions,
): number {
  const row: Record<string, number> = {
    avg_price: decisions.avg_price,
    menu_item_count: decisions.menu_item_count,
    baker_count: decisions.baker_count,
    cashier_count: decisions.cashier_count,
    manager_count: decisions.manager_count,
    baker_tier_max: decisions.baker_tier_max,
    avg_emp_pay: decisions.avg_emp_pay,
    ad_slots_won: decisions.ad_slots_won,
    oven_tier: decisions.oven_tier,
    register_tier: decisions.register_tier,
    fridge_tier: decisions.fridge_tier,
    espresso_tier: decisions.espresso_tier,
    competitor_count: decisions.competitor_count,
  };
  // One-hot encode store_design (baseline is implicit 0)
  for (const level of model.categorical.levels) {
    row[`store_design_${level}`] = decisions.store_design === level ? 1 : 0;
  }

  let revenue = model.intercept;
  for (let i = 0; i < model.feature_names.length; i++) {
    const name = model.feature_names[i];
    const value = row[name] ?? 0;
    revenue += model.coefficients[i] * value;
  }
  return Math.max(0, revenue);
}
