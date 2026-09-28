# Profile 1 Test Inventory

## Status And Purpose

- Inventory status: living execution register
- Last reviewed: 2026-09-28
- Specification: Profile 1 version 0.52
- Normative authority: [Profile 1 specification](../docs/specification.md)
- Requirement mapping: [conformance matrix](conformance-matrix.md)
- Requirement audit: [707-unit normative audit](normative-audit.md), complete

This document is the single operational record of tests completed to date and
tests still required for final Profile 1 review. It records executable suites,
functional coverage, differential coverage, target execution, and outstanding
work. The normative audit is the requirement-level authority, while the
conformance matrix defines stable aggregate evidence cases. All three documents
must be updated together when a case is added or its status changes.

This inventory covers the complete test plan currently known. The completed M0
audit froze and reviewed 707 normative units: 499 have passing evidence, 188
have partial evidence, 17 depend on planned evidence, and three are explicitly
non-applicable to Version 1 execution evidence. It added fourteen stable
closure cases to the conformance matrix; seven now pass, including traceability,
and the canonical trace foundation is partial. Future specification changes
must update the registry, mapping, matrix and this inventory together.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| **Pass** | The identified test ran successfully and has linked evidence for the stated target and revision. |
| **Fail** | The identified test ran and exposed a reproducible behavioural or resource failure for the stated target and revision. |
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
`libs/xfsm/tests/`. All twenty-two normal JavaScript suites below pass on Linux
Espruino. The stock 70 KB original ESP32 M7.4 and ESP32-C3 C3-D candidates
each pass all 20 embedded-applicable portable suites. Their complete target
evidence is in the [M7.4
result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json) and [C3-D
result](results/esp32-riscv/2026-09-28-m7-release-candidate.json). The full
desktop strict-validation and large-limit sources are not classified as
portable embedded suites.

