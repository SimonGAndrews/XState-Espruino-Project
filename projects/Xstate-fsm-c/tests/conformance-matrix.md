# Profile 1 Conformance Matrix

## Status

- Matrix status: Scaffolded
- Requirement inventory: Not yet complete
- Implemented cases: M1-M4 cases, M6 batches 1 through 3, final-state
  completion, and partial M5 resource evidence below
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
| `XFC-CF-CONTEXT-002` | Construction: literal context and property-map `assign` retain the required JavaScript values and resolved indexes | Profile 1 normative slice | [Decoded retained values and assignment records](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-CONTEXT-003` | Initial context: omitted context is allocated per actor at first start; literal context uses the exact shared template until assignment; factories are deferred, once per started actor, and isolate actors when returning fresh graphs | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json) and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux and original ESP32: Pass; deterministic allocation fault and other targets: Planned |
| `XFC-CF-CONTEXT-004` | Assignment: partial and property-map forms, fixed values, empty maps, every supported action location, source independence, shallow identity, old-context expression visibility, ordered publication, and rollback behave as specified | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json) and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux and original ESP32: Pass; deterministic allocation fault and other targets: Planned |
| `XFC-CF-DIAG-001` | Validation and Error Behavior: construction failures expose a stable category and object-graph path | Profile 1 normative slice | [Construction diagnostic cases](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-HOST-001` | Ownership: compiled-machine values remain GC-visible and temporary construction values are released on success and tested failures | Profile 1 normative slice | [Espruino memory cleanup checks](results/linux/2026-09-25-construction.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 behavior smoke: Pass, cleanup accounting: Planned; others: Planned |
| `XFC-CF-LIFE-001` | Actor Lifecycle: private actor allocation, start/send/controlled stop states, busy rejection, and fault terminality for the M4 slice | Profile 1 normative slice | [Actor lifecycle and fault tests](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-TRANS-001` | Construction and Runtime: hierarchical initial descent, parent fallback, ordered guards, native indexed dispatch, transition domains, and re-entry | Profile 1 normative slice | [Reviewed hierarchical runtime trace](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-TRANS-002` | Target grammar: bare exact and segmented paths, dot-relative descendants, effective IDs, escaped punctuation, ambiguity, malformed targets, and duplicate IDs | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-TRANS-003` | Event lookup: exact candidates precede wildcard candidates, rejected guards fall through, forbidden transitions block fallback, parent search follows local exhaustion, and hash collisions compare bytes | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-TRANS-004` | Transition re-entry: precomputed domains and bounded traversal produce the specified exit-transition-entry and initial-descent boundaries for targetless, forbidden, self, descendant, ancestor, sibling, root, cross-branch, nested-initial and depth-32 cases | Profile 1 normative | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) | Linux, physical targets | Linux: Pass; physical targets: Planned |
| `XFC-CF-ACTION-001` | Runtime Semantics: exit, transition, and entry actions execute in specified order and escaping callback exceptions fault transactionally | Profile 1 normative slice | [Ordered action and fault traces](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-CONTEXT-001` | Runtime Semantics: initial context factories and `assign` execute at their declared positions with ordered visibility and committed-context rollback | Intentional difference/compatibility | [Profile 1 runtime and fault traces](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-SNAP-001` | Stable Snapshots: status, hierarchical value, context, `matches`, lazy identity, and retained diagnostic state for the M4 slice | Profile 1 normative slice | [Snapshot checks](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-SUB-001` | Snapshot Subscriptions: ordered notification, unhandled events, mutation during notification, listener exceptions, and automatic stop removal | Profile 1 normative slice | [Subscription tests](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-DIAG-002` | Runtime diagnostics: invalid events and receivers, busy/state/fault categories, callback exception identity, and contextual paths for tested M4 operations | Profile 1 normative slice | [Runtime negative-path tests](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 M4 slice: Pass; others: Planned |
| `XFC-CF-HOST-002` | Host representation: shared native methods, private GC-visible actor graph, and zero retained test records after runtime cleanup | Profile 1 normative slice | [M4 runtime and cleanup record](results/linux/2026-09-25-actor-runtime.json) and [ESP32 physical regression](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 behavior smoke: Pass, cleanup accounting: Planned; others: Planned |
| `XFC-CF-RESOURCE-001` | Resource Requirements: enabled firmware-size increase is recorded against an identical disabled build | Resource measurement | [M5 resource report](../docs/reports/2026-09-25-m5-first-evidence.md) and [Pico feasibility report](../docs/reports/2026-09-26-pico-feasibility-build.md) | Linux, each physical target | Linux: Pass; Pico reduced profile: Pass; MDBT42Q: measured but enabled size gate fails; original ESP32 IDF5: Pass; others: Planned |
| `XFC-CF-BUILD-003` | Host Integration: MDBT42Q build compiles and links with XFSM selected through the normal library mechanism | Profile 1 normative | [MDBT42Q build attempt](results/mdbt42q/2026-09-25-m5-build-attempt.json) | MDBT42Q | Fail: enabled ELF links but overlaps reserved Storage |
| `XFC-CF-BUILD-004` | Host Integration: original ESP32 IDF5 build compiles, links, and passes its app-partition size check with XFSM selected through the normal library mechanism | Profile 1 normative | [Original ESP32 IDF5 build](results/esp32-xtensa/2026-09-25-m5-idf5-build.json) | Original ESP32 IDF5 | Pass |
| `XFC-CF-BUILD-005` | Host Integration: reduced-profile Pico build compiles, links, and passes its application-region size check with XFSM selected through the normal library mechanism | Profile 1 normative | [Pico feasibility build](results/pico/2026-09-26-feasibility-build.json) | Espruino Pico | Pass; build evidence only |
| `XFC-CF-LIMIT-001` | Resource Requirements: hierarchy depth 32 and rejection at 33 are measured and tested | Profile-specific limit | [Linux measurements](results/linux/2026-09-25-m5-resource-evidence.json) and [ESP32 physical measurements](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux and original ESP32 depth measurement: Pass; depth-33 and constrained target: Planned |
| `XFC-CF-LIMIT-002` | Resource Requirements: microstep budget 256 is measured and enforced before a 257th step | Profile-specific limit | [Completion report](../docs/reports/2026-09-26-completion.md) and target result records | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-LIMIT-003` | Host Integration: coordinator stack is measured and insufficient reserve rejects before actor mutation | Profile-specific limit | [Linux stack measurement](results/linux/2026-09-25-m5-resource-evidence.json) and [ESP32 physical measurement](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-HOST-003` | Ownership: compiled machines and actors survive GC and relocation and release all records after the harness | Profile 1 normative | [Linux result](results/linux/2026-09-25-m5-resource-evidence.json) and [ESP32 physical result](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) | Linux, physical targets | Linux: Pass; original ESP32 relocation: Pass, cleanup accounting: Planned; others: Planned |
| `XFC-CF-FINAL-001` | Final states and completion transitions: final-node validation, v5 completion events, action order, targetless completion, terminal `done`, and stable-only publication | Profile 1 normative | [Linux completion result](results/linux/2026-09-26-completion.json) and [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-FINAL-002` | Final states and completion transitions: nested ancestor cascades and initially-final top-level machines run to stability before publication | Profile 1 normative | [Linux completion result](results/linux/2026-09-26-completion.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json), and pinned XState 5.33.2 differential | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-COMPAT-001` | Compatibility target: workflow, nested completion, and initially-final traces match pinned XState 5.33.2 | Differential evidence | [Linux completion result](results/linux/2026-09-26-completion.json) | Node reference and Linux | Pass |
| `XFC-CF-COMPAT-002` | Migration syntax: `cond`, `internal`, inert true v4 flags, and empty compatibility maps behave as specified; conflicts and nonempty unsupported maps reject | Compatibility and intentional-difference policy | [Linux and pinned XState 4.38.3 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Node reference, Linux, physical targets | Node, Linux, and original ESP32: Pass; others: Planned |
| `XFC-CF-DIAG-003` | Construction diagnostics reject ambiguous, malformed and unknown targets, duplicate IDs, partial wildcards, alias conflicts, false compatibility flags, and nonempty unsupported maps with category and path | Profile 1 normative | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) | Linux, physical targets | Linux and original ESP32: Pass; others: Planned |
| `XFC-CF-COMPAT-003` | Context and assignment semantics match pinned XState 5.33.2 for shared literal ownership, shallow assignment identity, old-context property evaluation, ordered visibility, fixed values, empty assignment, and fresh-factory actor isolation; factory invocation is intentionally deferred from `createActor` to first `start` | Differential evidence and intentional difference | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json) | Node reference and Linux | Pass |
| `XFC-CF-COMPAT-004` | Transition-domain action traces match pinned XState 5.33.2 across the 16-case domain corpus and the depth-32, 65-action traversal | Differential evidence | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) | Node reference and Linux | Pass |
| `XFC-CF-DIAG-004` | Context and assignment validation rejects invalid literals, helper inputs, accessors, named descriptors, and invalid runtime results; factory/assignment exceptions retain exact identity and rollback to the last published state/context | Profile 1 normative | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json) and [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) | Linux, physical targets | Linux and original ESP32: Pass; deterministic allocation faults and other targets: Planned |

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
