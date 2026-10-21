# History Integration Optimization

Date: 2026-10-21

## Purpose

This report records the targeted resource and operational improvements made
after the step-back review of the experimental shallow/deep-history addition.
It supplements the existing history qualification rather than changing the
completed Profile 1 claim.

Machine-readable host evidence is in the [Linux result](../../tests/results/linux/2026-10-21-history-integration-optimization.json).

## Candidate

| Item | Value |
| --- | --- |
| Project base revision | `aa7e835514d8abde1a2775d2ab5e93cd807cdb95` |
| Implementation branch | `experiment/xfsm-history` |
| Compiler optimization | `5a044617a` |
| Reviewed implementation | `6f42145347d8f4018b2a1ec221b3834bf9561a24` |
| Native format | Experimental Version 2; physical layout unchanged |

## Compiler Workspace

The compiler previously stored a history-slot value in the allocation-heavy
metadata array and the compact numeric record for every state. Count and emit
already traverse states in the same index order, so their existing history
cursors define the same slot without that duplicated value.

The change removes one temporary JavaScript integer per state, removes the
compiler-wide slot counter and lookup helper, and reduces the compact compiler
state record from six bytes to four. The emitted arena and actor format do not
change.

| Linux fixture | Before | After | Change |
| --- | ---: | ---: | ---: |
| Base construction peak | 101 blocks | 99 blocks | -2 |
| One-owner history construction peak | 120 blocks | 113 blocks | -7 |
| Matched shallow construction peak | 147 blocks | 140 blocks | -7 |
| Matched deep construction peak | 147 blocks | 140 blocks | -7 |

Arena sizes remain 514 bytes for the base fixture, 576 bytes for its history
variant, and 660 bytes for both matched shallow and deep fixtures.

## Runtime Transaction

The two actor-owned history banks remain the rollback mechanism. Previously,
every active `start()`, `send()`, and `stop()` operation copied the complete
committed bank and successful operations switched banks even when history did
not change.

The runtime now reads the committed bank directly until the first history
capture. That first write copies the bank once, later writes in the same
operation reuse it, and successful publication switches banks only when one
was prepared. A fault still leaves the committed bank selected. This removes
all history-bank copying and flag changes from unhandled events, targetless
transitions, transitions that remain inside a history owner, and `stop()`.

The change adds one temporary Boolean to the native coordinator frame. It does
not change persistent actor bytes, arena bytes, retained JsVars, or the Version
2 physical layout. Instrumented representative restore measurements retain the
previous temporary-allocation and stack results.

## Scaling Measurement

`measure_history_dispatch.js` constructs matched actors with 0, 1, 8, and 32
history owners. It times 20,000 unhandled, targetless, and ordinary sends and
10,000 exit/restore pairs. The final production Linux run recorded:

| Owners | Actor bytes | Unhandled | Targetless | Ordinary | Exit/restore pair |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 16 | 54.690 us | 54.264 us | 47.790 us | n/a |
| 1 | 20 | 45.375 us | 47.154 us | 51.823 us | 90.087 us |
| 8 | 48 | 45.382 us | 47.195 us | 52.213 us | 90.971 us |
| 32 | 144 | 45.780 us | 47.232 us | 52.863 us | 92.640 us |

Repeated eager and lazy host runs varied enough with scheduling that they do
not establish a precise speedup. They do show no material owner-count penalty
for operations that do not use history after the change. The deterministic
improvement is stronger evidence here: those operations now perform zero bank
copies, while an operation that captures history performs one `2 * H`-byte
copy at its first write.

## Verification

- clean production Linux build passed all 26 portable JavaScript suites;
- every suite returned to zero memory records after garbage collection;
- focused full and embedded tests verify that ordinary operations retain the
  bank flag and exiting a history owner switches it;
- native AddressSanitizer, UndefinedBehaviorSanitizer, leak, bounds, and
  corruption suite passed all 96 checks;
- static contract audit passed 198 functions across 12 files;
- pinned XState 5.33.2 shallow and deep history runners passed; and
- the dedicated scaling fixture passed and returned to zero memory records.

Matched IDF 5.5.3 release cross-builds with `USE_XFSM=1` also pass at the
complete implementation revision:

| Target | Current image | Previous deep candidate | Change | App partition free |
| --- | ---: | ---: | ---: | ---: |
| Original ESP32 `ESP32_IDF5` | 1,527,840 bytes | 1,528,160 bytes | -320 bytes | 520,160 bytes (25%) |
| ESP32-C3 `ESP32C3_IDF5` | 1,718,000 bytes | 1,718,304 bytes | -304 bytes | 330,000 bytes (16%) |

These builds verify compilation and layout on both Xtensa and RISC-V targets.
The exact optimized candidate was subsequently flashed and passed the complete
target-sized history, diagnostics, save/restoration, reset, measurement, and
production-timing rerun on both boards. Normal production firmware was
restored afterward. See the [history promotion
rerun](2026-10-21-history-promotion-rerun.md).
