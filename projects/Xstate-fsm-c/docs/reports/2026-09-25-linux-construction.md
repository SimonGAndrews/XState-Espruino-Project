# Linux Construction Vertical-Slice Report

## Scope

This report covers the M3 transactional machine-construction slice. It does
not claim actor execution, runtime transition semantics, snapshots,
subscriptions, completion behaviour, resource qualification, or physical
target support.

## Revisions

- XState-Espruino-Project evidence base: `4a68106`
- Profile 1 specification: `0.48`
- Espruino implementation: `80d424772d08bbeb713288b1b1cad5b262cdfe9a`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Branch: `feature/xfsm-profile1`
- Result record:
  [`2026-09-25-construction.json`](../../tests/results/linux/2026-09-25-construction.json)
- Conformance cases: `XFC-CF-CONFIG-001`, `XFC-CF-CONFIG-002`,
  `XFC-CF-CONTEXT-002`, `XFC-CF-DIAG-001`, and `XFC-CF-HOST-001`

## Method

Linux Espruino was clean-built with `USE_XFSM=1`. Three JavaScript tests
exercised the public module surface, a representative hierarchical compiler
fixture, decoded arena records, retained JavaScript values, source mutation,
construction diagnostics, and cleanup:

```bash
make clean
make USE_XFSM=1
bin/espruino --test libs/xfsm/tests/test_shell.js
bin/espruino --test libs/xfsm/tests/test_compile.js
bin/espruino --test libs/xfsm/tests/test_diagnostics.js
```

The M2 native sanitizer suite was rerun, and an independent clean build without
`USE_XFSM` confirmed that the library remains optional.

## Results

All three Espruino tests passed. Each test reported zero retained memory
records after garbage collection. The representative definition compiled into
a 543-byte Version 1 arena containing five states, 11 symbols, one handler,
one transition, one guard, three actions, one assignment, two assignment
entries, and 79 string bytes. Its retained container held six values: literal
context, two action functions, one guard function, one assignment expression,
and one assignment literal.

The decoded evidence checks root and nested initial indexes, the event handler
range, sibling target and transition-domain indexes, guard slot, action order,
assignment entry keys and flags, symbol bytes, and retained callback identity.
Changing the source configuration after construction did not change the arena
or its resolved initial indexes.

Negative cases covered a missing initial state, unknown initial state, unknown
transition target, unresolved action, invalid context, and a cyclic object
graph. Every case failed synchronously with the expected compact category and
object-graph path. No incomplete machine was returned.

Clean enabled and disabled Linux builds passed. The portable suite again
reported `PASS 66 XFSM native checks` with no AddressSanitizer or
UndefinedBehaviorSanitizer finding.

## Construction Design

The compiler enumerates and validates the source graph without recursion,
counts records, symbols, string bytes, and retained values, then allocates one
exact-sized flat string. A second pass writes only resolved, pointer-free
native records. The arena is validated before it and the retained-value array
are attached as private children of the opaque machine object. Temporary
metadata and source-graph ownership are then released.

## Limitations And Decision

This slice implements the M3 subset rather than the complete Profile 1 grammar.
In particular, actor execution remains a controlled stub, so the tests do not
execute guards, actions, assignments, or state changes. The resource impact of
the compiler and its peak construction memory have not yet been measured; they
remain part of the M5 evidence gate. Physical targets and non-Linux byte-order
or alignment behaviour remain unverified.

The M3 exit gate is satisfied on Linux. Development may proceed to M4 actor
execution without freezing the provisional arena format or claiming runtime
conformance.
