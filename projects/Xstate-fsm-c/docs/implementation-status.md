# Xstate-fsm-c Implementation Status

- Last reviewed: 2026-09-28
- Overall status: all seven M6 behavioural batches, the post-M6 whole-build
  resource review, and M7.1-M7.3 original-ESP32 integration pass their
  applicable scope; compact compiler metadata removes the maximum-depth
  capacity gap on stock 70 KB original-ESP32 and ESP32-C3 profiles, and C3-C
  wireless-service coexistence passes on the stock C3 profile
- Current milestone: M0 normative requirement inventory and M7 product-profile
  and physical-target qualification
- Implementation code status: M4 runtime plus final/completion behavior, full
  Profile 1 target forms, wildcard event lookup, v4 migration aliases, all
  Profile 1 context and assignment forms, complete transition-domain and
  re-entry traversal, complete lifecycle and subscription behavior, cross-
  actor isolation, host save/restoration/reset behavior, strict schema and
  byte-limit validation, transactional allocation-failure handling, M5
  instrumentation, enforced stack reserve, and physical flash/native callback,
  GPIO, timer-ingress, exact settled-baseline cleanup, shared-machine stress,
  event-serialization, maximum-depth product-profile, and production
  allocation-pressure coverage
- Next gate: complete the original-ESP32 and ESP32-C3 release-candidate
  reruns, then continue M0 traceability and remaining target qualification

This is the living status dashboard. The stable milestone definitions and exit
criteria are in the [Implementation Plan](implementation-plan.md). The [test
inventory](../tests/test-inventory.md) is the consolidated record of completed
and outstanding tests for final project review.

## Current Revisions And Locations

