# Codex Handover Checklist — XState-Espruino-Project (Umbrella Repo)

This checklist is the “carry-forward” note for moving work into a VS Code Codex thread from https://chatgpt.com/share/6985f437-e0a8-800e-928b-e6635725cbf7.

This note captures the current repo state, design decisions, provenance, and the next implementation steps.
Goal: avoid losing subtle context and ensure work continues with clear intent and minimal rework.

---

## 1) Repository State Snapshot (Confirmed)

### Umbrella repository
- Repo: `XState-Espruino-Project`
- Local path: `/home/simon/SGAdev/XState-Espruino-Project`
- Branch: `main` (up to date with `origin/main`)

### Stage 1 baseline (flat FSM)
- Included as a submodule:
  - `projects/xstate-fsm-espruino/`
- Submodule has been tidied (README improvements committed in submodule repo and pointer updated).

### Stage 2 canonical (FSMPlus)
- Folder: `projects/xstate-fsmPlus/`
- Canonical engine source:
  - `projects/xstate-fsmPlus/src/xstate-fsmPlus.js`
- Provenance snapshots:
  - `projects/xstate-fsmPlus/archive/source/fsmPlus_ChatGPT_V15.js`
  - `projects/xstate-fsmPlus/archive/source/fsmPlus_ChatGPT_V16.js`
- Baseline tag:
  - `fsmplus-baseline-v15`
- Known state: `src/xstate-fsmPlus.js` matches V15 (diff = none at time of import/provenance capture).
- `projects/xstate-fsmPlus/docs/` exists locally but currently untracked/empty placeholder (`evolution.md` was explicitly not committed).

### Legacy public FSMPlus repo (reference only)
- Repo: `xstate-fsmPlus-Espruino` (public)
- README updated to clearly state “experimental/legacy reference”
- Do NOT treat as canonical implementation; umbrella repo is the source of truth going forward.

---

## 2) Design Decisions Captured as ADRs (Do Not Re-litigate)

Location: `docs/decisions/`

- ADR-0001: Exclude parallel states from initial implementations
- ADR-0002: Dot-path state identifiers and simple `matches()` semantics
  - Canonical state identity = string dot-path
  - `matches(target)` initially means strict equality with `state.value`
- ADR-0003: Preprocess machine configuration into lookup tables
  - Flatten hierarchy into `stateLookup`, resolve `initialResolved`, validate early
- ADR-0004: Entry/exit action ordering for compound state transitions
  - Exit actions → transition actions → entry actions
  - LCCA-based exit/entry sets (simplified by no-parallel constraint)
  - Targetless transitions run actions only (no exit/entry)
- ADR-0006: Parent fallback transition resolution
  - If leaf has no event handler, walk ancestors (nearest wins)
  - Guards: evaluate candidates in order; if all fail, continue to parent

Important: Action ordering semantics are explicitly defined and must be preserved:

- Exit actions run before transition actions (ADR-0004)
- All `assign` actions run before other transition actions (ADR-0005)
- Entry actions run after transition actions (ADR-0004)


---

## 3) Subtle Implementation Constraints (Espruino Compatibility)

FSMPlus (JS engine) must remain Espruino-friendly:

- Avoid optional chaining (`?.`)
- Avoid destructuring assignments
- Avoid default function parameters
- Avoid `const` for objects/arrays (prefer `var`)
- Avoid ES6 `Set` (use object map)
- Avoid reliance on `function.name`
- Be cautious with arrow functions (`=>`) — V16 introduced arrows in `matches`; V15 uses classic functions and is safer

Current decision:
- Keep canonical engine aligned to V15 baseline until testing confirms safe improvements.
- V16 snapshot is archived for comparison; do not promote blindly.

---

## 4) Key Semantic Subtleties to Preserve

### Compound states: “active set” semantics (no parallel)
Even without parallel states, transitions must behave as:
- active leaf + ancestors (implicit active set)
- transition computes exit set and entry set via LCCA
- executes in correct order (ADR-0004)

### Parent fallback traversal must be multi-level correct
- V16 refactor attempt appears to risk incorrect ancestor climbing due to recomputing parent from original value.
- Ensure traversal updates the “current” ancestor being checked.

