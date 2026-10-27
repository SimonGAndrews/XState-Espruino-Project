# XState-Espruino-Project

This public umbrella repository records the development of three approaches to
running state machines and statecharts on
[Espruino](https://www.espruino.com/), informed by
[XState](https://github.com/statelyai/xstate).

It retains the flat FSM baseline, the JavaScript FSMPlus engine, shared
examples, architectural decisions, and the history connecting those
approaches. The native C engine, XFSM, matured through this project and is now
developed independently in the standalone
[`SimonGAndrews/Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM)
repository.

This repository remains public as a project history, comparison point, and
navigation hub. Each implementation direction retains its own behavioural
authority and development lifecycle.

## Current Status

XFSM is the current active development focus. Its source, specifications,
tests, evidence, examples, and integration guidance are maintained in the
standalone Espruino-XFSM repository. Its
[implementation status](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/implementation-status.md)
records current qualification and development work.

Stage 1 remains the compact flat embedded baseline. FSMPlus remains a working
JavaScript hierarchical engine that can be deployed without a custom Espruino
firmware build. Moving XFSM to its own repository does not replace or deprecate
either direction.

The [current project context](docs/project-context.md) identifies the authority
and compatibility references for all three directions.

## Project Outcomes

The stage numbers describe the order in which the approaches arose. They do
not define a replacement sequence.

| Direction | Outcome | Current position |
| --- | --- | --- |
| [Stage 1: `xstate-fsm-espruino`](projects/xstate-fsm-espruino/) | Compact flat FSM adapted from `@xstate/fsm` for Espruino | Retained as a separate Git submodule and embedded baseline |
| [Stage 2: `xstate-fsmPlus`](projects/xstate-fsmPlus/) | Hierarchical JavaScript engine supporting compound states | Working parallel implementation maintained in this repository |
| [Stage 3: `Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM) | Specification-led native C hierarchical engine exposed through Espruino's `XFSM` module | Active development in its standalone repository |

Together, these approaches explored the trade-offs between deployment
simplicity, statechart capability, memory use, execution cost, and integration
with Espruino internals.

## What Remains Here

The umbrella repository retains:

- the Stage 1 Git submodule and its separate history
- the canonical FSMPlus implementation, tests, and status documents
- shared application examples and scenario-driven testing material
- architectural decisions and the background to the three approaches
- the XState v4 reference runner used by Stage 1 and FSMPlus work
- an archived XState v4.38.3 source tree for historical reference
- the XFSM journey and relocation record

Material shared by the projects is evidence or a reusable input. It does not
automatically change the behavioural contract of another implementation.

## XFSM Relocation

Current XFSM work belongs in
[`SimonGAndrews/Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM).
The standalone repository is the source of truth for the native library,
Profile 2 specification, tests, recorded evidence, examples, and development
workflow. Its canonical `xfsm/` library is exported unchanged into Espruino's
`libs/xfsm/` directory for integration builds.

This umbrella retains a permanent
[`projects/Xstate-fsm-c/`](projects/Xstate-fsm-c/) placeholder explaining the
project's journey and current location. The last complete umbrella copy is
preserved by the
[`xfsm-umbrella-snapshot-final`](https://github.com/SimonGAndrews/XState-Espruino-Project/tree/xfsm-umbrella-snapshot-final/projects/Xstate-fsm-c)
tag.

## Testing And Authority

Testing across the umbrella project is scenario-driven and trace-based, using
deterministic event sequences and observable state, action, and context
results. The shared [testing strategy](docs/governance/testing-strategy.md)
describes this approach.

Each implementation decides which shared scenarios it adopts and which
external references define its expected behaviour:

- Stage 1 is governed by its submodule source, tests, and documentation.
- FSMPlus is governed by its implementation, tests, status, and applicable
  architectural decisions in this repository.
- XFSM is governed by the standalone Profile 2 specification and its
  incorporated Profile 1 and history requirements.

The [project context](docs/project-context.md) is the complete navigation and
authority guide.

## Documentation

- [Current project context and authority](docs/project-context.md)
- [Background and evolution](docs/governance/background.md)
- [Testing strategy and issue ownership](docs/governance/testing-strategy.md)
- [FSMPlus status and backlog](docs/governance/fsmPlus-status-01.md)
- [Architectural decisions](docs/decisions/)
- [Reference links](docs/references/links.md)
- [XFSM project overview](https://github.com/SimonGAndrews/Espruino-XFSM#readme)
- [XFSM Profile 2 specification](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/specification-profile-2.md)
- [XFSM implementation status](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/implementation-status.md)
- [XFSM Espruino integration workflow](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/espruino-integration.md)

## Licensing

This umbrella repository contains independently licensed projects, an upstream
source archive, and a Git submodule. See [LICENSING.md](LICENSING.md) for the
path-to-licence map. The retained Xstate-fsm-c record and tagged snapshot are
licensed under MPL-2.0. The standalone Espruino-XFSM repository publishes its
own path-based licensing map.

## Acknowledgements

- **Espruino** - the [open-source JavaScript runtime](https://www.espruino.com/)
  and community that make embedded JavaScript development possible.
- **XState and Stately** - the statechart model, tooling, and API patterns from
  [XState](https://github.com/statelyai/xstate) and
  [Stately](https://stately.ai/) that informed the three project directions.
