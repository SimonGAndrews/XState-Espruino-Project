# Post-M6 Whole-Build Resource Review

## Scope And Provenance

- Date: 2026-09-27
- Profile 1 specification: version 0.50
- Project base revision: `38cfcbe`
- Espruino implementation revision: `1589218d3`
- Official Espruino base: `84c190da7`
- Linux toolchain: GCC 13.3.0
- Original ESP32 toolchain: ESP-IDF 5.5.3 and Xtensa GCC 14.2.0
- Cases: `XFC-CF-RESOURCE-001`, `XFC-CF-RESOURCE-002`,
  `XFC-CF-LIMIT-001`, `XFC-CF-LIMIT-002`, `XFC-CF-LIMIT-003`,
  `XFC-CF-HOST-003`, and `XFC-CF-BUILD-004`

This review measures the complete M6 implementation before target profiles are
changed or M7 qualification begins. The machine-readable results are the
[Linux result](../../tests/results/linux/2026-09-27-post-m6-resource-review.json)
and [original ESP32 result](../../tests/results/esp32-xtensa/2026-09-27-post-m6-resource-review.json).

The host exports `DEBUG=release`, which GNU Make treats as an enabled `DEBUG`
variable. Initial ESP32 control builds therefore included `-DDEBUG`; they were
discarded. Every ESP32 number below comes from a clean build run with
`env -u DEBUG`.

## Firmware Cost

| Target and measure | XFSM disabled | XFSM enabled | Increase |
| --- | ---: | ---: | ---: |
| Linux linked `text + data + bss` | 1,216,798 bytes | 1,294,462 bytes | 77,664 bytes (6.38%) |
| Linux executable file | 4,852,552 bytes | 5,017,520 bytes | 164,968 bytes (3.40%) |
| Original ESP32 app image | 1,491,968 bytes | 1,523,424 bytes | 31,456 bytes (2.11%) |

The ESP32 production image leaves 524,576 bytes, or 25.61% of its 2,048,000-
byte app partition. The post-M6 Linux linked delta is 8,240 bytes larger than
the 69,424-byte M5 vertical-slice delta, an 11.87% increase in XFSM's Linux
delta while completing the remaining Profile 1 behavior.

The private ESP32 measurement image is 992 bytes larger than production. The
production image exposes neither measurement nor deterministic-fault methods.

## Runtime Storage

The feature fixture includes nested compound states, a context factory,
guards, named actions, property-map and whole-context assignments, wildcard
lookup, final states, and `onDone`.

| Measure | Linux, 27-byte blocks | ESP32, 14-byte blocks |
| --- | ---: | ---: |
| Compiled arena | 943 bytes | 943 bytes |
| Retained values | 6 | 6 |
| Persistent machine increase | 77 blocks | 125 blocks |
| Construction peak above its baseline | 265 blocks | 338 blocks |
| Actor before start | 25 blocks | 33 blocks |
| Start persistent increase | 9 blocks | 13 blocks |
| First snapshot | 22 blocks | 33 blocks |
| First subscription | 21 blocks | 30 blocks |
| Send persistent increase | 21 blocks | 30 blocks |
| Sampled send peak | 20 blocks | 29 blocks |
| Maximum representative send stack | 480 bytes | 304 bytes |

The ESP32 native heap reported the same 66,696 free bytes and 65,536-byte
largest free block before and after the fixture. This supports the design rule
that persistent XFSM ownership is held in Espruino GC-visible values and the
compiled arena, not hidden native-heap allocations. The native-heap reading is
host-health evidence; ownership is established by the implementation and GC
tests rather than inferred from this counter alone.

On Linux, 5,000-iteration median dispatch observations were 48.687 us for a
local hit, 49.012 us for parent fallback, 59.545 us for guarded selection, and
48.166 us for an unhandled event. The current 87-character path-bearing
diagnostic peaked at 93 Linux blocks and ended 21 blocks above its measurement
baseline. The current 48-byte detail cap passes compact ESP32 validation; its
physical allocation decision also retains the earlier 113-block peak as a
conservative reference. These observations are regression evidence, not hard
real-time guarantees.

