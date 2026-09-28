# Tests

This directory owns the Profile 1 conformance definitions, differential
runners, expected traces, and reviewed result records defined by the
[specification](../docs/specification.md). Start with the [test
inventory](test-inventory.md) for completed and outstanding test work, then use
the [conformance matrix](conformance-matrix.md) for requirement traceability.
Recorded evidence is indexed under [`results/`](results/).

The primary differential environment is pinned under
[`reference/xstate-v5/`](reference/xstate-v5/). The migration-alias reference
is pinned under [`reference/xstate-v4/`](reference/xstate-v4/).
Compatibility provenance, pins, adaptations and exclusions are checked with:

```bash
python3 projects/Xstate-fsm-c/tests/audit_compatibility_governance.py
```

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
The M3 machine-construction, arena-decoding, diagnostic-path, source-isolation,
and cleanup checks are recorded in the
[Linux construction result](results/linux/2026-09-25-construction.json).
The M4 hierarchical actor trace, runtime fault paths, subscription ordering,
snapshot behaviour, and cleanup checks are recorded in the
[Linux actor-runtime result](results/linux/2026-09-25-actor-runtime.json).
The first M5 Linux measurements and MDBT42Q build attempt are recorded in the
[Linux resource result](results/linux/2026-09-25-m5-resource-evidence.json) and
[MDBT42Q build result](results/mdbt42q/2026-09-25-m5-build-attempt.json).
Original ESP32 IDF5 build and device measurements are recorded in the
[ESP32 build result](results/esp32-xtensa/2026-09-25-m5-idf5-build.json) and
[physical result](results/esp32-xtensa/2026-09-25-m5-physical-evidence.json).
Final-state, nested-completion, and exact microstep-boundary evidence is
recorded in the [Linux completion result](results/linux/2026-09-26-completion.json)
and [ESP32 completion result](results/esp32-xtensa/2026-09-26-completion.json).
Reduced-profile Espruino Pico build feasibility is recorded in the [Pico build
result](results/pico/2026-09-26-feasibility-build.json); it contains no
physical-device runtime claim.
M6 target resolution, wildcard lookup, migration-alias, and strict diagnostic
evidence is recorded in the [Linux M6.1
result](results/linux/2026-09-26-m6-target-events.json) and [ESP32 M6.1
result](results/esp32-xtensa/2026-09-26-m6-target-events.json).
M6 context initialization, assignment-form, actor-isolation, rollback, and
diagnostic evidence is recorded in the [Linux M6.2
result](results/linux/2026-09-26-m6-context-assignment.json) and [ESP32 M6.2
result](results/esp32-xtensa/2026-09-26-m6-context-assignment.json).
M6 transition-domain, re-entry, and maximum-depth evidence is recorded in the
[Linux M6.3 result](results/linux/2026-09-27-m6-transition-domains.json).
M6 lifecycle-state, callback-fault, busy-actor, and subscriber evidence is
recorded in the [Linux M6 lifecycle/subscriber
result](results/linux/2026-09-27-m6-lifecycle-subscribers.json); that record
is accompanied by the [current ESP32 IDF5 build
result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers-build.json),
and [physical
result](results/esp32-xtensa/2026-09-27-m6-lifecycle-subscribers.json). The
physical record distinguishes the three passing suites from the stock-profile
memory failure of the maximum-depth action fixture.
M6 cross-actor isolation, broader GC relocation, and physical Espruino
save/reboot/reset evidence is recorded in the [Linux host-lifecycle
result](results/linux/2026-09-27-m6-host-lifecycle.json) and [original ESP32
host-lifecycle
result](results/esp32-xtensa/2026-09-27-m6-host-lifecycle.json).
The complete-engine flash, JsVar, native-heap, arena, runtime-allocation,
stack, timing, depth-headroom, and test-loading measurements are recorded in
the [Linux post-M6 resource
result](results/linux/2026-09-27-post-m6-resource-review.json) and [original
ESP32 post-M6 resource
result](results/esp32-xtensa/2026-09-27-post-m6-resource-review.json).
The stock full-feature ESP32-C3 release candidate's matched builds, portable
runtime, maximum-depth, deterministic allocation-fault, cleanup,
host-integration, save/restoration, and combined-service evidence is recorded
in the [C3-D result](results/esp32-riscv/2026-09-28-m7-release-candidate.json).
The corresponding stock full-feature original-ESP32 release qualification is
recorded in the [M7.4
result](results/esp32-xtensa/2026-09-28-m7-release-candidate.json).
The first four M8 grouped closure packages and their nine canonical streamed
traces are recorded in the [public/configuration
result](results/linux/2026-09-28-closure-public-configuration.json) and the
[runtime-contract
result](results/linux/2026-09-28-closure-runtime-contract.json). The diagnostic,
native-format, and host-boundary package is recorded in the
[structural-contract
result](results/linux/2026-09-28-closure-structural-contract.json).
The compatibility governance and pinned differential package is recorded in
the [compatibility closure
result](results/linux/2026-09-29-closure-compatibility.json).
