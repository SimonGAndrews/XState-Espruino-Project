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
- Wildcard and descriptor-based event matching (for example `*`, `sensor.*`, partial descriptors).
- Final state semantics and done events.
- Review/align `state.changed` behavior against XState v4 edge cases.
- Parameterized guard helper API is not implemented; closures over `(context, event)` are supported.

## Summary

FSMPlus has moved beyond baseline MVHE and now includes the core hierarchical transition semantics, ordered action behavior, runtime action execution, and option-driven action/guard resolution. The current gap is mainly API/compatibility enhancements and optional matching semantics, rather than core hierarchical behavior.
