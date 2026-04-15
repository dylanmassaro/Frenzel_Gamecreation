"""Synthetic café dataset generator for Bakery Bash.

Generates N simulated café-weeks with plausible feature distributions. Revenue is
computed from a known ground-truth linear model plus noise — so when fit_model.py
fits a regression, it should (roughly) recover these coefficients. When Prof. Frenzel
delivers a real dataset, this file is replaced; nothing downstream changes.

Output: data/synthetic_cafes.csv
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

random.seed(42)

N_ROWS = 500
OUT = Path(__file__).resolve().parents[1] / "data" / "synthetic_cafes.csv"
OUT.parent.mkdir(exist_ok=True, parents=True)

# ---- Ground-truth coefficients (what the model SHOULD recover) ----------
# Revenue (USD/week) = intercept + sum(beta_i * feature_i) + noise
GROUND_TRUTH = {
    "intercept": 1200.0,
    "avg_price": 85.0,              # higher avg price → more revenue per customer, to a point
    "menu_item_count": 140.0,       # broader menu attracts more customers
    "baker_count": 320.0,           # bakers produce supply
    "cashier_count": 180.0,         # throughput
    "manager_count": 260.0,         # quality + retention
    "baker_tier_max": 410.0,        # star chef halo
    "avg_emp_pay": 1.8,             # paying people well helps (diminishing)
    "ad_slots_won": 380.0,          # ads drive traffic
    "oven_tier": 240.0,
    "register_tier": 120.0,
    "fridge_tier": 90.0,
    "espresso_tier": 280.0,
    "competitor_count": -95.0,      # more rivals in plaza → fewer customers each
    "store_design_modern": 150.0,   # categorical one-hots
    "store_design_cozy": 220.0,
    "store_design_industrial": 60.0,
    # store_design_classic is the omitted baseline
}

FIELDS = [
    "day",
    "avg_price",
    "menu_item_count",
    "baker_count",
    "cashier_count",
    "manager_count",
    "baker_tier_max",
    "avg_emp_pay",
    "ad_slots_won",
    "oven_tier",
    "register_tier",
    "fridge_tier",
    "espresso_tier",
    "competitor_count",
    "store_design",
    "revenue",
]


def sample_row(day: int) -> dict:
    store_design = random.choice(["modern", "cozy", "industrial", "classic"])
    row = {
        "day": day,
        "avg_price": round(random.uniform(3.5, 12.0), 2),
        "menu_item_count": random.randint(3, 12),
        "baker_count": random.randint(0, 4),
        "cashier_count": random.randint(0, 4),
        "manager_count": random.randint(0, 2),
        "baker_tier_max": random.randint(1, 3),
        "avg_emp_pay": round(random.uniform(15.0, 35.0), 2),
        "ad_slots_won": random.randint(0, 6),
        "oven_tier": random.randint(1, 3),
        "register_tier": random.randint(1, 3),
        "fridge_tier": random.randint(1, 3),
        "espresso_tier": random.randint(1, 3),
        "competitor_count": random.randint(4, 30),
        "store_design": store_design,
    }

    # Compute revenue from ground truth + Gaussian noise
    revenue = GROUND_TRUTH["intercept"]
    for k in [
        "avg_price", "menu_item_count", "baker_count", "cashier_count",
        "manager_count", "baker_tier_max", "avg_emp_pay", "ad_slots_won",
        "oven_tier", "register_tier", "fridge_tier", "espresso_tier",
        "competitor_count",
    ]:
        revenue += GROUND_TRUTH[k] * row[k]
    if store_design != "classic":
        revenue += GROUND_TRUTH[f"store_design_{store_design}"]
    revenue += random.gauss(0, 350)  # noise
    row["revenue"] = round(max(0.0, revenue), 2)
    return row


def main() -> None:
    with OUT.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for i in range(N_ROWS):
            writer.writerow(sample_row(day=i % 20 + 1))
    print(f"Wrote {N_ROWS} rows to {OUT}")


if __name__ == "__main__":
    main()
