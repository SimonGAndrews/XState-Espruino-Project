# Espruino Pico Reduced-Profile Build Feasibility

Date: 2026-09-26

## Purpose

This check establishes whether the current Xstate-fsm-c completion candidate
can fit an Espruino Pico without changing its stock board definition. It is a
product-configuration feasibility result, not physical-device qualification.

The machine-readable result is the [Pico build
record](../../tests/results/pico/2026-09-26-feasibility-build.json).

## Configuration

The `PICO_R1_3` release build used Espruino's normal `USE_XFSM=1` optional
library selection. To create useful flash headroom for the engine, both the
disabled baseline and enabled build omitted JIT, the debugger, tab completion,
the vector font, and JavaScript-backed networking. Other board-selected
features remained unchanged.

`NO_VECTOR_FONT` was appended through Espruino's `SETDEFINES` hook. Supplying
`DEFINES` directly on the GNU Make command line is not equivalent: it replaces
the processor and board definitions that Espruino generates.

The provisioned compiler was Arm GNU Toolchain 13.2.1. The build was based on
implementation revision `4d4ef00b9` plus the uncommitted completion candidate.

## Result

| Measurement | XFSM disabled | XFSM enabled | Difference |
| --- | ---: | ---: | ---: |
| Firmware binary | 287,864 bytes | 311,392 bytes | 23,528 bytes |
| ELF `.text` | 287,556 bytes | 311,084 bytes | 23,528 bytes |
| ELF `.data` | 304 bytes | 304 bytes | 0 bytes |
| ELF `.bss` | 71,616 bytes | 71,620 bytes | 4 bytes |
| Free in 327,680-byte application region | 39,816 bytes | 16,288 bytes | -23,528 bytes |

XFSM increases the reduced-profile binary by 8.17% relative to its matching
baseline and consumes 7.18% of the Pico application region. The enabled image
uses 95.03% of that region and passes Espruino's size check with 16,288 bytes
free.

## Interpretation

Espruino Pico advances to **Build verified** for this explicit reduced product
profile. This proves that the current engine can be packaged for STM32F401;
it does not establish that XFSM fits alongside every stock Pico feature.

No Pico was attached, so runtime semantics, RAM behaviour, stack reserve,
timing, GC relocation, `save()` behaviour, and hardware-facing actions remain
unverified on this target. The original ESP32 IDF5 remains the primary
physical development and full-behaviour test target.
