# Profile 1 Conformance Matrix

## Status

- Matrix status: Scaffolded
- Requirement inventory: Not yet complete
- Implemented cases: M1-M4 cases, all seven M6 behavioural batches, final-
  state completion, and partial M5 resource evidence below
- Normative authority: [Profile 1 specification](../docs/specification.md)

The specification requires every normative `MUST` and `MUST NOT` to link to an
automated test, build or static-inspection check, or recorded measurement. This
matrix is the bidirectional index between those requirements and their
evidence. The [test inventory](test-inventory.md) is the companion operational
register of completed suites, partial coverage, outstanding execution and final
review conditions.

## Identifier Convention

Cases use `XFC-CF-<AREA>-<NUMBER>`, with a stable three-digit number within an
area. Initial areas are:

| Area | Scope |
| --- | --- |
| `API` | Public module, machine, actor, snapshot, and subscription surface |
| `BUILD` | Optional-library integration, compiler contract, and target builds |
| `CONFIG` | Accepted configuration grammar and construction validation |
| `FORMAT` | Arena and actor-block layout, invariants, and corruption handling |
| `LIFE` | Actor lifecycle and operation-state rules |
| `TRANS` | Event lookup, guards, transition selection, hierarchy, and re-entry |
| `ACTION` | Action ordering, JavaScript callbacks, and exceptions |
| `CONTEXT` | Initial context, ownership, assignment, and actor isolation |
| `FINAL` | Final states, completion events, and completion cascades |
| `SNAP` | Snapshot content, identity, caching, and publication |
| `SUB` | Subscription registration, notification, and failure behaviour |
| `DIAG` | Construction and runtime diagnostic categories and paths |
| `HOST` | GC, save, reset, interrupts, native callbacks, pins, and timers |
| `LIMIT` | Record, symbol, depth, microstep, stack, and memory limits |
| `RESOURCE` | Flash, RAM, variable-block, stack, and timing measurements |
| `COMPAT` | Pinned XState comparisons and intentional differences |

Identifiers are never reused after a case is published. A replaced case keeps
its identifier and is marked superseded with a link to its replacement.

## Result Vocabulary

- `Planned`: requirement and evidence type identified, case not implemented.
- `Pass`: applicable evidence passed for the recorded revisions and target.
- `Fail`: evidence ran and did not meet the requirement.
- `Reasoned skip`: case cannot run on that target and records why; it is not a
  pass.
- `Not applicable`: the requirement does not apply to the declared target or
  layer and records why.

## Initial Matrix

The rows below establish the format; M0 must expand this into a complete
requirement inventory before Profile 1 completion can be claimed.