| Executable suite | Principal coverage | Linux | Physical target(s) | Evidence |
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
| `test_transition_domains.js` | Targetless and forbidden transitions; atomic and compound self-transition defaults and re-entry; descendant, ancestor, sibling, root, and cross-branch domains; initial-action boundaries | Pass | Pass | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json), [ESP32 current result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json) |
| `test_transition_depth.js` | Depth-32 exit, transition, and entry traversal with 65 ordered actions and an active-ancestor target | Pass | Pass on stock 70 KB profile | [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json), [ESP32 optimization result](results/esp32-xtensa/2026-09-27-compiler-jsvar-optimization.json) |
| `test_lifecycle_complete.js` | Complete state-operation matrix, busy-call precedence, startup/guard/entry/exit/stop faults, exact thrown identity, rollback, terminal fault rejection, and actor receiver validation | Pass | Pass | [Linux M6 lifecycle/subscriber result](results/linux/2026-09-27-m6-lifecycle-subscribers.json), [ESP32 current result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json) |
| `test_subscriber_complete.js` | Exact-one-callable contract, deterministic listener mutation, duplicate registrations, snapshot identity, busy calls during every notification type, listener-error continuation, terminal cleanup, and unsubscribe receiver validation | Pass | Pass | [Linux M6 lifecycle/subscriber result](results/linux/2026-09-27-m6-lifecycle-subscribers.json), [ESP32 current result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json) |
| `test_cross_actor_gc.js` | Nested calls into a different actor from guards, assignments, actions, and listeners; independent commits and propagated faults; broader retained-graph relocation | Pass | Pass | [Linux host-lifecycle result](results/linux/2026-09-27-m6-host-lifecycle.json), [ESP32 host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) |
| `test_strict_validation.js` | Strict top-level/state/transition schema, excluded-feature rejection, accessor safety, diagnostic categories/paths, and 48-byte UTF-8-safe detail truncation | Pass | Reasoned non-run: source exhausts stock test heap | [Linux validation/fault result](results/linux/2026-09-27-m6-validation-faults.json), [ESP32 validation/runtime result](results/esp32-xtensa/2026-09-27-m6-validation-runtime.json) |
| `test_strict_validation_embedded.js` | Compact strict-schema, accessor-safety, diagnostic-detail, and production-private-API smoke for constrained targets | Pass | Pass | [Linux validation/fault result](results/linux/2026-09-27-m6-validation-faults.json), [ESP32 validation/runtime result](results/esp32-xtensa/2026-09-27-m6-validation-runtime.json) |
| `test_limits.js` | Hierarchy depth 32/33, symbol/event byte length 65,535/65,536, Unicode byte boundaries, and recoverable oversized runtime-event rejection | Pass | Reasoned non-run: Linux large-limit harness | [Linux validation/fault result](results/linux/2026-09-27-m6-validation-faults.json) |
| `test_save_restore.js` | Deferred save from every callback boundary; hard-reboot restoration of every actor lifecycle state, compiled machines, callbacks, snapshots, context, and subscriptions without replay | Not applicable | Pass | [ESP32 host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) |
| `test_reset_lifecycle.js` | `reset(true)` erases the saved image without executing exit actions for discarded active actors | Not applicable | Pass | [ESP32 host-lifecycle result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json) |
| `test_host_application.js` | Retained outer-scope, closure, flash-module and native callbacks; GPIO actions; timer-driven synchronous dispatch; subscription order; flash-callback fault rollback; Storage, module-cache and pin cleanup | Not applicable: physical host integration | Pass twice | [ESP32 M7.1 application-integration result](results/esp32-xtensa/2026-09-27-m7-application-integration.json) |
| `test_host_memory_cleanup.js` | Shared-machine/eight-actor stress, context isolation, subscription and snapshot lifetime, live-graph relocation, repeated construction, fault rollback, and exact settled-baseline recovery | Not applicable: physical host integration | Pass twice | [ESP32 M7.2 memory/serialization result](results/esp32-xtensa/2026-09-27-m7-memory-serialization.json) |
| `test_host_event_serialization.js` | A one-millisecond timer becomes due during a measured 128-send synchronous sequence, waits for every publication, and then observes the fully committed result | Not applicable: physical host integration | Pass twice | [ESP32 M7.2 memory/serialization result](results/esp32-xtensa/2026-09-27-m7-memory-serialization.json) |
| `prepare_host_service_coexistence.js` | Retained service actor with ordered assignment, actions, guard, subscriptions, final state, and a depth-24 branch executing 49 ordered actions during HTTPS completion | Not applicable: physical service integration | ESP32-C3: Pass four times; original ESP32: Pass | [C3 service result](results/esp32-riscv/2026-09-28-m7-service-coexistence.json), [M7.4 result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json) |
| `test_host_service_coexistence.js` | BLE peripheral and retained GATT connection before/after WiFi association and TLS 1.2 HTTPS, correlated through the XFSM service actor and peer | Not applicable: physical service integration | ESP32-C3: Pass four times; original ESP32: Pass | [C3 service result](results/esp32-riscv/2026-09-28-m7-service-coexistence.json), [M7.4 result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json) |
| `test_transition_depth_storage.js` | Storage-backed construction and execution of the depth-32/65-action trace, native-heap observation, and temporary-file cleanup | Not applicable: physical product profile | Pass on stock 70 KB classic and C3 profiles | [Classic optimization result](results/esp32-xtensa/2026-09-27-compiler-jsvar-optimization.json), [C3 optimization result](results/esp32-riscv/2026-09-27-compiler-jsvar-optimization.json) |
| `test_host_allocation_pressure.js` | Production `E_NO_MEMORY`, failed-construction cleanup, and same-configuration retry after releasing pressure | Not applicable: physical host allocation | Pass twice | [ESP32 M7.3 allocation/profile result](results/esp32-xtensa/2026-09-27-m7-allocation-profile.json) |
| `test_host_diagnostic_pressure.js` | Long diagnostic-path allocation pressure, compact fallback error, and repeat-attempt non-accumulation | Not applicable: physical host allocation | Pass twice | [ESP32 M7.3 allocation/profile result](results/esp32-xtensa/2026-09-27-m7-allocation-profile.json) |

Each Linux semantic suite returned to zero retained Espruino records after its
explicit cleanup and garbage collection. The original ESP32 results are
physical behavioural passes; where their result records say cleanup accounting
is still planned, that limitation remains.

## Completed Internal And Measurement Tests

