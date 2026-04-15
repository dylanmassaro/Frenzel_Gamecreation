# Bakery Bash — Solo-Build Roadmap

Status: draft, pre-scope-lock.
Stack: **React (Vite) + Firebase** (Firestore, Auth, Cloud Functions, Hosting).
Builder: Dylan (PM/designer, non-technical) + Claude Code as implementation partner.

---

## Guiding principles

1. **Playable before pretty.** Ugly working game > beautiful half-game.
2. **One scope cut per phase.** Each phase ships something demoable end-to-end.
3. **The regression model is the soul of the game.** It gets built first — everything else is chrome on top.
4. **Classroom-only MVP.** No monetization, no account recovery, no polish beyond what the teaching moment needs.
5. **Firebase-native everything.** If a feature needs a custom server, rethink it.

---

## Stack decisions (proposed)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React + Vite + TypeScript | Fast HMR, tiny config, TS catches bugs Claude would otherwise introduce |
| State / routing | Zustand + React Router | Simpler than Redux, no boilerplate |
| Styling | Tailwind CSS | Fast iteration, no naming debates |
| Realtime data | **Firestore listeners** | Lobby, leaderboard, chat, plaza map — all snapshot subscriptions |
| Auth | Firebase Auth (email link or anonymous + display name) | No passwords to manage for students |
| Server logic | **Cloud Functions (TypeScript)** | Auction resolution, round tick, model scoring — trusted server needed |
| Regression model | **Coefficients exported to JSON**, inference in TS on the server | Pedagogical payoff = revealing the betas, so we ship them as data. No Python runtime. |
| Hosting | Firebase Hosting | One command deploy, free tier covers a class |
| Assets / sprites | Static imports in Vite + CSS for pixel-art placeholder | Real art deferred to Phase 4 |

**Why not scikit-learn on the backend?** The model in the deck is a linear/multiple regression. The coefficients *are* the model. We fit it once offline, export `{feature: beta}` as JSON, and do the prediction in JS. This gives us: no Python infra, no cold-start latency, and the reveal-the-coefficients moment becomes literally loading the same file the game uses.

---

## Phased roadmap

### Phase 0 — Decisions & foundation (no code yet)
**Goal:** unblock Phase 1 by locking the 5 open questions at the bottom of this doc, getting the professor's dataset, and setting up the Firebase project.

- [ ] Answer the 5 open questions below
- [ ] Obtain the Chapman/Frenzel café dataset
- [ ] Fit the regression model once (Claude can do this in a notebook), export `model.json` with betas + feature names + R²
- [ ] Create Firebase project, enable Auth, Firestore, Functions, Hosting
- [ ] Initialize repo with Vite + TS + Tailwind + Firebase SDK
- [ ] Deploy a "hello world" landing page to confirm pipeline works

### Phase 1 — Solo slice with fake competitors (3 ROUNDS)
**Goal:** one human player vs. 4 faked AI cafés over 3 rounds, showing the full round loop. Looks like a real game; technically it's single-player under the hood.

- Lobby screen (fake — just "Start Game" button)
- Player dashboard: 12 products (static list, set prices, toggle on menu), simple employee count
- Round-phase state machine with visible timer: Closing Hours → Open for Business → Results
- Submit button → Cloud Function scores the round via `model.json` → returns revenue + customer count
- **Fake AI leaderboard**: 4 scripted competitors with pre-baked strategies — their scores come from the same model, just with varied decisions
- Leaderboard after each round, time-series line chart of your revenue across the 3 rounds
- Clean Tailwind UI — not pretty, but not embarrassing. No pixel art yet.
- **Cut:** real multiplayer, auctions, curveballs, chat, plaza map, pixel art, satisfaction, poaching

**Why this shape:** de-risks the two hardest things (model integration + round-tick state machine) without the complexity of real multiplayer sync. If this works on your laptop, you'll feel the game is real and I'll know the foundation is solid before we add N-player coordination.

**Definition of done:** you open `bakerybash.web.app`, play 3 rounds, beat or lose to 4 AI cafés, see a line chart of your revenue with the actual regression coefficients driving it.

### Phase 2 — Real multiplayer
**Goal:** 3–5 humans in the same lobby across 3+ rounds. Swap the fake AI leaderboard for real peers. Shared customer pool.

