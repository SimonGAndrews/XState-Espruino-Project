# Xstate-fsm-c Implementation Status

- Last reviewed: 2026-09-27
- Overall status: M6 batches 1 through 6 pass their applicable Linux and
  original ESP32 coverage, including cross-actor nesting and physical save,
  reboot restoration, and reset; the stock ESP32 profile cannot construct the
  depth-32/65-action fixture, while the M5 constrained-target gate remains open
- Current milestone: M6 complete Profile 1 behaviour, with M0/M5 evidence work
  continuing alongside it
- Implementation code status: M4 runtime plus final/completion behavior, full
  Profile 1 target forms, wildcard event lookup, v4 migration aliases, all
  Profile 1 context and assignment forms, complete transition-domain and
  re-entry traversal, complete lifecycle and subscription behavior, cross-
  actor isolation, host save/restoration/reset behavior, M5 instrumentation,
  and enforced stack reserve
- Next gate: M6 batch 7 strict validation, diagnostics, limits, and
  deterministic fault injection; the whole-build resource review follows the
  completed M6 behavior gate

This is the living status dashboard. The stable milestone definitions and exit
criteria are in the [Implementation Plan](implementation-plan.md). The [test
inventory](../tests/test-inventory.md) is the consolidated record of completed
and outstanding tests for final project review.

## Current Revisions And Locations

