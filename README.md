# Bakery Bash

Classroom multiplayer café-simulation game for Chapman University's MGSC 220 / 310 (Prof. Frenzel). Each student runs a café in a shared plaza; a regression model scores their decisions each round; the pedagogical payoff is revealing the actual coefficients at the end of the session.

**Status:** Phase 0 of 5 — model foundation + scaffolding complete. See [ROADMAP.md](ROADMAP.md) for the full build plan.

---

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- Firebase (Firestore, Auth, Cloud Functions, Hosting) — not yet wired up
- Python + scikit-learn for dataset generation + model fitting (offline; results shipped as JSON)

## Quick start

```bash
npm install
npm run gen:data     # regenerate synthetic dataset + model.json
npm run dev          # http://localhost:5173
npm run typecheck
```

## Project layout

```
src/
  App.tsx            # Phase 0 UI: slider sandbox + revenue predictor
  main.tsx           # React entrypoint
  firebase.ts        # Firebase SDK init (reads from .env.local)
  lib/model.ts       # Runtime model loader + inference
public/
  model.json         # Exported regression coefficients (generated)
data/
  synthetic_cafes.csv  # Training data (generated)
scripts/
  generate_dataset.py  # Synthetic data generator
  fit_model.py         # Fits regression, exports model.json
docs/
  bakery-bash-presentation.html   # Original game design deck
```

## Design references

- [ROADMAP.md](ROADMAP.md) — phased build plan
- [docs/bakery-bash-presentation.html](docs/bakery-bash-presentation.html) — full game design proposal
