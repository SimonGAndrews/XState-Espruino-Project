# M7.3 Original ESP32 Allocation Profile

## Purpose

This report selects and qualifies a provisional XFSM product memory profile
for the original ESP32 IDF5 target. It closes the action-heavy maximum-depth
resource case left open by the stock profile, exercises production allocation
failure and retry, and hardens diagnostic-path construction under memory
pressure.

The machine-readable result is
[2026-09-27-m7-allocation-profile.json](../../tests/results/esp32-xtensa/2026-09-27-m7-allocation-profile.json).

## Profile Decision

The selected profile keeps the stock `ESP32_IDF5` board definition, its normal
14-byte JsVar layout, and the complete board feature set. A small
`SETDEFINES` file changes only `ESP_HEAP_SIZE` from 70,000 to 65,000 bytes:

```bash
SETDEFINES=libs/xfsm/tests/esp32_xfsm_profile.make
```

This trades 5,000 bytes of configured native-heap reserve for 357 additional
JsVar blocks, increasing the pool from 2,803 to 3,160 blocks. No feature is
removed and no stock board file is changed. The decision is provisional until
the final M7 release review, but it is now the original-ESP32 profile used for
XFSM qualification.

## Build

| Item | Value |
| --- | --- |
| Target | Original ESP32, `ESP32_IDF5` |
| Processor | ESP32-D0WD-V3 revision 3.1, Xtensa LX6 |
| ESP-IDF and compiler | ESP-IDF 5.5.3, Xtensa GCC 14.2.0 |
| Firmware | Espruino `2v29.442`, production APIs |
| Implementation revision | `8ce408fb560ed60b33d327f2feb7fac856e3f8ac` |
| App image | 1,523,712 bytes |
| App partition free | 524,288 bytes, 25.6% |
| XFSM delta from matched disabled reference | 31,744 bytes, 2.13% |
| Coordinator reserve | 1,024 bytes |

The image exposes neither `XFC_MEASURE` nor `XFC_TEST`. The extra diagnostic
allocation checks add 288 bytes over the 1,523,424-byte post-M6 image while
preserving the overall approximately two-percent XFSM flash increase.
The image was built from the tested working tree immediately before its M7.3
commit, so its embedded Git identity reports parent `b7b6d88d7`; the result
record's source hashes identify and match revision `8ce408fb5` exactly.

## Maximum Depth

The previously constrained action-heavy depth-32 fixture now passes directly
on the device. Startup executes 32 ordered entry actions. `RESET` then executes
32 exits, one transition action, and 32 entries, for 65 actions in total, and
the resulting active hierarchy matches `L1`.

The same model also passes when its source is stored in and evaluated from
Espruino `Storage`, preventing uploaded source text and the live model from
competing throughout the entire test. The Storage-backed run measured 644
JsVar blocks after configuration construction and 1,046 after compilation.
After execution it reported 62,644 bytes of native heap free, a 62,216-byte
minimum, and a 61,440-byte largest free block. The temporary Storage file was
removed.

## Allocation Pressure

Two unchanged production runs forced a large valid construction to fail with
501 JsVar blocks free. Each returned `E_NO_MEMORY`, released to the same
1,798-block settled usage, and then compiled and started the identical
configuration successfully after pressure was removed. The retry also
returned to 1,798 blocks. This is physical evidence that the production
failure is transactional and does not poison a later construction attempt.

A second fixture used an 8,000-byte event name to pressure diagnostic-path
construction. During development this exposed an unchecked Espruino string
copy that could dereference a failed initial allocation. XFSM now copies
segmented strings through a checked helper and preflights the complete rendered
key path while reserving 32 JsVar blocks for the compact fallback diagnostic.

The final fixture passed twice at 387 free blocks. It returned exactly
`XFC E_NO_MEMORY @ createMachine` and repeated at the same 2,186-block settled
usage without accumulation. At an exploratory 68 free blocks, Espruino's
global out-of-memory interrupt occurred before a normal JavaScript error could
be constructed; that extreme host condition is retained as a limitation, not
reported as an XFSM diagnostic pass.

## Regression

The exact hardened source passed all 22 normal Linux JavaScript suites, the
separate deterministic allocation-fault suite, and all 66 native checks under
address, undefined-behaviour, and leak sanitizers. The physical image also
passed the direct and Storage-backed maximum-depth fixtures, general allocation
pressure and retry, diagnostic pressure twice, and the shell smoke test.

No new Node differential was required for the memory-profile and host-failure
mechanics. The shared depth-32, 65-action semantics already match pinned
XState 5.33.2 in the M6.3 evidence.

## Conclusion

M7.3 passes for the original ESP32. The selected profile retains the full
board feature set, provides enough JsVar headroom for the Profile 1
maximum-depth action trace, and preserves more than 62 KB of native heap in the
measured Storage-backed run. Production construction and diagnostic failures
are recoverable at the tested pressure points.

The target remains `Build verified` until M7.4 performs the final
release-candidate regression and evidence review. Profiles and runtime
qualification for the other target families remain separate work.
