# Profile 1 Test Inventory

## Status And Purpose

- Inventory status: living execution register
- Last reviewed: 2026-09-27
- Specification: Profile 1 version 0.50
- Normative authority: [Profile 1 specification](../docs/specification.md)
- Requirement mapping: [conformance matrix](conformance-matrix.md)

This document is the single operational record of tests completed to date and
tests still required for final Profile 1 review. It records executable suites,
functional coverage, differential coverage, target execution, and outstanding
work. The conformance matrix remains the requirement-by-requirement authority;
the two documents must be updated together when a case is added or its status
changes.

This inventory covers the complete test plan currently known. The outstanding
M0 audit of every normative `MUST` and `MUST NOT` may identify additional
cases. Any such case must be added here when discovered rather than being left
only in an implementation note or issue.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| **Pass** | The identified test ran successfully and has linked evidence for the stated target and revision. |
| **Partial** | Some required cases or targets pass, but the listed test area is not complete. |
| **Planned** | The requirement and required evidence are known, but the complete test has not yet been implemented or run. |
| **Blocked** | Execution cannot currently proceed; the blocking condition is recorded. |
| **Not applicable** | The layer or target has no corresponding requirement, with the reason recorded. |

A pass applies only to the target, implementation revision, specification
version, and scope named by its evidence. A build pass is not a runtime or
conformance pass. Node differential success is not a substitute for embedded
execution, and embedded success is not a substitute for the pinned reference
comparison where one is required.

## Completed Executable Suites

These test programs exist in the implementation repository under
`libs/xfsm/tests/`. All sixteen JavaScript semantic suites below pass on Linux
Espruino. The first fourteen also pass on the original ESP32 IDF5 M6.2
candidate; the two M6.3 suites await the current physical run.

