# XState-Espruino-Project

This umbrella repository explores **[XState](https://xstate.js.org/)-style state machines on
[Espruino](https://www.espruino.com/)**,
with a focus on **hierarchical statecharts** that are practical for real
microcontroller workloads (automation, UI flows, fault handling).

The core goal is to establish a **statechart-driven framework** on Espruino
that remains small, testable, and deterministic, while enabling:

- model-driven tooling (visual designers, code generation, trace testing)
- [Stately](https://stately.ai/) / [XState](https://xstate.js.org/) workflows for embedded control
- AI-assisted generation of statecharts that run on-device

## Why Statecharts for Microcontrollers

Statecharts provide a compact, explicit model of system behaviour:

- event → transition mappings are clear and testable
- entry/exit actions are explicit
- guards and context separate logic from side effects

That clarity is ideal for embedded systems where correctness, traceability,
and limited resources matter.

See `docs/governance/background.md` for the full motivation and background.

## Project Stages

### Stage 1: Flat FSM (Espruino port)

Baseline port of `@xstate/fsm`, adapted to Espruino constraints.

Location:

`projects/xstate-fsm-espruino/`

### Stage 2: FSMPlus (Hierarchical JS Engine)

Canonical JavaScript hierarchical FSM engine for Espruino, matching a
Minimum Viable Hierarchical Engine (MVHE) scope.

Location:

`projects/xstate-fsmPlus/`

### Stage 3: Xstate-fsm-c (Native C Engine)

Specification-led development of a native C state-machine engine.

Location:

`projects/Xstate-fsm-c/`

## Testing Approach

Testing is **scenario-driven** and trace-based:

- shared machine definitions under `examples/`
- deterministic event sequences
- expected trace outputs for comparison

See:

`docs/governance/testing-strategy.md` and
`projects/xstate-fsmPlus/tests/`.

## Key Docs

- Background and motivation  
  `docs/governance/background.md`

- Testing strategy and ownership  
  `docs/governance/testing-strategy.md`

- FSMPlus status and backlog (canonical)  
  `docs/governance/fsmPlus-status-01.md`

- Espruino CLI test workflow (operator guide)  
  `tools/README_espruino.md`

- Architectural decisions (ADRs)  
  `docs/decisions/`

- References  
  `docs/references/links.md`

## Status

FSMPlus is the current working hierarchical engine. Xstate-fsm-c is in the
specification and design phase. See `docs/governance/fsmPlus-status-01.md` for
the FSMPlus status and `projects/Xstate-fsm-c/` for Stage 3 work.

## Acknowledgements

- **Espruino** — the open-source JavaScript runtime and community that make
  embedded JS development possible.  
  https://www.espruino.com/

- **XState / Stately** — the statechart model, tooling, and API patterns that
  inspire FSMPlus.  
  https://xstate.js.org/  
  https://stately.ai/
