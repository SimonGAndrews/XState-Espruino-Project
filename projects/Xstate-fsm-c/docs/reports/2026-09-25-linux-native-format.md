# Linux Native-Format Foundation Report

## Scope

This report covers the M2 private native-format foundation. It does not claim
JavaScript machine construction, actor execution, runtime semantic conformance,
or physical-target qualification.

## Revisions

- XState-Espruino-Project evidence base: `4751c8f`
- Profile 1 specification: `0.48`
- Espruino implementation: `d4860d07a93a725176f6216321b3d47f2d0a14cf`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Branch: `feature/xfsm-profile1`
- Result record:
  [`2026-09-25-native-format.json`](../../tests/results/linux/2026-09-25-native-format.json)
- Conformance cases: `XFC-CF-FORMAT-001`, `XFC-CF-FORMAT-002`

## Method

The portable suite was compiled as C99 with GCC 13.3.0, strict conversion and
prototype warnings promoted to errors, AddressSanitizer, and
UndefinedBehaviorSanitizer:

```bash
make -C libs/xfsm/tests/native clean test
```

The same revision was regression-built through Espruino with XFSM both enabled
and disabled. The enabled JavaScript library-shell test also passed with zero
retained memory records after garbage collection.

## Results

All 66 native checks passed with no sanitizer finding. Compile-time assertions
confirm the Version 1 record sizes and header table offset. The decoded golden
arena is 458 bytes and contains five states, seven symbols, one handler, two
transitions, one guard, two actions, one assignment, one assignment entry, and
46 string bytes.

The suite covers checked arithmetic, alignment, empty and maximum ranges,
native byte order, FNV-1a known values, and exact-byte rejection of a known
hash collision. It validates omitted, literal, and factory context records;
exact and wildcard handlers; guarded candidate arrays; state and assignment
action ranges; and targetless, self, descendant, ancestor, sibling,
cross-branch, and root-reentry transition domains.

Corruption cases cover magic, format version, endian flag, unknown flags,
reserved fields, arena size, table placement, string bounds and hashes, record
ranges, transition domains, indexes, depth, and base alignment. Tested invalid
arenas are rejected before unsafe access.

## Limitations And Decision

The host was 64-bit little-endian x86_64. Big-endian and physical
microcontroller layouts remain unverified, and retained JavaScript value types
cannot be checked until the Espruino construction boundary exists. The arena
layout remains provisional until the M5 vertical-slice resource and layout
review.

The M2 exit gate is satisfied on Linux. Development may proceed to M3 machine
construction without claiming any runtime state-machine behaviour.
