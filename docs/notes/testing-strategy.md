# Testing and Issue Tracking Strategy

This project uses **scenario-driven testing** combined with **clear issue ownership**
to validate behaviour and manage defects across multiple FSM implementations.

The emphasis is on **observable behaviour**, not exhaustive unit testing.

Advantages of this approach:

- aligns with embedded constraints (small footprint, minimal harness)
- validates real ordering and side effects rather than internal implementation details
- enables cross-engine parity checks (FSMPlus vs XFSM) using the same scenarios
- keeps tests stable across refactors as long as behaviour is preserved

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
  - `examples/` (repo root)
- Expected traces are stored alongside examples:
  - `examples/<scenario>/<scenario>.expected.js`
- Actual run outputs may be stored under:
  - `tests/results/` (per runtime, e.g. `node/`, `espruino/`)
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

## Appendix: Test Workflow (Operational Guide)

This appendix describes how a test is assembled and executed, with clear source locations
and the roles of shared framework vs scenario-specific inputs.

### 1. Scenario definition (inputs)

Sources:
- Machine definition: `examples/<scenario>/<scenario>.machine.js`
- Event sequence: `examples/<scenario>/<scenario>.events.js`
- Expected trace: `examples/<scenario>/<scenario>.expected.js`

What varies per scenario:
- State topology, transitions, guards, and actions in the machine definition.
- Ordered list of events in the event sequence.
- Expected trace lines for the scenario.

What stays fixed across scenarios:
- Trace format and comparison rules used by the harness.
- Use of dot-path state values and ordered action logging.

### 2. Execution (framework)

Framework location:
- Node harness: `projects/xstate-fsmPlus/tests/node/run-<scenario>.js`
- Espruino harness: `projects/xstate-fsmPlus/tests/espruino/run-<scenario>.js`

Shared framework responsibilities:
- Create machine from scenario definition.
- Run the event sequence in order.
- Capture a trace of observed behaviour.
- Compare actual vs expected trace.
- Write actual output to `projects/xstate-fsmPlus/tests/results/<runtime>/`.

What can vary per runtime:
- Output destination (e.g., `tests/results/node/` vs `tests/results/espruino/`).
- Minimal runtime glue needed to load files in Node vs Espruino.

### 3. Updating or extending scenarios

To change scenario behaviour:
- Edit the machine file to adjust transitions, guards, or actions.
- Adjust the event sequence to exercise the new behaviour.
- Update the expected trace to match the new observable output.

To add a new scenario:
- Create a new folder under `examples/<scenario>/`.
- Add machine and events files with the same naming convention.
- Add a corresponding expected trace in the same scenario folder.
- Add a harness file in `projects/xstate-fsmPlus/tests/node/` and optionally in `projects/xstate-fsmPlus/tests/espruino/`.

### 4. Test designer checklist

- Confirm the scenario uses dot-path state identifiers.
- Ensure guarded transitions are ordered correctly for selection.
- Include at least one compound state transition if testing hierarchy.
- Keep logs deterministic and avoid non-deterministic actions.
