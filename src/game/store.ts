// Zustand store for game state. Persists to localStorage so a page refresh
// mid-round doesn't wipe progress. Resets cleanly on "New Game".

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelPayload } from "../lib/model";
import { COMPETITORS, defaultPlayerDecisions } from "./competitors";
import { scoreCafe } from "./scoring";
import type {
  CafeDecisions,
  CafeRoundResult,
  GamePhase,
  GameState,
  RoundHistory,
} from "./types";

const TOTAL_ROUNDS = 3;
const CLOSING_HOURS_MS = 120_000; // 2 minutes per round in Phase 1

interface GameStore extends GameState {
  startGame: () => void;
  updateDecisions: (patch: Partial<CafeDecisions>) => void;
  updateMenuItem: (
    productId: string,
    patch: Partial<{ enabled: boolean; price: number }>,
  ) => void;
  submitRound: (model: ModelPayload) => void;
  advanceToNextRound: () => void;
  goToPostGame: () => void;
  resetGame: () => void;
}

const initialState = (): GameState => ({
  phase: "lobby",
  currentRound: 0,
  totalRounds: TOTAL_ROUNDS,
  phaseEndsAt: null,
  decisions: defaultPlayerDecisions(),
  history: [],
});

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      startGame: () =>
        set({
          phase: "closing_hours",
          currentRound: 1,
          phaseEndsAt: Date.now() + CLOSING_HOURS_MS,
          decisions: defaultPlayerDecisions(),
          history: [],
        }),

      updateDecisions: (patch) =>
        set((s) => ({ decisions: { ...s.decisions, ...patch } })),

      updateMenuItem: (productId, patch) =>
        set((s) => ({
          decisions: {
            ...s.decisions,
            menu: {
              items: {
                ...s.decisions.menu.items,
                [productId]: {
                  ...s.decisions.menu.items[productId],
                  ...patch,
                },
              },
            },
          },
        })),

      submitRound: (model) => {
        const s = get();
        const round = s.currentRound;

        // Score player + all 4 competitors
        const playerResult: CafeRoundResult = {
          id: "player",
          name: "You",
          decisions: s.decisions,
          revenue: scoreCafe(model, s.decisions),
          isPlayer: true,
        };
        const competitorResults: CafeRoundResult[] = COMPETITORS.map((c) => {
          const decisions = c.decide(round);
          return {
            id: c.id,
            name: c.name,
            decisions,
            revenue: scoreCafe(model, decisions),
            isPlayer: false,
          };
        });

        const sorted = [playerResult, ...competitorResults].sort(
          (a, b) => b.revenue - a.revenue,
        );
        const playerRank = sorted.findIndex((r) => r.isPlayer) + 1;

        const history: RoundHistory = {
          round,
          results: sorted,
          playerRevenue: playerResult.revenue,
          playerRank,
        };

        set({
          phase: "round_results",
          phaseEndsAt: null,
          history: [...s.history, history],
        });
      },

      advanceToNextRound: () => {
        const s = get();
        if (s.currentRound >= s.totalRounds) {
          set({ phase: "post_game", phaseEndsAt: null });
          return;
        }
        set({
          phase: "closing_hours",
          currentRound: s.currentRound + 1,
          phaseEndsAt: Date.now() + CLOSING_HOURS_MS,
        });
      },

      goToPostGame: () => set({ phase: "post_game", phaseEndsAt: null }),

      resetGame: () => set(initialState()),
    }),
    {
      name: "bakery-bash-game-v1",
      // Don't rehydrate mid-closing-hours timer state — reset timer if user refreshes.
      partialize: (s) => ({
        phase: s.phase,
        currentRound: s.currentRound,
        totalRounds: s.totalRounds,
        decisions: s.decisions,
        history: s.history,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.phase === "closing_hours") {
          // Restart the phase timer after a refresh rather than leaving it stale.
          state.phaseEndsAt = Date.now() + CLOSING_HOURS_MS;
        }
      },
    },
  ),
);

/** Selector for phase-gated pages to use. */
export function phaseFor(s: GameStore): GamePhase {
  return s.phase;
}

/** Helper: cumulative revenue across rounds played so far. */
export function cumulativeRevenue(history: RoundHistory[]): number {
  return history.reduce((sum, h) => sum + h.playerRevenue, 0);
}
