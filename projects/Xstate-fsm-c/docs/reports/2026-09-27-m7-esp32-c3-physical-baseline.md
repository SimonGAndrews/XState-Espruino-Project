# ESP32-C3 Initial Physical Baseline

Date: 2026-09-27

## Purpose

This report starts the M7 ESP32-C3 physical qualification track. It verifies
the stock XFSM image on a real RISC-V target, identifies the stock memory
profile's limiting resource, and uses a temporary memory split to confirm the
diagnosis. It does not select the final C3 product profile.

The exact observations are retained in the [machine-readable physical
result](../../tests/results/esp32-riscv/2026-09-27-m7-physical-baseline.json).

## Device And Image

The connected target identified as an ESP32-C3 QFN32 revision 0.3 with 4 MB
embedded flash, WiFi, BLE, and USB Serial/JTAG. The build system flashed the
bootloader, partition table, and 1,713,264-byte XFSM application through
`/dev/ttyACM0`; all image hashes verified.

The running image reported `ESP32C3_IDF5`, Espruino `2v29.443`, and Git commit
`8ce408fb5`. `require("XFSM").createMachine` was present and the private
measurement API was absent, as required for a production build.

## Stock 70 KB Profile

The stock board setting produced 3,016 13-byte JsVar blocks in the
qualification run. Construction, runtime/actions, assignment forms,
transition domains, completion cascades, lifecycle, compact strict validation,
eight-actor cleanup, GC relocation, and timer serialization passed.

The action-heavy depth-32 fixture failed both directly and from flash Storage
with `XFC E_NO_MEMORY @ createMachine`. The broad limit fixture reached the
same failure at its depth-32 check. No transition or entry action ran, so this
is a construction-capacity result rather than a semantic failure. The failed
Storage case still erased its temporary file and reported 67,020 native-heap
bytes free, showing that the scarce resource was the JsVar pool.

## Diagnostic 65 KB Trial

For diagnosis only, the existing `SETDEFINES` layer changed
`ESP_HEAP_SIZE` from 70,000 to 65,000 bytes. It did not change the stock board
file, included features, app-image size, or engine semantics. The pool grew by
386 blocks to 3,402.

| Check | Result |
| --- | --- |
| Direct depth-32 startup | Pass, 32 entry actions |
| Direct depth-32 transition | Pass, 65 ordered actions |
| Storage-backed depth-32 execution and cleanup | Pass |
| Two shared eight-actor graphs | Pass, exact settled-baseline recovery |
| Six construction/cleanup cycles | Pass, no accumulation |
| Faulted graph cleanup | Pass, exact settled-baseline recovery |
| GC relocation and subsequent dispatch | Pass |
| 128 synchronous sends plus queued timer | Pass, timer observed all 128 publications |

After the Storage-backed depth test, native heap reported 62,924 bytes free,
a 62,340-byte observed minimum, and a 53,248-byte largest free block. These
idle/focused figures do not represent WiFi, TLS, or BLE load.

## Decision

ESP32-C3 is physically viable for XFSM and remains `Build verified`. The stock
70 KB native-heap split cannot satisfy the current maximum-depth construction
peak. The 65 KB trial proves that 386 additional JsVar blocks are sufficient;
it is not the preferred product solution.

The 70 KB C3 reserve was deliberately established to support Bluetooth plus
HTTPS under native-memory pressure, as recorded in [Espruino issue
#2746](https://github.com/espruino/Espruino/issues/2746). Reducing it would
trade away native heap, not task stack. The next engineering step is therefore
to measure and reduce XFSM's peak compiler-side JsVar demand while preserving
the stock reserve. A lower reserve remains a fallback only if active XFSM,
Bluetooth, and HTTPS coexistence passes with adequate minimum free heap and
largest-block margin and the deviation is explicitly accepted.

After the diagnostic run, the stock 70 KB XFSM image was rebuilt, reflashed,
and its runtime identity checked. That boot exposed 3,017 blocks; a one-block
startup variation does not alter the capacity result.
