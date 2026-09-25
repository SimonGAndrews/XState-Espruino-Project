# Current Project Context

- Last reviewed: 2026-09-25
- Current development focus: Xstate-fsm-c Profile 1

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
| [Stage 3: `Xstate-fsm-c`](../projects/Xstate-fsm-c/), public module `XFSM` | Native C hierarchical engine; current active development focus | [Profile 1 specification](../projects/Xstate-fsm-c/docs/specification.md), its conformance corpus, and the provisional [native format](../projects/Xstate-fsm-c/docs/native-format-v1.md) | XState v5.33.2 primary differential reference and XState v4.38.3 secondary reference, as specified by Profile 1 |

A reference that is authoritative or useful for one direction does not
automatically govern another. Shared examples, traces, and tools may be reused
only after review against the receiving project's contract.

## Current Focus

Xstate-fsm-c Profile 1 is the active specification-led development effort. Its
design is an implementation candidate, no unresolved Profile 1 design questions
are recorded, and its M2 native-format foundation is sanitizer-verified on
Linux. Machine construction and runtime behaviour have not started. Current
revisions, progress, and next tasks are recorded in its
[implementation status](../projects/Xstate-fsm-c/docs/implementation-status.md).

The next code step is the M3 transactional construction vertical slice,
followed by actor execution on Linux Espruino. The completed slice must exercise
construction and execution through the native C engine and Espruino wrapper,
then produce the required resource, layout, stack, limit, and timing evidence
before the native physical format is frozen or the full implementation
proceeds. Espruino Pico, MDBT42Q, ESP32-C3, and an Xtensa ESP32 provide the
initial physical qualification matrix after the Linux host.

Canonical implementation code is developed under `libs/xfsm/` in the
[`SimonGAndrews/Espruino` `feature/xfsm-profile1` branch](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1).
The umbrella repository owns the specification, conformance definitions, and
reviewed evidence rather than a duplicate implementation tree.

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

The [Profile 1 specification](../projects/Xstate-fsm-c/docs/specification.md)
is the normative behavioural and public-interface authority. In particular:

1. A conflict with an expected conformance result is resolved in favour of the
   specification.
2. The [native-format document](../projects/Xstate-fsm-c/docs/native-format-v1.md)
   is normative for the provisional physical C representation, subject to its
   first-vertical-slice review gate.
3. Stately exports, pinned Node XState runs, SCXML, existing ADRs, FSMPlus
   traces, Stage 1 behaviour, and archived sources are evidence. They do not
   silently add or change a Profile 1 requirement.
4. An intentional difference within a supported feature belongs in the
   specification's compatibility-difference register.

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
  Stage 1 and FSMPlus; Xstate-fsm-c conformance is governed by Profile 1.
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
