# M8 Structural Contract Closure

- Date: 2026-09-28
- Cases: `XFC-CF-DIAG-006`, `XFC-CF-FORMAT-003`, `XFC-CF-HOST-007`
- Specification repository base: `257b829002929c3316a3097fdeac49a632267556`
- Implementation revision: `02c8a054feea4999f21c477978bc46637b4b645e`
- Espruino upstream base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`

## Decision

All three cases pass for their defined closure scope. Native arena Format
Version 1 is frozen at the implementation revision above. A later incompatible
physical change must increment the private arena format version; this decision
does not freeze the public JavaScript API or prevent compatible implementation
optimisation.

The format decision is supported by strict C99 host tests, compile-time sizes
and offsets, 64-bit Linux execution, 32-bit ARM compilation, and physical
little-endian Xtensa and RISC-V execution. Big-endian execution remains
unclaimed, while mismatched byte-order rejection remains tested.

## Diagnostic Closure

The canonical `XFC-CF-DIAG-006` trace passes 58 streamed records. It covers all
publicly producible construction categories, normal `Error` versus `TypeError`
selection, identifier/bracket/index paths, deterministic first-error order,
48-byte detail truncation, escaping, public-boundary stability, same-actor busy
rejection, exact application-thrown identity, and runtime rollback.

The existing private `XFC_TEST=1` suite supplies deterministic coverage for
construction, actor, startup, dispatch, assignment, completion, publication,
snapshot, stop, and subscription allocation failures. Existing completion and
limit suites supply the 256/257 microstep boundary and 65,535/65,536-byte event
boundary. Internal-consistency paths are covered by native corruption tests and
source inspection rather than by corrupting live JavaScript-owned objects.

The compiler keeps the fixed allocation fallback
`XFC E_NO_MEMORY @ createMachine` independent of path construction. Runtime
allocation messages are fixed literals emitted without allocating a second
diagnostic object.

## Native Format Closure

The ASan/UBSan native suite now passes 73 checks. The additions cover successful
arithmetic at the exact `uint32_t` boundary, overflow immediately beyond it,
last-valid and overflowing 16-bit ranges, maximum table counts, and overflowing
string spans. Compile-time assertions now cover every record size and the
normative offsets within the header, records, and actor block.

The suite continues to decode a golden arena and reject invalid magic, version,
byte order, sizes, offsets, padding, strings, ranges, indexes, flags, reserved
fields, transition domains, unaligned input, and invalid actor data. The host
compiler uses `-std=c99 -pedantic -Werror` with address and undefined-behaviour
sanitizers.

## Host Boundary Review

The reproducible static audit checks 12 production source/header files and 188
XFSM functions. It reports:

- no `malloc`, `calloc`, `realloc`, or `free` use;
- no packed structures, variable-length workspaces, recursive call cycles, or
  task/IRQ synchronization primitives;
- no mutable file-scope state in the compiler, runtime, or portable engine;
- 14 fixed-size native array declarations;
- 29 hidden host ownership/token names;
- exactly the three public JSON wrapper declarations; and
- all required private-brand, shared-prototype, and hidden-ownership hooks.

Manual review covered `jswrap_xfsm.c`, `xfsm_compile.c`, `xfsm_runtime.c`,
`xfsm_native.c`, and their public/internal headers. Local locked values follow
the existing cleanup paths; persistent ownership is represented by hidden
Espruino parent-child references. Production coordination remains call-local.
The only mutable XFSM globals are isolated to explicitly test-only or
measurement-only builds and are absent from production firmware.

This source review is corroborated by the public-brand negative trace, normal
suite cleanup to zero retained records, sanitizer execution, GC relocation,
whole-interpreter save/restoration, native/flash callback tests, and physical
ESP32/C3 release-candidate results.

## Verification

- 22 normal Linux JavaScript suites: pass
- 7 canonical streamed traces: pass
- private deterministic allocation-fault suite: pass
- native ASan/UBSan checks: 73 pass, zero findings
- static contract audit: pass
- production Linux build restored; test-only API absence rechecked: pass

The target/result metadata requirement `XFC-REQ-0579` remains partial under
`XFC-CF-BUILD-006`. It was removed from the structural cases because completing
metadata across the target matrix is a build-evidence task, not a property of
the native format or host implementation boundary.
