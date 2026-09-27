# Xstate-fsm-c Implementation Plan

## Status

- Plan status: M6 behavior, post-M6 resource review, and original-ESP32
  M7.1-M7.3 qualification slices complete
- Current milestone: M0 requirement inventory and M7 product-profile and
  physical-target qualification
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
- pinned Node XState v5.33.2 primary reference and v4.38.3 secondary reference;
  and
- baseline Espruino Linux build without XFSM.

Exit gate: another developer can obtain both repositories, reproduce the
baseline build, and identify the next case and implementation task without
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
M0 traceability, M5 resource decisions, and M7 physical-target work are not
part of this behavioural exit gate and remain open.

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

The M7.4 release-candidate rerun remains open for this target.

### M8 - Format Freeze And Release Readiness

Deliverables:

- reviewed vertical-slice and target reports;
- complete requirement-to-evidence matrix;
- frozen arena format or a documented version increment;
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
