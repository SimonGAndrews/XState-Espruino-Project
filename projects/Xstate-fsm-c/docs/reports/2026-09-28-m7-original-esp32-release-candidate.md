# Original ESP32 Release-Candidate Qualification

Date: 2026-09-28

## Purpose

This report closes the M7.4 release-candidate gate for the stock full-feature
`ESP32_IDF5` profile. It repeats matched disabled and enabled builds, flashes
the exact enabled artifact, and exercises the applicable portable, resource,
cleanup, host-integration, save/restoration, allocation-failure, and combined
wireless-service suites on the physical Xtensa target.

The machine-readable evidence is the [M7.4 result
record](../../tests/results/esp32-xtensa/2026-09-28-m7-release-candidate.json).

## Candidate

| Item | Value |
| --- | --- |
| Production firmware revision | `c25a1c32dd07369e8a7ec42d6c853ada641019d6` |
| Engine implementation revision | `cb5d74e8953ac7b4290aaba64f2aabe7714a3a05` |
| Service-fixture revision | `aded959ada37449c59b4a79e67133cd4cc4cbd2b` |
| Bench revision | `0123361566f442fe27d6a8a84178c719f0fae20c` |
| Board | `ESP32_IDF5` |
| Runtime | `2v29.446`, commit `c25a1c32d` |
| CPU | ESP32 Xtensa LX6, 32-bit little-endian |
| ESP-IDF | 5.5.3 |
| Compiler | Xtensa GCC 14.2.0 |
| Build flags | `RELEASE=1 USE_XFSM=1`, no `SETDEFINES` override |
| Native-heap reserve | 70,000 bytes |
| JsVar pool | 2,803 blocks of 14 bytes |
| XFSM coordinator reserve | 1,024 bytes |
| Device | ESP32-D0WD-V3 revision 3.1, 4 MB embedded flash |
| Control path | `/dev/serial/by-path/pci-0000:00:14.0-usb-0:2.2:1.0-port0` |

The engine source is unchanged from the compact compiler revision. Its
compiler SHA-256 remains `689c6c81...14b9e2cd9` and its runtime SHA-256
remains `5d5403c3...08fbc3d`.

## Matched Build Result

Both clean builds used the same revision, board, release optimization, IDF,
complete WiFi/Bluetooth/TLS/graphics/debugger feature set, and 2,048,000-byte
generated app partition.

| Build | App image | Free app partition | SHA-256 |
| --- | ---: | ---: | --- |
| `USE_XFSM=0` | 1,491,968 bytes | 556,032 bytes | `cea38ea1...86304ed` |
| `USE_XFSM=1` | 1,525,248 bytes | 522,752 bytes | `0802cd7c...172fe08` |

XFSM adds 33,280 bytes, or 2.23% of the matched disabled image. The enabled
link map contains `jswrap_xfsm.c`, `jswrap_xfsm_createMachine`, and
`xfsm_compile.c`; the disabled generated wrapper-source list omits XFSM.

## Physical Regression

All 20 embedded-applicable portable suites passed on the exact production
candidate. They cover the module API, construction, diagnostics, runtime,
completion and its 256/257 microstep boundary, target grammar, event lookup,
context and assignment forms, transition domains, lifecycle, subscriptions,
cross-actor GC behavior, runtime errors, and compact strict validation.

The canonical maximum-depth fixtures passed through both direct REPL and
Storage-backed loading:

- depth 32 entered with 32 ordered entry actions;
- the reviewed transition executed 32 exits, one transition action, and 32
  entries;
- direct execution used 1,092 of 2,803 JsVar blocks at its sampled transition;
- Storage-backed construction used 1,046 blocks after compilation, erased its
  temporary file, and left 66,740 native-heap bytes free with a 66,364-byte
  recorded minimum.

The target-specific lifecycle and integration checks also passed:

- eight actors sharing one compiled machine, six repeated construction cycles,
  a faulted graph, and two shared-graph cycles returned exactly to the
  1,819-block settled baseline;
- compiled machines and actors survived GC relocation;
- 128 synchronous sends and publications completed before the due timer ran;
- outer-scope and closure actions, flash-module actions and guards, a native
  guard, bound GPIO actions, timer ingress, subscription order, callback-fault
  rollback, Storage cleanup, module-cache cleanup, and safe pin state passed;
- whole-interpreter save/restoration retained the tested actor lifecycle state
  without replay, and `reset(true)` erased the saved image without synthesizing
  exits.

## Allocation Paths

A temporary `XFC_TEST=1` build ran the compact deterministic physical fault
suite. Eight representative allocation seams passed: compiler workspace,
compiled arena, actor creation, startup context, assignment context,
pre-publication snapshot, explicit snapshot materialization, and subscription
node. Each case checked the stable `E_NO_MEMORY` path plus rollback or retry.

The older production pressure fixtures were calibrated for the superseded
65 KB native-heap diagnostic profile. Under that profile, the earlier
pre-optimization compiler revision passed at 501 and 387 free JsVars. Their
fixed 12,000-byte and 8,000-byte fillers drive the selected 70 KB profile into
global interpreter pressure and did not finish in the release runner window,
so they are not counted as current stock-profile passes. The deterministic
physical suite is the bounded release-candidate allocation-path evidence;
Linux retains the complete fault-seam responsibility.

After the fault run, the exact production artifact with SHA-256
`0802cd7c...172fe08` was restored. Compact production validation passed before
and after the wireless run and confirmed that `_failNext` and `_measure` are
absent.

## Wireless-Service Rerun

Release-candidate run `20260928T164722Z` passed with the C3 as BLE GATT central
and the classic ESP32 simultaneously acting as BLE peripheral, WiFi station,
TLS 1.2 HTTPS client, and XFSM host. It recorded:

- 11 target and 7 peer checks with no failures;
- exactly one 200-status HTTPS request and a 744-byte response;
- the complete five-event XFSM service trace and depth-24/49-action branch;
- BLE connection and GATT writes before and after HTTPS;
- a 30,520-byte minimum native heap and 1,716 free JsVars at the sampled
  runtime high-water point; and
- cleanup to 456 used JsVars with temporary Storage removed.

## Embedded Exclusions

`test_strict_validation.js` and `test_limits.js` remain Linux-host suites
because their deliberately large source and 65,535-byte string fixtures are
not suitable embedded payloads. The target ran
`test_strict_validation_embedded.js`, the canonical depth-32 cases, and the
256/257 microstep boundary instead. This is the established target-sized
coverage policy, not a relaxation introduced for M7.4.

## Decision

Original ESP32 IDF5 advances from **Build verified** to **Conformance
verified** for Profile 1 under the target-specific criteria in specification
version 0.51. The claim applies to the stock full-feature 70 KB native-heap
profile and the exact evidence above. It does not imply that every
configuration combining independent structural maxima will fit, nor does it
qualify another ESP32 or Xtensa board.
