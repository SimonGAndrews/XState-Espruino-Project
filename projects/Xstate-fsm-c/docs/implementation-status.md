# Xstate-fsm-c Implementation Status

- Last reviewed: 2026-09-25
- Overall status: M2 native-format foundation verified on Linux
- Current milestone: M0 evidence completion and M3 construction
- Implementation code status: Build integration, controlled API stubs, and
  portable native-format foundation
- Next gate: Transactional construction vertical slice

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
| Current implementation HEAD | `d4860d07a93a725176f6216321b3d47f2d0a14cf` |
| Canonical source path | `libs/xfsm/` |

The branch is one local commit ahead of its tracked remote. The M1 branch push
was confirmed on 2026-09-25; the M2 implementation commit has not been pushed.

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
- Clean Linux Espruino baseline built and recorded.
- Node differential environment pinned and verified at `xstate@5.33.2`.
- `libs/xfsm/` library shell, `USE_XFSM` selection, and generated wrapper added.
- Disabled and enabled Linux builds and JavaScript module smoke tests passed.
- Initial library-shell size delta recorded without treating it as a completed
  engine estimate.
- Version 1 structures, compile-time layout assertions, checked arithmetic,
  FNV-1a lookup support, and arena and actor-block validators implemented.
- Sixty-six portable native-format checks passed with address and
  undefined-behaviour sanitizers.
- Native-format coverage includes all context kinds, handler forms, required
  transition-domain shapes, action-range forms, and corrupt-record rejection.

## Current Work

The M2 native-format exit gate is satisfied on Linux. M0's full normative
requirement inventory remains documentation work; the next code work is the M3
transactional machine-construction vertical slice.

Immediate tasks:

1. expand the conformance matrix into the initial normative requirement
   inventory;
2. define the M3 representative hierarchical fixture and expected decoded
   records;
3. implement the two-pass `createMachine` compiler and exact arena allocation;
4. add the GC-visible retained-value container and transactional cleanup;
5. implement the M3 supported grammar, resolution, and construction
   diagnostics; and
6. push the reviewed Espruino and umbrella commits when requested.

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
| Linux Espruino | Build verified | [M2 native-format report](reports/2026-09-25-linux-native-format.md) |
| Espruino Pico | Not yet verified | None |
| MDBT42Q | Not yet verified | None |
| ESP32-C3 | Not yet verified | None |
| Xtensa ESP32 target | Not yet verified | Target not yet selected |

Statuses have the meanings defined in the Profile 1 specification. A successful
build alone can advance a target only to `Build verified`.

## Status History

| Date | Change |
| --- | --- |
| 2026-09-25 | M2 native-format foundation committed at `d4860d07a`; 66 strict sanitizer checks and enabled/disabled Linux regression builds passed |
| 2026-09-25 | M1 optional-library shell committed at `225e55fba`; Linux disabled/enabled builds and module smoke tests passed |
| 2026-09-25 | Implementation preparation started; clean Espruino fork branch and documentation scaffolds established |
