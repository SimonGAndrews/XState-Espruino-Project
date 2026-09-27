# XFSM Compiler JsVar Optimization

Date: 2026-09-27

## Purpose

This work implements the two highest-value stages identified by the
[ESP32-C3 compiler investigation](2026-09-27-c3-compiler-jsvar-investigation.md):
derived state paths and IDs are reconstructed when needed, and JavaScript
array state metadata is replaced with a compact GC-owned flat workspace.
Profile 1 behavior, limits, diagnostics, and Native Format Version 1 remain
unchanged.

The implementation is committed at Espruino revision `cb5d74e8953ac7b4290aaba64f2aabe7714a3a05`.
Target measurements are retained in the [classic ESP32
result](../../tests/results/esp32-xtensa/2026-09-27-compiler-jsvar-optimization.json)
and [ESP32-C3
result](../../tests/results/esp32-riscv/2026-09-27-compiler-jsvar-optimization.json).

## Implementation

The compiler now retains only each state's source configuration, key, parent
index, depth, type, and effective ID during construction. Numeric state
topology is packed into a temporary flat string of four-byte records, while a
small GC-visible owner array keeps the JavaScript values reachable. Full
object-graph paths, implicit IDs, and completion event names are reconstructed
from the bounded parent chain when required.

The flat workspace is an Espruino-owned string rather than native-heap memory.
No raw pointer into it survives an operation that can allocate or trigger
garbage collection. A new deterministic `compile.workspace` fault seam covers
workspace-allocation failure and cleanup. The arena and retained-binding
formats are unchanged.

## Resource Result

On the stock 70 KB ESP32-C3 profile, the same compact depth-32 fixture used by
the investigation changed as follows:

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Compiler peak delta | 2,245 blocks | 1,335 blocks | -910 blocks (-40.5%) |
| Persistent machine | 410 blocks | 409 blocks | -1 block |
| Arena | 4,610 bytes | 4,610 bytes | unchanged |

The action-heavy depth-32 fixture, which previously failed on the stock C3
profile, now passes. Its measured construction envelope is:

| Target | Pool | Approximate absolute peak | Remaining headroom |
| --- | ---: | ---: | ---: |
| Original ESP32, 14-byte blocks | 2,799 | 1,759 | 1,040 blocks (37.2%) |
| ESP32-C3, 13-byte blocks | 3,012 | 1,838 | 1,174 blocks (39.0%) |

The one-pass path reconstruction refinement reduced the classic ESP32
action-heavy construction time from 8,023.666 ms to 2,299.789 ms, about 71.3%,
without changing its measured peak.

## Verification

The exact committed implementation passed:

- all 22 normal Linux JavaScript suites;
- deterministic `XFC_TEST=1` allocation-fault coverage, including the new
  workspace seam;
- all 66 native-format checks under address, undefined-behaviour, and leak
  sanitizers;
- compact and action-heavy depth-32 construction on physical original ESP32
  and ESP32-C3 hardware using the stock 70 KB native-heap reserve;
- direct and Storage-backed 65-action depth execution on both boards;
- exact shared-machine and fault cleanup, GC relocation, and 128-event
  serialization on both boards; and
- a normal-firmware module smoke test after restoring each board from its
  measurement image.

The measured maximum coordinator stack was 224 bytes on the classic ESP32 and
256 bytes on the C3, within the 1,024-byte XFSM reserve.

## Decision

The stock full-feature 70 KB native-heap profile is selected for both original
ESP32 and ESP32-C3 XFSM qualification. The 65 KB `SETDEFINES` profile remains
only as a historical diagnostic tool and is not required by the optimized
compiler. Hierarchy depth 32 and all other Profile 1 resource limits are
retained.

Compact symbol metadata and further lifetime splitting are deferred. The
current stock-profile margin does not justify their additional compiler and
ownership complexity before loaded WiFi, HTTPS/TLS, BLE, and combined-service
qualification is measured.
