// Bridges a CafeDecisions (menu + staff + ads + equipment + design) to the
// flat feature space the regression model expects, then predicts revenue.

import { predictRevenue, type ModelPayload } from "../lib/model";
import { menuStats } from "./products";
import type { CafeDecisions } from "./types";

const COMPETITOR_COUNT = 4; // 4 AI rivals in Phase 1

export function decisionsToFeatures(d: CafeDecisions) {
  const { menu_item_count, avg_price } = menuStats(d.menu);
  return {
    avg_price,
    menu_item_count,
    baker_count: d.baker_count,
    cashier_count: d.cashier_count,
    manager_count: d.manager_count,
    baker_tier_max: d.baker_tier_max,
    avg_emp_pay: d.avg_emp_pay,
    ad_slots_won: d.ad_slots_won,
    oven_tier: d.oven_tier,
    register_tier: d.register_tier,
    fridge_tier: d.fridge_tier,
    espresso_tier: d.espresso_tier,
    competitor_count: COMPETITOR_COUNT,
    store_design: d.store_design,
  };
}

export function scoreCafe(model: ModelPayload, decisions: CafeDecisions): number {
  return predictRevenue(model, decisionsToFeatures(decisions));
}
