# Current Project Context

- Last reviewed: 2026-10-27
- Current development focus: standalone Espruino-XFSM Profile 2

This document is the umbrella repository's current navigation and authority
guide. It does not define state-machine behaviour; each implementation
direction owns its behavioural contract.

## Evolution And Parallel Directions

The repository records an evolution in approaches to implementing state
machines for Espruino, informed by XState. The three resulting directions
remain parallel projects with different costs, capabilities, and compatibility
baselines. The stage numbers describe their historical order, not replacement
or obsolescence.

| Direction | Role and current position | Project authority | External compatibility reference |
| --- | --- | --- | --- |
| [Stage 1: `xstate-fsm-espruino`](../projects/xstate-fsm-espruino/) | Compact flat FSM port and embedded baseline | Its submodule README, source, and tests | The `@xstate/fsm` and XState v4-era behaviour from which it was adapted |
| [Stage 2: `xstate-fsmPlus`](../projects/xstate-fsmPlus/) | Working hierarchical JavaScript engine and parallel deployable option | FSMPlus source, tests, [status](governance/fsmPlus-status-01.md), and applicable ADRs | XState v4 and SCXML evidence as recorded by the FSMPlus documents |
| [Stage 3: `Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM), public module `XFSM` | Native C hierarchical engine; current active development focus | The standalone repository's Profile 2 specification, incorporated Profile 1 base and history requirements, and frozen private Native Format Version 2 | XState v5.33.2 primary differential reference and XState v4.38.3 secondary reference, as specified by Profile 2 and its base |

A reference that is authoritative or useful for one direction does not
automatically govern another. Shared examples, traces, and tools may be reused
only after review against the receiving project's contract.

## Current Focus

Espruino-XFSM Profile 2 is the active specification-led development effort. It
retains the completed Profile 1 contract and adds the qualified shallow- and
deep-history requirements. Native Format Version 2 is frozen. Linux and all
four specified physical target profiles are Profile 2 Conformance verified:
original ESP32 IDF5, ESP32-C3 IDF5, reduced Pico, and constrained Bluetooth
MDBT42Q. Current resource decisions, qualified revisions, progress, and next
tasks are recorded in the standalone
[implementation status](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/implementation-status.md).

Profile 1 M0 traceability, grouped M8 closure, and four-target physical
qualification remain complete. The repeatable original-ESP32 procedure is
recorded in the
[device-testing guide](../projects/Xstate-fsm-c/docs/esp32-device-testing.md),
and the completed measurements are interpreted in the [post-M6 resource
report](../projects/Xstate-fsm-c/docs/reports/2026-09-27-post-m6-resource-review.md)
and [constrained-target build report](../projects/Xstate-fsm-c/docs/reports/2026-09-29-m8-constrained-target-builds.md),
with Pico details in the [physical qualification
report](../projects/Xstate-fsm-c/docs/reports/2026-09-29-m8-pico-physical-qualification.md)
and MDBT42Q details in its [physical qualification
report](../projects/Xstate-fsm-c/docs/reports/2026-09-29-m8-mdbt42q-physical-qualification.md).

Canonical source, specifications, conformance definitions, and reviewed
evidence are maintained in `SimonGAndrews/Espruino-XFSM`. Its `xfsm/` tree is
deployed unchanged under `libs/xfsm/` in the
[`SimonGAndrews/Espruino` `feature/xfsm-profile2` branch](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile2).
The umbrella project directory is retained as the migration-source snapshot,
not a second active authority.

The Xstate-fsm-c project name, public module name, and implementation identifiers
are distinct:

| Use | Name |
| --- | --- |
| Project and specification | `Xstate-fsm-c` |
| Espruino module and build-library identifier | `XFSM` |
| Build variable | `USE_XFSM` |
| Internal C, arena, diagnostic, and conformance identifiers | `XFC` |

## Authority By Direction

### Xstate-fsm-c

The standalone
[Profile 2 specification](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/specification-profile-2.md)
and its incorporated Profile 1 and history requirements are the normative
behavioural and public-interface authority. In particular:

1. A conflict with an expected conformance result is resolved in favour of the
   specification.
2. The standalone
   [native-format document](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/native-format-v2.md)
   is normative for frozen private arena Format Version 2. An incompatible
   physical change requires a version increment.
3. Stately exports, pinned Node XState runs, SCXML, existing ADRs, FSMPlus
   traces, Stage 1 behaviour, and archived sources are evidence. They do not
   silently add or change a Profile 2 or incorporated Profile 1 requirement.
4. An intentional difference within a supported feature belongs in the
   applicable Profile 2 or incorporated Profile 1 compatibility register.

### FSMPlus

The canonical implementation is
`projects/xstate-fsmPlus/src/xstate_fsmPlus.js`. Its current capability and
backlog are recorded in
[fsmPlus-status-01.md](governance/fsmPlus-status-01.md). The existing ADRs were
principally developed for this direction and remain applicable to FSMPlus
according to their stated scope.

### Stage 1

Stage 1 is a separate Git submodule. Its repository content and history govern
that implementation. Umbrella documents may describe or test it but do not
replace its own source, documentation, licence, or repository history.

## Shared Material

- [Background](governance/background.md) explains the project's motivation and
  evolution.
- [Testing strategy](governance/testing-strategy.md) defines shared
  scenario-driven principles. Its XState v4 truth-runner direction applies to
  Stage 1 and FSMPlus; current Xstate-fsm-c conformance is governed by Profile
  2.
- [ADRs](decisions/README.md) record earlier architectural decisions and their
  scope.
- Root `examples/` are shared evidence, not automatically normative cases for
  every engine.
- `archive/` preserves upstream and historical sources and must not be treated
  as current implementation code.
- [LICENSING.md](../LICENSING.md) defines the repository's per-path licensing
  boundaries.

## Keeping Context Current

Update this document when the active development focus, project authority,
implementation phase, or next major step changes. Put detailed behaviour in the
owning project's specification, tests, or ADRs rather than duplicating it here.
