// Four named AI rivals, each testing a distinct strategic axis.
// Deterministic for Phase 1 — the same persona picks the same decisions every round.
// Phase 3 will replace these with adaptive/aggressive heuristics.

import { PRODUCTS } from "./products";
import type { CafeDecisions, Competitor, MenuState } from "./types";

/** Build a menu state for a competitor: only the given product IDs enabled, at the given price markup. */
function competitorMenu(enabledIds: string[], pricingFn: (basePrice: number) => number): MenuState {
  return {
    items: Object.fromEntries(
      PRODUCTS.map((p) => [
        p.id,
        {
          enabled: enabledIds.includes(p.id),
          price: Number(pricingFn(p.basePrice).toFixed(2)),
        },
      ]),
    ),
  };
}

export const COMPETITORS: Competitor[] = [
  {
    id: "budget_betty",
    name: "Budget Betty",
    persona: "Rock-bottom prices, bare-bones staff",
    colorClass: "bg-sage",
    decide: () => ({
      menu: competitorMenu(
        ["croissant", "bagel", "drip_coffee", "scone"],
        (p) => Math.max(1.5, p * 0.7),
      ),
      baker_count: 1,
      cashier_count: 1,
      manager_count: 0,
      baker_tier_max: 1,
      avg_emp_pay: 16,
      ad_slots_won: 0,
      oven_tier: 1,
      register_tier: 1,
      fridge_tier: 1,
      espresso_tier: 1,
      store_design: "industrial",
    }),
  },
  {
    id: "posh_pierre",
    name: "Posh Pierre",
    persona: "Premium prices, top chef, upscale design",
    colorClass: "bg-berry",
    decide: () => ({
      menu: competitorMenu(
        ["pain_au_chocolat", "quiche", "focaccia", "latte", "cold_brew", "scone", "breakfast_sandwich"],
        (p) => p * 1.35,
      ),
      baker_count: 2,
      cashier_count: 2,
      manager_count: 1,
      baker_tier_max: 3,
      avg_emp_pay: 32,
      ad_slots_won: 1,
      oven_tier: 3,
      register_tier: 2,
      fridge_tier: 3,
      espresso_tier: 3,
      store_design: "modern",
    }),
  },
  {
    id: "ad_queen_ava",
    name: "Ad Queen Ava",
    persona: "Max marketing, mid-tier everything else",
    colorClass: "bg-caramel",
    decide: () => ({
      menu: competitorMenu(
        ["croissant", "cinnamon_roll", "breakfast_sandwich", "bagel", "latte", "hot_chocolate"],
        (p) => p * 1.05,
      ),
      baker_count: 2,
      cashier_count: 2,
      manager_count: 1,
      baker_tier_max: 2,
      avg_emp_pay: 22,
      ad_slots_won: 5,
      oven_tier: 2,
      register_tier: 2,
      fridge_tier: 2,
      espresso_tier: 2,
      store_design: "cozy",
    }),
  },
  {
    id: "menu_madness_max",
    name: "Menu Madness Max",
    persona: "All 12 items, balanced middle",
    colorClass: "bg-golden",
    decide: () => ({
      menu: competitorMenu(
        PRODUCTS.map((p) => p.id),
        (p) => p,
      ),
      baker_count: 3,
      cashier_count: 2,
      manager_count: 1,
      baker_tier_max: 2,
      avg_emp_pay: 24,
      ad_slots_won: 2,
      oven_tier: 2,
      register_tier: 2,
      fridge_tier: 2,
      espresso_tier: 2,
      store_design: "classic",
    }),
  },
];

export function defaultPlayerDecisions(): CafeDecisions {
  return {
    menu: {
      items: Object.fromEntries(
        PRODUCTS.map((p) => [p.id, { enabled: true, price: p.basePrice }]),
      ),
    },
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
    store_design: "cozy",
  };
}
