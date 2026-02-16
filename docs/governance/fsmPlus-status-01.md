# FSMPlus Status Summary (from Flat FSM baseline)

This note summarises the functional state of FSMPlus versus the flat baseline:
- Flat baseline: `projects/xstate-fsm-espruino/src/xstate-fsm.js`
- Current engine: `projects/xstate-fsmPlus/src/xstate_fsmPlus.js`

## What is implemented now

- Hierarchical states with dot-path identity.
- Initial leaf resolution for compound states.
- Parent-fallback transition lookup (leaf to root).
- Guard arrays with first-passing-candidate selection.
- Preprocessed state lookup with parent links and resolved initial leaves.
- LCCA-based transition pathing for compound transitions.
- Entry/exit/action ordering for targeted transitions: exit actions -> transition actions -> entry actions.
- Targetless transitions execute transition actions only (no exit/entry traversal).
- Self-transition handling with re-entry behavior via LCCA parent adjustment.
- Assign precedence: assign actions are applied before non-assign transition actions.
- `matches()` supports exact leaf match and ancestor-prefix match (`state.matches("a.b")` true for `a.b.c`).
- Runtime option/config support: `createMachine(config, options)`, `machine.withConfig(overrideOptions, contextOverride)`, `machine.withContext(contextOverride)`.
- Action/guard resolution by name from options maps.
- Interpreter executes actions at runtime (not just returns action descriptors).

## Recent fixes and validation

- Fixed missing action execution path in interpreter by adding runtime action runner in `interpret()`.
- Fixed LCCA membership bug for state names like `"on"` by changing membership check to own-property test.
- Result of LCCA fix: entry actions now execute correctly for `off -> on` transitions where state id is `"on"`.
- Hardware validation on ESP32-C3 now confirms all three action implementation patterns toggle LED correctly: inline function actions in machine config, named actions via `withConfig`, named actions via `createMachine(..., options)`.

## High-level engine structure (current)

- Helpers: event normalization, map merges, action resolution, matcher logic.
- Transition selection: guard handling and ancestor fallback resolution.
- Preprocessing: flattened lookup, parent links, resolved initial leaves.
- Hierarchical traversal: ancestor chains, LCCA discovery, exit/entry action collection.
- Machine transition: assign-first context update, target resolution, ordered action set assembly.
- Interpreter: lifecycle (`start/send/stop/subscribe`) and runtime action execution.

## What is still open / deferred

- Export ergonomic `assign()` helper from `xstate_fsmPlus` (currently scenarios use local helper pattern).
- Add debug flag to gate verbose logging.
- Relative targets and `#id` targets (likely preprocessing map extension).
- String target shorthand support (for example `on: { EVT: "next" }`).
- Eventless transitions (`always`) support and ordering behavior.
- Delayed transitions (`after`) support and timer semantics/ordering behavior.
- Wildcard transitions support (`*`) as per-state fallback.
- Dotted/descriptor event matching (for example `sensor.temp.high` descriptors).
- Partial/wildcard descriptor matching (for example `sensor.*`, `sensor.temp.*`).
- Final state semantics and done events.
- Review/align `state.changed` behavior against XState v4 edge cases.
- Consider `onTransition` convenience API (currently `subscribe` provides equivalent observer path).
- Parameterized guard helper API is not implemented; closures over `(context, event)` are supported.

## ADR alignment gaps (must close)

- ADR-0003 preprocessing validation is incomplete:
  - missing fail-fast validation for invalid `initial` references
  - missing fail-fast validation for unknown transition targets
  - duplicate-id validation not explicitly enforced
- ADR-0001 exclusion of parallel states is not explicitly validated/rejected at preprocess time.
- ADR traceability gap:
  - runtime action execution and `withConfig`/`withContext` are implemented and tested,
    but not yet captured by a dedicated ADR update.

## ADR gap closure actions (next thread)

1. Implement fail-fast preprocessing validation required by ADR-0003.
2. Add explicit parallel-state rejection during preprocessing per ADR-0001.
3. Add or update ADR(s) to record v15.2 runtime/API decisions (`withConfig`/`withContext`, runtime action execution).
4. Add targeted tests for validation paths (invalid `initial`, unknown target, parallel config rejection).
5. v15.3 normative baseline is in `docs/governance/v15.3-decision-requests.md`.
6. Performance strategy baseline is in `docs/decisions/ADR-0008-espruino-performance-strategy.md` (Proposed).

## Summary

FSMPlus has moved beyond baseline MVHE and now includes the core hierarchical transition semantics, ordered action behavior, runtime action execution, and option-driven action/guard resolution. The current gap is mainly API/compatibility enhancements and optional matching semantics, rather than core hierarchical behavior.
