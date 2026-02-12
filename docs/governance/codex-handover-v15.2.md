# Codex Handover — v15.2 (FSMPlus / Espruino)

Purpose: carry forward exact working context into a new Codex thread without losing semantic, tooling, or workflow detail.

## Current Repo State

- Repo: `XState-Espruino-Project`
- Active branch: `v15.2-configs`
- Remote tracking: `origin/v15.2-configs` (in sync)
- `main` and `v15.2-configs` both contain stable v15.2 work, but are not the same HEAD commit.

Current branch pointers at handover time:
- `v15.2-configs`: `bdf48c3`
- `main`: `c7acc32`
- `main` includes merge commit: `5766049` (`Merge branch 'v15.2-configs'`)

Current local untracked files (intentional, not yet promoted):
- `examples/espruino_interactive/deepMachine.js`
- `examples/espruino_interactive/led_d8_toggle.js`

## Branching Approach (Agreed)

- Feature/version work is developed on versioned branches (`v15.x-*`).
- `main` is treated as stable/integration branch.
- Promote to `main` only from stable, tested branch states.

## Espruino Constraints (Do Not Regress)

FSMPlus has been developed with Espruino runtime constraints in mind. Keep these in scope for all changes:

- Avoid optional chaining (`?.`) and default parameters.
- Avoid destructuring for critical paths.
- Be careful with `const`, arrow functions, and modern syntax on target firmware.
- Avoid reliance on `function.name`.
- Keep module names/storage names Espruino-safe (underscore preferred; avoid long names).

Note:
- A full strict-syntax hardening pass is deferred; current source may still include modern constructs that should be treated as compatibility risk items.

## Canonical Documents (Source of Truth)

- Project background/motivation:
  - `docs/governance/background.md`
- Testing strategy/policy:
  - `docs/governance/testing-strategy.md`
- FSMPlus implementation status + TODO backlog:
  - `docs/governance/fsmPlus-status-01.md`
- Espruino command-level operator guide:
  - `tools/README_espruino.md`

Supporting notes:
- `docs/notes/espruino-test-workflow.md`
- `docs/notes/withConfig-design.md`
- `docs/notes/include_xstateV4_forTesting.md`

## FSMPlus Code State (What is Working)

Engine file:
- `projects/xstate-fsmPlus/src/xstate_fsmPlus.js`

Confirmed implemented behavior:
- Hierarchical compound state handling (dot-path leaf identity).
- Initial leaf resolution for compound states.
- Parent fallback transition lookup (leaf -> root).
- Guard arrays with ordered first-pass selection.
- LCCA-based hierarchical traversal for exit/entry calculation.
- Ordered action semantics for targeted transitions:
  - exit actions -> transition actions -> entry actions
- Targetless transitions execute transition actions only.
- Assign precedence before non-assign transition actions.
- `matches()` supports exact and ancestor-prefix matching.
- Runtime option/config resolution:
  - `createMachine(config, options)`
  - `machine.withConfig(overrideOptions, contextOverride)`
  - `machine.withContext(contextOverride)`
- Interpreter runtime action execution (not descriptor-only).

## Critical Fixes from This Thread

1. **Action execution in interpreter**
- `interpret()` now executes actions via `runActions(...)` on `start()` and `send()`.
- This enabled real side effects (for example hardware pin writes).

2. **LCCA bug for state names like `on`**
- Root cause: using plain object lookup as a set caused prototype key collision (`"on"`).
- Symptom: missing entry actions on `off -> on` transitions.
- Fix: own-property membership check in `findLCCA`.
- Result: both `LED action: ON` and `LED action: OFF` execute correctly.

## XState v4 Alignment Context

- Testing strategy uses XState v4 semantics as reference for this phase.
- v5 is considered future compatibility direction, not current truth basis.
- WithConfig/options path was implemented as v4-style compatibility ergonomics.

## Test System Shape (Current)

### Suite Test

- Scenario source-of-truth:
  - `examples/<scenario>/<scenario>.machine.js`
  - `examples/<scenario>/<scenario>.events.js`
  - `examples/<scenario>/<scenario>.expected.js`
- Espruino runner:
  - `projects/xstate-fsmPlus/tests/espruino/run_<scenario>.js`
- Node runner:
  - `projects/xstate-fsmPlus/tests/node/run_<scenario>.js`
