# ADR-0005: `assign` Actions Execute Before Other Transition Actions

## Status

Accepted

## Context

FSMPlus supports transition actions, including `assign`-style actions that update machine context.
In XState-style semantics, `assign` is special because it updates context and subsequent actions
often depend on the updated values.

In embedded control flows (e.g. greenhouse automation), deterministic ordering is critical.
If context updates occur after other actions, the actions may observe stale values and produce
unexpected side effects.

FSMPlus also supports hierarchical transitions (compound states) where ordering across exit,
transition, and entry actions must remain consistent (ADR-0004).

## Decision

When a transition is selected, FSMPlus will execute actions in this order:

1. Exit actions (for exited states)            (ADR-0004)
2. Transition actions                          (ADR-0004)
   2a. All `assign` actions are applied first
   2b. All remaining transition actions run after assigns
3. Entry actions (for entered states)          (ADR-0004)

This rule applies to:
- transitions defined on the leaf state
- transitions resolved via parent fallback (ADR-0006)
- targetless transitions (actions only)

## Definition of `assign`

An action is treated as an `assign` action if it is explicitly created using the FSMPlus/XState
assign helper (e.g. `xstate.assign(...)`), or matches the internal representation used for assign
actions in the engine.

The engine may normalise actions to an internal object form to make this detection fast and
predictable.

## Alternatives Considered

1. Execute actions strictly in declared order  
   Rejected because context updates would not be reliably available to subsequent actions.

2. Execute assigns last  
   Rejected because it makes assigns less useful and diverges from common XState expectations.

3. Execute assigns between exit and transition actions  
   Rejected to keep ordering aligned with typical “exit → transition → entry” semantics.

## Consequences

### Positive

- Deterministic context availability for transition and entry actions
- Matches common XState expectations for `assign`
- Reduces subtle bugs where actions rely on updated context
- Supports clean implementation patterns in application machines

### Negative

- Requires detection/normalisation of assign actions
- Slightly deviates from “pure declared order” mental model (must be documented)

## Notes

- This ADR only defines ordering relative to other transition actions.
- Exit and entry ordering remain defined by ADR-0004.
- Any change to assign detection or ordering should be captured in a new ADR as it can affect
  application behaviour and tests.

