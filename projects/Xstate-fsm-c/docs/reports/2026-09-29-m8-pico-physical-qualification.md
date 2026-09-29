# M8 Espruino Pico Physical Qualification

## Scope And Provenance

- Date: 2026-09-29
- Profile 1 specification: version 0.52
- Production engine and firmware revision: `6ed09d5d2`
- Physical fixture revision after portability refinements: `e772a1d44`
- Official Espruino base: `84c190da7`
- Target: `PICO_R1_3`, STM32F401CDU6 ARM Cortex-M4F
- Toolchain: ARM GCC 13.2.1 from `scripts/provision.sh PICO_R1_3`
- Result record: [Pico physical qualification](../../tests/results/pico/2026-09-29-m8-physical-qualification.json)

This run qualifies the reduced Pico product profile selected by the earlier
[matched-build review](2026-09-29-m8-constrained-target-builds.md). The board
has 5,100 13-byte JsVar blocks. The production image is 314,792 bytes and
leaves 12,888 bytes in the 327,680-byte application region.

## Results

The production firmware passed all 20 embedded-applicable portable suites.
The two desktop-only omissions are reasoned target exclusions: the large
strict-validation source has a compact embedded counterpart, and the
65,535/65,536-byte string harness remains a Linux boundary test.

All nine streamed canonical traces matched their reviewed outputs exactly on
the physical Pico. Those outputs are generated from the pinned XState 5.33.2
reference, with the v4 alias trace additionally generated from XState 4.38.3.
This covers the public/configuration, action/guard, snapshot, transition,
diagnostic, and compatibility closure packages on 32-bit ARM.

The canonical maximum-depth fixture entered a depth-32 chain, performed 32
startup actions and the reviewed 65-action transition, and returned to the
expected active state. The direct run peaked at 1,138 used blocks during the
transition. The Storage-backed run compiled at 1,105 used blocks and cleaned
to 324 blocks.

Physical host integration also passed:

- JavaScript closures, flash-backed module callbacks, native guards and bound
  GPIO actions;
- timer-driven synchronous dispatch, ordered subscription publication, and
  callback-fault rollback;
- eight-actor cleanup, repeated construction, and GC relocation;
- production `E_NO_MEMORY`, cleanup, and same-configuration retry;
- save, hard reboot, restoration without replay, and reset without synthetic
  exit actions; and
- exact cleanup of Storage, module-cache state, timers, subscriptions, and the
  output pin.

## Resource Review

The combined `XFC_MEASURE=1 XFC_TEST=1` image remained within the application
region at 316,096 bytes. All eight deterministic allocation seams passed.

| Measurement | Pico result |
| --- | ---: |
| Representative compiled arena | 943 bytes |
| Representative construction peak | 243 blocks |
| Representative send peak | 29 blocks |
| Representative send stack | 360 bytes |
| Depth-32 arena | 4,610 bytes |
| Depth-32 construction peak | 1,335 blocks |
| Maximum coordinator stack | 504 bytes |
| Default coordinator reserve | 1,024 bytes |
| 256-microstep completion | 340.717 ms |
| Attempted 257th microstep | rejected before mutation |
| Median local dispatch | 788.542 us |
| Median guarded JavaScript dispatch | 928.328 us |
| Median depth-32 parent fallback | 1,200.556 us |

The 504-byte maximum measured coordinator stack is below the 1,024-byte XFSM
reserve, which is itself protected by Espruino's additional 512-byte safety
allowance. The 256-microstep boundary completed; an attempted 257th step
returned `E_MICROSTEP_LIMIT` with the last stable state and context retained.

## Fixture Findings

No engine defect was found. Four physical fixtures were made target-portable:
allocation pressure now calibrates to the available JsVar pool, ESP32 heap
fields are reported only where that host API exists, reboot uses `E.reboot()`,
and save/restoration writes a durable result marker before USB disconnect.
The revised fixtures pass the Linux regression as well as the Pico run.

After instrumentation, the exact production image was restored. Its runtime
identity, absence of `_failNext` and measurement helpers, and shell, runtime,
and compact-validation smoke tests all passed.

## Decision

The reduced Pico profile advances from **Build verified** to **Conformance
verified**. `XFC-CF-BUILD-006` and `XFC-CF-RESOURCE-003` remain partial only
because the separately required MDBT42Q physical qualification is outstanding.
The Pico closes the representative constrained-target runtime measurement
requirements and confirms the current depth, microstep, stack, snapshot,
diagnostic, and native Format Version 1 decisions on constrained 32-bit ARM.
