# M5 First Vertical-Slice Evidence Report

## Scope

This report records the first M5 measurements for the M4 construction and
execution slice. Linux evidence passed, and all XFSM sources compiled for the
32-bit MDBT42Q toolchain. The stock MDBT42Q image passed its build and size
checks. The XFSM-enabled ELF linked but exceeded the board's code budget before
reserved Storage, so no XFSM-enabled constrained image ran. Clean disabled and
enabled original ESP32 images also built successfully under ESP-IDF 5.5.3.
Completion cascades are not yet implemented.

## Revisions And Evidence

- XState-Espruino-Project evidence base: `02bf91b`
- Profile 1 specification: `0.48` for the initial Linux/MDBT42Q evidence;
  `0.49` for the original ESP32 IDF5 extension
- Espruino implementation: `de251bd97`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Linux result: [M5 resource evidence](../../tests/results/linux/2026-09-25-m5-resource-evidence.json)
- MDBT42Q result: [M5 build attempt](../../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json)
- Original ESP32 result: [M5 IDF5 build](../../tests/results/esp32-xtensa/2026-09-25-m5-idf5-build.json)

The Linux compiler was GCC 13.3.0 on little-endian x86-64. MDBT42Q used the
pinned `arm-none-eabi-gcc` 13.2.1 toolchain, `RELEASE=1`, LTO, and the normal
DFU-update build configuration. The target toolchain was selected with
`source scripts/provision.sh MDBT42Q`. The inherited Codex-shell `DEBUG=release`
variable was removed from the build environment so Make retained the board's
`-Os` optimization, matching Espruino's official workflow.

## Firmware Cost

Identical clean Linux builds without and with `USE_XFSM=1` measured with
`size` were:

| Build | text | data | bss | total |
| --- | ---: | ---: | ---: | ---: |
| Disabled | 1,195,542 | 20,048 | 4,704 | 1,220,294 |
| Enabled | 1,264,038 | 20,976 | 4,704 | 1,289,718 |
| Delta | 68,496 | 928 | 0 | 69,424 |

The unstripped host executable grew by 153,856 bytes; that file-size delta is
not a firmware-flash estimate. The corresponding optimized MDBT42Q results
were:

| Build | text | data | bss | total |
| --- | ---: | ---: | ---: | ---: |
| Disabled | 314,904 | 376 | 44,520 | 359,800 |
| Enabled | 337,192 | 376 | 44,500 | 382,068 |
| Delta | 22,288 | 0 | -20 | 22,268 |

XFSM added 22,288 flash bytes, 7.07% of the baseline `text + data`. The stock
image passed with 112 bytes between code and reserved Storage. The enabled ELF
linked, but Espruino's target size check found code overlapping Storage by
22,176 bytes, exactly the remaining XFSM cost after consuming that headroom.
The official upstream `build_dfu (MDBT42Q)` job passed for the same base commit
in [Firmware build run 36115500476](https://github.com/espruino/Espruino/actions/runs/36115500476).
MDBT42Q remains `Not yet verified` for XFSM, and XFSM was not added to the stock
board definition.

The original ESP32 used the `ESP32_IDF5` board definition, ESP-IDF 5.5.3, and
Xtensa GCC 14.2.0. Its disabled image was 1,491,968 bytes and its XFSM-enabled
image was 1,519,872 bytes. XFSM therefore added 27,904 bytes (1.87%), while the
enabled image passed the 2,048,000-byte app-partition check with 528,128 bytes
free. This advances original ESP32 IDF5 to `Build verified`; physical runtime
and conformance remain unverified.

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
