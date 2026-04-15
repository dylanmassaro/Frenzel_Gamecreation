"""Fit a multiple linear regression on the synthetic dataset, export model.json.

The exported JSON is loaded at runtime by the game for revenue scoring. It contains:
  - feature_names: ordered list of input features (includes one-hot store designs)
  - coefficients: betas aligned with feature_names
  - intercept: scalar
  - r2: model fit score on the training data
  - notes: provenance metadata

Output: public/model.json
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

ROOT = Path(__file__).resolve().parents[1]
CSV_IN = ROOT / "data" / "synthetic_cafes.csv"
OUT = ROOT / "public" / "model.json"
OUT.parent.mkdir(exist_ok=True, parents=True)

NUMERIC_FEATURES = [
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
]
CATEGORICAL = "store_design"
CATEGORICAL_BASELINE = "classic"
CATEGORICAL_LEVELS = ["modern", "cozy", "industrial"]  # excludes baseline


def main() -> None:
    df = pd.read_csv(CSV_IN)

    # One-hot store_design with classic as baseline
    X = df[NUMERIC_FEATURES].copy()
    for level in CATEGORICAL_LEVELS:
        X[f"store_design_{level}"] = (df[CATEGORICAL] == level).astype(int)

    feature_names = list(X.columns)
    y = df["revenue"].values

    model = LinearRegression()
    model.fit(X.values, y)
    y_pred = model.predict(X.values)
    r2 = float(r2_score(y, y_pred))

    payload = {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "synthetic (scripts/generate_dataset.py)",
        "n_rows": int(len(df)),
        "feature_names": feature_names,
        "coefficients": [float(c) for c in model.coef_],
        "intercept": float(model.intercept_),
        "r2": r2,
        "categorical": {
            "field": CATEGORICAL,
            "baseline": CATEGORICAL_BASELINE,
            "levels": CATEGORICAL_LEVELS,
        },
        "notes": "Placeholder model on synthetic data. Replace with coefficients from Prof. Frenzel's real dataset for classroom play.",
    }

    OUT.write_text(json.dumps(payload, indent=2))
    print(f"Wrote model.json (R² = {r2:.3f}) to {OUT}")
    print("Top coefficients by magnitude:")
    pairs = sorted(zip(feature_names, model.coef_), key=lambda p: -abs(p[1]))
    for name, coef in pairs[:8]:
        print(f"  {name:30s}  {coef:+10.2f}")


if __name__ == "__main__":
    main()
