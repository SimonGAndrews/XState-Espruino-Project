# Xstate-fsm-c Implementation Plan

## Status

- Plan status: M0 evidence foundation and normative traceability, M6 behavior,
  post-M6 resource review, original-ESP32 M7.1-M7.4, stock-profile ESP32
  compiler-capacity optimization, ESP32-C3 C3-A through C3-D qualification,
  and the first three grouped M8 public/configuration, runtime-contract, and
  structural-contract closure packages complete
- Current milestone: M7 remaining product-profile qualification and M8
  conformance-case closure and release readiness
- Normative authority: [Profile 1 specification](specification.md)
- Physical format: [Native Format Version 1](native-format-v1.md)
- Living progress: [Implementation Status](implementation-status.md)

This plan defines implementation order, deliverables, and review gates. It does
not change Profile 1 behaviour. A conflict is resolved in favour of the
specification.

## Repository Ownership

Xstate-fsm-c uses two repositories with no duplicated implementation source:

| Responsibility | Repository and location |
| --- | --- |
| Specification, plan, status, conformance cases, differential runners, results, and reports | `XState-Espruino-Project/projects/Xstate-fsm-c/` |
| Canonical C engine, Espruino wrapper, build integration, and upstream-suitable implementation tests | [`SimonGAndrews/Espruino`, branch `feature/xfsm-profile1`](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1), under `libs/xfsm/` and the necessary Espruino build files |

The current local implementation clone is
`/home/simon/Espruino-XFSM-Profile1`. Machine-specific paths are recorded in
[Building Xstate-fsm-c](building.md), not embedded in source or tests.

## Working Rules

1. Add or identify conformance evidence for a behaviour before or with its
   implementation.
2. Keep the portable C99 engine separate from Espruino-specific `JsVar` and
   wrapper operations.
3. Use the Version 1 arena layout from the first executable slice; do not build
   a disposable execution representation first.
4. Keep persistent ownership visible to Espruino's garbage collector and keep
   persistent native records pointer-free.
5. Do not copy behaviour from FSMPlus, XState, SCXML, or an earlier XFSM
   implementation without reviewing it against Profile 1.
6. Record an evidence-driven specification or native-format revision rather
   than silently deviating in code.
7. Keep implementation commits small enough to associate with conformance
   cases and build evidence.

## Milestones

### M0 - Repository And Evidence Foundation

Deliverables:

- clean Espruino fork branch based on a recorded official upstream commit;
- documented local and remote development locations;
- reproducible Linux build instructions;
- implementation-status dashboard;
- conformance-matrix structure and stable case-ID convention;
- complete normative-requirement registry and bidirectional evidence mapping;
- pinned Node XState v5.33.2 primary reference and v4.38.3 secondary reference;
  and
- baseline Espruino Linux build without XFSM.

Exit gate: another developer can obtain both repositories, reproduce the
baseline build, trace every applicable normative requirement to evidence or an
explicit planned case, and identify the next implementation task without
requiring thread history.

### M1 - Espruino Library Shell

Deliverables:

- `libs/xfsm/` source area with MPL-2.0 source notices;
- `XFSM` build-library identity and `USE_XFSM` selection;
- generated-wrapper declaration for `require("XFSM")`;
- public `createMachine`, `createActor`, and `assign` names present as initial
  controlled stubs;
- Linux firmware builds both with and without XFSM; and
- attributed initial firmware-size delta.

Exit gate: the optional library builds through Espruino's normal mechanism and
the JavaScript module surface can be smoke-tested without adding an alternative
loader or build system.

### M2 - Native Format Foundation

Deliverables:

- Version 1 structures and compile-time size and offset assertions;
- checked arithmetic, range, alignment, byte-order, and string-pool helpers;
- FNV-1a symbol hashing with exact-byte collision comparison;
- arena and actor-block validators; and
- Linux host tests for valid, boundary, malformed, and corrupted records under
  address and undefined-behaviour sanitizers.

Exit gate: native-format tests pass independently of JavaScript state-machine
behaviour and no tested malformed arena reaches unsafe access.

### M3 - Construction Vertical Slice

