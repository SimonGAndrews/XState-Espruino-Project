# ESP32-C3 Compiler JsVar Investigation

Date: 2026-09-27

## Purpose

This investigation compares reducing XFSM's peak `createMachine` JsVar use
with reducing Profile 1 limits. It uses the stock ESP32-C3 board memory split:
`ESP_HEAP_SIZE=70000`, 3,012 13-byte JsVar blocks in the instrumented run, and
all normal board features enabled. No specification or implementation limit
was changed.

The exact observations are retained in the [machine-readable
result](../../tests/results/esp32-riscv/2026-09-27-compiler-depth-probe.json).

## Measurements

The compact depth-32 fixture succeeded. Its source definition occupied 357
blocks before compilation; `createMachine` then peaked 2,245 blocks above its
entry baseline. The resulting arena was 4,610 bytes and the persistent machine
cost 410 blocks. The temporary-to-persistent construction ratio was therefore
about 5.5:1, and the observed absolute peak was about 86% of the complete pool.

The action-heavy hierarchy used one entry and one exit action at every level
plus a leaf transition action. The stock profile passed through depth 30 and
failed at depths 31 and 32 with `E_NO_MEMORY @ createMachine`:

| Depth | Definition blocks | Compiler peak delta | Last observed absolute use | Result |
| ---: | ---: | ---: | ---: | --- |
| 16 | 430 | 855 | 1,285 | Pass |
| 20 | 487 | 1,144 | 1,631 | Pass |
| 24 | 539 | 1,474 | 2,013 | Pass |
| 26 | 565 | 1,655 | 2,220 | Pass |
| 28 | 591 | 1,844 | 2,435 | Pass |
| 30 | 617 | 2,043 | 2,660 | Pass |
| 31 | 630 | 2,002 | 2,632 | `E_NO_MEMORY` |
| 32 | 651 | 2,098 | 2,749 | `E_NO_MEMORY` |

The failure rows stop before the successful allocation peak and are not lower
requirements than depth 30. They show the last measurement before the exact
arena allocation failed.

## Current Cost Drivers

Compiler inspection found that every state is retained during both logical
passes as a JavaScript array with configuration, key, parent, depth, full
diagnostic path, effective ID, implicit ID, type, and completion-event fields.
Every interned symbol is another JavaScript array containing text and flags.
The exact final arena is then allocated while these structures remain live.

Full paths, implicit IDs, and completion event strings grow with hierarchy
depth. Retaining the complete string for every ancestor therefore introduces
roughly quadratic string storage for a deep chain. The persistent native arena
does not have the same overhead.

## Options

1. Reconstruct diagnostic paths and implicit IDs only when needed. Keep parent
   and key topology, and walk the bounded hierarchy to format an error or
   derive a default ID. This preserves complete diagnostics and Profile 1
   behaviour while removing cumulative retained strings. The tradeoff is more
   construction CPU work, primarily on error paths.
2. Replace JavaScript array metadata with compact GC-owned workspace. Store
   numeric topology, type, flags, and indexes in a temporary flat string or in
   the final arena during the emit pass. Keep only the minimum JavaScript owner
   collection needed to make source objects and retained callbacks visible to
   Espruino's garbage collector. This should provide the largest general
   saving, but requires careful relocation, alignment, cleanup, and fault tests.
3. Compact the symbol index. Replace per-symbol JavaScript arrays and integer
   values with packed hash, length, flags, and owner indexes. This preserves
   the native format and public behaviour but adds compiler implementation
   complexity.
4. Shorten overlapping lifetimes. Once validation and exact counts are known,
   release count-pass-only strings and records before allocating or populating
   the final arena. Deterministic regeneration costs compilation time but can
   reduce the peak without increasing persistent memory.
5. Use temporary native-heap allocations. C structs would be straightforward
   and compact, but they would compete with the C3 reserve needed by Bluetooth
   and HTTPS and could add fragmentation. This is not preferred while a
   GC-owned compact workspace is practical.
6. Add an offline precompiled-arena path in a later profile. This could remove
   runtime compilation pressure for production deployments, but it does not
   satisfy Version 1's direct `createMachine` authoring contract and needs a
   separate portable-image design.

## Specification Reduction Tradeoff

Reducing the hierarchy limit from 32 to 30 makes this particular action-heavy
fixture pass, but leaves only about 352 blocks at its observed peak. Different
legal source shapes can consume more blocks at the same depth, so the change
would not define a reliable capacity envelope. It would also reject existing
XState-style hierarchies for a small saving in bounded runtime stack.

Reducing the 256-microstep budget does not reduce compilation memory. Lowering
the 65,535 record and symbol ceilings without changing 16-bit arena indexes
also provides no saving for ordinary machines. Changing to 8-bit indexes would
reduce the persistent arena but impose a broad 255-record constraint and a new
physical format. Removing entry/exit actions would attack the product's core
purpose and is not justified by this evidence.

## Recommendation

Retain depth 32 and the other Profile 1 limits while implementing compiler
memory reduction in stages: lazy paths and derived IDs first, compact state
metadata second, compact symbols and lifetime splitting third if still needed.
Keep the stock 70 KB native reserve. Re-run the same C3 sweep after each stage
and require the depth-32 action fixture to pass with measured headroom, not
merely cross the allocation boundary.

Only reconsider the Profile 1 depth target if those changes still cannot
provide a useful margin on the C3. A lower limit should then be selected from a
documented resource envelope across several model shapes, rather than from the
single depth threshold measured here.