| Test or measurement | Coverage | Status and evidence |
| --- | --- | --- |
| `native/test_xfsm_native.c` | 73 checked-arithmetic, near-limit range/offset, hash/collision, valid-layout, handler/domain, corruption-rejection and actor-record assertions under address, undefined-behaviour and leak sanitizers | Pass: [structural-contract closure](results/linux/2026-09-28-closure-structural-contract.json) |
| `measure_m5.js` | Firmware, arena, retained values, construction peak, actor/snapshot/subscription cost, representative dispatch timing, hierarchy depth, stack and diagnostic size | Partial M5 pass: [Linux resource result](results/linux/2026-09-25-m5-resource-evidence.json) |
| `measure_m5_completion.js` | Five-trial 256-step completion timing, rejected step 257, stack, rollback and cleanup | Pass on Linux and ESP32: [completion report](../docs/reports/2026-09-26-completion.md) |
| `measure_compile_pressure.js` | Action-heavy compiler peak, persistent use, arena size, construction time, and stock-profile headroom | Pass on original ESP32 and ESP32-C3: [optimization report](../docs/reports/2026-09-27-compiler-jsvar-optimization.md) |
| `measure_m5_gc_relocation.js` | Machine and actor survival across Espruino GC relocation | Pass for the implemented slice on Linux and ESP32: [ESP32 physical result](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json) |
| `measure_post_m6.js` | Complete-engine feature fixture: arena, retained bindings, machine/actor/runtime allocation, snapshot, subscription, stack, ESP32 native heap, and test-loading cost | Pass on Linux and original ESP32: [post-M6 resource report](../docs/reports/2026-09-27-post-m6-resource-review.md) |
| `measure_post_m6_depth.js` | Compact depth-32 construction separated from large all-in-one test-source loading | Pass on Linux, original ESP32, and ESP32-C3; optimized physical results are in the [compiler optimization report](../docs/reports/2026-09-27-compiler-jsvar-optimization.md) |
| `test_stack_reserve.js` | Operation rejection before mutation when the configured coordinator reserve is unavailable | Pass on Linux; normal reserve measured on ESP32: [Linux resource result](results/linux/2026-09-25-m5-resource-evidence.json) |
| `test_fault_injection.js` | Deterministic construction, actor, context, event, assignment, completion, publication, snapshot, stop and subscription allocation failures with rollback and exact error identity | Pass in a separate `XFC_TEST=1` Linux build; `_failNext` is absent from production firmware: [validation/fault result](results/linux/2026-09-27-m6-validation-faults.json) |
| `test_fault_injection_embedded.js` | Sequential constrained-target smoke for compiler workspace/arena, actor, startup, assignment, publication, snapshot and subscription allocation seams | Pass on original ESP32 and ESP32-C3 in temporary `XFC_TEST=1` builds; exact production images restored afterward: [M7.4 result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json), [C3-D result](results/esp32-riscv/2026-09-28-m7-release-candidate.json) |
| `reference/xstate-v5/verify-reference.mjs` | Pinned XState 5.33.2 basic transition, completion, hierarchy, wildcard, forbidden-transition, context/assignment, action/event identity, snapshot values/matches, 16 transition-domain, and maximum-depth traces | Pass: [Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json) and [runtime-contract closure](results/linux/2026-09-28-closure-runtime-contract.json) |
| `reference/xstate-v4/verify-reference.mjs` | Pinned XState 4.38.3 `cond`, `internal`, ordered-action flags, and action-boundary trace | Pass: [Linux M6.1 result](results/linux/2026-09-26-m6-target-events.json) |
| `trace_*.js` with `run_trace_test.py` | Seven reviewed streamed NDJSON cases covering the public/configuration, runtime-contract, and diagnostic closure packages | Pass on Linux: [public/configuration result](results/linux/2026-09-28-closure-public-configuration.json), [runtime-contract result](results/linux/2026-09-28-closure-runtime-contract.json), and [structural-contract result](results/linux/2026-09-28-closure-structural-contract.json) |
| `audit_static_contract.py` | Prohibited allocation/packing/concurrency primitives, recursive call graph, bounded arrays, mutable production globals, hidden ownership, private branding and generated-wrapper declarations | Pass: [structural-contract result](results/linux/2026-09-28-closure-structural-contract.json) |

## Functional Coverage Register

This register identifies both completed coverage and the remaining cases in
each specification area. **Partial** means that the completed cases listed in
the third column pass, but the fourth column must still be closed.