Deliverables:

- two-pass `createMachine` compiler;
- exact-sized flat-string arena allocation;
- retained JavaScript value container owned by the compiled machine;
- atomic and compound states, nested initial descent, exact events, sibling
  targets, one guard form, user actions, literal context, and `assign`;
- resolved state, parent, initial, target, action, and callback indexes; and
- categorized construction diagnostics with object-graph paths for the slice.

Exit gate: a representative hierarchical definition compiles transactionally,
can be decoded into the expected arena records, and releases all temporary
resources on tested failures.

### M4 - Actor Execution Vertical Slice

Deliverables:

- actor allocation and branding;
- `start`, `send`, `getSnapshot`, `subscribe`, and the necessary controlled
  `stop` path;
- initial descent, parent fallback, ordered guard candidates, transition-domain
  traversal, and exit-transition-entry ordering;
- JavaScript actions and ordered context assignment;
- stable snapshot publication and subscriber notification; and
- callback-exception handling for the representative slice.

The representative machine must be hierarchical and must exercise actions,
context, and the JavaScript/native callback boundary. A flat state-index change
alone is not an acceptable vertical slice.

Exit gate: reviewed Profile 1 traces pass on Linux Espruino for the slice and
the engine performs structural dispatch from native records rather than the
source configuration.

### M5 - First Vertical-Slice Evidence Gate

Measure and report:

- enabled-versus-disabled firmware size;
- arena bytes, retained-value count, and construction peak memory;
- per-actor, first-snapshot, and first-subscription cost;
- local-hit, parent-fallback, guarded, and unhandled dispatch timing;
- maximum coordinator stack and required reserve;
- hierarchy traversal at representative depths;
- completion chains approaching the microstep budget;
- diagnostic formatting cost; and
- GC ownership and relocation behaviour.

Linux Espruino is assessed first. MDBT42Q supplies early constrained-RAM
evidence; final resource and target-profile decisions are deferred until the
complete Profile 1 behavior is implemented.

Review gate: explicitly retain or revise the native layout, hierarchy depth
`32`, microstep budget `256`, stack reserve, snapshot strategy, retained-value
ownership, and diagnostic detail. Update the specification and native-format
document when evidence changes a requirement.

### M6 - Complete Profile 1 Behaviour

Complete the remaining implementation in reviewed behavioural batches:

1. target forms, explicit IDs, escaped paths, wildcard events, and migration
   aliases;
2. all context initialization and assignment forms and actor isolation;
3. targetless, forbidden, re-entering, ancestor, descendant, sibling, and
   cross-branch transitions;
4. final states, `onDone`, and completion cascades;
5. complete lifecycle, fault, busy-actor, and subscriber behaviour;
6. save, restoration, reset, GC, and nested calls between different actors;
   and
7. complete strict validation, diagnostics, limits, and deterministic
   fault-injection paths.

Exit gate: the complete applicable Linux semantic, validation, native-format,
fault, diagnostic, and differential suites pass.

Exit-gate status: satisfied for M6 in implementation revision `319adfef5`.
Twenty-two normal Linux JavaScript suites, the separate deterministic fault-
injection suite, and the 66-check native sanitizer suite pass. The continuing
M5 resource decisions and M7 physical-target work are not part of this
behavioural exit gate and remain open. M0 traceability is complete.

After the M6 behavior exit gate, perform a whole-build resource review before
changing target profiles or beginning final physical qualification. Review
flash, JsVar and native-heap use, construction peaks, persistent arena and
binding storage, actor/runtime allocation, coordinator stack, diagnostic cost,
and test-loading overhead against matched enabled and disabled builds. The
stock ESP32 depth-32/65-action construction failure is an input to this review.
Any optimization must preserve the completed Profile 1 behavior and rerun its
full regression suite before it is accepted.

Review status: satisfied in implementation revision `1589218d3`. Matched
Linux and original ESP32 production builds, complete-engine RAM and stack
measurements, compact depth-32 construction, the completion boundary, and
test-loading overhead are recorded in the [post-M6 resource
report](reports/2026-09-27-post-m6-resource-review.md). The review retains the
current record, depth, microstep, snapshot, and diagnostic designs
provisionally, raises the default coordinator reserve to 1,024 bytes, and
passes the remaining product-profile and target-specific decisions to M7.

