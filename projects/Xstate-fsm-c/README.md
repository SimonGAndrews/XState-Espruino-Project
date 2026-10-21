# Xstate-fsm-c

Xstate-fsm-c is the Stage 3 native C state-machine project within the
XState-Espruino-Project umbrella repository.

Its public Espruino module is `XFSM`, loaded by application JavaScript with
`require("XFSM")`.

The umbrella [project context](../../docs/project-context.md) records how this
direction relates to the Stage 1 and FSMPlus projects.

## Status

Public Profile 2 is the current XFSM profile. It retains the completed Profile
1 contract and adds one shallow- or deep-history node per compound owner.
Profile 1 and private Native Format Version 1 remain frozen; Profile 2 uses
frozen private Native Format Version 2.

The exact Profile 2 implementation passes the complete Linux history and base
regression, pinned XState 5.33.2 comparisons, 96 sanitizer-backed native
checks, and physical production and instrumented reruns on original ESP32 IDF5
and ESP32-C3 IDF5. Those three environments are Profile 2 Conformance
verified. The reduced Pico and constrained Bluetooth MDBT42Q profiles build
successfully and are Profile 2 Build verified pending physical repetition of
the history runtime cases. Their completed Profile 1 Conformance verified
status remains valid.

Current work, revisions, and next tasks are recorded in the
[implementation status](docs/implementation-status.md). The
[implementation plan](docs/implementation-plan.md) defines the milestone and
review gates, and the [build guide](docs/building.md) records reproducible
commands and development locations.

## Public Profiles

The [Profile 2 specification](docs/specification-profile-2.md) is the current
normative entry point. It incorporates the frozen
[Profile 1 specification](docs/specification.md) and the qualified
[history-state requirements](docs/extensions/history-states.md). Profile 1
remains available as the smaller public baseline without history.

## Code Development

Canonical Profile 2 implementation code is developed in the
[`SimonGAndrews/Espruino` `feature/xfsm-profile2` branch](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile2).
Profile 1 remains on `feature/xfsm-profile1`, and the qualification history is
preserved on `experiment/xfsm-history`. The current local clone is
`/home/simon/Espruino-XFSM-Profile1`, and the canonical library location is
`libs/xfsm/`.

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

- [docs/specification-profile-2.md](docs/specification-profile-2.md) - current
  public Profile 2 normative entry point
- [docs/specification.md](docs/specification.md) - frozen Profile 1 normative
  base
- [docs/native-format-v1.md](docs/native-format-v1.md) - frozen private native
  arena and actor layout
- [docs/native-format-v2.md](docs/native-format-v2.md) - frozen Profile 2
  history-state arena and actor layout
- [docs/extensions/history-states.md](docs/extensions/history-states.md) -
  normative Profile 2 shallow- and deep-history requirements
- [docs/memory-ownership.md](docs/memory-ownership.md) - conceptual memory
  regions, ownership and reachability
- [docs/memory-lifetime.md](docs/memory-lifetime.md) - construction, execution,
  hibernation and reclamation lifetimes
- [docs/implementation-plan.md](docs/implementation-plan.md) - implementation
  milestones and evidence gates
- [docs/implementation-status.md](docs/implementation-status.md) - current
  revisions, progress, and next work
- [docs/building.md](docs/building.md) - two-repository build and target guide
- [docs/esp32-device-testing.md](docs/esp32-device-testing.md) - original ESP32
  USB-UART flashing, execution, and evidence procedure
- [docs/compatibility/](docs/compatibility/) - raw Stately v4/v5 exports and
  their assessments
- [docs/reports/](docs/reports/) - reviewed measurements and qualification
  reports
- [src/](src/) - implementation ownership and source-location note
- [tests/normative-audit.md](tests/normative-audit.md) - requirement-level
  frozen Profile 1 traceability audit
- [tests/profile-2-conformance.md](tests/profile-2-conformance.md) - Profile 2
  composition, added cases, evidence, and target status
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