| Item | Current value |
| --- | --- |
| Specification repository | `SimonGAndrews/XState-Espruino-Project` |
| Specification project path | `projects/Xstate-fsm-c/` |
| Current specification version | `0.50` |
| Local specification clone | `/home/simon/XState-Espruino-Project` |
| Current project HEAD | `f7fe0f321` plus the M6 evidence working tree |
| Implementation repository | [`SimonGAndrews/Espruino`](https://github.com/SimonGAndrews/Espruino) |
| Implementation branch | [`feature/xfsm-profile1`](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1) |
| Local implementation clone | `/home/simon/Espruino-XFSM-Profile1` |
| Official upstream base | `espruino/Espruino` `master` at `84c190da7feb10a976d7ca422be39adaa10fb3c2` |
| Current implementation HEAD | `2b31e01c0` |
| Canonical source path | `libs/xfsm/` |
| Original ESP32 procedure | [Device testing guide](esp32-device-testing.md) |

M6 lifecycle, subscriber, cross-actor, GC, and host-lifecycle work is committed
in implementation revision `2b31e01c0`.

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
- Nineteen Espruino tests pass on Linux with zero retained memory records after
  cleanup and garbage collection; the disabled build and 66-check sanitizer
  suite remain green.
- Final states, compound `onDone`, XState v5 completion-event spelling,
  targetless completion, terminal `done`, completion ordering, and stable-only
  publication pass the pinned Node differential and focused semantic tests.
- The 256th microstep completes and an attempted 257th faults before its
  actions, retaining the last stable state and context.
- Bare exact and segmented targets, dot-relative descendants, explicit and
  implicit effective IDs, escaped punctuation, and ambiguity detection pass
  focused construction and runtime tests.
- Exact event candidates fall through to full wildcard candidates after guard
  rejection, forbidden transitions block wildcard and parent fallback, and
  event lookup verifies length and bytes after its one-per-send hash.
- The `cond` and `internal` aliases, inert true v4 ordering flags, and empty
  compatibility maps pass against pinned XState 4.38.3 behavior; conflicts and
  unsupported nonempty maps reject with stable diagnostics.
- Pinned XState 5.33.2 traces also cover shared hierarchy, wildcard,
  forbidden-transition, targetless, and self-transition behavior.
- Omitted, literal, and factory contexts now pass their startup timing,
  ownership, shared-template, stopped-before-start, and actor-isolation cases.
- Partial-function, property-map, fixed-value, and empty assignments pass in
  entry, exit, initial, event, and completion action positions with ordered
  visibility, shallow identity, source-map independence, and rollback.
- Invalid context and assignment forms, invalid factory and partial results,
  accessor maps, and callback exceptions pass their category, path, exact
  thrown-value, no-entry, and last-stable-context checks.
- Pinned XState 5.33.2 confirms the shared context and assignment semantics;
  its context factory runs during `createActor`, while Profile 1 intentionally
  defers that call to first `start` to avoid pre-start MCU allocation.
- Sixteen transition-domain cases and a depth-32, 65-action traversal match
  pinned XState 5.33.2, covering targetless, forbidden, self, descendant,
  ancestor, sibling, root, cross-branch, and nested-initial boundaries.
- The complete lifecycle-state matrix, busy-call precedence, guard/action/
  entry/exit fault rollback, exact thrown-value retention, exactly-one-callable
  subscription contract, deterministic listener mutation, listener-error
  continuation, and terminal cleanup pass focused Linux tests.
- Nested operations on a different actor pass from guards, assignment
  expressions, actions, and listeners. Independent commits survive a later
  outer fault, inner exceptions propagate with exact identity, and the broader
  retained graph survives GC relocation on Linux and original ESP32.
- On the original ESP32, a `save()` requested from each specified callback
  boundary captured only the stable result after the operation. A physical
  reboot restored not-started, active, done, stopped, and faulted actors,
  cached snapshots, callbacks, context, subscriptions, and compiled machines
  without replaying entry/exit actions or notifications; `reset(true)` erased
  the image without stopping actors or running exit actions.
- The same lifecycle/subscriber coverage and complete transition-domain corpus
  pass on the original ESP32. The maximum-depth 65-action fixture instead
  reports `E_NO_MEMORY` during `createMachine` after a clean hardware reboot;
  the stock profile exposes 2,803 14-byte JsVar blocks.
- Build-only M5 instrumentation measures construction block high-water and
  synchronous coordinator stack without changing normal firmware API or cost.
- Linux firmware size, arena, retained values, construction, actor, snapshot,
  subscription, dispatch, hierarchy, diagnostics, GC, and relocation evidence
  is recorded in the [M5 report](reports/2026-09-25-m5-first-evidence.md).
- A 768-byte coordinator reserve plus Espruino's 512-byte safety allowance is
  enforced before an actor operation marks the actor busy.
- All XFSM sources compile for 32-bit ARM with the pinned MDBT42Q toolchain.
- Clean disabled and XFSM-enabled original ESP32 builds pass with ESP-IDF 5.5.3
  and Xtensa GCC 14.2.0; the enabled image leaves 528,128 app-partition bytes.
- Matching disabled and XFSM-enabled `PICO_R1_3` reduced-profile builds pass
  with ARM GCC 13.2.1; XFSM adds 23,528 bytes and leaves 16,288 bytes in the
  application region without changing the stock board definition.
- Fork-local XFSM CI covers disabled/enabled Linux builds, nineteen JavaScript
  test suites, 66 native sanitizer checks, and the enabled original ESP32 IDF5
  build without changing any stock board definition.
- A physical ESP32-D0WD-V3 running the `ESP32_IDF5` build passes eighteen of
  nineteen portable JavaScript suites plus save/reboot/reset host-lifecycle
  tests and the M5 resource, timing, and GC relocation harnesses. The remaining
  portable suite is the separately recorded stock-profile depth fixture.
- Physical depth-32 construction passed from a clean runtime with a 4,393-byte
  arena, a 2,062-block construction peak, and 224 bytes of maximum measured
  coordinator stack; a later depth-32 construction after smaller measurements
  exposed the documented contiguous-allocation and application-headroom limit.
- The original ESP32 USB-UART, Make flashing, direct-runner, reset, evidence,
  and recovery procedure is retained in the project-local
  [device-testing guide](esp32-device-testing.md).

## Current Work

M6 batches 1 through 6 are implemented. Batches 1, 2, 4, 5, and 6 pass on
Linux and the original ESP32. Batch 3's transition-domain cases pass on both,
while its depth-32/65-action fixture passes on Linux and fails construction on
the stock ESP32 profile for lack of JsVar memory. Shared behavior is checked
against pinned XState 4.38.3 and 5.33.2 references; host-specific save, reset,
and GC behavior has no direct Node XState equivalent.
The M5 exit gate is not satisfied. A reduced-profile Pico image passes its size
gate, but no physical Pico runtime evidence has been collected. The stock
MDBT42Q release/DFU image passes, while the XFSM-enabled ELF links but overlaps
reserved Storage by 22,176 bytes and fails the target size check. M0's full
normative requirement inventory also remains documentation work.

Immediate tasks:

1. implement M6 batch 7 strict validation, diagnostics, limits, and
   deterministic fault injection;
2. expand the M0 normative requirement inventory alongside M6 while
   maintaining the consolidated [test inventory](../tests/test-inventory.md);
3. after the M6 behavior exit gate, perform the whole-build resource review,
   including the ESP32 JsVar/native-heap balance and depth-32/65-action result;
   and
4. use that review to select product `Board.py` profiles, close the provisional
   layout/depth/stack/snapshot/diagnostic decisions, and plan M7 qualification.

## Open Issues And Blockers

| Issue | Repository | Effect | Status |
| --- | --- | --- | --- |
| XFSM adds 22,288 flash bytes to an MDBT42Q baseline with only 112 bytes before reserved Storage | Espruino implementation | Enabled ELF overlaps Storage by 22,176 bytes, preventing a valid DFU and runtime measurement | Select a viable target library/Storage budget without changing the stock board build |

## Evidence-Dependent Decisions

These are specified review gates, not unresolved Profile 1 semantics:

| Decision | Required evidence | Review milestone |
| --- | --- | --- |
| Freeze or revise native record layout | Linux evidence supports provisional retention; constrained target still required | M5 open |
| Retain or revise hierarchy depth 32 | ESP32 passes from a clean runtime but uses 2,062 of 2,800 blocks and is allocation-order sensitive; constrained evidence remains required | M5 open |
| Retain or revise microstep budget 256 | Retained: Linux and original ESP32 enforce the boundary; the ESP32 median 256-step chain is 763.553 ms | M5 closed for represented targets |
| Select per-target stack reserve | Default raised to 768 bytes after Linux measured 672 bytes and original ESP32 measured 448 bytes; remaining physical families pending | M5/M7 |
| Retain or revise snapshot materialization | Lazy snapshots retained provisionally; ESP32 measured and constrained-target RAM pending | M5 open |
| Retain or revise diagnostic detail | Current detail retained provisionally; ESP32 measured and constrained-target RAM pending | M5 open |
| Original ESP32 IDF5 is the primary Xtensa and high-resource target | Selected, build verified, and physically exercised for the implemented M4/M5 slice | M5/M7 |

## Target Status

| Target | Current status | Latest evidence |
| --- | --- | --- |
| Linux Espruino | Build verified | [M6 host-lifecycle result](../tests/results/linux/2026-09-27-m6-host-lifecycle.json) |
| Espruino Pico | Build verified for reduced product profile | [Pico feasibility build](../tests/results/pico/2026-09-26-feasibility-build.json) |
| MDBT42Q | Not yet verified | [M5 build attempt](../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json) |
| Original ESP32 IDF5 | Build verified; eighteen portable suites and the host-lifecycle tests pass; depth-32/65-action construction fails for stock-profile memory | [M6 host-lifecycle result](../tests/results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) |
| ESP32-C3 IDF5 | Not yet verified | Stock-build capacity established from upstream Actions; XFSM build pending |
| ESP32-S3 IDF5 | Not yet verified | Later expansion target; not required for Version 1 qualification |

Statuses have the meanings defined in the Profile 1 specification. A successful
build alone can advance a target only to `Build verified`.

## Status History

| Date | Change |
| --- | --- |
| 2026-09-27 | M6 batch 6 passed a nineteen-suite Linux regression plus physical original ESP32 cross-actor/GC, deferred-save, hard-reboot restoration, lifecycle-state retention, and reset-without-exit tests |
| 2026-09-27 | Original ESP32 passed transition-domain, complete lifecycle/fault, and subscriber suites; the depth-32/65-action fixture reproducibly failed clean-boot construction with `E_NO_MEMORY` on the stock 2,803-block runtime, leaving target status at Build verified pending a product `Board.py` memory decision |
| 2026-09-27 | Complete lifecycle-state, callback-fault, busy-call, and subscriber behavior passed an eighteen-suite Linux regression, the 66-check sanitizer suite, and pinned XState 4.38.3/5.33.2 references; current ESP32 IDF5 image builds with a 30,304-byte (2.03%) delta |
| 2026-09-27 | M6 batch 3 transition-domain, re-entry, nested-initial, and depth-32 traces passed sixteen-suite Linux regression, the 66-check sanitizer suite, and pinned XState 5.33.2 differential |
| 2026-09-26 | M6 batch 2 omitted/literal/factory context ownership, all assignment forms and locations, actor isolation, strict diagnostics, and transactional rollback passed fourteen-suite Linux and physical original ESP32 regressions plus the pinned XState 5.33.2 context/assignment reference |
| 2026-09-26 | M6 batch 1 target forms, escaped paths, effective IDs, wildcard event selection, collision-safe lookup, v4 aliases, and strict diagnostics passed eleven-suite Linux and physical original ESP32 regressions plus pinned XState 4.38.3/5.33.2 references |
| 2026-09-26 | Reduced-profile Pico disabled/enabled builds passed; XFSM adds 23,528 bytes and leaves 16,288 bytes in the application region, advancing that explicit configuration to Build verified |
| 2026-09-26 | Final-state and `onDone` execution, stable completion cascades, terminal `done`, and the 256/257 microstep boundary passed on Linux and physical original ESP32; the default coordinator reserve increased to 768 bytes |
| 2026-09-25 | Added the project-local original ESP32 device-testing procedure derived from the successful physical M5 workflow |
| 2026-09-25 | Physical original ESP32 IDF5 passed the six M4 JavaScript suites, M5 runtime measurements, depth-32 construction from a clean runtime, stack instrumentation, and GC relocation; allocation-order sensitivity was recorded |
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
