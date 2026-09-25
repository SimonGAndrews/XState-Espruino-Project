# Xstate-fsm-c Implementation Status

- Last reviewed: 2026-09-25
- Overall status: Implementation preparation
- Current milestone: M0 - repository and evidence foundation
- Implementation code status: Not started
- Next gate: Reproducible Linux Espruino baseline build

This is the living status dashboard. The stable milestone definitions and exit
criteria are in the [Implementation Plan](implementation-plan.md).

## Current Revisions And Locations

| Item | Current value |
| --- | --- |
| Specification repository | `SimonGAndrews/XState-Espruino-Project` |
| Specification project path | `projects/Xstate-fsm-c/` |
| Current specification version | `0.48` |
| Local specification clone | `/home/simon/XState-Espruino-Project` |
| Implementation repository | [`SimonGAndrews/Espruino`](https://github.com/SimonGAndrews/Espruino) |
| Implementation branch | [`feature/xfsm-profile1`](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1) |
| Local implementation clone | `/home/simon/Espruino-XFSM-Profile1` |
| Official upstream base | `espruino/Espruino` `master` at `84c190da7feb10a976d7ca422be39adaa10fb3c2` |
| Current implementation HEAD | `84c190da7feb10a976d7ca422be39adaa10fb3c2` |
| Planned canonical source path | `libs/xfsm/` |

The branch currently equals its upstream base and contains no XFSM
implementation files.

## Completed Foundation Work

- Profile 1 specification promoted to implementation candidate.
- Native Format Version 1 defined provisionally for the first vertical slice.
- Licensing, contribution, and third-party provenance rules recorded.
- Public module and build identity fixed as `XFSM` and `USE_XFSM`.
- Fresh Espruino clone created without reusing an existing local checkout.
- `feature/xfsm-profile1` created from official upstream `master` and pushed to
  the fork.
- Fork `master`, official `upstream/master`, and the feature branch confirmed at
  the same initial commit.
- Implementation plan, build-guide, status, report, result, and conformance
  scaffolds created.

## Current Work

Milestone M0 is establishing reproducible build and evidence mechanics before
native implementation begins.

Immediate tasks:

1. verify and record the clean Linux Espruino baseline build;
2. create the initial requirement inventory in the conformance matrix;
3. pin and scaffold the Node XState v5.33.2 differential runner;
4. create the `libs/xfsm/` library shell on the Espruino feature branch;
5. add generated-wrapper and `USE_XFSM` build selection stubs; and
6. capture the first enabled-versus-disabled build record.

## Open Issues And Blockers

No implementation blocker is currently recorded. Detailed work items and bugs
should live in the relevant GitHub repository and be linked here when they
affect the current milestone or a review gate.

| Issue | Repository | Effect | Status |
| --- | --- | --- | --- |
| None recorded | - | - | - |

## Evidence-Dependent Decisions

These are specified review gates, not unresolved Profile 1 semantics:

| Decision | Required evidence | Review milestone |
| --- | --- | --- |
| Freeze or revise native record layout | Arena decoding, memory, alignment, and target builds | M5 |
| Retain or revise hierarchy depth 32 | Stack, RAM, and traversal timing at representative depths | M5 |
| Retain or revise microstep budget 256 | Completion-chain time and watchdog impact | M5 |
| Select per-target stack reserve | Maximum coordinator-frame measurement | M5/M7 |
| Retain or revise snapshot materialization | Variable-block and timing measurements | M5 |
| Retain or revise diagnostic detail | Flash, RAM, and deep-path formatting measurements | M5 |
| Select Xtensa qualification target | Hardware and supported build availability | Before M7 |

## Target Status

| Target | Current status | Latest evidence |
| --- | --- | --- |
| Linux Espruino | Not yet verified | Baseline build pending |
| Espruino Pico | Not yet verified | None |
| MDBT42Q | Not yet verified | None |
| ESP32-C3 | Not yet verified | None |
| Xtensa ESP32 target | Not yet verified | Target not yet selected |

Statuses have the meanings defined in the Profile 1 specification. A successful
build alone can advance a target only to `Build verified`.

## Status History

| Date | Change |
| --- | --- |
| 2026-09-25 | Implementation preparation started; clean Espruino fork branch and documentation scaffolds established |
