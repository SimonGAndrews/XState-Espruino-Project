# xstate-fsmPlus (Espruino)

This folder contains the **canonical Stage 2** implementation in the umbrella project:
a JavaScript-based hierarchical finite state machine engine for **Espruino**, inspired by:

- `@xstate/fsm` (XState v4 lightweight FSM semantics)
- SCXML compound state behaviour (hierarchical/compound states and ordered entry/exit)
- practical constraints of embedded Espruino runtimes

The goal of FSMPlus is to provide a usable hierarchical FSM engine for real
embedded applications, including greenhouse automation, without requiring
custom firmware.

## Status

FSMPlus is a parallel development track in this umbrella repository. The
umbrella project's current active development focus is Xstate-fsm-c; this does
not replace or deprecate FSMPlus.

- Scope is intentionally limited to deliver a working subset quickly.
- Parallel state support is explicitly excluded (see ADR-0001).

## Espruino Implementation Constraints

The canonical JavaScript engine must remain compatible with the supported
Espruino language subset. In particular:

- avoid optional chaining and destructuring assignments;
- avoid default function parameters and reliance on `function.name`;
- prefer `var` and classic functions where target support for newer syntax is
  uncertain; and
- avoid unsupported collections such as ES6 `Set`.

Changes to these constraints require validation on the applicable Espruino
targets rather than an assumption based on Node.js behaviour.

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
- Runtime configuration overrides:
  - `createMachine(config, options)` (actions/guards)
  - `machine.withConfig(options, contextOverride)`
  - `machine.withContext(contextOverride)`

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

- `projects/Xstate-fsm-c/`

FSMPlus provides the working JavaScript hierarchical engine. Xstate-fsm-c has
its own Profile 1 contract and is expected to provide improved performance and
determinism; FSMPlus behaviour is evidence for that project rather than an
automatic parity requirement.

## Testing Strategy

FSMPlus is tested primarily using **scenario-driven traces**:

- real application machines (e.g. greenhouse control)
- deterministic event sequences
- expected trace outputs

See the shared [testing strategy](../../docs/governance/testing-strategy.md) and
the repository-root [`examples/`](../../examples/) corpus.

## Runtime Configuration (Actions/Guards)

FSMPlus supports a small subset of the configuration-override forms used by
XState v4:

```
var machine = fsm.createMachine(config, {
  actions: { logGo: function () {} },
  guards: { allow: function (ctx) { return true; } }
});

var tuned = machine.withConfig({
  actions: { logGo: function () {} },
  guards: { allow: function (ctx) { return ctx.count > 0; } }
}, { count: 1 });
```

## Current Work

The canonical capability summary and backlog are maintained in the
[FSMPlus status](../../docs/governance/fsmPlus-status-01.md). Shared scenarios
may be compared with Xstate-fsm-c after they are reviewed against both projects'
contracts; exact parity is not assumed where the documented semantics differ.
