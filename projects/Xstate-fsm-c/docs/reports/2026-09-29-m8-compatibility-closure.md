# M8 Compatibility Closure

- Date: 2026-09-29
- Cases: `XFC-CF-COMPAT-005`, `XFC-CF-COMPAT-006`
- Specification repository base: `2b40cd22cbff84684d1b0fbd77b4c6bac89c3aa3`
- Implementation revision: `6ed09d5d2444f5355e1573bcbd46094c362c6edf`
- Espruino upstream base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`

## Decision

Both compatibility closure cases pass. Compatibility evidence is now governed
by a machine-checked register, and the shared semantic corpus has reviewed
canonical traces produced independently by pinned XState and XFSM execution.
The two audit-derived cases that remained at this stage concerned target
acceptance rather than compatibility semantics. They were subsequently closed
by the Pico and MDBT42Q physical qualification runs.

## Governance Closure

The compatibility register accounts for:

- all 19 `XFC-CD` intentional differences in the specification;
- all seven preserved Stately Editor specimens, including producer/version
  status, capture date, assessment, adaptations and stable case IDs;
- exact package locks for `xstate@5.33.2` and `xstate@4.38.3`;
- ten shared differential areas and three reasoned exclusion groups; and
- three legacy or compatibility-evidence sources, none silently adopted as a
  normative Profile 1 expectation.

`audit_compatibility_governance.py` checks the register against the
specification headings, conformance case IDs, corpus directories, source
fixtures, reference scripts, package locks and reviewed evidence. The audit
passes without an unpinned `latest` dependency.

The context/ordered-assign specimen assessment was corrected to reflect the
completed specification: named assignment descriptors are supported, and its
v5 destructured callback requires the registered positional-argument source
adaptation.

## Differential Closure

The XState 5.33.2 reference and XFSM each produce the same reviewed 56-record
NDJSON trace. It covers basic execution, initial actions, committed
subscription timing, exact and wildcard selection, ordered guard decisions,
parent fallback, ordered assignment, event identity, context isolation,
targetless and self transitions, explicit re-entry, relative and ID targets,
cross-hierarchy action boundaries, final-state completion, structural
snapshots and the depth-32 least-common-ancestor action count.

The XState 4.38.3 reference and XFSM each produce the same reviewed 11-record
trace for retained `cond` and `internal` migration syntax. Each trace records
its reference version and every textual source adaptation. State topology,
event sequence, guard decisions, context changes and action order are not
adapted.

Both pinned Node scripts reproduce their committed expected traces exactly.
The complete 22-suite normal Linux regression, all nine canonical traces, the
73-check ASan/UBSan native suite and the static implementation audit pass.

## Embedded Execution

The v4 migration artifact was composed with the common streaming harness,
uploaded through the paced direct runner, captured as a noisy serial transcript
and parsed by the same canonical comparator. All 11 records match on:

- original ESP32 Xtensa, board `ESP32_IDF5`, runtime `2v29.446`, firmware
  `c25a1c32d`; and
- ESP32-C3 RISC-V, board `ESP32C3_IDF5`, runtime `2v29.445`, firmware
  `aded959ad`.

The 56-record aggregate source artifact is host-only. Loading all of its
independent models as one JavaScript source bundle exceeds the classic ESP32
JsVar pool before semantic execution. This is a test-packaging limit, not a
Profile machine limit: its component behaviors already pass the physical
release-candidate suites, and the smaller paired artifact proves that embedded
targets stream and compare canonical records without retaining the trace.

The trace tool now appends a physical-runner completion marker derived from the
actual trace result and can compare a captured noisy transcript. An interrupted
or incomplete trace therefore cannot be reported as `DONE=PASS`.
