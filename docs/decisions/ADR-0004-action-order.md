# ADR-0004: Entry and Exit Action Ordering for Compound State Transitions

## Status

Accepted

## Context

FSMPlus supports **compound (nested) states** and parent fallback transition resolution.
In hierarchical state machines, a transition does not simply move from one state to another;
it moves from one **set of active states** to another.

Correct execution order of actions is critical for:

- predictable side effects
- correct context updates
- compatibility with SCXML and XState semantics
- avoiding subtle bugs in real-world control applications

The SCXML specification (sections 3.1.4 and 3.1.5) defines a precise ordering for exit actions,
transition actions, and entry actions when transitioning between compound states.

FSMPlus excludes parallel states (ADR-0001), which simplifies the active state set to a
single ancestor chain, but **ordering remains essential**.

## Decision

FSMPlus will execute actions for a transition between compound states in the following order:

1. **Exit actions**
2. **Transition actions**
3. **Entry actions**

This ordering applies regardless of whether the transition is defined on the leaf state
or on an ancestor state via parent fallback resolution (ADR-0006).

## Detailed Ordering Rules

### 1. Exit Actions

- Exit actions are executed for all states that are exited during the transition.
- States are exited starting from the **current leaf state**, moving upward to (but not
  including) the **least common compound ancestor (LCCA)** of the source and target states.
- Exit actions are executed in **leaf-to-root order**.

### 2. Transition Actions

- Actions defined directly on the selected transition are executed after all exit actions.
- If the transition includes `assign` actions, they are applied **before** any other
  transition actions (see ADR-0005).

### 3. Entry Actions

- Entry actions are executed for all states that are entered during the transition.
- States are entered starting from the **LCCA**, moving downward to the **target leaf state**.
- Entry actions are executed in **root-to-leaf order**.

### Targetless Transitions

- For targetless transitions:
  - Exit and entry actions are **not** executed.
  - Only transition actions are run.
  - The current state value remains unchanged.

## Alternatives Considered

1. **Flat FSM ordering (exit → entry only)**  
   Rejected because it does not handle compound state transitions correctly.

2. **Execute transition actions first**  
   Rejected because it breaks expected context availability for entry actions.

3. **Interleave exit and entry actions**  
   Rejected due to complexity and divergence from SCXML semantics.

## Consequences

### Positive

- Aligns FSMPlus semantics with SCXML and XState expectations
- Ensures deterministic and testable behaviour
- Supports real-world control flows (e.g. greenhouse automation)
- Makes reasoning about side effects significantly easier

### Negative

- Requires correct identification of the LCCA
- Slightly more complex implementation than flat FSM transitions
- Errors in ordering logic can cause subtle runtime bugs

## Notes

- Because parallel states are excluded (ADR-0001), exit and entry ordering operates on a
  single ancestor chain.
- Correct LCCA calculation depends on reliable dot-path state identifiers (ADR-0002).
- Any change to this ordering must be captured in a new ADR, as it would be a breaking
  semantic change.

