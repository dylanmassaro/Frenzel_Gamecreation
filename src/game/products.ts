// 12-product catalog per the game design deck: 4 sweet, 4 savory, 4 drinks.
// Every café must stock ≥1 from each category (enforced at submit time).

import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  // Sweet pastries
  { id: "croissant", name: "Butter Croissant", category: "sweet", basePrice: 4.5, emoji: "🥐" },
  { id: "pain_au_chocolat", name: "Pain au Chocolat", category: "sweet", basePrice: 5.0, emoji: "🍫" },
  { id: "cinnamon_roll", name: "Cinnamon Roll", category: "sweet", basePrice: 5.5, emoji: "🌀" },
  { id: "scone", name: "Blueberry Scone", category: "sweet", basePrice: 4.0, emoji: "🫐" },

  // Savory
  { id: "breakfast_sandwich", name: "Breakfast Sandwich", category: "savory", basePrice: 7.5, emoji: "🥪" },
  { id: "quiche", name: "Quiche Lorraine", category: "savory", basePrice: 6.5, emoji: "🥧" },
  { id: "bagel", name: "Everything Bagel", category: "savory", basePrice: 4.5, emoji: "🥯" },
  { id: "focaccia", name: "Rosemary Focaccia", category: "savory", basePrice: 5.0, emoji: "🌿" },

  // Drinks
  { id: "drip_coffee", name: "Drip Coffee", category: "drink", basePrice: 3.5, emoji: "☕" },
  { id: "latte", name: "Oat Milk Latte", category: "drink", basePrice: 5.5, emoji: "🥛" },
  { id: "cold_brew", name: "Cold Brew", category: "drink", basePrice: 5.0, emoji: "🧊" },
  { id: "hot_chocolate", name: "Hot Chocolate", category: "drink", basePrice: 4.5, emoji: "🍫" },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

export const CATEGORY_LABELS: Record<"sweet" | "savory" | "drink", string> = {
  sweet: "Sweet pastries",
  savory: "Savory",
  drink: "Drinks",
};

/** Build a default menu state: all 12 items enabled at their base price. */
export function defaultMenuState() {
  return {
    items: Object.fromEntries(
      PRODUCTS.map((p) => [p.id, { enabled: true, price: p.basePrice }]),
    ),
  };
}

/** Derive aggregate features from the menu state. */
export function menuStats(menu: ReturnType<typeof defaultMenuState>) {
  const enabled = PRODUCTS.filter((p) => menu.items[p.id]?.enabled);
  const menu_item_count = enabled.length;
  const avg_price =
    enabled.length === 0
      ? 0
      : enabled.reduce((sum, p) => sum + menu.items[p.id].price, 0) /
        enabled.length;
  const hasAll =
    enabled.some((p) => p.category === "sweet") &&
    enabled.some((p) => p.category === "savory") &&
    enabled.some((p) => p.category === "drink");
  return { menu_item_count, avg_price, hasAllCategories: hasAll };
}
