# M8 MDBT42Q Physical Qualification

## Scope And Provenance

- Date: 2026-09-29
- Profile 1 specification: version 0.52
- Production engine and firmware revision: `e772a1d44`
- Physical fixture revision after portability refinements: `190d14a90`
- Official Espruino base: `84c190da7`
- Target: `MDBT42Q`, Nordic nRF52832 ARM Cortex-M4F
- Toolchain: ARM GCC 13.2.1 from `scripts/provision.sh MDBT42Q`
- Result record: [MDBT42Q physical qualification](../../tests/results/mdbt42q/2026-09-29-m8-physical-qualification.json)

This run qualifies the constrained Bluetooth product profile selected by the
earlier [matched-build review](2026-09-29-m8-constrained-target-builds.md).
The profile retains Bluetooth and has 2,950 13-byte JsVar blocks. Its XFSM
production image occupies 311,944 bytes before the reserved Storage boundary
and leaves 3,296 bytes of application flash headroom.

## Results

The production firmware passed all 20 embedded-applicable portable suites.
The two desktop-only omissions are reasoned target exclusions: the large
strict-validation source has a compact embedded counterpart, and the
65,535/65,536-byte string harness remains a Linux boundary test.

All nine canonical traces matched their reviewed outputs exactly. The larger
`COMPAT-006` and `DIAG-006` programs were evaluated from a temporary
flash-backed Storage string so their own source text did not displace the
maximum-depth runtime workload from the finite JsVar pool. The temporary file
was erased after each run. The traces retain the same reviewed records
generated from XState 5.33.2 and, for the v4 alias case, XState 4.38.3.

The maximum-depth fixture entered a depth-32 chain, performed 32 startup
actions and the reviewed 65-action transition, and returned to the expected
active state. The direct transition used 1,137 blocks. The Storage-backed run
compiled at 1,104 used blocks and cleaned to 323 blocks.

Physical host integration also passed:

- JavaScript closures, flash-backed module callbacks, native guards and bound
  GPIO actions;
- timer-driven synchronous dispatch, ordered subscription publication, and
  callback-fault rollback;
- eight-actor cleanup, repeated construction, and GC relocation;
- production allocation and diagnostic pressure with exact cleanup;
- save, reboot, restoration without replay, and reset without synthetic exit
  actions; and
- exact cleanup of Storage, module-cache state, timers, subscriptions, and the
  output pin.

## Resource Review

The combined `XFC_MEASURE=1 XFC_TEST=1` image also fit before Storage at
313,248 bytes, leaving 1,992 bytes. All eight deterministic allocation seams
passed.

| Measurement | MDBT42Q result |
| --- | ---: |
| Representative compiled arena | 943 bytes |
| Representative construction peak | 243 blocks |
| Representative send peak | 29 blocks |
| Representative send stack | 360 bytes |
| Depth-32 arena | 4,610 bytes |
| Depth-32 construction peak | 1,335 blocks |
| Maximum coordinator stack | 504 bytes |
| Default coordinator reserve | 1,024 bytes |
| 256-microstep completion | 449.127 ms |
| Attempted 257th microstep | rejected before mutation |
| Median local dispatch | 1,056.519 us |
| Median guarded JavaScript dispatch | 1,243.469 us |
| Median depth-32 parent fallback | 1,580.200 us |

The 504-byte maximum measured coordinator stack is below the 1,024-byte XFSM
reserve, which is protected by Espruino's additional 512-byte safety
allowance. The 256-microstep boundary completed; an attempted 257th step
returned `E_MICROSTEP_LIMIT` with the last stable state and context retained.

## Fixture Findings

No engine defect was found. The physical fixtures now read the nRF52 GPIO
output latch when input sense is unavailable, calibrate diagnostic pressure to
the finite target pool, release completed action-trace objects before
independent rejection cases, pace the 9,600-baud UART in small chunks, and use
temporary Storage for oversized conformance source. The 22 documented Linux
suites and all nine Linux canonical traces pass after these changes. The
native-heap pressure fixture remains MCU-specific by design because Linux does
not have the finite embedded heap it exercises.

After instrumentation, the exact production image was restored. Its runtime
identity, empty Storage, absence of `_failNext` and `_measure`, and shell,
runtime, and compact-validation smoke tests all passed.

## Decision

The constrained Bluetooth MDBT42Q profile advances from **Build verified** to
**Conformance verified**. Together with the completed Pico qualification, this
closes `XFC-CF-BUILD-006` and `XFC-CF-RESOURCE-003`. The Version 1 target
matrix now has physical conformance evidence for both constrained ARM targets,
original ESP32 Xtensa, and ESP32-C3 RISC-V, with the existing documented
product-profile distinctions.
