# Shallow-History Physical Qualification

Date: 2026-10-20

## Purpose

This report records host and physical qualification of the experimental XFSM
shallow-history extension on the `experiment/xfsm-history` branches. The work
does not alter the completed Profile 1 conformance claim or frozen Native
Format Version 1.

Machine-readable evidence is recorded for [Linux](../../tests/results/linux/2026-10-20-shallow-history.json),
the [original ESP32](../../tests/results/esp32-xtensa/2026-10-20-shallow-history.json),
and the [ESP32-C3](../../tests/results/esp32-riscv/2026-10-20-shallow-history.json).

## Candidate

| Item | Value |
| --- | --- |
| Project branch | `experiment/xfsm-history` |
| Project base revision | `2af25e3b51cae04d544e512fa1cf3e00734f0b30` |
| Specification version | `0.52` plus the experimental extension |
| Implementation branch | `experiment/xfsm-history` |
| Implementation base revision | `48d8d3e8e0d32885188a40dd319d7e90b9e9b86a` |
| Runtime | Espruino `2v29.453`, reported commit `48d8d3e8e` |
| Source identity | Uncommitted experimental tree, pinned by SHA-256 in each result |
| Native format | Experimental Version 2 |

The build revision printed by Espruino identifies the committed base, not the
uncommitted extension. The result files therefore include hashes for the engine
sources and exact test fixtures used.

## Host Regression

A clean production Linux build passed all 25 portable JavaScript suites. This
includes the complete history suite, the independent target-sized history
suite, and history diagnostics. Every suite returned to zero memory records
after GC.

The native suite passed 92 AddressSanitizer, UndefinedBehaviorSanitizer, leak,
bounds, and corruption checks. The static contract audit checked 199 functions
across 12 source files and reported no failures. The pinned XState 5.33.2
reference passed all eight history scenarios.

The final native review found that a hand-corrupted restored arena could place
a history node directly below the machine root even though the production
compiler cannot emit that form. The native validator was tightened, a direct-
root corruption check was added, and the sanitizer total increased from 91 to
92 passing checks.

## Physical Behavior

Both targets used their stock full-feature IDF5 profiles with no `SETDEFINES`
override. On each target the following production-firmware tests passed:

- target-sized shallow restoration, fallback, nested-owner, final-state,
  isolation, rollback, GC, and stop semantics;
- invalid history configuration diagnostics;
- whole-interpreter save and hard-reboot restoration without replay;
- reset without synthetic exit actions and saved-image erasure; and
- compact strict validation after the normal production image was restored.

The complete desktop `test_history.js` source retains all of its scenario
functions while Espruino evaluates the enclosing script and exhausted the C3's
finite JsVar pool. This is a test-fixture loading limit, not a runtime history
failure. `test_history_embedded.js` separates the same target-relevant groups,
releases each graph, and forces GC between them. It passed on Linux and both
physical targets and is the applicable constrained-target suite.

The original ESP32 saved 39,284 interpreter bytes as 9,727 compressed bytes.
The C3 saved 39,351 interpreter bytes as 9,580 compressed bytes. On both, an
actor saved outside its history owner returned to the remembered child after
reboot, and stopping the actor did not rewrite its remembered history.

## Resource Results

| Measurement | Linux | Original ESP32 | ESP32-C3 |
| --- | ---: | ---: | ---: |
| Base arena | 514 bytes | 514 bytes | 514 bytes |
| History arena | 576 bytes | 576 bytes | 576 bytes |
| Arena delta | 62 bytes | 62 bytes | 62 bytes |
| Persistent machine-block delta | 2 | 5 | 5 |
| Construction-peak block delta | 19 | 18 | 18 |
| Persistent actor-block delta | 0 | 0 | 0 |
| Actor native-byte delta per owner | 4 | 4 | 4 |
| Restore temporary-block delta | 0 | 0 | 0 |
| Restore coordinator-stack delta | 0 | 0 | 0 |
| Measured restore stack | 352 bytes | 224 bytes | 256 bytes |

The four actor bytes are the two transactional 16-bit history banks for one
history owner. The differing persistent block counts reflect each target's
JsVar representation; the native arena and actor-byte costs are identical.

## Firmware Fit

| Target | Production image | Free application partition | Instrumented image |
| --- | ---: | ---: | ---: |
| Original ESP32 `ESP32_IDF5` | 1,527,984 bytes | 520,016 bytes (25%) | 1,529,008 bytes |
| ESP32-C3 `ESP32C3_IDF5` | 1,718,160 bytes | 329,840 bytes (16%) | 1,719,424 bytes |

The instrumented images were used only for measurement. Each board was then
restored to its normal production image before compact validation was rerun.

Same-revision builds provide the full XFSM cost for each experimental firmware:

| Target | XFSM disabled | XFSM enabled | Delta |
| --- | ---: | ---: | ---: |
| Original ESP32 | 1,491,968 bytes | 1,527,984 bytes | 36,016 bytes (2.414%) |
| ESP32-C3 | 1,678,240 bytes | 1,718,160 bytes | 39,920 bytes (2.379%) |

Compared with the previously qualified Profile 1 enabled images, these enabled
images are 2,736 bytes (0.179%) larger on the original ESP32 and 3,040 bytes
(0.177%) larger on the C3. Those smaller figures indicate the history-change
cost, but are not same-revision feature-toggle deltas because history has no
production build switch.

## Outcome

`XFC-HIST-HOST-001` is complete for Linux stop behavior and physical Espruino
save/restoration on both ESP32 architectures. The behavioral portions of
`XFC-HIST-RUNTIME-001` through `XFC-HIST-FINAL-001` also pass on both targets.

`XFC-HIST-RESOURCE-001` passes its matched firmware, arena, actor RAM, compiler
peak, restore allocation, stack, production-fit, and cross-architecture
physical measurements. All ten extension cases now pass for the experimental
candidate. Promotion into a later public profile remains a separate governance
decision.
