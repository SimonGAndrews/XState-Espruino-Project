# Testing and Issue Tracking Strategy

This project uses **scenario-driven testing** combined with **clear issue ownership**
to validate behaviour and manage defects across multiple FSM implementations.

The emphasis is on **observable behaviour**, not exhaustive unit testing.

## Testing Approach

Testing is primarily based on:

- real application scenarios (e.g. greenhouse automation)
- deterministic event sequences
- traceable logs of:
  - events
  - state transitions
  - entry / exit actions
  - side effects

Correctness is evaluated by comparing **expected traces** against **actual traces**,
rather than asserting internal implementation details.

This approach is particularly well suited to:

- finite state machines
- embedded and constrained runtimes
- behaviour where ordering matters more than return values

## Where Tests Live

- Shared machine definitions and scenarios live under:
  - `examples/`
- Expected traces may be stored alongside examples or under:
  - `tests/`
- Tests are intended to run against:
  - FSMPlus (JavaScript module)
  - XFSM (native C engine)
  using the same inputs where possible

## Issue Tracking: Ownership Model

Issues are logged based on **ownership**, not where the problem was first observed.

### Umbrella Repository Issues

Log issues in the **XState-Espruino-Project** repository when they involve:

- FSMPlus (hierarchical JavaScript engine)
- XFSM (native C engine)
- integration between engines
- test harnesses or example scenarios
- behavioural mismatches between implementations
- performance or determinism concerns

These issues often arise during scenario testing and cross-engine comparison.

### Submodule Repository Issues

Log issues in the **xstate-fsm-Espruino** submodule repository when:

- the root cause is confined to the flat FSM engine
- the issue is reproducible using the submodule alone
- the fix would be meaningful independently of the umbrella project

This keeps the submodule self-contained and independently maintainable.

### Cross-Referencing Issues

If an issue is discovered during umbrella testing but belongs to the submodule:

- create the issue in the submodule repository
- reference it from the umbrella repo issue or commit message

Issues should not be duplicated across repositories.

## Issue Labels

To keep issue tracking lightweight but meaningful, the following labels are recommended.

### Umbrella Repository Labels

Use these labels in **XState-Espruino-Project**:

- `fsmplus`  
  Issues specific to the hierarchical JavaScript engine

- `xfsm`  
  Issues specific to the native C FSM engine

- `integration`  
  Issues involving interaction between engines, tests, or examples

- `tests`  
  Test harnesses, trace comparisons, or scenario definitions

- `performance`  
  Timing, memory, or determinism observations

- `question`  
  Design questions or clarifications that are not yet bugs

### Submodule Repository Labels

Use these labels in **xstate-fsm-Espruino**:

- `bug`  
  Incorrect or unexpected behaviour

- `behaviour`  
  Semantic or edge-case issues that require discussion

- `compatibility`  
  Espruino-specific constraints or regressions

- `docs`  
  Documentation issues or improvements

## Relationship to ADRs

- Issues capture problems, defects, and missing behaviour
- Architectural Decision Records (ADRs) capture **deliberate design choices**

If resolving an issue results in a permanent architectural constraint or exclusion,
that decision should be recorded separately as an ADR.

## Summary

This strategy aims to:

- keep testing lightweight and behaviour-focused
- preserve clear ownership of defects
- support rapid iteration across multiple FSM implementations
- avoid unnecessary process overhead

It is expected to evolve as the project matures, but simplicity is a deliberate choice.
