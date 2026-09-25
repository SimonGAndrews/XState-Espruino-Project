# Xstate-fsm-c Implementation Plan

## Status

- Plan status: Initial implementation baseline
- Current milestone: M4 - actor execution vertical slice; M0 requirement
  inventory remains open
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

Linux Espruino is assessed first. MDBT42Q supplies the primary constrained-RAM
measurement before the full implementation proceeds.

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

### M7 - Physical Target Qualification

Qualify, separately:

- Espruino Pico;
- MDBT42Q;
- ESP32-C3; and
- one identified Xtensa ESP32 or ESP32-S3 target.

Each target must be reported only as `Not yet verified`, `Build verified`, or
`Conformance verified` under the specification's criteria. Shared CPU families
do not substitute for target-specific evidence.

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
