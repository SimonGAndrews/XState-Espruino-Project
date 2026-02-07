# ADR-0006: Parent Fallback Transition Resolution in Compound States

## Status

Accepted

## Context

FSMPlus extends a flat FSM engine to support **compound (nested) states**. In such machines,
events may be handled at multiple levels of the state hierarchy.

In flat FSMs, transitions are resolved only on the current state. In hierarchical state
machines (as described in SCXML and XState), an event that is not handled by a leaf state
may be handled by one of its ancestor states.

Without parent fallback resolution, compound states would require duplicating transitions
across all leaf states, leading to larger, harder-to-maintain machines.

FSMPlus explicitly excludes parallel states (ADR-0001), so at any time there is a single
active leaf state with a well-defined ancestor chain.

## Decision

FSMPlus will implement **parent fallback transition resolution** as follows:

1. When an event is sent to the machine, transition resolution starts at the **currently
   active leaf state** (`state.value`).

2. If the active state defines one or more transitions for the event, those transitions
   are considered.

3. If no transition is defined on the active state, FSMPlus will **walk up the ancestor
   chain**, checking each parent state in turn.

4. The **nearest ancestor** that defines a transition for the event is selected.

5. If no ancestor defines a transition for the event, the event is ignored and the state
   remains unchanged.

This resolution applies equally to:
- transitions with targets
- targetless transitions (actions only)

## Resolution Order

The ancestor chain is derived from the dot-path state identifier (ADR-0002).

Example:

- Current state: `system.ui.menu`
- Ancestor chain checked (in order):
  1. `system.ui.menu`
  2. `system.ui`
  3. `system`
  4. root (implicit)

The first state in this sequence that defines a transition for the event wins.

## Relationship to Guards

If a state defines **multiple candidate transitions** for the same event, they are evaluated
in declaration order, and the **first transition whose guard passes** is selected.

If all guarded transitions fail, fallback resolution continues to the parent state.

## Alternatives Considered

1. **No parent fallback (leaf-only resolution)**  
   Rejected because it leads to excessive duplication and does not match Statechart semantics.

2. **Global transition table only**  
   Rejected because it obscures intent and weakens encapsulation of behaviour within states.

3. **Evaluate all ancestors and merge transitions**  
   Rejected to keep semantics simple and deterministic; nearest ancestor wins.

## Consequences

### Positive

- Aligns with SCXML and XState hierarchical semantics
- Greatly reduces duplication in machine definitions
- Encourages clean separation of local vs shared behaviour
- Enables compact, readable greenhouse control machines

### Negative

- Requires careful implementation of ancestor traversal
- Incorrect traversal logic can lead to subtle bugs (e.g. skipping ancestors)
- Must be documented clearly to avoid surprise for users new to hierarchical FSMs

## Notes

- Because parallel states are excluded (ADR-0001), parent fallback resolution operates on a
  single ancestor chain.
- Correct traversal depends on reliable dot-path handling (ADR-0002).
- This behaviour is considered **core FSMPlus semantics** and should not be changed without
  a new ADR.