### M7 - Physical Target Qualification

Qualify, separately:

- Espruino Pico;
- MDBT42Q;
- ESP32-C3 with ESP-IDF 5; and
- original ESP32 with ESP-IDF 5 as the primary Xtensa and high-resource
  physical target.

ESP32-S3 with ESP-IDF 5 is a later expansion target once its Espruino test
maturity is sufficient; it is not required to close the Version 1 target
matrix.

Each target must be reported only as `Not yet verified`, `Build verified`, or
`Conformance verified` under the specification's criteria. Shared CPU families
do not substitute for target-specific evidence.

M7.1 original-ESP32 application integration passed with production engine
source `1589218d3` and the physical fixture committed at `21154897f` under
`libs/xfsm/tests/test_host_application.js`. The retained outer-scope, closure,
flash-backed module and native callback cases, representative GPIO output,
timer-driven event ingress, flash-callback exception, and safe cleanup are
recorded in the [M7.1 report](reports/2026-09-27-m7-original-esp32-application-integration.md).
At that checkpoint the target remained `Build verified`, pending its remaining
product-profile, allocation/cleanup, and release-candidate evidence.

M7.2 original-ESP32 memory lifecycle and event serialization also pass. Two
complete eight-actor shared-machine graphs, six repeated construction and
cleanup cycles, and a faulted graph return exactly to the warmed production
baseline; a queued timer observes the fully published result only after 128
synchronous sends finish. See the [M7.2 report](reports/2026-09-27-m7-original-esp32-memory-serialization.md).

M7.3 provisionally selects the original-ESP32 XFSM product profile without
changing the stock board file or removing features. A `SETDEFINES` layer
changes `ESP_HEAP_SIZE` from 70,000 to 65,000 bytes, increasing the pool from
2,803 to 3,160 14-byte JsVar blocks. The depth-32/65-action trace passes both
directly and from flash `Storage`; production allocation failure, cleanup and
same-configuration retry pass; and diagnostic-path pressure returns the
compact fallback without accumulating allocation. See the [M7.3
report](reports/2026-09-27-m7-original-esp32-allocation-profile.md).

The compiler-capacity follow-up supersedes the provisional 65 KB product
selection. At revision `cb5d74e89`, compact GC-owned state metadata and
on-demand derived paths allow the direct and Storage-backed depth-32/65-action
fixtures to pass on the stock 70 KB original-ESP32 profile with 1,040 measured
blocks of construction headroom. The override remains a diagnostic artifact,
not the selected product profile. See the [compiler optimization
report](reports/2026-09-27-compiler-jsvar-optimization.md).

M7.4 passes at implementation revision `c25a1c32d`: clean matched builds, all
20 embedded-applicable portable suites, deterministic physical allocation
faults, direct and Storage-backed maximum depth, cleanup, host integration,
save/restoration, and combined XFSM/BLE/WiFi/TLS service coexistence pass on
the stock 70 KB profile. Original ESP32 IDF5 advances to `Conformance
verified`. See the [M7.4 release-candidate
report](reports/2026-09-28-m7-original-esp32-release-candidate.md).

ESP32-C3 follows its own qualification track so the classic ESP32 memory
profile is not assumed to suit the RISC-V target:

1. **C3-A, build feasibility:** make clean, matched XFSM-disabled and enabled
   stock `ESP32C3_IDF5` release builds; record the exact app-image delta,
   generated partition headroom, toolchain, and linked XFSM symbol. This gate
   passed at implementation revision `8ce408fb5`: the enabled image is
   1,713,264 bytes, adds 35,024 bytes (2.09%), and leaves 334,736 bytes in the
   2,048,000-byte app partition. See the [C3 build
   report](reports/2026-09-27-m7-esp32-c3-build-feasibility.md).
2. **C3-B, stock-profile physical baseline:** identify and flash a physical
   C3; verify boot and module identity; run compact Profile 1, depth-32,
   completion-boundary, GC-relocation, cleanup, stack, timing, JsVar, and
   native-heap checks using the stock 70,000-byte native-heap reserve.