## Depth And Test Loading

The compact depth-32 fixture constructs and runs successfully on the stock
original ESP32 profile:

- 4,610-byte compiled arena;
- 382 persistent machine blocks, or 5,348 bytes;
- 2,102-block construction peak above the 354-block configured baseline;
- approximately 2,456 of 2,799 blocks occupied at the sampled peak, or 87.75%;
- approximately 343 blocks, or 4,802 bytes, remaining; and
- 224 bytes maximum measured coordinator stack for its send.

The earlier 7,062-byte all-in-one M5 harness and the action-heavy depth test can
exhaust the stock JavaScript heap because the loaded test program and fixtures
remain live while compilation needs its temporary peak. The compact 1,859-byte
harness proves that hierarchy depth 32 itself remains executable. It does not
remove the product concern: a real depth-32 application with many JavaScript
actions has little stock-profile headroom. Embedded qualification must use
compact or streamed harnesses and the product profile must be selected with
the application model loaded.

## Completion And Stack

The 256-microstep boundary remains valid. Linux completed the boundary in
16.186 ms and rejected step 257 transactionally in 16.181 ms. The original
ESP32 completed it in 807.461 ms and rejected step 257 in 776.229 ms. Timing is
recorded as a target observation, not a real-time guarantee.

The maximum measured coordinator stack was 704 bytes on Linux and 448 bytes on
the original ESP32. The former 768-byte reserve left only 64 bytes above the
largest observation. The private default reserve is therefore raised to 1,024
bytes, in addition to Espruino's 512-byte safety allowance. This threshold does
not allocate 1,024 bytes; it rejects an operation before mutation unless that
much native stack remains. Targets may override it only after measurement.

## Decisions

| Decision | Post-M6 outcome |
| --- | --- |
| Native indexed records and Version 1 layout | Retain provisionally. The complete implementation remains compact enough on the primary ESP32 target; constrained-target format freeze still needs M7 evidence. |
| Hierarchy depth 32 | Retain provisionally. It passes on Linux and a clean stock ESP32 runtime, but ESP32 construction uses about 87.75% of all blocks with the compact fixture. |
| Microstep budget 256 | Retain. The boundary and transactional 257th-step rejection pass on both measured targets. |
| Snapshot materialization | Retain lazy snapshots. Measured first-materialization cost is bounded and avoids permanent snapshot duplication. |
| Diagnostic detail | Retain the 48-byte UTF-8-safe detail budget. Current diagnostic and fault suites pass without evidence that a smaller budget is required. |
| Coordinator stack reserve | Raise the default from 768 to 1,024 bytes; remeasure each M7 target. |
| Persistent native heap | Keep prohibited. No design change is justified by the measured ESP32 heap state or ownership tests. |
| Test execution | Keep desktop-complete suites on Linux; use compact or streamed equivalent cases on constrained targets and record source-loading exclusions separately from engine failures. |

No resource result justifies removing Profile 1 behavior or beginning a risky
engine rewrite. Optimization remains worthwhile, particularly in the compiler
and runtime objects, but it must be measured against the complete regression
baseline established here.

## Verification

- Twenty-two production Linux JavaScript suites passed and cleaned to zero
  retained records after each suite.
- The separate deterministic allocation-fault suite passed.
- All 66 native sanitizer checks passed.
- The measurement feature, compact depth-32, and completion-boundary harnesses
  passed on Linux and the physical original ESP32.
- After measurement, the clean ESP32 production image was restored and
  `test_shell.js`, `test_runtime.js`, and `test_completion.js` passed.

The review closes the planned post-M6 measurement phase. M0 normative
traceability, product-profile selection, and M7 physical qualification remain.
