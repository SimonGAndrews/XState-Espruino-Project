# Profile 1 Conformance Matrix

## Status

- Matrix status: Scaffolded
- Requirement inventory: Not yet complete
- Implemented cases: M1-M3 foundation and construction cases listed below
- Normative authority: [Profile 1 specification](../docs/specification.md)

The specification requires every normative `MUST` and `MUST NOT` to link to an
automated test, build or static-inspection check, or recorded measurement. This
matrix is the bidirectional index between those requirements and their
evidence.

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
| `XFC-CF-DIAG-001` | Validation and Error Behavior: construction failures expose a stable category and object-graph path | Profile 1 normative slice | [Construction diagnostic cases](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-HOST-001` | Ownership: compiled-machine values remain GC-visible and temporary construction values are released on success and tested failures | Profile 1 normative slice | [Espruino memory cleanup checks](results/linux/2026-09-25-construction.json) | Linux, physical targets | Linux: Pass; physical: Planned |
| `XFC-CF-TRANS-001` | Construction and Runtime: hierarchical initial descent and indexed transition execution | XState differential | Profile 1 trace plus `xstate@5.33.2` reference | Linux, physical targets | Planned |
| `XFC-CF-ACTION-001` | Runtime Semantics: exit, transition, and entry actions execute in specified order | XState differential | Ordered action trace | Linux, physical targets | Planned |
| `XFC-CF-CONTEXT-001` | Runtime Semantics: `assign` executes at its declared position with ordered visibility | Intentional difference/compatibility | Profile 1, v5, and applicable v4 reference traces | Linux, physical targets | Planned |
| `XFC-CF-RESOURCE-001` | Resource Requirements: enabled firmware-size increase is recorded against an identical disabled build | Resource measurement | Build artifacts and linker-map report | Linux, each physical target | Planned |
| `XFC-CF-LIMIT-001` | Resource Requirements: hierarchy depth 32 and rejection at 33 are measured and tested | Profile-specific limit | Generated boundary cases and stack report | Linux, MDBT42Q | Planned |
| `XFC-CF-LIMIT-002` | Resource Requirements: microstep budget 256 is measured and enforced | Profile-specific limit | Completion-chain boundary cases and timing report | Linux, MDBT42Q | Planned |

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