- Lobby with join codes, Firebase Auth (anonymous + display name)
- Professor-triggered round advancement (simple "Start next round" button for the host)
- Attractiveness-score customer allocation (write as pure function, tune later)
- Real leaderboard driven by Firestore listener
- Time-series dataset: each round appends a row to the player's Firestore doc, CSV export at end
- AFK detection: if a player doesn't submit, re-use last round's decisions minus rent
- Keep the AI competitors around to fill empty slots (deterministic "passive" strategy)

**Cut:** auctions, employees with tiers/satisfaction, curveballs, chat, adaptive AI, professor dashboard
**Test:** Run a 3-player game with friends. Then 10-player. Measure Firestore costs and latency.

### Phase 3 — Economy depth
**Goal:** the game starts to feel strategic, not just "set prices and wait."

- Triple sealed-bid auction (Chef / Ads / Tech) with 30s windows, Cloud Function resolves ties
- Employee tiers (3 per role) + satisfaction score
- Employee poaching: broadcast event when satisfaction drops below threshold, other cafés can bid
- Equipment tiers (3 per category, 4 categories)
- Store design choice (modern / cozy / industrial / classic) as a categorical feature in the model
- Supplier drop: 1 new product offered per round
- AI competitors (passive tier only — fill empty slots with a deterministic strategy)

**Test:** 10-player game with a TA. Make sure auction fairness is airtight.

### Phase 4 — Polish, curveballs, chrome
**Goal:** ship the full experience described in the deck.

- 6 curveball event types, probability-weighted by player investment
- AI competitors: adaptive + aggressive tiers
- Plaza map (SVG top-down view, customer dots animating between cafés)
- Public Plaza Chat + auto-posted achievements
- 7 achievement types
- Professor dashboard: aggregate stats, coefficient reveal, decision heatmap, engagement metrics
- Stardew-inspired pixel art café interior view (placeholder sprite pack → real art last)
- Dual route-guarded leaderboard (student vs professor views)
- Post-game debrief screen: "Here are the actual regression coefficients — now look at what you did"

### Phase 5 — Classroom-ready
- Load-test with simulated 50 concurrent bots
- Professor onboarding doc (how to start a session, share code, interpret dashboard)
- Export dataset as CSV for students to analyze post-game
- One dry run with Prof. Frenzel before real class use

---

## How we'll work each session

1. You open the repo in Claude Code, point me at the phase/task
2. I propose a small, focused change (one feature or one bug fix)
3. I show you the diff before committing
4. We test in the browser together (Firebase emulators locally + Firebase Hosting for shared demos)
5. Commit with a clear message, move on

I'll keep a running `TODO.md` with the current phase's checklist so you always know where we are.

---

## Risks & unknowns (things that could bite)

- **Dataset shape.** If the prof's dataset has features we can't reproduce in-game, we'll need to either drop them or simplify. I won't know until I see it.
- **Firestore cost at 50 players.** Each round = N players × M listeners × round duration. Probably fine on free tier for a classroom, but worth measuring.
- **Auction fairness.** Sealed-bid with concurrent submits on a public database is non-trivial. Cloud Functions + transactions handle it, but need careful tests.
- **Your time.** You're non-technical; every session has friction cost. Plan for 2–3 hour blocks, not 20-minute drive-bys.

---

## Locked decisions (2026-04-15)

- **Data:** synthetic dataset for Phase 0–3, swap in Frenzel's real dataset for Phase 4–5 classroom rollout.
- **Audience:** real classroom use, MGSC 220 + MGSC 310 (Prof. Frenzel, Chapman). Full scope is the target.
- **Session style:** synchronous real-time per the deck. 30–50 concurrent players. Professor controls round advancement.
- **MVP:** solo player vs. 4 faked AI competitors over 3 rounds, real model scoring, clean-but-not-polished UI. Multiplayer swaps in at Phase 2.

## Open questions still pending

1. **Repo:** reuse `Frenzel_Gamecreation` or create a new repo (e.g. `bakery-bash-game`)? Presentation HTML stays in either way.
2. **Firebase project:** do you have a Google account you want to use for the Firebase console? It'll need to be the same one across every session.
3. **Cadence:** how much time do you have per week for build sessions? This determines how aggressively I batch vs. keep things small.
