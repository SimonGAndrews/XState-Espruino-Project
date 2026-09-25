# Test And Build Results

This directory indexes reproducible Xstate-fsm-c results. It must not contain
claims inferred from an unrecorded local run.

Create target-specific result directories as evidence becomes available:

- `linux/`
- `pico/`
- `mdbt42q/`
- `esp32-c3/`
- `esp32-xtensa/`

The Xtensa directory name may be refined when the exact qualification target
is selected.

## Result Records

Each committed result record must identify:

- conformance case ID or measurement name;
- date and result state from the
  [conformance matrix](../conformance-matrix.md);
- XState-Espruino-Project revision and specification version;
- Espruino implementation revision and upstream base;
- target, board definition, compiler, version, and build flags;
- exact command or runner invocation;
- expected and observed outcome;
- retained artifact or report paths; and
- any limitation, failure, or reasoned skip.

Prefer concise machine-readable output plus a small metadata file for automated
runs. Large binaries, transient build trees, and unrestricted console logs do
not belong in Git. Reviewed interpretations and resource decisions belong in
[`../../docs/reports/`](../../docs/reports/).
