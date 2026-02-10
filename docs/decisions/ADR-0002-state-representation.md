# ADR-0002: Use Dot-Path State Identifiers and `matches()` Semantics

## Status

Accepted

## Context

FSMPlus adds support for **compound (nested) states** on top of a flat FSM engine in a constrained
runtime (Espruino). In full XState, state values can be represented as nested objects, and state
nodes can be identified via multiple mechanisms (IDs, paths, relative targets, etc.).

In this project we need:

- a state representation that is **simple**, **compact**, and **fast** on embedded devices
- a way to reference nested states consistently in transitions and tests
- predictable semantics for `state.matches(...)` that work in Espruino and are easy to reason about

The project also prioritises delivery speed and maintainability over full XState feature parity.

## Decision

### State identifiers

FSMPlus will represent state identity using **dot-path strings**:

- `idle`
- `heating.on`
- `system.ui.menu`

A dot-path represents the hierarchical path from the machine root to a nested state.

### Canonical current state value

The canonical `state.value` in FSMPlus is a **string dot-path** representing the currently active
leaf state (in the no-parallel model).

Examples:

- `state.value === "idle"`
- `state.value === "heating.on"`

### `matches()` semantics

FSMPlus will provide a `state.matches(target)` helper with **dot-path equality or ancestor
matching** against the canonical resolved state value:

- `state.matches("heating.on")` is true iff `state.value === "heating.on"`
- `state.matches("heating")` is true iff `state.value` is within that subtree
  (e.g., `state.value === "heating.on"` or `state.value === "heating.off"`)

This brings FSMPlus closer to XState v4 `matches()` semantics while keeping the
string-based dot-path representation.

### Targets and resolved paths

Transition targets should be specified using dot-path strings. FSMPlus may internally resolve
targets to a canonical dot-path (for example, resolving a compound state target to its initial
leaf state) before assigning the next state.

In this case, `state.value` stores the **resolved** leaf dot-path.

## Alternatives Considered

1. **Nested object state values** (full XState style)  
   Rejected due to increased memory usage, implementation complexity, and more complex comparisons.

2. **Numeric state IDs**  
   Rejected due to loss of readability in tests and configuration; would require additional mapping.

3. **SCXML-style generated IDs only**  
   Rejected for now; dot-paths provide a straightforward and human-readable identifier scheme.

## Consequences

### Positive

- Simple, stable, human-readable representation suitable for embedded logging and tests
- Easy to compare states and generate deterministic traces
- Low overhead implementation in Espruino
- Reduces ambiguity when migrating legacy FSMPlus work and writing greenhouse scenarios

### Negative

- Does not support full XState nested-object `matches()` patterns
- Requires dot-path discipline in configuration and tests
- Relative targets and `#id`-style addressing are not part of the initial scope

## Notes

- Parallel state support is excluded by ADR-0001, so a single active leaf dot-path is sufficient
  for the canonical state value.
- Prefix/ancestor matching is supported by this ADR; any richer matching should be captured
  in a new ADR to avoid breaking test expectations.
