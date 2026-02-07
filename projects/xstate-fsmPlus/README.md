# xstate-fsmPlus (Espruino)

This folder contains the **canonical Stage 2** implementation in the umbrella project:
a JavaScript-based hierarchical finite state machine engine for **Espruino**, inspired by:

- `@xstate/fsm` (XState v4 lightweight FSM semantics)
- SCXML compound state behaviour (hierarchical/compound states and ordered entry/exit)
- practical constraints of embedded Espruino runtimes

The goal of FSMPlus is to deliver a **usable hierarchical FSM engine quickly** (days / small number of weeks),
suitable for real embedded applications (initially greenhouse automation), without requiring custom firmware.

## Status

FSMPlus is an active development track in this umbrella repository.

- It is expected to evolve rapidly during early consolidation and testing.
- Scope is intentionally limited to deliver a working subset quickly.
- Parallel state support is explicitly excluded (see ADR-0001).

## Scope: Minimum Viable Hierarchical Engine (MVHE)

FSMPlus targets a practical subset required for compound states, with predictable semantics.

### In Scope (must-have)

- Compound (nested) states
- Initial substate resolution for compound states
- Parent fallback transition lookup (event handled by nearest ancestor with matching transition)
- Multiple candidate transitions with guards (select first passing guard)
- Targetless transitions (actions only; no state change)
- Ordered action execution:
  - exit actions
  - transition actions (with `assign` actions applied first)
  - entry actions
- State object shape compatible with `@xstate/fsm` style:
  - `value`
  - `context`
  - `changed`
  - `matches(state)`

### Out of Scope (explicitly not now)

- Parallel (orthogonal) states
- History states
- Invoked services / actors
- Delayed transitions and timers (`after`)
- Final states and done events
- SCXML full algorithm completeness beyond what is required for compound states

## Relationship to Other Subprojects

### Stage 1 Baseline (flat FSM)

A stable flat FSM engine (Espruino port of `@xstate/fsm`) is included in this umbrella repository as a submodule:

- `projects/xstate-fsm-espruino/`

FSMPlus should remain broadly API-compatible with the Stage 1 engine, while adding hierarchical semantics.

### Legacy Public Reference Repo

A legacy public repository exists and is retained as historical reference only:

- `xstate-fsmPlus-Espruino` (legacy / experimental)

It is not the canonical implementation and should not be treated as current.

### Stage 3 Native Engine (XFSM)

A native C FSM engine is being developed in parallel under the umbrella repository:

- `projects/xfsm/` (to be created / populated)

FSMPlus provides the fast path to a working hierarchical engine. XFSM is expected to provide improved
performance and determinism once parity with the MVHE subset is achieved.

## Testing Strategy

FSMPlus is tested primarily using **scenario-driven traces**:

- real application machines (e.g. greenhouse control)
- deterministic event sequences
- expected trace outputs

See:

- `docs/notes/testing-strategy.md`
- `examples/` (once greenhouse scenarios are added)

## Next Steps

Initial work in this subproject typically proceeds in this order:

1. Consolidate an initial working FSMPlus implementation into `src/`
2. Add one greenhouse scenario machine and expected trace output
3. Verify behaviour on Espruino hardware
4. Iterate until MVHE scope is stable
5. Compare parity against the native XFSM engine

