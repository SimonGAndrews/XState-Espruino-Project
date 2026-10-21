# Deep-History Qualification

Date: 2026-10-20

## Purpose

This report records host and physical qualification of deep history on the
experimental `experiment/xfsm-history` branches. It extends the earlier
shallow-history checkpoint without changing Profile 1 or Native Format
Version 1.

Machine-readable evidence is recorded for
[Linux](../../tests/results/linux/2026-10-20-deep-history.json), the
[original ESP32](../../tests/results/esp32-xtensa/2026-10-20-deep-history.json),
and the [ESP32-C3](../../tests/results/esp32-riscv/2026-10-20-deep-history.json).

## Candidate

| Item | Value |
| --- | --- |
| Project branch and base | `experiment/xfsm-history` at `a3c65dd32604c292d7e7bde7c4856049a9dc55b6` |
| Specification | Profile 1 version `0.52` plus the experimental history extension |
| Implementation branch and candidate | `experiment/xfsm-history` at `007d8b4b441f0729f19d41e30548b7f044ac9a89` |
| Runtime | Espruino `2v29.454`, reported commit `3b3952b9c` |
| Source identity | Implementation commit above, with component SHA-256 values retained in each result |
| Native format | Experimental Version 2 |

## Behavior And Validation

The clean Linux production build passed all 26 portable JavaScript suites and
returned to zero memory records after each suite. The native suite passed 96
AddressSanitizer, UndefinedBehaviorSanitizer, leak, bounds, flag, and
corruption checks. The static contract audit checked 199 functions across 12
source files with no failures.

The pinned XState 5.33.2 references passed eight shallow-history scenarios and
five deep-history groups. The deep groups cover exact nested restoration and
action order, normal and descendant fallback, nested history owners, final
leaf completion, and transactional fault rollback.

On both ESP32 targets, the production image passed deep behavior, diagnostics,
shallow regression, compact strict validation, and whole-interpreter
save/reboot/reset tests. The saved actor resumed its exact nested deep leaf
without replaying actions or notifications. The Classic saved 39,284
interpreter bytes as 9,780 compressed bytes; the C3 saved 39,351 bytes as
9,628 compressed bytes.

## Matched Resources

The resource fixture compiles identical nested machines differing only in
`history: "shallow"` versus `history: "deep"`.

| Measurement | Linux shallow/deep | Original ESP32 shallow/deep | ESP32-C3 shallow/deep |
| --- | ---: | ---: | ---: |
| Arena bytes | 660 / 660 | 660 / 660 | 660 / 660 |
| Persistent machine blocks | 61 / 61 | 99 / 99 | 104 / 104 |
| Construction peak blocks | 147 / 147 | 169 / 169 | 175 / 175 |
| Persistent actor blocks | 11 / 11 | 16 / 16 | 16 / 16 |
| Actor native bytes | 20 / 20 | 20 / 20 | 20 / 20 |
| Restore temporary blocks | 2 / 2 | 2 / 2 | 2 / 2 |
| Restore coordinator stack | 496 / 352 bytes | 304 / 224 bytes | 336 / 256 bytes |

Deep mode therefore adds no compiled arena, persistent JsVar, actor storage,
construction peak, or restore-time temporary JsVar cost. The lower stack
figures are observations for this representative machine, not a general
minimum guarantee.

The production timing fixture measured 500 repeated exit/restore pairs:

| Target | Shallow | Deep | Difference |
| --- | ---: | ---: | ---: |
| Linux | 90.354 us | 91.554 us | +1.200 us |
| Original ESP32 | 2,820.526 us | 2,799.094 us | -21.432 us |
| ESP32-C3 | 3,438.834 us | 3,442.718 us | +3.884 us |

The small differences change direction across targets and show no practical
deep-history dispatch penalty.

## Firmware Fit

| Target | Shallow checkpoint | Deep production | Increase | Free app partition | Instrumented deep image |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original ESP32 `ESP32_IDF5` | 1,527,984 | 1,528,160 | 176 bytes (0.012%) | 519,840 bytes (25%) | 1,529,184 |
| ESP32-C3 `ESP32C3_IDF5` | 1,718,160 | 1,718,304 | 144 bytes (0.008%) | 329,696 bytes (16%) | 1,719,568 |

Both targets used the stock full-feature IDF5 profiles with the 70 KB
Espruino heap and no `SETDEFINES` override. Measurement firmware was temporary;
both boards were rebuilt and reflashed with normal production firmware, then
passed the compact private-API validation.

## Manual Authoring Check

On 2026-10-21, simple shallow-history and nested deep-history configurations
were entered and exercised through the XFSM Espruino REPL. The shallow example
restored the last active direct child, and the deep example restored the exact
nested leaf instead of following the remembered compound state's normal
initial transition. Both produced the expected state values.

The same configurations were accepted and rendered correctly by the VS Code
XState extension. This provides supplementary evidence that the selected
configuration syntax is usable with existing XState authoring tooling. It is
a manual interoperability check, not a replacement for the pinned XState
traces or automated XFSM conformance suites.

## Outcome

`XFC-HIST-CONFIG-001`, `XFC-HIST-DEEP-001`, `XFC-HIST-FORMAT-001`, and the
deep portion of `XFC-HIST-RESOURCE-001` pass. All twelve extension cases now
have passing evidence. The combined shallow/deep implementation is ready for
experimental-branch review; promotion into a public profile remains a
separate governance decision.