3. **C3-C, memory optimization and loaded-service qualification:** retain the
   stock 70,000-byte native-heap reserve as the product constraint, reduce
   XFSM's peak compiler-side JsVar demand, and repeat memory and lifecycle
   checks during WiFi association, HTTP and HTTPS/TLS work, BLE activity, and
   combined WiFi/BLE coexistence. This gate passes at fixture revision
   `aded959ad`: four consecutive combined XFSM, BLE GATT, WiFi, and TLS 1.2
   runs pass with at least 40,480 native-heap bytes and 1,902 free JsVars at
   the sampled runtime high-water point. See the [C3 service-coexistence
   report](reports/2026-09-28-m7-esp32-c3-service-coexistence.md).
4. **C3-D, release-candidate rerun:** repeat clean disabled/enabled builds and
   the agreed portable, target, resource, cleanup, and service-coexistence
   suite against the selected C3 profile. Advance from `Build verified` to
   `Conformance verified` only when this physical evidence passes. This gate
   passes at revision `aded959ad`: matched builds, all 20 embedded-applicable
   portable suites, deterministic physical allocation faults, direct and
   Storage-backed maximum depth, host integration, save/restoration, cleanup,
   and the combined wireless-service rerun pass. See the [C3-D release-
   candidate report](reports/2026-09-28-m7-esp32-c3-release-candidate.md).

The first C3-B physical slice is recorded in the [C3 physical baseline
report](reports/2026-09-27-m7-esp32-c3-physical-baseline.md). The stock
70,000-byte reserve exposed 3,016 JsVar blocks in the qualification run and
passed the representative functional and cleanup checks, but both direct and
Storage-backed depth-32
fixtures fail construction with `E_NO_MEMORY`. A diagnostic 65,000-byte trial
exposes 3,402 blocks and passes both depth fixtures, exact eight-actor and
fault cleanup, GC relocation, and event serialization while retaining 62,924
native-heap bytes after the Storage-backed case. This trial identifies the
required JsVar headroom; it does not select a C3 profile. C3-B remains open for
instrumented stack/timing and remaining portable checks. C3-C must first seek
that headroom through XFSM optimization while preserving the 70 KB reserve,
whose Bluetooth-plus-HTTPS rationale is recorded in [Espruino issue
#2746](https://github.com/espruino/Espruino/issues/2746).
The [compiler JsVar investigation](reports/2026-09-27-c3-compiler-jsvar-investigation.md)
measures the stock-profile depth threshold and recommends retaining depth 32
while first removing retained paths/derived IDs and compacting compiler
metadata.

That optimization is now complete at revision `cb5d74e89`. The compact C3
depth-32 compiler peak fell from 2,245 to 1,335 blocks (40.5%), and the direct
and Storage-backed action-heavy fixtures pass on the stock 70 KB profile with
1,174 measured blocks of construction headroom. C3-B's capacity gate is
closed. C3-C subsequently passed four combined-service runs on that stock
profile. C3-D passed the final release-candidate rerun and advances ESP32-C3
IDF5 to `Conformance verified` for Profile 1.

### M8 - Format Freeze And Release Readiness

Deliverables:

- reviewed vertical-slice and target reports;
- complete requirement-to-evidence matrix;
- frozen arena format or a documented version increment (Format Version 1 was
  frozen by the 2026-09-28 structural-contract review);
- user-facing Espruino example and module documentation;
- licensing and provenance review;
- clean enabled and disabled firmware builds; and
- an upstream-suitable Espruino change series.

Exit gate: no required Profile 1 evidence is missing, no target support is
overstated, and the implementation source, documentation, and recorded results
identify compatible revisions of both repositories.

## Definition Of Profile 1 Completion

Profile 1 implementation is complete only when every normative `MUST` and
`MUST NOT` is linked from the conformance matrix to a passing automated test,
static/build inspection, or recorded measurement; the required Linux suite and
physical integration cases pass; the first-slice decisions have been reviewed;
and no required skip lacks an accepted rationale.
