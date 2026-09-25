# Linux Library-Shell Report

## Scope

This report covers the M1 optional-library shell only. It does not measure or
claim state-machine construction, execution, arena, actor, or physical-target
behaviour.

## Revisions

- XState-Espruino-Project evidence base: `fefe391`
- Profile 1 specification: `0.48`
- Espruino implementation: `225e55fba32b7a859a30ae5ba5db0c8e4f9f4ff6`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Branch: `feature/xfsm-profile1`
- Result record:
  [`2026-09-25-library-shell-build.json`](../../tests/results/linux/2026-09-25-library-shell-build.json)

## Results

The unchanged Linux board configuration built successfully with XFSM disabled.
The generated wrapper and platform configuration contained no XFSM symbol, and
`require("XFSM")` followed Espruino's normal module-not-found path.

With `USE_XFSM=1`, Espruino included `libs/xfsm/xfsm.c` and
`libs/xfsm/jswrap_xfsm.c`. The generated `XFSM` library exposed the native
`createMachine`, `createActor`, and `assign` functions. Its smoke test passed,
including the controlled not-yet-implemented error from the stubs.

The shell changed the Linux linked size by 960 bytes of text, 96 bytes of data,
and no BSS, for a 1,056-byte combined increase. The executable file increased
by 3,976 bytes. These figures describe the initial wrapper shell and are not a
forecast of the completed engine.

Both builds emitted 544 existing upstream warnings. No warning referred to an
XFSM source file.

## Decision

The Espruino optional-library and generated-wrapper approach is viable for the
planned module surface. No alternative loader or build system is required.
Linux advances to `Build verified`; semantic conformance and every physical
target remain unverified.
