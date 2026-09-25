# Tests

This directory will contain the Profile 1 conformance and implementation test
suite defined by `../docs/specification.md`.

The suite will distinguish normative Profile 1 cases, pinned Node XState
differential cases, intentional compatibility differences, native-format and
fault-injection cases, and legacy evidence. Portable behaviour cases emit the
specified newline-delimited JSON trace and use reviewed expected results.

Linux Espruino is the complete reference-test host. Espruino Pico, MDBT42Q,
ESP32-C3, and one Xtensa ESP32 target provide the initial physical
qualification matrix. Existing umbrella `examples/`, FSMPlus traces, and
XState v4.38.3 results remain evidence until individually reviewed and adopted
as Profile 1 cases.