### `matches()` semantics
- Currently defined as strict equality with resolved leaf `state.value`.
- Consider future extension (prefix/ancestor matching) only via a new ADR if needed.
- Do not silently change `matches()` semantics without tests.

---

## 5) Provenance / Baseline Discipline (Do Not Skip)

- `fsmplus-baseline-v15` tag marks the baseline moment.
- `archive/source/*` snapshots are immutable provenance.
- `src/xstate-fsmPlus.js` may be refactored later, but provenance snapshots must remain unchanged.
- Any promotion of V16 changes should be:
  - driven by tests
  - done via small commits
  - documented in issues/ADRs if semantic impact exists

---

## 6) Immediate Next Steps in Codex (Recommended Order)

### Step A — Create umbrella GitHub issues (tracking work, not design)
Create issues in `XState-Espruino-Project` for:
1. FSMPlus MVHE test harness + trace format
2. Compound state initial resolution test coverage
3. Parent fallback transition tests (multi-level)
4. Guarded transition selection order tests
5. Targetless transition behaviour tests
6. Action ordering tests (exit → transition → entry) with LCCA
7. Assign action precedence (ADR-0005 to be written + tests)
8. Espruino compatibility scan / lint checklist for FSMPlus code

Suggested labels:
- `fsmplus`
- `tests`
- `behaviour`
- `compatibility`
- `performance`
- `docs`

### Step B — Add test scaffolding
Prefer scenario-driven tests (as already described in docs/notes/testing-strategy.md):
- define machine
- define event sequence
- define expected trace output
- run in Node locally (and later replicate in Espruino REPL)

Directory suggestion:
- `projects/xstate-fsmPlus/tests/` (unit-ish)
- `examples/greenhouse/` (scenario-ish) OR `projects/xstate-fsmPlus/examples/`

### Step C — First concrete scenario: greenhouse
Pick one small machine as a “spine” test:
- heating control OR watering control OR menu navigation
- must include a compound state to exercise hierarchy

Target outcomes:
- deterministic logs for state.value + actions
- run quickly on Espruino without heavy dependencies

### Step D — Decide canonical baseline: V15 vs selective V16 improvements
After tests exist:
- evaluate V16 improvements (especially `_stateLookup` optimisation) via cherry-picks
- avoid arrow functions unless confirmed safe on target Espruino builds

---

## 7) Quick Reference Commands

### Confirm baseline tag
  git tag --list | grep fsmplus-baseline-v15

### Compare snapshots (V15 vs V16)
  diff -u projects/xstate-fsmPlus/archive/source/fsmPlus_ChatGPT_V15.js \
        projects/xstate-fsmPlus/archive/source/fsmPlus_ChatGPT_V16.js | head -n 120

### Confirm canonical matches V15
  diff -u projects/xstate-fsmPlus/src/xstate-fsmPlus.js \
        projects/xstate-fsmPlus/archive/source/fsmPlus_ChatGPT_V15.js | head -n 60

---

## 8) “Do Not Forget” Items

- Maintain the three-stage story:
  - Stage 1: `projects/xstate-fsm-espruino` (flat, stable)
  - Stage 2: `projects/xstate-fsmPlus` (hierarchical JS engine, MVHE)
  - Stage 3: `projects/xfsm` (native C engine, later parity)
- Do not accidentally conflate legacy public FSMPlus repo with canonical umbrella implementation.
- Preserve Espruino language limitations: avoid modern JS features as listed.
- Keep commits small and traceable; use ADRs for semantic changes.
- Avoid implementing large new features before a minimal greenhouse scenario test exists.

---

## 9) Suggested First Codex Prompt (copy/paste)

“Open the umbrella repo at `/home/simon/SGAdev/XState-Espruino-Project`.
We have FSMPlus baseline tagged `fsmplus-baseline-v15` with V15/V16 snapshots archived.
Please help scaffold a minimal scenario-driven test harness for `projects/xstate-fsmPlus/src/xstate-fsmPlus.js`,
starting with one greenhouse control machine that exercises compound state transitions and parent fallback.
Tests must be deterministic and Espruino-friendly (no modern JS features).”

