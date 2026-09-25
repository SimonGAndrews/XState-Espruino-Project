# Tests

This directory owns the Profile 1 conformance definitions, differential
runners, expected traces, and reviewed result records defined by the
[specification](../docs/specification.md). Start with the
[conformance matrix](conformance-matrix.md); recorded evidence is indexed under
[`results/`](results/).

The primary differential environment is pinned under
[`reference/xstate-v5/`](reference/xstate-v5/).

The suite will distinguish normative Profile 1 cases, pinned Node XState
differential cases, intentional compatibility differences, native-format and
fault-injection cases, and legacy evidence. Portable behaviour cases emit the
specified newline-delimited JSON trace and use reviewed expected results.

Linux Espruino is the complete reference-test host. Espruino Pico, MDBT42Q,
ESP32-C3, and one Xtensa ESP32 target provide the initial physical
qualification matrix. Existing umbrella `examples/`, FSMPlus traces, and
XState v4.38.3 results remain evidence until individually reviewed and adopted
as Profile 1 cases.

Upstream-suitable C unit tests and tests coupled to Espruino's build tree live
with the canonical implementation under `libs/xfsm/` in the Espruino feature
branch. The conformance matrix links those tests to umbrella-owned cases and
results; implementation source and build-local tests are not duplicated here.
The M2 native-format suite is recorded in the
[Linux result](results/linux/2026-09-25-native-format.json).