| Area and conformance cases | Status | Completed coverage | Outstanding tests |
| --- | --- | --- | --- |
| Optional library and module API (`BUILD-001/002`, `API-001/002`) | Partial | Disabled and enabled Linux builds; module exports; actor and machine smoke; canonical Linux negative surface, receiver and private-brand rejection; original ESP32 and ESP32-C3 module execution | Repeat `API-002` on physical targets, complete public-surface checks on Pico and MDBT42Q, and verify absence of all XFSM code and symbols in each representative disabled build |
| Native arena and actor records (`FORMAT-001/002/003`) | Pass | Exact frozen Version 1 layout, complete compile-time size/offset assertions, near-limit arithmetic/ranges, valid arenas, corruption rejection, byte-order mismatch, hashes, domains and actor validation across representative architectures | Maintain the frozen format and increment its version for an incompatible physical change |
| Machine-definition lifetime and ownership (`CONFIG-001/002/003/004/005`, `HOST-001/007`) | Pass for implementation contract | Two-pass construction, source independence, retained bindings, accessor-safe traversal, canonical composition and implementation-map ownership closure, deterministic arena-allocation failure and cleanup; formal static ownership/lock review; original ESP32 shared-machine and pressure evidence | Repeat portable runtime cases on remaining qualified targets under `BUILD-006` |
| State-node and initial-transition grammar (`CONFIG-001/003/004`) | Pass on Linux | Canonical closure covers invalid root shapes, explicit/inferred atomic, compound and final nodes, empty atomic `states`, initial descriptors, action/event order, nested-machine rejection, punctuated keys, composition, source independence and contradictory forms | Repeat the portable trace on qualified physical targets |
| Excluded-feature rejection (`CONFIG-003`, `DIAG-001/005/006`) | Pass on Linux | Automated strict rejection covers parallel/history states, eventless/delayed transitions, invoke, activities, tags, output, actors/spawning, restored-snapshot input, custom delimiters and unsupported properties; the exhaustive category/path matrix passes | Repeat the compact subset on remaining qualified targets |
| Target grammar and ID resolution (`TRANS-001/002`) | Partial | Exact-key-first and segmented bare targets, relative dot form, root/effective ID paths, explicit IDs with punctuation, escaped period/backslash/leading punctuation, duplicate IDs, malformed and ambiguous targets | Target and path length boundaries, allocation failures, and full deep ancestor/descendant/domain combinations |
| Event grammar and lookup (`TRANS-001/003/005`, `LIMIT-004`) | Pass on Linux | Exact strings and object events, identity and captured lookup type, malformed/reserved input rejection, guard coercion, wildcard precedence/fallback, forbidden blocking, parent fallback, collision-safe lookup, UTF-8 byte-length boundaries, event-allocation failures, and pinned shared-semantics comparison | Generated deep lookup cost and remaining target repetition |
| Migration syntax and Stately compatibility (`COMPAT-002/005`) | Partial | `cond`, `internal`, inert true v4 flags, empty compatibility maps, conflict/false/nonempty-map rejection, and pinned v4.38.3 behavior | `COMPAT-005` corpus-governance check, generated Stately v4/v5 fixture ingestion, and rejection of every unsupported generated field |
| Initial context (`CONTEXT-001/002/003`) | Partial | Omitted/literal/factory context semantics, stopped-before-start behavior, invalid results/exceptions, and deterministic context/event allocation failure with no entry or publication | Final repetition on remaining qualified targets |
| Context assignment (`CONTEXT-001/002/004`) | Partial | All assignment forms and positions, identity/ordering semantics, invalid results/exceptions, rollback, and deterministic pending-context allocation failure | Remaining allocation seams identified by the M0 audit and final repetition on qualified targets |
| Action definition and ordering (`ACTION-001/002`) | Pass on Linux | Every action representation and location, initial-transition actions, arrays, `assign`, stop/final/completion events, ordered context observations, ignored returns/thenables, unresolved/invalid descriptors, exact callback arguments, exception suppression, and retained host callback forms | Repeat the canonical trace on qualified physical targets |
| Guards and candidate selection (`TRANS-001/005`, `ACTION-002`) | Pass on Linux | Direct, string and parameterless object guards; truthy coercion; false then true ordered candidates; exact-to-wildcard and parent fallback; all-false no-op; parameter rejection; context/event visibility; and pinned shared-semantics comparison | Repeat the canonical trace on qualified physical targets |
| Transition domains and re-entry (`TRANS-001/002/004`) | Partial | Linux passes the complete scope; original ESP32 passes targetless, forbidden, self, descendant, ancestor, sibling, root, cross-branch, nested-initial and re-entry boundaries; stock 70 KB original-ESP32 and C3 profiles pass the action-heavy depth-32 trace directly and from Storage | Repeat on remaining targets and add any deterministic traversal allocation/fault cases identified by M0 |
| Actor lifecycle (`LIFE-001/002`) | Partial | Linux and original ESP32 pass the complete operation matrix, busy precedence, fault terminality, different-actor nesting, independent commit/fault behavior, and production cleanup of ordinary and faulted graphs; Linux passes deterministic actor/start/send/completion/stop allocation faults; original ESP32 passes production construction pressure/retry and physical save/reboot preserves all five states | Remaining targets and any additional physical pressure points identified by M0 |
| Event dispatch (`TRANS-001`, `LIFE-001`, `HOST-006`) | Partial | Synchronous string/object dispatch, handled/unhandled publication, same-actor busy rejection, different-actor calls from guards, assignments, actions and listeners, plus timer-callback ingress and static interpreter-boundary inspection on original ESP32 | Generated deep lookup, exact/wildcard lookup cost, long-operation host-event responsiveness, and remaining targets |
| Snapshots and `matches` (`SNAP-001/002`, `LIFE-002`) | Pass on Linux | All statuses and value shapes, total malformed/accessor-safe `matches`, punctuated literal keys, receiver/negative surface, identity and invalidation, lazy allocation, stable-only publication, exact fault retention, deterministic allocation failure, and pinned shared-shape comparison | Repeat the canonical trace and complete physical RAM accounting on qualified targets |
| Subscriptions (`SUB-001/002`) | Partial | Linux and original ESP32 pass listener contract/order/mutation/terminal/error/identity behavior; Linux also passes deterministic subscription and publication-snapshot allocation failure without listener calls | Full Node timing comparison where equivalent and remaining targets |
| Callback failure and rollback (`ACTION-001`, `DIAG-002/004`, `LIFE-002`) | Partial | Callback throws and deterministic allocation failures retain exact identity and last stable state/context; failed publication occurs before commit and suppresses listeners; a flash-backed action fault passes physically on original ESP32 | Remaining completion side-effect boundaries, other targets, and physical allocation-pressure coverage |
| Final states and completion (`FINAL-001/002`) | Pass for implemented Linux/ESP32 scope | Validation, v5 event names, action order, targetless `onDone`, nested cascades, initial final, terminal `done`, stable publication, limit rollback, strict final-state grammar, and deterministic completion-event allocation failure | Run the same portable cases on remaining qualified targets and close any additional completion case found by the M0 audit |
| Construction diagnostics (`DIAG-001/003/005/006`) | Pass on Linux | Exhaustive stable categories and paths, deterministic first error, target/ID/context errors, accessor safety, cyclic input, 48-byte UTF-8-safe quoted/escaped detail, tested failure cleanup, and compact allocation fallback | Repeat the compact portable subset on remaining qualified targets |
| Runtime diagnostics (`DIAG-002/004/005/006`) | Pass on Linux | Invalid inputs/receivers, exact `Error`/`TypeError` classes, busy/fault/allocation categories, exact callback identity, rollback, microstep and byte limits, allocation fallback and last-stable retention | Repeat the compact portable subset on remaining qualified targets |
| Depth, microstep and string limits (`LIMIT-001/002/004`) | Partial | Canonical depth-32/65-action execution from recorded clean baselines and depth-33 structural rejection; 65,535-byte success/65,536-byte rejection with Unicode byte accounting; step 256 success/257 failure; deep trace matched to XState 5.33.2; stock 70 KB original-ESP32 and C3 profiles pass the depth fixture directly and from Storage; the C3 combined-service capacity result is separately classified as `E_NO_MEMORY` | Repeat practical boundaries on remaining product profiles; the huge-string harness is Linux-only by design |
| Stack reserve (`LIMIT-003`) | Partial | Linux reserve negative path; complete-runtime Linux maximum of 704 bytes, earlier original-ESP32 maximum of 448 bytes, and optimized compiler construction maxima of 224 bytes on original ESP32 and 256 bytes on C3; default is 1,024 bytes | Select and verify reserve on Pico and MDBT42Q; complete C3 loaded-service observation |
| GC, save and reset (`HOST-001/002/003/004`) | Partial | Linux suites clean to zero records; broader machine/actor/callback/snapshot/subscription relocation passes on Linux and ESP32; original ESP32 shared, repeated and faulted graphs return exactly to a settled production baseline; callback-requested save, hard-reboot restoration of all actor states, and reset-without-exit pass | Failure-path relocation stress and repetition on remaining save-capable qualified targets |
| Native callbacks, pins and timers (`HOST-005`) | Partial | Original ESP32 passes retained outer-scope, closure, flash-module, native guard and bound native GPIO callbacks; LED1 readback; timer-driven event ingress; exception rollback; Storage/cache cleanup; and safe low pin state | Repeat applicable integration cases on the remaining qualified physical targets |
| Interrupt and concurrency boundary (`HOST-006`, `LIFE`) | Partial | Same-actor synchronous re-entry is rejected; nested operations on different actors use independent state/context and retain committed inner work across outer faults; original ESP32 timer ingress uses normal interpreter dispatch and waits for a 128-send synchronous sequence; static inspection finds no public ISR/task coordinator or XFSM mailbox | Repeat applicable serialization evidence on remaining targets |
| Compiler and target contract (`BUILD`, `FORMAT-001/002/003`, `HOST-007`) | Partial | C99 native suite on 64-bit Linux; successful 32-bit ARM, Xtensa, and ESP32-C3 RISC-V compilation; physical Xtensa/RISC-V runtime; frozen Version 1 layout; byte-order rejection; static portability and host-boundary review | Complete the `BUILD-006` Pico/MDBT42Q target matrix and per-result metadata |
| Canonical portable trace and runner contract (`COMPAT-006`) | Partial | Versioned streamed NDJSON harness, parsed/canonicalized host comparator, reviewed expected traces, physical-artifact composition and seven passing closure cases are implemented; older tests retain their machine-readable markers and the Node runner retains its reviewed JSON summary | Convert the remaining portable behavior and pinned Node cases to the common trace, then run the composed artifacts on qualified physical targets |
| Normative requirement traceability (`COMPAT-007`) | Pass | All 707 normative units are reviewed; all 704 applicable units map to stable cases; three are explicitly non-applicable; every case maps back to a requirement; the drift/orphan checker passes | Maintain the registry and mapping with every normative specification or case change |
| Resource and performance (`RESOURCE-001/002/003`) | Partial | Complete-runtime Linux and ESP32 flash, JsVar, native-heap, arena/binding, actor/allocation, stack, diagnostic, timing and test-loading review; [compiler optimization](../docs/reports/2026-09-27-compiler-jsvar-optimization.md) reduces the compact C3 depth-32 peak by 40.5% and passes action-heavy depth 32 on stock 70 KB classic and C3 profiles with 37-39% headroom; [C3 service coexistence](../docs/reports/2026-09-28-m7-esp32-c3-service-coexistence.md) passes four combined XFSM/BLE/WiFi/TLS runs with a 40,480-byte native-heap minimum; Pico and C3 size comparisons; MDBT42Q size failure; Format Version 1 frozen | `RESOURCE-003`: Pico runtime, viable MDBT42Q product profile or disposition, and any resulting optimization rerun |

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
| Initial descent and initial actions | XState 5.33.2 | Matching initial-transition action and ordered context trace | Pass |
| Ordered guards and parent fallback | XState 5.33.2 | Matching exact rejection, wildcard fallback and parent fallback traces | Pass |
| Exact and wildcard event selection | XState 5.33.2 | Matching exact rejection, wildcard fallback, parent fallback and forbidden blocking trace | Pass |
| Action and ordered assignment visibility | XState 5.33.2 | Matching partial/property-map ordering, same-old-context property expressions, fixed identities, and empty-assignment identity | Pass |
| Context isolation between actors | XState 5.33.2 | Matching shared literal template, first-assign isolation, nested identity, and fresh factory graph isolation; factory call timing is an intentional Profile difference | Pass for shared semantics |
| Targetless and self transitions | XState 5.33.2 | Matching targetless, preserved self and explicit re-entry trace | Pass |
| Relative, explicit-ID and cross-hierarchy targets | XState 5.33.2 | Matching relative reset and explicit-ID cross-hierarchy action-boundary trace; XFSM escaping is Profile-specific | Pass for shared forms |
| Deep hierarchy and least-common-ancestor ordering | XState 5.33.2 | Matching 16-case domain corpus and 32-level, 65-action exit-transition-entry trace | Pass |
| String and object event visibility | XState 5.33.2 | Matching object identity through guard/action; Profile string convenience reuses one materialized callback event | Pass for shared semantics |
| Hierarchical snapshot values and matches | XState 5.33.2 | Matching nested values and object matches; dotted string matching is an intentional literal-key difference | Pass for shared semantics |
| Committed snapshots and notification timing | XState 5.33.2 | XFSM local timing tests pass | Planned differential |
| v4 migration aliases | XState 4.38.3 and XState 5.33.2 | `cond` and `internal` trace matches pinned v4; canonical behavior is covered by v5 | Pass for implemented aliases |

