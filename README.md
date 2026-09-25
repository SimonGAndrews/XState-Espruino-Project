# XState-Espruino-Project

This umbrella repository explores state-machine and statechart engines for
[Espruino](https://www.espruino.com/), informed by
[XState](https://xstate.js.org/), with a focus on hierarchical statecharts
that are practical for real microcontroller workloads (automation, UI flows,
fault handling).

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

See the [project context](docs/project-context.md) for the current direction and
the [background](docs/governance/background.md) for its evolution.

## Parallel Project Directions

The three directions arose in sequence but remain parallel projects. Their
stage numbers describe that evolution; they do not mean that a later project
replaces an earlier one.

### Stage 1: Flat FSM (Espruino Port)

Baseline port of `@xstate/fsm`, adapted to Espruino constraints.

Project: [`projects/xstate-fsm-espruino/`](projects/xstate-fsm-espruino/)

### Stage 2: FSMPlus (Hierarchical JS Engine)

Working JavaScript hierarchical FSM engine for Espruino and a parallel
deployable direction that does not require custom firmware.

Project: [`projects/xstate-fsmPlus/`](projects/xstate-fsmPlus/)

### Stage 3: Xstate-fsm-c (Native C Engine)

Specification-led native C hierarchical engine, exposed to Espruino JavaScript
as the `XFSM` module. This is the current active development focus.

Project: [`projects/Xstate-fsm-c/`](projects/Xstate-fsm-c/)

## Testing Approach

Testing is **scenario-driven** and trace-based:

- shared machine definitions under `examples/`
- deterministic event sequences
- expected trace outputs for comparison

The shared approach is described in the
[testing strategy](docs/governance/testing-strategy.md). Each project retains
its own compatibility authority and decides which shared cases it adopts.

## Key Docs

- [Current project context and authority](docs/project-context.md)
- [Background and evolution](docs/governance/background.md)
- [Testing strategy and ownership](docs/governance/testing-strategy.md)
- [FSMPlus status and backlog](docs/governance/fsmPlus-status-01.md)
- [Xstate-fsm-c Profile 1 specification](projects/Xstate-fsm-c/docs/specification.md)
- [Xstate-fsm-c provisional native format](projects/Xstate-fsm-c/docs/native-format-v1.md)
- [Xstate-fsm-c implementation status](projects/Xstate-fsm-c/docs/implementation-status.md)
- [Xstate-fsm-c implementation plan](projects/Xstate-fsm-c/docs/implementation-plan.md)
- [Xstate-fsm-c build guide](projects/Xstate-fsm-c/docs/building.md)
- [Espruino CLI test workflow](tools/README_espruino.md)
- [Architectural decisions](docs/decisions/)
- [References](docs/references/links.md)

## Status

FSMPlus is the current working JavaScript hierarchical engine. Xstate-fsm-c is
the active development focus: its Profile 1 specification is an implementation
candidate, its M1 optional-library shell is build-verified on Linux, and its
M2 native-format foundation is sanitizer-verified on Linux. Machine
construction and runtime behaviour are not yet implemented. The M3
transactional construction slice is the next code milestone. Stage 1 remains
the flat embedded baseline.

The [current project context](docs/project-context.md) identifies the authority
and compatibility references for each direction.

## Licensing

This umbrella repository contains projects, an upstream source archive, and a
Git submodule with distinct licensing boundaries. See [LICENSING.md](LICENSING.md)
for the path-to-licence map. Xstate-fsm-c is licensed separately under
MPL-2.0.

## Acknowledgements

- **Espruino** — the [open-source JavaScript runtime](https://www.espruino.com/)
  and community that make embedded JS development possible.
- **XState / Stately** — the statechart model, tooling, and API patterns from
  [XState](https://xstate.js.org/) and [Stately](https://stately.ai/) that
  inform the three project directions.
