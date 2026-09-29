# M8 Constrained-Target Product-Profile Builds

## Scope And Provenance

- Date: 2026-09-29
- Profile 1 specification: version 0.52
- Project base revision: `59efe41`
- Espruino implementation revision: `6ed09d5d2`
- Official Espruino base: `84c190da7`
- Toolchain: ARM GNU Toolchain 13.2.Rel1, GCC 13.2.1
- Cases: `XFC-CF-BUILD-003`, `XFC-CF-BUILD-005`,
  `XFC-CF-BUILD-006`, `XFC-CF-RESOURCE-001`, and
  `XFC-CF-RESOURCE-003`

This package rechecks the current complete engine on the two constrained ARM
candidate targets. Its machine-readable records are the [Pico result](../../tests/results/pico/2026-09-29-product-profile-build.json)
and [MDBT42Q result](../../tests/results/mdbt42q/2026-09-29-product-profile-build.json).

No Pico or MDBT42Q was physically attached during this matched-build run. This
report therefore establishes build capacity and viable product profiles. The
Pico was subsequently qualified physically in the [Pico qualification
report](2026-09-29-m8-pico-physical-qualification.md); MDBT42Q remains
build-only.

## Matched Builds

| Target and profile | XFSM disabled | XFSM enabled | Increase | Enabled headroom |
| --- | ---: | ---: | ---: | ---: |
| Pico reduced profile | 287,864 bytes | 314,792 bytes | 26,928 bytes (9.35%) | 12,888 bytes |
| MDBT42Q constrained Bluetooth profile | 284,840 bytes | 311,944 bytes | 27,104 bytes (9.52%) | 3,296 bytes before Storage |

Both comparisons use clean disabled and enabled builds at the same revision,
toolchain, board definition, optimization, and feature selection. The default
XFSM coordinator reserve is 1,024 bytes plus Espruino's 512-byte safety
allowance. Neither stock board file was modified.

## Pico Decision

The current engine still fits the previously selected Pico product profile.
That profile omits JIT, debugger, tab completion, vector font, and
JavaScript-backed networking. Growth since the 2026-09-26 feasibility build is
3,400 bytes and reflects the completed engine and the later stack-reserve
decision. The image retains 12,888 bytes, or 3.93% of its 327,680-byte
application region.

This build initially established **Build verified**. The subsequent physical
qualification passes the portable semantic and validation corpus,
maximum-depth fixture, allocation-failure paths, callback/pin/timer
integration, save/restoration, and resource, timing, stack, and cleanup
measurements, advancing Pico to **Conformance verified**.

## MDBT42Q Decision

The stock MDBT42Q profile has effectively no spare flash and cannot carry
XFSM. A measured feature trade study found:

| Trial | Result |
| --- | --- |
| Remove JIT only | 14,840-byte Storage overlap |
| Also remove debugger, tab completion, vector font, and JavaScript-backed networking | 2,472-byte Storage overlap |
| Also remove NFC while retaining Bluetooth | Pass, with 3,296 bytes before Storage |

The selected constrained Bluetooth profile retains Bluetooth, filesystem,
graphics, network/HTTP, crypto/SHA-256, and NeoPixel. NFC is an optional
near-field interaction feature rather than part of the core Bluetooth role,
so omitting it is a bounded product-profile trade rather than an engine
reduction. The result advances MDBT42Q from **Not yet verified** to **Build
verified** for this explicit optional profile.

The narrow 3,296-byte margin is acceptable for feasibility but must be
rechecked after any engine or upstream Espruino change. Physical runtime and
resource evidence is still required before a conformance claim.

## Closure Assessment

The product-profile capacity question is resolved for both constrained targets
without reducing Profile 1 or changing stock board definitions. The Version 1
matrix now has evidence-based status for all four product targets:

- original ESP32 IDF5: Conformance verified;
- ESP32-C3 IDF5: Conformance verified;
- Pico reduced profile: Conformance verified by the subsequent physical run; and
- MDBT42Q constrained Bluetooth profile: Build verified.

`XFC-CF-BUILD-006` and `XFC-CF-RESOURCE-003` remain open because their defined
closure includes physical MDBT42Q qualification. The separate Pico result
fills its runtime metadata, including `process.memory().blocksize`; this build
report alone still makes no physical claim.
