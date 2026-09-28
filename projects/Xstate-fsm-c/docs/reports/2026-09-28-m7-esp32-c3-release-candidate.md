# ESP32-C3 Release-Candidate Qualification

Date: 2026-09-28

## Purpose

This report closes the C3-D release-candidate gate for the stock full-feature
`ESP32C3_IDF5` profile. It repeats matched disabled and enabled builds, flashes
the exact enabled artifact, and exercises the applicable portable, resource,
cleanup, host-integration, save/restoration, allocation-failure, and combined
wireless-service suites on the physical RISC-V target.

The machine-readable evidence is the [C3-D result
record](../../tests/results/esp32-riscv/2026-09-28-m7-release-candidate.json).

## Candidate

| Item | Value |
| --- | --- |
| Production firmware revision | `aded959ada37449c59b4a79e67133cd4cc4cbd2b` |
| Engine implementation revision | `cb5d74e8953ac7b4290aaba64f2aabe7714a3a05` |
| Embedded fault-fixture revision | `c25a1c32dd07369e8a7ec42d6c853ada641019d6` |
| Bench revision | `7572baf654c284417b80dc7c0c068a601bada5f4` |
| Board | `ESP32C3_IDF5` |
| Runtime | `2v29.445`, commit `aded959ad` |
| CPU | ESP32-C3 RV32IMC, 32-bit little-endian |
| ESP-IDF | 5.5.3 |
| Compiler | RISC-V GCC 14.2.0 |
| Build flags | `RELEASE=1 USE_XFSM=1`, no `SETDEFINES` override |
| Native-heap reserve | 70,000 bytes |
| JsVar pool | 3,027 blocks of 13 bytes |
| XFSM coordinator reserve | 1,024 bytes |
| Device | ESP32-C3 QFN32 revision 0.3, 4 MB embedded flash |
| Control path | `/dev/serial/by-path/pci-0000:00:14.0-usb-0:2.3:1.0` |

The only implementation-tree changes after the compact compiler revision are
the library README and physical service fixtures. The compiler source SHA-256
remains `689c6c81...14b9e2cd9` and the runtime source SHA-256 remains
`5d5403c3...08fbc3d`.

## Matched Build Result

Both builds used the same revision, board, release optimization, IDF, complete
WiFi/Bluetooth/TLS/graphics/debugger feature set, and 2,048,000-byte generated
app partition.

| Build | App image | Free app partition | SHA-256 |
| --- | ---: | ---: | --- |
| `USE_XFSM=0` | 1,678,240 bytes | 369,760 bytes | `e767d19e...2b4868c1` |
| `USE_XFSM=1` | 1,715,120 bytes | 332,880 bytes | `e0f6411a...36a7371` |

XFSM adds 36,880 bytes, or 2.20% of the matched disabled image. The enabled
link map contains `jswrap_xfsm.c`, `jswrap_xfsm_createMachine`, and the native
compiler. The disabled wrapper-source list omits `libs/xfsm/jswrap_xfsm.c`.

## Physical Regression

All 20 embedded-applicable portable suites passed on the exact production
candidate. They cover the public module, construction, diagnostics, runtime,
completion and its 256/257 microstep boundary, target grammar, event lookup,
context and assignment forms, transition domains, lifecycle, subscriptions,
cross-actor GC behavior, runtime errors, and compact strict validation.

The canonical maximum-depth fixtures passed by both direct REPL and
Storage-backed loading:

- depth 32 entered with 32 ordered entry actions;
- the reviewed traversal executed 32 exits, one transition action, and 32
  entries;
- direct execution used 1,126 of 3,027 JsVar blocks at its sampled transition;
- Storage-backed construction used 1,083 blocks after compilation, erased its
  temporary file, and left 67,136 native-heap bytes free with a 66,564-byte
  recorded minimum.

The target-specific lifecycle and integration checks also passed:

- eight actors sharing one compiled machine, six repeated construction cycles,
  a faulted graph, and two shared-graph cycles returned exactly to the
  1,973-block settled baseline;
- compiled machines and actors survived GC relocation;
- 128 synchronous sends and publications completed before the due timer ran;
- outer-scope and closure actions, flash-module actions and guards, a native
  guard, bound GPIO actions, a timer event, subscription order, callback-fault
  rollback, Storage cleanup, module-cache cleanup, and safe pin state passed;
- whole-interpreter `save()` captured 39,351 bytes, restored 7,654 compressed
  bytes after reboot, preserved every tested actor lifecycle state without
  replay, and `reset(true)` erased the saved image without synthesizing exits.

## Allocation Paths

A temporary `XFC_TEST=1` build ran the compact embedded deterministic fault
suite. Eight representative allocation seams passed: compiler workspace,
compiled arena, actor creation, startup context, assignment context,
pre-publication snapshot, explicit snapshot materialization, and subscription
node. Each case checked the stable `E_NO_MEMORY` path plus rollback or retry.

The full 7.7 KB Linux fault source and the older 1,000-action physical
pressure fixtures are not counted as C3 passes: their transient JavaScript test
graphs exhaust or monopolize the finite C3 pool. Linux retains the complete
fault-seam responsibility. The compact physical suite is the applicable C3
allocation-path evidence.

After the fault run, the exact production artifact with SHA-256
`e0f6411a...36a7371` was restored. The compact production validation suite
then passed again and confirmed that test-only APIs are absent.

## Wireless-Service Rerun

Release-candidate run `20260928T112243Z` passed with the classic ESP32 as the
BLE GATT central and the C3 simultaneously acting as BLE peripheral, WiFi
station, TLS 1.2 HTTPS client, and XFSM host. It recorded:

- 11 target and 7 peer checks with no failures;
- exactly one 200-status HTTPS request and a 744-byte response;
- the complete five-event XFSM service trace and depth-24/49-action branch;
- BLE connection and GATT writes before and after HTTPS;
- a 40,612-byte minimum native heap and 1,902 free JsVars at the sampled
  runtime high-water point; and
- cleanup to 460 used JsVars with temporary Storage removed.

## Embedded Exclusions

`test_strict_validation.js` and `test_limits.js` remain Linux-host suites
because their deliberately large source and 65,535-byte string fixtures are
not suitable embedded payloads. The C3 ran `test_strict_validation_embedded.js`,
the canonical depth-32 cases, and the 256/257 microstep boundary instead.
This is the existing target-sized coverage policy, not a relaxation introduced
for C3-D.

## Decision

ESP32-C3 IDF5 advances from **Build verified** to **Conformance verified** for
Profile 1 under the target-specific criteria in specification version 0.51.
The claim applies to the stock full-feature 70 KB native-heap profile and the
exact evidence above. It does not imply that every configuration combining
independent structural maxima will fit, nor does it qualify another ESP32 or
RISC-V board.