| Item | Current value |
| --- | --- |
| Specification repository | `SimonGAndrews/XState-Espruino-Project` |
| Specification project path | `projects/Xstate-fsm-c/` |
| Current specification version | `0.51` |
| Local specification clone | `/home/simon/XState-Espruino-Project` |
| Project base for this evidence | `4819be0` |
| Implementation repository | [`SimonGAndrews/Espruino`](https://github.com/SimonGAndrews/Espruino) |
| Implementation branch | [`feature/xfsm-profile1`](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1) |
| Local implementation clone | `/home/simon/Espruino-XFSM-Profile1` |
| Official upstream base | `espruino/Espruino` `master` at `84c190da7feb10a976d7ca422be39adaa10fb3c2` |
| Current implementation HEAD | `aded959ad` |
| Canonical source path | `libs/xfsm/` |
| Original ESP32 procedure | [Device testing guide](esp32-device-testing.md) |

The complete M6 implementation is committed through `319adfef5`; post-M6
measurement support and the revised coordinator reserve are committed in
implementation revision `1589218d3`, and the M7.1 physical application fixture
is committed in `21154897f`. The M7.2 production-memory and event-serialization
fixtures are committed in `b7b6d88d7`.
The exact M7.3 hardened compiler, product-profile layer, and physical pressure
fixtures are committed in `8ce408fb5`; their source hashes are retained in the
[M7.3 result](../tests/results/esp32-xtensa/2026-09-27-m7-allocation-profile.json).
The compact compiler state workspace and lazy derived-path implementation are
committed in `cb5d74e89`; their cross-target evidence is in the [compiler
optimization report](reports/2026-09-27-compiler-jsvar-optimization.md).
The C3 physical service fixtures are committed in `aded959ad`; four
consecutive combined-service passes are recorded in the [C3 service-
coexistence report](reports/2026-09-28-m7-esp32-c3-service-coexistence.md).

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
- Twenty-two normal Espruino tests pass on Linux with zero retained memory
  records after cleanup and garbage collection; the disabled build and 66-
  check sanitizer suite remain green.
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
- M7.1 passes twice on the production original-ESP32 image with an identical
  ordered trace: retained outer-scope and closure actions, Storage-backed
  module guard/actions, a native guard, bound native GPIO actions, timer-driven
  synchronous dispatch, subscription publication, exact flash-callback fault
  identity, Storage/module-cache cleanup, and a safe low output all pass.
- M7.2 passes twice with identical production-memory results. Two full
  eight-actor shared-machine graphs, six later construction/cleanup cycles,
  and a faulted graph all return to a 1,819-block settled baseline after the
  first full-path warm-up. A separate timer test observes all 128 synchronous
  sends and 129 publications only after the uninterrupted 666-670 ms loop
  completes, despite its one-millisecond delay.
- M7.3 provisionally selects a full-feature original-ESP32 profile by reducing
  `ESP_HEAP_SIZE` from 70,000 to 65,000 bytes through `SETDEFINES`, without
  changing `ESP32_IDF5.py`. The resulting 3,160-block pool passes the direct
  and Storage-backed depth-32/65-action trace.
- Production construction pressure returns `E_NO_MEMORY` at 501 free blocks,
  cleans to the same settled usage, and retries the identical configuration
  successfully. Diagnostic-path pressure returns
  `XFC E_NO_MEMORY @ createMachine` at 387 free blocks twice without
  accumulation.
- Checked segmented-string copying and complete diagnostic-path preflight now
  prevent the null dereference exposed by an early long-key pressure run. The
  exact hardened source passes 22 normal Linux suites, the private fault suite,
  and all 66 sanitizer checks.
- The same lifecycle/subscriber coverage and complete transition-domain corpus
  pass on the original ESP32. The stock 2,803-block profile failed the
  maximum-depth 65-action fixture, while the selected 3,160-block M7.3 profile
  passes it directly and from flash Storage.
- The subsequent compiler optimization supersedes that provisional product
  profile. Compact GC-owned state records and on-demand derived paths reduce
  the C3 compact depth-32 peak from 2,245 to 1,335 blocks (40.5%). The
  action-heavy depth-32 fixture now passes on stock 70 KB original-ESP32 and
  C3 builds with 1,040 and 1,174 blocks of measured headroom respectively.
  The 65 KB override is retained only as diagnostic history.
- On the stock 70 KB ESP32-C3 profile, four consecutive physical runs retain
  a BLE GATT connection while associating WiFi, completing a controlled TLS
  1.2 HTTPS request, and advancing an XFSM service actor through five external
  events plus a depth-24, 49-action traversal. The lowest observed native heap
  is 40,480 bytes; all runs clean to 460 used JsVars and pass their correlated
  target, peer, endpoint, lifecycle, and Storage-cleanup assertions.
- Build-only M5 instrumentation measures construction block high-water and
  synchronous coordinator stack without changing normal firmware API or cost.
- Linux firmware size, arena, retained values, construction, actor, snapshot,
  subscription, dispatch, hierarchy, diagnostics, GC, and relocation evidence
  is recorded in the [M5 report](reports/2026-09-25-m5-first-evidence.md).
- A 1,024-byte coordinator reserve plus Espruino's 512-byte safety allowance
  is enforced before an actor operation marks the actor busy.
- Strict schema validation rejects unsupported and accessor properties without
  invoking accessors, and construction diagnostic detail is bounded to 48
  bytes at a valid UTF-8 boundary.
- Native symbol, target, event, and runtime limits are enforced using Espruino
  string bytes. Automated Linux boundaries cover hierarchy depth 32/33,
  string length 65,535/65,536 bytes, Unicode byte length, and non-faulting
  rejection of oversized runtime events.
- A separate `XFC_TEST=1` build deterministically exercises construction,
  actor, startup, send, assignment, completion, publication, snapshot, stop,
  and subscription allocation failures. It verifies rollback and exact error
  identity; neither `_failNext` nor measurement helpers exist in production
  firmware.
- Subscriber snapshot materialization now precedes state/context commit, so a
  publication allocation failure faults against the last stable actor state
  and does not call listeners.
- All XFSM sources compile for 32-bit ARM with the pinned MDBT42Q toolchain.
- Initial M5 disabled and XFSM-enabled original ESP32 builds passed with ESP-
  IDF 5.5.3 and Xtensa GCC 14.2.0; that enabled image left 528,128 app-
  partition bytes.
- Matching disabled and XFSM-enabled `PICO_R1_3` reduced-profile builds pass
  with ARM GCC 13.2.1; XFSM adds 23,528 bytes and leaves 16,288 bytes in the
  application region without changing the stock board definition.
- Fork-local XFSM CI covers disabled/enabled Linux builds, twenty-two normal
  JavaScript suites, the private allocation-fault suite, 66 native sanitizer
  checks, and the enabled original ESP32 IDF5 build without changing any stock
  board definition.
- A physical ESP32-D0WD-V3 running the selected `ESP32_IDF5` profile passes all
  nineteen portable JavaScript suites, including the formerly constrained
  depth fixture, plus save/reboot/reset host-lifecycle tests and the M5
  resource, timing, and GC relocation harnesses.
- Post-M6 compact depth-32 construction passed from a clean stock runtime with
  a 4,610-byte arena, a 2,102-block construction peak, and 224 bytes of maximum
  measured coordinator stack. Its sampled peak uses about 87.75% of all 2,799
  blocks, explaining why the larger action-heavy test source can exhaust
  application headroom without making hierarchy depth itself unsupported.
- The original ESP32 USB-UART, Make flashing, direct-runner, reset, evidence,
  and recovery procedure is retained in the project-local
  [device-testing guide](esp32-device-testing.md).
- The production post-M6 ESP32 image builds at 1,523,424 bytes with 524,576
  app-partition bytes free. Its compact strict-validation suite and focused
  runtime, subscription, completion, and lifecycle regressions pass; the full
  desktop-oriented strict-validation source is a reasoned non-run because its
  test harness exhausts the stock 2,803-block JavaScript heap.
- The M7.3 production-profile image builds at 1,523,712 bytes, a 31,744-byte
  or 2.13% increase over the matched disabled reference, and leaves 524,288
  app-partition bytes free.

## Current Work

All seven M6 behavioural batches, the post-M6 resource review, and M7.1-M7.3
original-ESP32 integration are complete. Shared behavior is checked against
pinned XState 4.38.3 and 5.33.2 references; strict native validation,
allocation failures, Espruino GC, save/reset, Storage-backed callbacks, GPIO,
timer integration, and interpreter scheduling have no direct Node XState
equivalent. The resource review retains the current arena, depth, microstep,
lazy-snapshot, and diagnostic designs provisionally and raises the default
stack reserve to 1,024 bytes. The compact compiler workspace now passes the
action-heavy depth-32 fixture on both ESP32 families with their complete
feature sets and stock 70 KB native-heap reserve.

A reduced-profile Pico image passes its size gate, but no physical Pico runtime
evidence has been collected. The optimized stock full-feature ESP32-C3 image
passes compact and action-heavy depth 32, direct and Storage-backed execution,
exact cleanup, GC relocation, event serialization, and four consecutive
combined XFSM, BLE, WiFi, and HTTPS/TLS service runs at the preserved 70 KB
native reserve. The stock MDBT42Q release/DFU image passes,
while the XFSM-enabled ELF links but overlaps reserved Storage by 22,176 bytes
and fails the target size check. M0's full normative requirement inventory
also remains documentation work.

Immediate tasks:

1. expand the M0 normative requirement inventory while
   maintaining the consolidated [test inventory](../tests/test-inventory.md);
2. complete the original-ESP32 M7.4 and ESP32-C3 C3-D release-candidate
   reruns and qualify a
   physical Pico;
3. produce an XFSM memory architecture and lifetime diagram that distinguishes
   firmware/flash, the Espruino JsVar pool, compiled arena and retained values,
   actor storage, native heap, and the single native C stack. Show their use
   during module loading, `createMachine` compilation, `createActor`,
   `start`/`send`/`stop`, guards, actions, assignments, snapshots,
   subscriptions, GC, save/restoration, and cleanup, including which storage is
   persistent, temporary, shared, or application-owned.

## Open Issues And Blockers

| Issue | Repository | Effect | Status |
| --- | --- | --- | --- |
| XFSM adds 22,288 flash bytes to an MDBT42Q baseline with only 112 bytes before reserved Storage | Espruino implementation | Enabled ELF overlaps Storage by 22,176 bytes, preventing a valid DFU and runtime measurement | Select a viable target library/Storage budget without changing the stock board build |

## Evidence-Dependent Decisions

These are specified review gates, not unresolved Profile 1 semantics:

| Decision | Required evidence | Review milestone |
| --- | --- | --- |
| Freeze or revise native record layout | Complete Linux/original-ESP32 review retains Version 1 provisionally; constrained target still required | M7 open |
| Retain or revise hierarchy depth 32 | Retained provisionally: direct and Storage-backed 65-action fixtures pass on stock 70 KB original-ESP32 and ESP32-C3 profiles after compiler optimization | M7 open for remaining targets |
| Retain or revise microstep budget 256 | Retained: Linux and original ESP32 enforce the boundary; current ESP32 observation is 807.461 ms | Closed for represented targets |
| Select per-target stack reserve | Default raised to 1,024 bytes after complete-runtime Linux measured 704 bytes and original ESP32 measured 448 bytes; remaining physical families pending | M7 |
| Retain or revise snapshot materialization | Lazy snapshots retained provisionally after Linux and ESP32 allocation measurement; constrained-target evidence pending | M7 open |
| Retain or revise diagnostic detail | The 48-byte detail budget is retained provisionally after complete Linux and compact ESP32 validation; constrained-target evidence pending | M7 open |
| Original ESP32 IDF5 is the primary Xtensa and high-resource target | Selected; full-feature stock 70 KB profile and M7.1-M7.3 physical slices pass after compiler optimization | M7.4 release-candidate rerun |
| Select ESP32-C3 JsVar/native-heap profile | Stock 70 KB reserve selected; optimized action-heavy depth 32 passes with 1,174 measured blocks of headroom and C3-C combined services pass with a 40,480-byte native-heap minimum | C3-D release-candidate rerun |

## Target Status

| Target | Current status | Latest evidence |
| --- | --- | --- |
| Linux Espruino | Build verified | [Post-M6 resource result](../tests/results/linux/2026-09-27-post-m6-resource-review.json) |
| Espruino Pico | Build verified for reduced product profile | [Pico feasibility build](../tests/results/pico/2026-09-26-feasibility-build.json) |
| MDBT42Q | Not yet verified | [M5 build attempt](../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json) |
| Original ESP32 IDF5 | Build verified; M7.1-M7.3 integration and stock 70 KB compact/action-heavy depth, Storage-backed execution, exact cleanup, GC and serialization pass; M7.4 pending | [Compiler optimization result](../tests/results/esp32-xtensa/2026-09-27-compiler-jsvar-optimization.json) |
| ESP32-C3 IDF5 | Build verified; optimized stock 70 KB profile passes compact/action-heavy depth, Storage-backed execution, exact cleanup, GC, serialization, and C3-C combined XFSM/BLE/WiFi/TLS service qualification; C3-D pending | [C3 service-coexistence result](../tests/results/esp32-riscv/2026-09-28-m7-service-coexistence.json) |
| ESP32-S3 IDF5 | Not yet verified | Later expansion target; not required for Version 1 qualification |

Statuses have the meanings defined in the Profile 1 specification. A successful
build alone can advance a target only to `Build verified`.

## Status History

| Date | Change |
| --- | --- |
| 2026-09-28 | Specification 0.51 clarifies that structural maxima are not memory reservations for arbitrary combinations, retains depth 32, distinguishes valid-shape `E_NO_MEMORY` from `E_LIMIT_EXCEEDED`, and requires the canonical depth-32/65-action fixture for a target's Conformance verified claim |
| 2026-09-28 | C3-C passed four consecutive stock-profile combined runs: XFSM coordinated BLE GATT, WiFi association and TLS 1.2 HTTPS while exercising a depth-24, 49-action transition; minimum native heap was 40,480 bytes and every run passed correlated target, peer, endpoint and cleanup checks |
| 2026-09-27 | Compact GC-owned state metadata and on-demand derived paths reduced the C3 compact depth-32 compiler peak by 910 blocks (40.5%); stock 70 KB original-ESP32 and C3 builds now pass direct and Storage-backed action-heavy depth 32 with 37-39% measured JsVar headroom, so the 65 KB override is no longer selected |
| 2026-09-27 | Instrumented stock-profile ESP32-C3 measurement found a 2,245-block compiler peak for the compact depth-32 model and an action-heavy pass/fail boundary between depths 30 and 31; the resulting trade study recommends compiler metadata reduction before any Profile 1 limit reduction |
| 2026-09-27 | Initial physical ESP32-C3 baseline passed representative runtime, exact cleanup, GC and serialization checks; stock 70 KB profile failed maximum-depth construction, while a diagnostic 65 KB reserve raised the pool from 3,016 to 3,402 blocks and passed both direct and Storage-backed depth fixtures; retaining 70 KB and reducing XFSM's peak JsVar demand is preferred |
| 2026-09-27 | Stock full-feature ESP32-C3 IDF5 disabled and XFSM-enabled builds passed with RISC-V GCC 14.2.0; XFSM adds 35,024 app-image bytes (2.09%) and leaves 334,736 bytes in the generated app partition, advancing the target to Build verified |
| 2026-09-27 | M7.3 selected the provisional full-feature original-ESP32 3,160-block profile; direct and Storage-backed depth-32/65-action execution, production failure/retry, diagnostic fallback, 22 Linux suites, fault injection, and 66 sanitizer checks passed |
| 2026-09-27 | M7.2 original-ESP32 memory lifecycle and event serialization passed twice: shared, repeated and faulted graphs return exactly to the settled production baseline, and queued timer work waits for 128 synchronous sends and publications |
| 2026-09-27 | M7.1 original-ESP32 application integration passed twice with retained outer-scope, closure, flash-backed and native callbacks, GPIO output/readback, timer-driven dispatch, exact callback-fault rollback, and safe Storage/cache/pin cleanup |
| 2026-09-27 | Post-M6 whole-build review measured matched Linux and original ESP32 production images, complete-engine allocations, native heap, depth-32 headroom, completion timing, stack and test loading; retained the current designs provisionally and raised the coordinator reserve to 1,024 bytes |
| 2026-09-27 | M6 batch 7 passed twenty-two normal Linux suites, deterministic allocation-fault coverage, production/test API separation, disabled/enabled builds, and 66 sanitizer checks; the production ESP32 image passed compact strict validation plus focused runtime regressions |
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
