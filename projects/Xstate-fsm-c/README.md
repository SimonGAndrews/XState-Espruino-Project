# Xstate-fsm-c

Xstate-fsm-c is the Stage 3 native C state-machine project within the
XState-Espruino-Project umbrella repository.

Its public Espruino module is `XFSM`, loaded by application JavaScript with
`require("XFSM")`.

The umbrella [project context](../../docs/project-context.md) records how this
direction relates to the Stage 1 and FSMPlus projects.

## Status

The Profile 1 specification is an implementation candidate. The M1
optional-library shell is implemented and build-verified on Linux; machine
construction and runtime behaviour have not started. The specification defines
the supported feature scope, XState compatibility direction, native indexed
arena, actor and context ownership, transition and action semantics,
diagnostics, Espruino build integration, target matrix, resource measurements,
and conformance strategy.

The next code milestone establishes the native format and sanitizer tests,
followed by the construction and execution vertical slice on Linux Espruino.
That slice must measure the provisional
native layout, hierarchy-depth and microstep limits, stack reserve, flash, RAM,
and timing before the physical format is frozen or the full implementation
proceeds.

Current work, revisions, and next tasks are recorded in the
[implementation status](docs/implementation-status.md). The
[implementation plan](docs/implementation-plan.md) defines the milestone and
review gates, and the [build guide](docs/building.md) records reproducible
commands and development locations.

## Code Development

Canonical implementation code is developed in the
[`SimonGAndrews/Espruino` `feature/xfsm-profile1` branch](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1).
The current local clone is `/home/simon/Espruino-XFSM-Profile1`, and the
canonical library location is `libs/xfsm/`.

This umbrella repository owns the specification, planning, conformance cases,
differential tooling, results, and reports. It does not keep a second copy of
the C engine or Espruino wrapper.

## Relationship to Existing Work

The existing projects and documents provide evidence and experience for the
design discussion:

- `projects/xstate-fsm-espruino/` provides the flat FSM baseline.
- `projects/xstate-fsmPlus/` provides the hierarchical JavaScript engine.
- `projects/xstate-v4-truth/` provides the secondary XState v4 reference runner
  and legacy evidence.
- `examples/` contains shared behavioral scenarios and expected traces.
- `docs/decisions/` records earlier umbrella-project decisions.

These sources are design inputs. They are not automatically normative for
Xstate-fsm-c; the specification must explicitly adopt, revise, or reject the
relevant behavior and constraints.

## Project Layout

- [docs/specification.md](docs/specification.md) - Profile 1 normative
  implementation candidate
- [docs/native-format-v1.md](docs/native-format-v1.md) - provisional native
  arena and actor layout
- [docs/implementation-plan.md](docs/implementation-plan.md) - implementation
  milestones and evidence gates
- [docs/implementation-status.md](docs/implementation-status.md) - current
  revisions, progress, and next work
- [docs/building.md](docs/building.md) - two-repository build and target guide
- [docs/compatibility/](docs/compatibility/) - raw Stately v4/v5 exports and
  their assessments
- [docs/reports/](docs/reports/) - reviewed measurements and qualification
  reports
- [src/](src/) - implementation ownership and source-location note
- [tests/](tests/) - conformance definitions, differential tooling, results,
  and evidence indexes

## Licensing And Contributions

Xstate-fsm-c is licensed under the Mozilla Public License 2.0. See
[LICENSE](LICENSE) for the complete terms,
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for provenance, and
[CONTRIBUTING.md](CONTRIBUTING.md) for the source-header and contribution
rules.

The licence applies to this project directory and does not relicense sibling
projects, the XState source archive, the Stage 1 Git submodule, or Espruino.
