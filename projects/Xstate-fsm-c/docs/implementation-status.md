# Xstate-fsm-c Implementation Status

- Last reviewed: 2026-09-25
- Overall status: M5 Linux and original ESP32 IDF5 build evidence recorded;
  M5 exit gate remains open
- Current milestone: M0 evidence completion and M5 resource evaluation
- Implementation code status: M4 runtime plus build-only M5 instrumentation
  and enforced coordinator stack reserve
- Next gate: original ESP32 IDF5 physical runtime evidence and completion-chain
  measurement

This is the living status dashboard. The stable milestone definitions and exit
criteria are in the [Implementation Plan](implementation-plan.md).

## Current Revisions And Locations

| Item | Current value |
| --- | --- |
| Specification repository | `SimonGAndrews/XState-Espruino-Project` |
| Specification project path | `projects/Xstate-fsm-c/` |
| Current specification version | `0.49` |
| Local specification clone | `/home/simon/XState-Espruino-Project` |
| Implementation repository | [`SimonGAndrews/Espruino`](https://github.com/SimonGAndrews/Espruino) |
| Implementation branch | [`feature/xfsm-profile1`](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1) |
| Local implementation clone | `/home/simon/Espruino-XFSM-Profile1` |
| Official upstream base | `espruino/Espruino` `master` at `84c190da7feb10a976d7ca422be39adaa10fb3c2` |
| Current implementation HEAD | `8794dc1d7` |
| Canonical source path | `libs/xfsm/` |

The branch is two local commits ahead of its tracked remote: the M5 evidence
instrumentation and fork-development CI. The M4 revision was confirmed pushed
before M5 work began.

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
- Two-pass `createMachine` construction emits one exact-sized flat-string arena
  and publishes it only after native validation succeeds.
- Atomic and compound states, nested initial links, exact events, sibling
  targets, named guards and actions, literal context, and property-map
  `assign` compile to resolved Version 1 records.
- The compiled machine owns a private GC-visible retained-value array; source
  configuration mutation cannot alter emitted structural records.
- Construction diagnostics were exercised for required/unknown initial states,
  unknown targets, unresolved actions, invalid context, and cyclic input, with
  category and object-graph path checks.
- Three Espruino construction tests pass with zero retained memory records
  after test cleanup and garbage collection.
- Actor objects use interpreter-owned private brands, a 16-byte native actor
  block, hidden GC-visible ownership, and shared private native prototypes.
- `start`, `send`, `stop`, `getSnapshot`, and `subscribe` execute against M3
  native records without returning to the source configuration.
- Hierarchical initial descent, parent fallback, ordered guards, transition
  domains, re-entry, action ordering, context factories, and ordered
  assignments pass the representative Linux trace.
- Stable hierarchical snapshots, `matches`, snapshot identity rules, ordered
  subscription mutation, unhandled-event notification, controlled stop, and
  callback exception paths pass focused Linux tests.
- Six Espruino tests pass with zero retained memory records after cleanup and
  garbage collection; the disabled build and 66-check sanitizer suite remain
  green.
- Build-only M5 instrumentation measures construction block high-water and
  synchronous coordinator stack without changing normal firmware API or cost.
- Linux firmware size, arena, retained values, construction, actor, snapshot,
  subscription, dispatch, hierarchy, diagnostics, GC, and relocation evidence
  is recorded in the [M5 report](reports/2026-09-25-m5-first-evidence.md).
- A 512-byte coordinator reserve plus Espruino's 512-byte safety allowance is
  enforced before an actor operation marks the actor busy.
- All XFSM sources compile for 32-bit ARM with the pinned MDBT42Q toolchain.
- Clean disabled and XFSM-enabled original ESP32 builds pass with ESP-IDF 5.5.3
  and Xtensa GCC 14.2.0; the enabled image leaves 528,128 app-partition bytes.
- Fork-local XFSM CI covers disabled/enabled Linux builds, six JavaScript test
  suites, 66 native sanitizer checks, and the enabled original ESP32 IDF5
  build without changing any stock board definition.

## Current Work

The Linux part of M5 is measured, but the M5 exit gate is not satisfied. The
stock MDBT42Q release/DFU image passes, while the XFSM-enabled ELF links but
overlaps reserved Storage by 22,176 bytes and fails the target size check. The
original ESP32 IDF5 image now builds with XFSM and has ample flash headroom,
but has not yet run on physical hardware. The M4 slice cannot yet supply
completion-chain timing. M0's full normative requirement inventory also
remains documentation work.

Immediate tasks:

1. establish the product `Board.py` selection for original ESP32 IDF5 without
   changing the stock board definition;
2. run the M5 harness or an equivalent serial harness on original ESP32 IDF5;
3. decide whether a reduced MDBT42Q product configuration is worthwhile;
4. implement the minimum final-state/`onDone` slice needed to measure
   completion chains approaching 256 microsteps;
5. close the native-layout, depth, microstep, stack, snapshot, and diagnostic
   review decisions; and
6. expand the M0 normative requirement inventory.

## Open Issues And Blockers

| Issue | Repository | Effect | Status |
| --- | --- | --- | --- |
| XFSM adds 22,288 flash bytes to an MDBT42Q baseline with only 112 bytes before reserved Storage | Espruino implementation | Enabled ELF overlaps Storage by 22,176 bytes, preventing a valid DFU and runtime measurement | Select a viable target library/Storage budget without changing the stock board build |
| M4 does not implement final-state completion cascades | Espruino implementation | Prevents the required near-256-microstep timing measurement | Implement bounded measurement slice before closing M5 |

## Evidence-Dependent Decisions

These are specified review gates, not unresolved Profile 1 semantics:

| Decision | Required evidence | Review milestone |
| --- | --- | --- |
| Freeze or revise native record layout | Linux evidence supports provisional retention; constrained target still required | M5 open |
| Retain or revise hierarchy depth 32 | Linux retains provisionally; constrained construction RAM still required | M5 open |
| Retain or revise microstep budget 256 | Completion-chain time and watchdog impact | M5 |
| Select per-target stack reserve | Linux selected 512 bytes plus host safety; physical targets pending | M5/M7 |
| Retain or revise snapshot materialization | Lazy snapshots retained provisionally; target RAM pending | M5 open |
| Retain or revise diagnostic detail | Current detail retained provisionally; target flash/RAM pending | M5 open |
| Original ESP32 IDF5 is the primary Xtensa and high-resource target | Selected and build verified; physical evidence pending | M5/M7 |

## Target Status

| Target | Current status | Latest evidence |
| --- | --- | --- |
| Linux Espruino | Build verified | [M5 first-evidence report](reports/2026-09-25-m5-first-evidence.md) |
| Espruino Pico | Not yet verified | None |
| MDBT42Q | Not yet verified | [M5 build attempt](../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json) |
| Original ESP32 IDF5 | Build verified | [Local IDF5 build report](reports/2026-09-25-esp32-idf5-build.md) |
| ESP32-C3 IDF5 | Not yet verified | Stock-build capacity established from upstream Actions; XFSM build pending |
| ESP32-S3 IDF5 | Not yet verified | Later expansion target; not required for Version 1 qualification |

Statuses have the meanings defined in the Profile 1 specification. A successful
build alone can advance a target only to `Build verified`.

## Status History

| Date | Change |
| --- | --- |
| 2026-09-25 | Added fork-development XFSM CI in implementation revision `8794dc1d7` and corrected workflow branch matching from `*` to `**`; local Linux-equivalent build and test commands passed |
| 2026-09-25 | Original ESP32 IDF5 disabled and XFSM-enabled builds passed with Xtensa GCC 14.2.0; XFSM added 27,904 app-image bytes (1.87%) and left 528,128 bytes free |
| 2026-09-25 | Selected original ESP32 IDF5 as the primary high-resource and Xtensa target; ESP32-C3 qualification also standardized on IDF5 and ESP32-S3 IDF5 deferred |
| 2026-09-25 | Corrected MDBT42Q release measurement after target provisioning and removal of inherited `DEBUG=release`: stock DFU passes; XFSM adds 22,288 flash bytes and overlaps reserved Storage by 22,176 bytes |
| 2026-09-25 | Partial M5 evidence committed in implementation revision `de251bd97`; Linux resource/timing/stack/GC measurements passed, 32-bit ARM compiled, MDBT42Q target packaging and completion-chain evidence remain open |
| 2026-09-25 | M4 actor execution vertical slice committed at `c6505437a`; hierarchical runtime, actions, assignments, stable snapshots, subscriptions, fault paths, enabled/disabled builds, GC cleanup, and native sanitizer regression passed |
| 2026-09-25 | M3 construction vertical slice committed at `80d424772`; clean enabled/disabled builds, three Espruino tests, decoded records, diagnostics, source independence, GC cleanup, and the native sanitizer regression passed |
| 2026-09-25 | M2 native-format foundation committed at `d4860d07a`; 66 strict sanitizer checks and enabled/disabled Linux regression builds passed |
| 2026-09-25 | M1 optional-library shell committed at `225e55fba`; Linux disabled/enabled builds and module smoke tests passed |
| 2026-09-25 | Implementation preparation started; clean Espruino fork branch and documentation scaffolds established |