XFSM diagnostics, native records, resource limits, Espruino ownership, firmware
integration, `save()`, pins and timers have no direct Node equivalent. Their
exclusion from differential execution must be recorded against the relevant
conformance cases rather than treated as missing comparison data.

## Target Execution Register

| Target | Build status | Tests completed | Outstanding or blocker |
| --- | --- | --- | --- |
| Linux Espruino | Build verified | Twenty-two normal suites, separate deterministic fault suite, 73-check sanitizer suite, seven canonical closure traces, static contract audit, pinned XState references, broader GC/cross-actor behavior, complete post-M6 resource review, frozen format, and completed normative traceability | Four audit-derived closure cases, remaining differential conversion and release-candidate rerun |
| Original ESP32 IDF5 | [M7.4 release-candidate result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json) passes; Conformance verified | Matched builds; 20 embedded portable suites; deterministic physical allocation seams; direct and Storage-backed maximum depth; exact cleanup, GC, serialization, native callbacks/GPIO/timer, save/restoration/reset; and combined XFSM/BLE/WiFi/TLS service rerun | No target-specific Profile 1 blocker; project-wide closure cases and release review remain |
| Espruino Pico | Reduced-profile build verified | Matching disabled/enabled size comparison | Physical board execution, complete portable suite, stack/RAM/timing, save/reset and hardware callbacks |
| MDBT42Q | Not yet verified | Stock DFU passes; XFSM compiles and links | Blocked by 22,176-byte Storage overlap; select and document a viable product profile before runtime testing |
| ESP32-C3 IDF5 | [C3-D release-candidate result](results/esp32-riscv/2026-09-28-m7-release-candidate.json) passes; Conformance verified | Matched builds; 20 embedded portable suites; deterministic physical allocation seams; direct and Storage-backed maximum depth; exact cleanup, GC, serialization, native callbacks/GPIO/timer, save/restoration/reset; and combined XFSM/BLE/WiFi/TLS service rerun | No target-specific Profile 1 blocker; project-wide closure cases and release review remain |
| ESP32-S3 IDF5 | Later expansion target | None required for Profile 1 | Optional after the Espruino port reaches the required maturity |

## Build And CI Register

| Check | Current status | Remaining action |
| --- | --- | --- |
| Linux build with XFSM disabled | Pass | Repeat at release candidate |
| Linux build with XFSM enabled | Pass | Repeat at release candidate |
| Linux semantic, fault, sanitizer and static CI | Configured on fork branch | Preserve all 22 normal suites, seven canonical trace cases, the 73-check sanitizer suite, static audit, separate `XFC_TEST=1` fault build, and disabled build |
| Original ESP32 IDF5 enabled CI build | Configured on fork branch; M7.4 matched build and physical qualification pass; normal image leaves 522,752 app-partition bytes free | Retain as fork-development coverage |
| Pico reduced-profile build | Pass locally | Decide whether to add fork CI; run on physical Pico |
| MDBT42Q enabled build | Fails size gate | Do not claim support; retry only after product-profile decision |
| ESP32-C3 IDF5 enabled build | C3-D matched build and physical qualification pass; normal image leaves 332,880 app-partition bytes free | Optional fork CI remains useful but is not part of the target's local conformance result |

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