- Result storage:
  - `projects/xstate-fsmPlus/tests/results/<runtime>/`

Trace capture convention:
- Copy only lines between `TRACE BEGIN` and `TRACE END`.

### Interactive Test

- Scripts under:
  - `examples/espruino_interactive/`
- Confirmed working action implementation patterns:
  - inline function actions
  - named actions via `withConfig`
  - named actions via `createMachine(..., options)`

## Validated v15.2 Behaviors (Tested)

- Suite traces match expected and remain diffable offline.
- XState-v4 truth comparison flow is in place and used for parity checks.
- Espruino bench validation confirmed:
  - action execution is active in interpreter runtime;
  - LED hardware side-effects execute in all three action-wiring styles;
  - LCCA fix resolves state-name collision cases (for example state id `"on"`).

## Espruino Tooling and Shell Helpers

Operational guide:
- `tools/README_espruino.md`

One-off shell setup defines helpers such as:
- `espFsmPlus` (flash current engine module)
- `espflash` (flash named storage module)
- `espram` (run JS in RAM)
- `espboot` (write/run bootcode)
- `espbootrepl` (bootcode + attached console)
- `espEraseAll` (erase storage + reset)
- `espPort` (change default serial port)

Important subtleties:
- Hyphens are problematic in Espruino module names; use underscore naming.
- Storage name length limits apply; test helper may use short prefixes.
- `espram` executes and exits; it does not keep terminal attached.
- `espbootrepl` is used when continuous console output is needed after upload.
- CLI/REPL operation is asynchronous around uploads; wait for `Upload Complete` before next REPL step.

## Codex + Bench Device Execution Reality

- Codex can run local repo commands and local comparisons.
- Bench-device USB access may be environment-dependent in Codex sessions.
- Stable collaboration pattern used here:
  1. Codex provides exact command sequence.
  2. User runs on bench and pastes trace output.
  3. Codex diffs/analyzes trace locally in repo.

This pattern should be reused in new threads unless direct bench access is confirmed.

## Current Operational Baseline

- Preferred branch for active development: `v15.2-configs`.
- `main` is kept stable and updated only with tested branch content.
- Current untracked working examples (left intentionally outside commits):
  - `examples/espruino_interactive/deepMachine.js`
  - `examples/espruino_interactive/led_d8_toggle.js`

## Resume Checklist For Next Thread

1. Confirm branch is `v15.2-configs` and working tree state with `git status`.
2. Read `docs/governance/fsmPlus-status-01.md` first (canonical backlog).
3. Use `docs/governance/testing-strategy.md` for test intent and workflow semantics.
4. Use `tools/README_espruino.md` for exact bench/CLI commands.
5. For bench runs, use command-driven workflow and paste trace output back for Codex diff/analysis.
6. Keep commits scoped and version-branch-first; merge to `main` only after stable verification.

## Current Direction and Next Priorities

Primary goal:
- keep FSMPlus stable and well-tested before extending semantics.

Backlog source:
- `docs/governance/fsmPlus-status-01.md` (`What is still open / deferred`)

## ADR Alignment Gaps (Open)

The ADR review found open gaps that should be treated as explicit next-thread work:

- ADR-0003 preprocessing validation is incomplete:
  - missing fail-fast validation for invalid `initial` references
  - missing fail-fast validation for unknown transition targets
  - duplicate-id validation not explicitly enforced
- ADR-0001 exclusion of parallel states is not explicitly validated/rejected at preprocess time.
- Recent implemented semantics (`withConfig`/`withContext`, runtime interpreter action execution) should be captured with ADR-level traceability updates.

These gaps are documented in detail at:
- `docs/governance/fsmPlus-status-01.md` (sections: `ADR alignment gaps (must close)` and `ADR gap closure actions (next thread)`)

Likely next technical candidates:
- `assign()` helper export
- debug logging flag
- relative/`#id` targets
- string target shorthand
- eventless (`always`) transitions
- wildcard/descriptor event matching
- final state semantics

## Suggested First Prompt for Next Thread

“Open `XState-Espruino-Project` on branch `v15.2-configs`.
Use `docs/governance/fsmPlus-status-01.md` as the canonical backlog and
`tools/README_espruino.md` for execution commands.
Continue FSMPlus development from current stable v15.2 state.
Preserve branch-first workflow (version branch first, promote stable work to main).”