| Executable suite | Principal coverage | Linux | Original ESP32 | Evidence |
| --- | --- | --- | --- | --- |
| `test_shell.js` | `XFSM` module surface, opaque helpers, actor creation, start, initial snapshot and `matches` | Pass | Pass | [Linux shell result](results/linux/2026-09-25-library-shell-build.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_compile.js` | Hierarchical construction, resolved records, literal context, actions, guards, property-map `assign`, retained values and source independence | Pass | Pass | [Linux construction result](results/linux/2026-09-25-construction.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_diagnostics.js` | Selected construction categories and object-graph paths, including final-state restrictions | Pass | Pass | [Linux completion result](results/linux/2026-09-26-completion.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_runtime.js` | Hierarchical initial descent, parent fallback, guard order, actions, ordered assignment, targetless/self/re-entering/cross-branch transitions, snapshots and stop exits | Pass | Pass | [Linux actor result](results/linux/2026-09-25-actor-runtime.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_runtime_errors.js` | Context factories, whole-context assignment, listener exceptions, busy rejection, action faults, rollback, invalid events and invalid receivers | Pass | Pass | [Linux actor result](results/linux/2026-09-25-actor-runtime.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_subscriptions.js` | Notification order, unhandled-event publication, mutation during notification, stop notification and stop before start | Pass | Pass | [Linux actor result](results/linux/2026-09-25-actor-runtime.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_completion.js` | Final states, parent `onDone`, completion event and action order, targetless completion, terminal `done`, automatic unsubscription and 256/257 boundary | Pass | Pass | [Linux completion result](results/linux/2026-09-26-completion.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_completion_cascade.js` | Nested ancestor completion cascade and initially-final top-level machine | Pass | Pass | [Linux completion result](results/linux/2026-09-26-completion.json), [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json) |
| `test_targets.js` | Bare exact and segmented targets, dot-relative descendants, explicit and implicit effective IDs, and escaped punctuation | Pass | Pass | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json), [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) |
| `test_events_migration.js` | Exact/wildcard precedence and fallback, forbidden transitions, collision-safe lookup, `cond`, `internal`, and inert v4 compatibility fields | Pass | Pass | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json), [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) |
| `test_profile1_diagnostics.js` | Ambiguous/malformed targets, duplicate IDs, partial wildcards, alias conflicts, compatibility flags, and unsupported maps | Pass | Pass | [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json), [ESP32 M6.1 result](results/esp32-xtensa/2026-09-26-m6-target-events.json) |
| `test_context_ownership.js` | Omitted, literal, and factory context timing, ownership, shallow sharing, stopped-before-start behavior, and actor isolation | Pass | Pass | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) |
| `test_assign_forms.js` | Partial, property-map, fixed-value, and empty assignments across entry, exit, initial, event, and completion positions with identity and ordered visibility | Pass | Pass | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) |
| `test_context_diagnostics.js` | Invalid context/assignment forms and results, accessors, callback/property exceptions, exact thrown identity, no-entry startup failure, and transactional rollback | Pass | Pass | [Linux M6.2 result](results/linux/2026-09-26-m6-context-assignment.json), [ESP32 M6.2 result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json) |
| `test_transition_domains.js` | Targetless and forbidden transitions; atomic and compound self-transition defaults and re-entry; descendant, ancestor, sibling, root, and cross-branch domains; initial-action boundaries | Pass | Planned | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) |
| `test_transition_depth.js` | Depth-32 exit, transition, and entry traversal with 65 ordered actions and an active-ancestor target | Pass | Planned | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) |

Each Linux semantic suite returned to zero retained Espruino records after its
explicit cleanup and garbage collection. The original ESP32 results are
physical behavioural passes; where their result records say cleanup accounting
is still planned, that limitation remains.

## Completed Internal And Measurement Tests

| Test or measurement | Coverage | Status and evidence |
| --- | --- | --- |
| `native/test_xfsm_native.c` | 66 checked-arithmetic, hash/collision, valid-layout, handler/domain, corruption-rejection and actor-record assertions under address, undefined-behaviour and leak sanitizers | Pass: [native-format result](results/linux/2026-09-25-native-format.json) |
| `measure_m5.js` | Firmware, arena, retained values, construction peak, actor/snapshot/subscription cost, representative dispatch timing, hierarchy depth, stack and diagnostic size | Partial M5 pass: [Linux resource result](results/linux/2026-09-25-m5-resource-evidence.json) |
| `measure_m5_completion.js` | Five-trial 256-step completion timing, rejected step 257, stack, rollback and cleanup | Pass on Linux and ESP32: [completion report](../docs/reports/2026-09-26-completion.md) |
| `measure_m5_gc_relocation.js` | Machine and actor survival across Espruino GC relocation | Pass for the implemented slice on Linux and ESP32: [ESP32 physical result](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) |
| `test_stack_reserve.js` | Operation rejection before mutation when the configured coordinator reserve is unavailable | Pass on Linux; normal reserve measured on ESP32: [Linux resource result](results/linux/2026-09-25-m5-resource-evidence.json) |
| `reference/xstate-v5/verify-reference.mjs` | Pinned XState 5.33.2 basic transition, completion, hierarchy, wildcard, forbidden-transition, context/assignment, 16 transition-domain, and maximum-depth traces | Pass: [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) |
| `reference/xstate-v4/verify-reference.mjs` | Pinned XState 4.38.3 `cond`, `internal`, ordered-action flags, and action-boundary trace | Pass: [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) |

## Functional Coverage Register

This register identifies both completed coverage and the remaining cases in
each specification area. **Partial** means that the completed cases listed in
the third column pass, but the fourth column must still be closed.

| Area and conformance cases | Status | Completed coverage | Outstanding tests |
| --- | --- | --- | --- |
| Optional library and module API (`BUILD-001/002`, `API-001`) | Partial | Disabled and enabled Linux builds; module exports; actor and machine smoke; original ESP32 module execution | Public-surface checks on Pico, MDBT42Q and ESP32-C3; absence of all XFSM code and symbols in each representative disabled build |
| Native arena and actor records (`FORMAT-001/002`) | Partial | Exact Version 1 layout, valid arenas, corruption rejection, byte-order mismatch, hashes, ranges, domains and actor validation | Boundary counts and offsets near 16/32-bit limits; deterministic malformed-record corpus on every applicable architecture; final format-freeze rerun |
| Machine-definition lifetime and ownership (`CONFIG-001/002`, `HOST-001`) | Partial | Two-pass construction, source independence, retained bindings, cleanup after tested cases | Complete allocation-failure points, all construction rejection cleanup paths, shared-machine stress and final GC accounting on physical targets |
| State-node and initial-transition grammar (`CONFIG-001`) | Partial | Atomic and compound states, nested `initial`, explicit final states and selected invalid combinations | Every accepted explicit/inferred type and initial-transition form; empty/undefined inert forms; all contradictory and unsupported properties |
| Excluded-feature rejection (`CONFIG`, `DIAG-001`) | Partial | Final/machine output and selected invalid state shapes are rejected rather than ignored | Automated rejection for parallel/history states, eventless and delayed transitions, invocation, activities, tags, output values, actor definitions/spawning, restored-snapshot input, custom delimiters and every other recognized exclusion |
| Target grammar and ID resolution (`TRANS-001/002`) | Partial | Exact-key-first and segmented bare targets, relative dot form, root/effective ID paths, explicit IDs with punctuation, escaped period/backslash/leading punctuation, duplicate IDs, malformed and ambiguous targets | Target and path length boundaries, allocation failures, and full deep ancestor/descendant/domain combinations |
| Event grammar and lookup (`TRANS-001/003`) | Partial | Exact strings and object events, full wildcard, exact-before-wildcard precedence, guarded fallback, forbidden blocking, parent fallback, unhandled events, and collision-safe hash lookup | Event-name length boundaries, every malformed event descriptor, generated deep lookup cost, and allocation failures |
| Migration syntax and Stately compatibility (`COMPAT-002`) | Partial | `cond`, `internal`, inert true v4 flags, empty compatibility maps, conflict/false/nonempty-map rejection, and pinned v4.38.3 behavior | Generated Stately v4/v5 fixture ingestion and rejection of every unsupported generated field |
| Initial context (`CONTEXT-001/002/003`) | Partial | Omitted context at start; literal exact-template and nested-reference sharing; first-assignment isolation; deferred once-per-actor factories; stopped-before-start behavior; invalid factory results and exact exceptions with no entry/publication | Deterministic startup allocation failure; final repetition on remaining qualified targets |
| Context assignment (`CONTEXT-001/002/004`) | Partial | Partial, property-map, fixed-value, and empty forms; all action locations; new properties; retained object/array/function identity; source-map independence; same-old-context expressions; ordered visibility; invalid results; callback/property-read/expression exceptions; transactional rollback | Deterministic pending-context and merge allocation failures; final repetition on remaining qualified targets |
| Action definition and ordering (`ACTION-001`) | Partial | Named entry, exit and transition actions; arrays; `assign`; stop exits; ordered context observations; action exception and remaining-action suppression | Every accepted action representation and location, unresolved/invalid descriptors, initial-transition actions, final callback metadata contract and native/flash-backed callback cases |
| Guards and candidate selection (`TRANS-001`) | Partial | Named guards, false then true ordered candidates and context/event visibility | Guard exceptions, invalid return/binding forms, all-false candidates, parent fallback after local candidate rejection, completion guards and parameterless-reference rules |
| Transition domains and re-entry (`TRANS-001/002/004`) | Pass for implemented Linux scope | Targetless, forbidden, atomic/compound self, source-to-descendant, root-to-descendant, descendant-to-active-ancestor, sibling and cross-branch domains with default/re-entering action boundaries; nested initial-action boundary; v4 `internal` equivalence; depth-32 traversal | Repeat the portable cases on remaining qualified targets and add deterministic traversal allocation/fault cases where applicable |
| Actor lifecycle (`LIFE-001`) | Partial | Not-started, active, stopped, done and error snapshots; repeated start while active; stop before/after start; ignored terminal sends; busy and fault terminality | Complete invalid-state operation matrix, nested calls between different actors, all callback-operation combinations, reset/restoration lifecycle and lifecycle allocation failures |
| Event dispatch (`TRANS-001`, `LIFE-001`) | Partial | Synchronous string/object dispatch, handled/unhandled publication and same-actor busy rejection | Generated deep lookup, exact/wildcard lookup cost and precedence, interrupt-context prohibition evidence and cross-actor nested dispatch |
| Snapshots and `matches` (`SNAP-001`) | Partial | All five statuses, flat/hierarchical values, context/error, string/object `matches`, identity reuse and change, stable-only completion publication | Complete invalid `matches` inputs, all hierarchy shapes, lazy-allocation failure, caching after every lifecycle state and physical RAM accounting |
| Subscriptions (`SUB-001`) | Partial | Function listeners, order, unsubscribe, add/remove during notification, unhandled events, stop, completion removal and listener exception continuation | Invalid listener and receiver matrix, repeated unsubscribe, subscribe in every actor state, allocation failure, nested actor calls and full Node timing comparison where equivalent |
| Callback failure and rollback (`ACTION-001`, `DIAG-002/004`) | Partial | Action, listener, context-factory, partial-assignment, property-read, and property-expression throws; exact thrown identity; no later actions or startup entry; state/context rollback and faulted-operation rejection | Guard and ordinary entry/exit exceptions; failures at each completion stage; native callback failures and side-effect boundary traces |
| Final states and completion (`FINAL-001/002`) | Pass for implemented Linux/ESP32 scope | Validation, v5 event names, action order, targetless `onDone`, nested cascades, initial final, terminal `done`, stable publication and limit rollback | Run the same portable cases on remaining qualified targets; add complete negative grammar and failure-in-each-completion-phase cases during strict-validation work |
| Construction diagnostics (`DIAG-001/003`) | Partial | Missing/unknown initial, unknown/ambiguous/malformed targets, duplicate IDs, partial wildcards, alias conflicts, compatibility flags/maps, unresolved actions, invalid context, cyclic graph, selected final/`onDone` errors and unsupported `output` | Every remaining construction category, exact object-graph path, length budget, truncation boundary and cleanup for every rejected grammar form |
| Runtime diagnostics (`DIAG-002/004`) | Partial | Invalid event/receiver, busy/fault categories, action/factory/assignment identity, invalid context/assignment categories and paths, rollback, and microstep diagnostic | Every public method/state/category combination, path and length budget, allocation errors, guard failures and physical diagnostic-cost measurements |
| Depth and microstep limits (`LIMIT-001/002`) | Partial | Depth-32 construction measurement and exact 65-action transition trace matched to XState 5.33.2; exact step 256 success and attempted step 257 transactional failure on Linux/ESP32 | Automated depth 31 and 33 boundary/rejection cases; remaining targets |
| Stack reserve (`LIMIT-003`) | Partial | Linux reserve negative path; Linux and ESP32 measured maxima; default raised to 768 bytes | Select and verify reserve on Pico, MDBT42Q and ESP32-C3; rerun after complete runtime implementation |
| GC, save and reset (`HOST-001/002/003`) | Partial | GC cleanup in Linux suites and relocation for implemented Linux/ESP32 slice | Whole-interpreter `save()`, restoration and reset in every relevant actor state; final cleanup accounting; relocation during broader behaviours and failure paths |
| Native callbacks, pins and timers (`HOST`) | Planned | JavaScript callback boundary passes; implementation design uses the common Espruino callable path | Representative flash-backed/native action and guard functions, pin output, timer-driven event ingress, cleanup and safe hardware reset |
| Interrupt and concurrency boundary (`HOST`, `LIFE`) | Planned | Same-actor synchronous re-entry is rejected | Interrupt-context restriction, different-actor nested operations, no mailbox behaviour and long-operation interrupt responsiveness |
| Compiler and target contract (`BUILD`, `FORMAT`) | Partial | C99 native suite on 64-bit Linux; successful 32-bit ARM and Xtensa compilation; runtime byte-order mismatch rejection | ESP32-C3 RISC-V compile/runtime, compiler-version matrix where required, record-alignment inspection on each architecture and final static portability review |
| Canonical portable trace and runner contract (`COMPAT`) | Partial | Current tests emit machine-readable `TEST`, assertion, metric and `DONE` markers; the Node runner emits a reviewed JSON summary | Implement the specified versioned newline-delimited JSON trace, normalize Node and XFSM output, stream embedded traces without retaining them, and make all portable behaviour cases use it |
| Normative requirement traceability (all areas) | Planned | Initial stable conformance IDs and evidence links exist for implemented slices | Complete the M0 line-by-line audit of every `MUST` and `MUST NOT`, add missing cases here and in the matrix, and prove bidirectional requirement-to-test mapping |
| Resource and performance (`RESOURCE-001`) | Partial | Linux and ESP32 implemented-slice RAM/stack/timing; Linux/ESP32/Pico size comparisons; MDBT42Q size failure | Complete-runtime rerun, diagnostic formatting, allocation-failure overhead, Pico/MDBT42Q/C3 measurements and final retained/revised design decisions |

## Differential Test Register

Shared observable statechart semantics require a pinned Node comparison unless
the conformance matrix records an intentional difference, Profile-specific
limit, or absence of equivalent XState behaviour.

| Differential area | XState reference | XFSM comparison | Status |
| --- | --- | --- | --- |
| Basic transition | XState 5.33.2 reference trace captured | Equivalent XFSM behaviour passes locally, but no normalized paired result is recorded | Partial; differential comparison planned |
| Final child and parent `onDone` | XState 5.33.2 | Exact action and completion-event trace | Pass |
| Nested completion cascade | XState 5.33.2 | Exact two-ancestor trace | Pass |
| Initially-final top-level machine | XState 5.33.2 | Exact entry/terminal-exit trace | Pass |
| Initial descent and initial actions | XState 5.33.2 | Not yet normalized into common trace | Planned |
| Ordered guards and parent fallback | XState 5.33.2 | XFSM behaviour passes locally | Planned differential |
| Exact and wildcard event selection | XState 5.33.2 | Matching exact rejection, wildcard fallback, parent fallback and forbidden blocking trace | Pass |
| Action and ordered assignment visibility | XState 5.33.2 | Matching partial/property-map ordering, same-old-context property expressions, fixed identities, and empty-assignment identity | Pass |
| Context isolation between actors | XState 5.33.2 | Matching shared literal template, first-assign isolation, nested identity, and fresh factory graph isolation; factory call timing is an intentional Profile difference | Pass for shared semantics |
| Targetless and self transitions | XState 5.33.2 | Matching targetless, preserved self and explicit re-entry trace | Pass |
| Relative, explicit-ID and cross-hierarchy targets | XState 5.33.2 | Matching relative reset and explicit-ID cross-hierarchy action-boundary trace; XFSM escaping is Profile-specific | Pass for shared forms |
| Deep hierarchy and least-common-ancestor ordering | XState 5.33.2 | Matching 16-case domain corpus and 32-level, 65-action exit-transition-entry trace | Pass |
| String and object event visibility | XState 5.33.2 | XFSM forms pass locally | Planned differential |
| Committed snapshots and notification timing | XState 5.33.2 | XFSM local timing tests pass | Planned differential |
| v4 migration aliases | XState 4.38.3 and XState 5.33.2 | `cond` and `internal` trace matches pinned v4; canonical behavior is covered by v5 | Pass for implemented aliases |

XFSM diagnostics, native records, resource limits, Espruino ownership, firmware
integration, `save()`, pins and timers have no direct Node equivalent. Their
exclusion from differential execution must be recorded against the relevant
conformance cases rather than treated as missing comparison data.

## Target Execution Register

| Target | Build status | Tests completed | Outstanding or blocker |
| --- | --- | --- | --- |
| Linux Espruino | Build verified | Sixteen semantic suites, 66-check sanitizer suite, pinned XState 4.38.3/5.33.2 references including complete M6.3 domains/depth, M5 resource and completion measurements | Complete later M6 batches, remaining differential corpus, allocation faults, save/reset where applicable, final full-suite rerun |
| Original ESP32 IDF5 | Build verified; implemented physical slices pass | Fourteen semantic suites, completion boundary, timing, stack and GC relocation on physical ESP32-D0WD-V3 | M6.3 physical run; later M6 suites, native/flash callback, pins/timers, save/reset, final RAM/cleanup and release-image run |
| Espruino Pico | Reduced-profile build verified | Matching disabled/enabled size comparison | Physical board execution, complete portable suite, stack/RAM/timing, save/reset and hardware callbacks |
| MDBT42Q | Not yet verified | Stock DFU passes; XFSM compiles and links | Blocked by 22,176-byte Storage overlap; select and document a viable product profile before runtime testing |
| ESP32-C3 IDF5 | Not yet verified | Upstream stock-build capacity reviewed | Build with XFSM, then complete RISC-V physical qualification |
| ESP32-S3 IDF5 | Later expansion target | None required for Profile 1 | Optional after the Espruino port reaches the required maturity |

## Build And CI Register

| Check | Current status | Remaining action |
| --- | --- | --- |
| Linux build with XFSM disabled | Pass | Repeat at release candidate |
| Linux build with XFSM enabled | Pass | Repeat at release candidate |
| Linux semantic and sanitizer CI | Configured on fork branch | Expand as new suites are added and preserve the disabled build |
| Original ESP32 IDF5 enabled CI build | Configured on fork branch | Add final release configuration and retain as fork-development coverage |
| Pico reduced-profile build | Pass locally | Decide whether to add fork CI; run on physical Pico |
| MDBT42Q enabled build | Fails size gate | Do not claim support; retry only after product-profile decision |
| ESP32-C3 IDF5 enabled build | Planned | Add after local provisioned build succeeds |

## Final Review Closure Checklist

Profile 1 cannot be declared complete until all of the following are true:

1. Every normative `MUST` and `MUST NOT` is represented in the conformance
   matrix and linked to an automated check, inspection, measurement, or
   reasoned exclusion.
2. Every row in this inventory is `Pass`, `Not applicable`, or an explicitly
   accepted exclusion; no unexplained `Partial`, `Planned`, or `Blocked` row
   remains.
3. Every shared statechart behaviour has a reviewed pinned XState differential
   trace, or the case records why comparison is not applicable.
4. The complete Linux semantic, validation, fault, native-format, sanitizer,
   resource, and differential suite passes from a clean build.
5. Each claimed physical target has the evidence required for its stated
   `Build verified` or `Conformance verified` status.
6. Normal release images contain no private measurement API or test-only fault
   seam.
7. Enabled and disabled builds pass, and attributable flash/RAM/stack/timing
   results identify the exact revisions and configurations.
8. Save/restoration, GC relocation, native callbacks, representative pins and
   timers, and the interrupt boundary have their required physical evidence.
9. The arena format and all provisional resource decisions are either frozen
   or revised with linked evidence.
10. Result records, reports, this inventory, the conformance matrix,
    implementation status, licensing review, and user documentation all refer
    to compatible final revisions.

## Maintenance Procedure

When implementing or executing a test:

1. assign or retain its stable `XFC-CF-<AREA>-<NUMBER>` conformance identifier;
2. update the appropriate completed-suite and functional-coverage rows here;
3. update the conformance matrix requirement mapping;
4. record target, revisions, configuration, commands and result under
   `tests/results/`;
5. link any interpretive report without replacing the machine-readable result;
6. preserve failures and reasoned skips rather than converting them into
   passes through scope changes; and
7. update the final-review checklist only when linked evidence closes the
   corresponding condition.
