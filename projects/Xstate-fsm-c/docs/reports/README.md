# Implementation Reports

This directory holds reviewed Xstate-fsm-c measurement and qualification
reports. Reports explain the result, method, interpretation, and resulting
decision; machine-readable or raw result records belong under
[`../../tests/results/`](../../tests/results/).

## Naming

Use a descriptive, dated name:

```text
YYYY-MM-DD-<target>-<subject>.md
```

Examples include `2026-10-15-linux-vertical-slice.md` and
`2026-11-02-mdbt42q-memory.md`.

## Required Metadata

Every report must identify:

- the XState-Espruino-Project revision and specification version;
- the Espruino implementation revision and upstream base;
- target, board definition, toolchain, and relevant build flags;
- the referenced conformance case IDs;
- the commands or procedure used;
- links to result records and retained artifacts;
- limitations, failures, and reasoned skips; and
- any specification, native-format, limit, or implementation decision made
  from the evidence.

Do not paste large raw logs into a report. Retain stable result files and
summarize the significant measurements and diagnostics here.

The first vertical-slice report must address every M5 measurement and review
gate in the [Implementation Plan](../implementation-plan.md), even where the
outcome is that further evidence is required.
