// Canonical game types for Phase 1.
// Decisions → features fed to the regression model. Anything the player (or an AI)
// chooses each round lives in CafeDecisions.

import type { StoreDesign } from "../lib/model";

export type ProductCategory = "sweet" | "savory" | "drink";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Suggested default sell price (USD). Players can override. */
  basePrice: number;
  emoji: string;
}

/** A single café's menu configuration for a round. */
export interface MenuState {
  /** Map of productId → { enabled, price }. Every product in the catalog lives here. */
  items: Record<string, { enabled: boolean; price: number }>;
}

/** Everything a café controls in a single round, flattened into the model's feature space. */
export interface CafeDecisions {
  menu: MenuState;
  baker_count: number;
  cashier_count: number;
  manager_count: number;
  baker_tier_max: number; // 1..3
  avg_emp_pay: number;
  ad_slots_won: number; // 0..6
  oven_tier: number;
  register_tier: number;
  fridge_tier: number;
  espresso_tier: number;
  store_design: StoreDesign;
}

/** A named AI rival with a deterministic strategy. */
export interface Competitor {
  id: string;
  name: string;
  persona: string;
  colorClass: string; // Tailwind bg-* class for their chip
  /** Pure function: given round number, return their decisions. */
  decide: (round: number) => CafeDecisions;
}

/** Result of scoring one café in one round. */
export interface CafeRoundResult {
  id: string; // "player" or competitor id
  name: string;
  decisions: CafeDecisions;
  revenue: number;
  isPlayer: boolean;
}

export interface RoundHistory {
  round: number;
  results: CafeRoundResult[]; // sorted descending by revenue
  playerRevenue: number;
  playerRank: number; // 1-indexed
}

export type GamePhase =
  | "lobby"
  | "closing_hours" // player is making decisions
  | "open_for_business" // brief animation while results resolve
  | "round_results" // show this round's leaderboard
  | "post_game"; // final summary + coefficient reveal

export interface GameState {
  phase: GamePhase;
  currentRound: number; // 0 before game starts; 1..totalRounds while playing
  totalRounds: number;
  phaseEndsAt: number | null; // epoch ms; null = no timer
  decisions: CafeDecisions;
  history: RoundHistory[];
}
