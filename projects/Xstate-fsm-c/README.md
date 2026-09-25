# Xstate-fsm-c

Xstate-fsm-c is the Stage 3 native C state-machine project within the
XState-Espruino-Project umbrella repository.

Its public Espruino module is `XFSM`, loaded by application JavaScript with
`require("XFSM")`.

## Status

The Profile 1 specification is an implementation candidate. It defines the
supported feature scope, XState compatibility direction, native indexed arena,
actor and context ownership, transition and action semantics, diagnostics,
Espruino build integration, target matrix, resource measurements, and
conformance strategy.

The first implementation step is a vertical slice on Linux Espruino followed
by representative physical targets. That slice must measure the provisional
native layout, hierarchy-depth and microstep limits, stack reserve, flash, RAM,
and timing before the physical format is frozen or the full implementation
proceeds.

## Relationship to Existing Work

The existing projects and documents provide evidence and experience for the
design discussion:

- `projects/xstate-fsm-espruino/` provides the flat FSM baseline.
- `projects/xstate-fsmPlus/` provides the hierarchical JavaScript engine.
- `projects/xstate-v4-truth/` provides the current XState v4 reference runner.
- `examples/` contains shared behavioral scenarios and expected traces.
- `docs/decisions/` records earlier umbrella-project decisions.

These sources are design inputs. They are not automatically normative for
Xstate-fsm-c; the specification must explicitly adopt, revise, or reject the
relevant behavior and constraints.

## Project Layout

- `docs/specification.md` - Profile 1 normative implementation candidate
- `docs/native-format-v1.md` - provisional native arena and actor layout
- `docs/compatibility/` - raw Stately v4/v5 exports and their assessments
- `src/` - native engine and Espruino wrapper implementation area
- `tests/` - conformance, differential, native-format, and resource tests

## Licensing And Contributions

Xstate-fsm-c is licensed under the Mozilla Public License 2.0. See
[LICENSE](LICENSE) for the complete terms,
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for provenance, and
[CONTRIBUTING.md](CONTRIBUTING.md) for the source-header and contribution
rules.

The licence applies to this project directory and does not relicense sibling
projects, the XState source archive, the Stage 1 Git submodule, or Espruino.