| Case ID | Specification section and requirement | Classification | Evidence | Targets | Result |
| --- | --- | --- | --- | --- | --- |
| `XFC-CF-BUILD-001` | Host Integration: firmware builds without XFSM when not selected | Profile 1 normative | [Disabled Linux build record](results/linux/2026-09-25-library-shell-build.json) | Linux | Pass |
| `XFC-CF-BUILD-002` | Host Integration: `XFSM`/`USE_XFSM` optional-library selection | Profile 1 normative | [Enabled Linux build and wrapper smoke test](results/linux/2026-09-25-library-shell-build.json) | Linux | Pass |
| `XFC-CF-API-001` | Public Interfaces: `require("XFSM")` exposes `createMachine`, `createActor`, and `assign` | Profile 1 normative | [JavaScript shell test](results/linux/2026-09-25-library-shell-build.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-FORMAT-001` | Native Format: normative structure sizes and table offset | Native implementation | [Compile-time assertions and decoded golden arena](results/linux/2026-09-25-native-format.json) | All builds | Linux: Pass; physical: Planned |
| `XFC-CF-FORMAT-002` | Native Format: malformed arena data rejected before unsafe access | Native implementation | [66-check corruption suite under sanitizers](results/linux/2026-09-25-native-format.json) | Linux | Pass |
| `XFC-CF-CONFIG-001` | Machine Model and Construction: the M3 atomic/compound hierarchical subset compiles to resolved Version 1 records | Profile 1 normative slice | [Decoded construction fixture](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-CONFIG-002` | Construction: structural records are independent of later source-configuration mutation | Profile 1 normative | [Source-isolation check](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-CONFIG-003` | Machine validation: supported properties and value forms are validated strictly; excluded properties reject; accessors reject without invocation; and traversal never evaluates configuration accessors | Profile 1 normative | [Linux strict-validation result](results/linux/2026-09-27-m6-validation-faults.json) and [ESP32 compact validation result](results/esp32-xtensa/2026-09-27-m6-validation-runtime.json) | Linux, physical targets | Linux: Pass; original ESP32 compact subset: Pass; others: Planned |
| `XFC-CF-CONTEXT-002` | Construction: literal context and property-map `assign` retain the required JavaScript values and resolved indexes | Profile 1 normative slice | [Decoded retained values and assignment records](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-CONTEXT-003` | Initial context: omitted context is allocated per actor at first start; literal context uses the exact shared template until assignment; factories are deferred, once per started actor, isolate fresh graphs, and fail transactionally on allocation | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [Linux allocation result](results/linux/2026-09-27-m6-validation-faults.json), and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux: Pass including allocation fault; original ESP32 semantic scope: Pass; other targets: Planned |
| `XFC-CF-CONTEXT-004` | Assignment: all supported forms/locations, identity, old-context expression visibility, ordered publication, rollback, and pending-context allocation failure behave as specified | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [Linux allocation result](results/linux/2026-09-27-m6-validation-faults.json), and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux: Pass including allocation fault; original ESP32 semantic scope: Pass; other targets: Planned |
| `XFC-CF-DIAG-001` | Validation and Error Behavior: construction failures expose a stable category and object-graph path | Profile 1 normative slice | [Construction diagnostic cases](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-HOST-001` | Ownership: compiled-machine values remain GC-visible and temporary construction values are released on success and tested failures | Profile 1 normative slice | [Espruino memory cleanup checks](results/linux/2026-09-25-construction.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 behavior smoke: Pass, cleanup accounting: Planned; others: Planned |
| `XFC-CF-LIFE-001` | Actor Lifecycle: private actor allocation; complete not-started, active, done, stopped and error operation matrix; busy-call precedence; transactional callback faults; terminal fault rejection; and lifecycle retention across host restoration | Profile 1 normative slice | [Complete Linux lifecycle/fault result](results/linux/2026-09-27-m6-lifecycle-subscribers.json), [Linux cross-actor result](results/linux/2026-09-27-m6-host-lifecycle.json), and [physical host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) | Linux, physical targets | Linux and original ESP32 implemented scope: Pass; other targets: Planned |
| `XFC-CF-LIFE-002` | Allocation failures during actor creation, start, send, assignment, completion, publication, snapshot and stop are transactional; publication snapshot allocation precedes state/context commit; exact errors and the last stable actor result are retained | Profile 1 normative | [Linux deterministic-fault result](results/linux/2026-09-27-m6-validation-faults.json) | Linux fault build; production API inspection | Linux: Pass; private seam absent from production: Pass; physical pressure tests: Planned |
| `XFC-CF-TRANS-001` | Construction and Runtime: hierarchical initial descent, parent fallback, ordered guards, native indexed dispatch, transition domains, and re-entry | Profile 1 normative slice | [Reviewed hierarchical runtime trace](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-TRANS-002` | Target grammar: bare exact and segmented paths, dot-relative descendants, effective IDs, escaped punctuation, ambiguity, malformed targets, and duplicate IDs | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-TRANS-003` | Event lookup: exact candidates precede wildcard candidates, rejected guards fall through, forbidden transitions block fallback, parent search follows local exhaustion, and hash collisions compare bytes | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-TRANS-004` | Transition re-entry: precomputed domains and bounded traversal produce the specified exit-transition-entry and initial-descent boundaries for targetless, forbidden, self, descendant, ancestor, sibling, root, cross-branch, nested-initial and depth-32 cases | Profile 1 normative | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json), [ESP32 domain result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json), and [post-M6 depth review](../docs/reports/2026-09-27-post-m6-resource-review.md) | Linux, physical targets | Linux: Pass; original ESP32 domain cases and compact depth 32: Pass, action-heavy all-in-one fixture: resource Fail; other targets: Planned |
| `XFC-CF-ACTION-001` | Runtime Semantics: exit, transition, and entry actions execute in specified order; guard, action, startup-entry, ordinary-entry/exit and stop-exit exceptions fault transactionally with exact identity and later-action suppression | Profile 1 normative slice | [Complete Linux lifecycle/fault result](results/linux/2026-09-27-m6-lifecycle-subscribers.json), [ESP32 lifecycle result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json), and [ESP32 native/flash callback result](results/esp32-xtensa/2026-09-27-m7-application-integration.json) | Linux, physical targets | Linux and original ESP32 implemented callback-fault scope, including flash-backed callback: Pass; remaining completion-stage cases and other targets: Planned |
| `XFC-CF-CONTEXT-001` | Runtime Semantics: initial context factories and `assign` execute at their declared positions with ordered visibility and committed-context rollback | Intentional difference/compatibility | [Profile 1 runtime and fault traces](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-SNAP-001` | Stable Snapshots: status, hierarchical value, context, `matches`, lazy identity, and retained diagnostic state for the M4 slice | Profile 1 normative slice | [Snapshot checks](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-SUB-001` | Snapshot Subscriptions: exactly one callable listener, stable registrations, ordered notification, snapshot identity, deterministic mutation, duplicate independence, listener-error continuation, terminal automatic removal, cross-actor calls, and restoration | Profile 1 normative slice | [Complete Linux subscriber result](results/linux/2026-09-27-m6-lifecycle-subscribers.json), [Linux cross-actor result](results/linux/2026-09-27-m6-host-lifecycle.json), and [physical host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) | Linux, physical targets | Linux and original ESP32 implemented scope: Pass; other targets: Planned |
| `XFC-CF-SUB-002` | Subscription-node and notification-snapshot allocation failures do not publish a partial subscription or call listeners, and snapshot allocation failure before commit faults transactionally | Profile 1 normative | [Linux deterministic-fault result](results/linux/2026-09-27-m6-validation-faults.json) | Linux fault build | Pass |
| `XFC-CF-DIAG-002` | Runtime diagnostics: invalid events, listeners and receivers; busy/state/fault categories with operation detail; callback exception identity; and contextual paths for implemented runtime operations | Profile 1 normative slice | [Complete Linux lifecycle/subscriber negative paths](results/linux/2026-09-27-m6-lifecycle-subscribers.json) and [current ESP32 result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json) | Linux, physical targets | Linux and original ESP32 implemented scope: Pass; allocation/completion paths and other targets: Planned |
| `XFC-CF-HOST-002` | Host representation: shared native methods, private GC-visible actor graph, and zero retained test records after runtime cleanup | Profile 1 normative slice | [M4 runtime and cleanup record](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 behavior smoke: Pass, cleanup accounting: Planned; others: Planned |
| `XFC-CF-RESOURCE-001` | Resource Requirements: enabled firmware-size increase is recorded against an identical disabled build | Resource measurement | [M5 resource report](../docs/reports/2026-09-25-m5-first-evidence.md) and [Pico feasibility report](../docs/reports/2026-09-26-pico-feasibility-build.md) | Linux, each physical target | Linux: Pass; Pico reduced profile: Pass; MDBT42Q: measured but enabled size gate fails; original ESP32 IDF5: Pass; others: Planned |
| `XFC-CF-RESOURCE-002` | Resource Requirements: complete-engine JsVar, native-heap, compiled-arena, retained-binding, actor, runtime-allocation, stack, diagnostic, timing, and test-loading costs are measured and reviewed | Resource measurement | [Post-M6 resource report](../docs/reports/2026-09-27-post-m6-resource-review.md) | Linux, each physical target | Linux and original ESP32 IDF5: Pass; Pico, MDBT42Q product profile, and ESP32-C3: Planned |
| `XFC-CF-BUILD-003` | Host Integration: MDBT42Q build compiles and links with XFSM selected through the normal library mechanism | Profile 1 normative | [MDBT42Q build attempt](results/mdbt42q/2026-09-25-m5-build-attempt.json) | MDBT42Q | Fail: enabled ELF links but overlaps reserved Storage |
| `XFC-CF-BUILD-004` | Host Integration: original ESP32 IDF5 build compiles, links, and passes its app-partition size check with XFSM selected through the normal library mechanism | Profile 1 normative | [Original ESP32 IDF5 baseline build](results/esp32-xtensa/2026-09-25-m5-idf5-build.json) and [current post-M6 build/resource result](results/esp32-xtensa/2026-09-27-post-m6-resource-review.json) | Original ESP32 IDF5 | Pass |
| `XFC-CF-BUILD-005` | Host Integration: reduced-profile Pico build compiles, links, and passes its application-region size check with XFSM selected through the normal library mechanism | Profile 1 normative | [Pico feasibility build](results/pico/2026-09-26-feasibility-build.json) | Espruino Pico | Pass; build evidence only |
| `XFC-CF-LIMIT-001` | Resource Requirements: hierarchy depth 32 succeeds and depth 33 rejects | Profile-specific limit | [Linux boundary result](results/linux/2026-09-27-m6-validation-faults.json), [post-M6 resource review](../docs/reports/2026-09-27-post-m6-resource-review.md), and [ESP32 action-heavy depth result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json) | Linux, physical targets | Linux 32/33: Pass; original ESP32 compact depth-32: Pass with low headroom, action-heavy all-in-one fixture: resource Fail; remaining physical boundaries: Planned |
| `XFC-CF-LIMIT-002` | Resource Requirements: microstep budget 256 is measured and enforced before a 257th step | Profile-specific limit | [Completion report](../docs/reports/2026-09-26-completion.md) and target result records | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-LIMIT-003` | Host Integration: coordinator stack is measured and insufficient reserve rejects before actor mutation | Profile-specific limit | [Post-M6 resource review](../docs/reports/2026-09-27-post-m6-resource-review.md) and [Linux reserve-negative result](results/linux/2026-09-25-m5-resource-evidence.json) | Linux, physical targets | Linux and original ESP32: Pass with 1,024-byte default reserve; others: Planned |
| `XFC-CF-LIMIT-004` | String limits use encoded Espruino bytes: 65,535-byte symbols/events succeed where otherwise valid, 65,536 bytes reject, Unicode counts by encoded byte length, and oversized runtime events reject without faulting the actor | Profile-specific limit | [Linux byte-boundary result](results/linux/2026-09-27-m6-validation-faults.json) | Linux; practical physical smoke | Linux: Pass; huge embedded fixture: reasoned non-run; practical target smoke: Planned |
| `XFC-CF-HOST-003` | Ownership: compiled machines, actors, callbacks, snapshots, and subscriptions survive GC and relocation and release all records after the harness | Profile 1 normative | [Linux and ESP32 host-lifecycle results](results/linux/2026-09-27-m6-host-lifecycle.json) and [physical result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) | Linux, physical targets | Linux: Pass with zero retained records; original ESP32 relocation: Pass, final cleanup accounting: Planned; others: Planned |
| `XFC-CF-HOST-004` | Save, restoration, and reset: callback-requested save defers to a stable actor; the complete retained graph and all lifecycle states survive identical-firmware restoration without replay; reset and host lifecycle do not synthesize actor exits | Profile 1 normative | [Physical ESP32 host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) | Save-capable physical targets | Original ESP32: Pass; other qualified save-capable targets: Planned |
| `XFC-CF-HOST-005` | Application bindings: outer-scope functions, closures, exported flash-backed module functions, direct native functions, and bound native actions remain callable through the retained machine binding; representative GPIO and timer-driven event ingress execute and clean up safely | Profile 1 normative | [Original ESP32 M7.1 application-integration result](results/esp32-xtensa/2026-09-27-m7-application-integration.json) | Physical targets | Original ESP32: Pass; other targets: Planned |
| `XFC-CF-HOST-006` | Interpreter boundary: actor operations enter through normal Espruino JavaScript dispatch; no public ISR/task coordinator entry or XFSM event mailbox exists; timer callback dispatch is synchronous and same-actor re-entry remains prohibited | Profile 1 normative and static inspection | [Original ESP32 M7.1 application-integration result](results/esp32-xtensa/2026-09-27-m7-application-integration.json) and [complete lifecycle result](results/linux/2026-09-27-m6-lifecycle-subscribers.json) | Implementation, physical targets | Interface/static inspection and original ESP32 timer path: Pass; remaining targets: Planned |
| `XFC-CF-FINAL-001` | Final states and completion transitions: final-node validation, v5 completion events, action order, targetless completion, terminal `done`, and stable-only publication | Profile 1 normative | [Linux completion result](results/linux/2026-09-26-completion.json) and [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-FINAL-002` | Final states and completion transitions: nested ancestor cascades and initially-final top-level machines run to stability before publication | Profile 1 normative | [Linux completion result](results/linux/2026-09-26-completion.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json), and pinned XState 5.33.2 differential | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-COMPAT-001` | Compatibility target: workflow, nested completion, and initially-final traces match pinned XState 5.33.2 | Differential evidence | [Linux completion result](results/linux/2026-09-26-completion.json) | Node reference and Linux | Pass |
| `XFC-CF-COMPAT-002` | Migration syntax: `cond`, `internal`, inert true v4 flags, and empty compatibility maps behave as specified; conflicts and nonempty unsupported maps reject | Compatibility and intentional-difference policy | [Linux and pinned XState 4.38.3 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Node reference, Linux, physical targets | Node, Linux, and original ESP32: Pass; others: Planned |
| `XFC-CF-DIAG-003` | Construction diagnostics reject ambiguous, malformed and unknown targets, duplicate IDs, partial wildcards, alias conflicts, false compatibility flags, and nonempty unsupported maps with category and path | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-COMPAT-003` | Context and assignment semantics match pinned XState 5.33.2 for shared literal ownership, shallow assignment identity, old-context property evaluation, ordered visibility, fixed values, empty assignment, and fresh-factory actor isolation; factory invocation is intentionally deferred from `createActor` to first `start` | Differential evidence and intentional difference | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json) | Node reference and Linux | Pass |
| `XFC-CF-COMPAT-004` | Transition-domain action traces match pinned XState 5.33.2 across the 16-case domain corpus and the depth-32, 65-action traversal | Differential evidence | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) | Node reference and Linux | Pass |
| `XFC-CF-DIAG-004` | Context and assignment validation rejects invalid literals, helper inputs, accessors, named descriptors, and invalid runtime results; factory/assignment exceptions retain exact identity and rollback to the last published state/context | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [Linux allocation result](results/linux/2026-09-27-m6-validation-faults.json), and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux including deterministic allocation fault: Pass; original ESP32 semantic scope: Pass; other targets: Planned |
| `XFC-CF-DIAG-005` | Strict construction and runtime diagnostics retain stable categories and object-graph paths; construction detail is limited to 48 bytes without splitting UTF-8; allocation and limit failures retain their specified actor state | Profile 1 normative | [Linux validation/fault result](results/linux/2026-09-27-m6-validation-faults.json) and [ESP32 compact validation result](results/esp32-xtensa/2026-09-27-m6-validation-runtime.json) | Linux, physical targets | Linux: Pass; original ESP32 compact subset: Pass; remaining targets: Planned |

## Requirement Inventory Procedure

For each normative statement:

1. record the specification heading and a concise requirement description;
2. assign one or more stable case IDs;
3. classify the evidence as normative, differential, intentional difference,
   native implementation, legacy evidence, or resource measurement;
4. identify applicable targets and required negative paths;
5. link the test, fixture, expected trace, build inspection, or report when it
   exists; and
6. record a result for a specific implementation and specification revision.

One case may cover several closely related requirements, and one requirement
may require several layers of evidence. The mapping must remain explicit in
both directions.

## Case Record Requirements

Every behavioural case must identify:

- case ID and classification;
- source specification section;
- machine definition;
- ordered public operations or event sequence;
- reviewed expected trace;
- applicable targets;
- pinned reference version where differential; and
- every adaptation made to the reference model.

Result records additionally identify the XState-Espruino-Project revision,
Espruino implementation revision, build metadata, target, pass/fail/skip state,
and evidence paths.
