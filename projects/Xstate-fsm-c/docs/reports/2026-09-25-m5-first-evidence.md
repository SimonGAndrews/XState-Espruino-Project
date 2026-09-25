# M5 First Vertical-Slice Evidence Report

## Scope

This report records the first M5 measurements for the M4 construction and
execution slice. Linux evidence passed, and all XFSM sources compiled for the
32-bit MDBT42Q toolchain. The M5 exit gate remains open because no constrained
target image linked or ran and completion cascades are not yet implemented.

## Revisions And Evidence

- XState-Espruino-Project evidence base: `02bf91b`
- Profile 1 specification: `0.48`
- Espruino implementation: `de251bd97`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Linux result: [M5 resource evidence](../../tests/results/linux/2026-09-25-m5-resource-evidence.json)
- MDBT42Q result: [M5 build attempt](../../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json)

The Linux compiler was GCC 13.3.0 on little-endian x86-64. MDBT42Q used the
pinned `arm-none-eabi-gcc` 13.2.1 toolchain, `RELEASE=1`, LTO, and the normal
DFU-update build configuration.

## Firmware Cost

Identical clean Linux builds without and with `USE_XFSM=1` measured with
`size` were:

| Build | text | data | bss | total |
| --- | ---: | ---: | ---: | ---: |
| Disabled | 1,195,542 | 20,048 | 4,704 | 1,220,294 |
| Enabled | 1,264,038 | 20,976 | 4,704 | 1,289,718 |
| Delta | 68,496 | 928 | 0 | 69,424 |

The unstripped host executable grew by 153,856 bytes; that file-size delta is
not a firmware-flash estimate. On MDBT42Q, both the disabled baseline and
enabled build failed to link, overflowing the application flash region by
176,576 and 215,016 bytes respectively. The difference attributes 38,440
bytes to XFSM in that release/LTO link attempt. The 32-bit compile itself was
clean, but MDBT42Q remains `Not yet verified` and XFSM was not added to the
stock board definition.

## RAM And Representation

Linux uses 27-byte Espruino variable blocks in this build. The representative
two-level machine used a 400-byte native arena and retained two JavaScript
values. Its measured costs were:

| Item | Blocks | Bytes |
| --- | ---: | ---: |
| Persistent compiled machine | 25 | 675 |
| Construction sampled peak | 107 | 2,889 |
| Actor | 23 | 621 |
| First snapshot | 16 | 432 |
| First subscription | 17 | 459 |

At depth 32 the arena was 4,393 bytes, construction reached a sampled peak of
1,368 blocks (36,936 bytes), and the first hierarchical snapshot used 73
blocks (1,971 bytes). The arena remains a single exact-sized, pointer-free
flat string. GC followed by `E.defrag()` preserved dispatch and snapshot
behavior, and the test host returned to zero retained records after cleanup.

## Timing And Stack

Five 5,000-send trials reported these median host times:

| Dispatch | Microseconds |
| --- | ---: |
| Local hit | 43.26 |
| Parent fallback | 44.71 |
| Guarded, including one JavaScript callback | 54.84 |
| Unhandled | 43.44 |

Parent-fallback traversal rose from 42.35 microseconds at depth 1 to 47.91 at
depth 32. Runtime coordinator stack stayed constant across depths because the
hierarchy algorithms are iterative: start used 224 bytes and send used at
most 288 bytes in the instrumented Linux build. The selected Linux coordinator
reserve is 512 bytes, plus Espruino's 512-byte safety allowance. An oversized
reserve test confirmed rejection before the actor becomes busy or changes
state. The MDBT42Q reserve remains pending physical measurement.

## Diagnostics And Missing Evidence

The representative deep-path target error was 87 characters. Its sampled
construction/formatting peak was 93 blocks (2,511 bytes), with 21 blocks
remaining while the exception was observable. Formatting uses Espruino-owned
values and no separate native heap allocation. The existing categorized,
path-bearing diagnostic policy is retained provisionally.

Completion-chain timing near 256 microsteps was not fabricated: the M4 slice
does not implement final-state and `onDone` completion processing. That
measurement and the microstep-limit decision remain open and must be completed
before the rest of M6 proceeds. On-device RAM, timing, stack, and GC behavior
also remain required after the MDBT42Q flash/build issue is resolved.

## Review Decisions

| Decision | M5 position |
| --- | --- |
| Native layout | Retain provisionally; do not freeze before a constrained image links and runs. |
| Hierarchy depth 32 | Retain provisionally. Linux traversal is iterative and modest in runtime cost, but the 36,936-byte construction peak requires constrained-RAM evidence. |
| Microstep budget 256 | No decision; completion-chain evidence is unavailable until the required behavior exists. |
| Stack reserve | Use 512 coordinator bytes plus 512 Espruino safety bytes on Linux; measure and select per physical target. |
| Snapshot strategy | Retain lazy materialization provisionally; deep snapshots scale linearly and remain a target-RAM review item. |
| Retained-value ownership | Retain; GC and relocation evidence passed on Linux. |
| Diagnostic detail | Retain categorized path-bearing errors provisionally; recheck flash and peak RAM on the constrained target. |

M5 has therefore produced useful implementation evidence but has not satisfied
its exit gate. Full Profile 1 implementation must not be described as having
passed this gate until constrained-target and completion-chain results close
the two explicit gaps.
