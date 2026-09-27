# ESP32-C3 IDF5 Build Feasibility

Date: 2026-09-27

## Purpose

This check establishes whether the complete Profile 1 XFSM implementation can
fit the stock full-feature `ESP32C3_IDF5` build. It also exercises the C engine
and Espruino wrapper through a 32-bit RISC-V compiler and linker. It is not a
physical-device or runtime-conformance result.

The machine-readable evidence is the [ESP32-C3 build
record](../../tests/results/esp32-riscv/2026-09-27-m7-build-feasibility.json).

## Configuration

Both comparison builds use Espruino implementation revision `8ce408fb5`,
ESP-IDF 5.5.3, and RISC-V GCC 14.2.0. The stock board profile retains WiFi,
Bluetooth, TLS, filesystem, graphics, and crypto, with 4,095 configured
variables and `ESP_HEAP_SIZE=70000`. XFSM is selected only through
`USE_XFSM=1`; the board file is unchanged.

```bash
source scripts/provision.sh ESP32_IDF5
env -u DEBUG make BOARD=ESP32C3_IDF5 clean
env -u DEBUG make BOARD=ESP32C3_IDF5 RELEASE=1 USE_XFSM=0 -j2
env -u DEBUG make BOARD=ESP32C3_IDF5 clean
env -u DEBUG make BOARD=ESP32C3_IDF5 RELEASE=1 USE_XFSM=1 -j2
```

For IDF5 builds, ESP-IDF validates the image against the generated partition
table. Its `factory` application partition is 2,048,000 bytes. The
`ESP32_FLASH_MAX=1572864` assignment still present in the board file is used by
the older `ESP32.make` path, not by `ESP32_IDF5.make`.

## Result

| Measurement | XFSM disabled | XFSM enabled | Difference |
| --- | ---: | ---: | ---: |
| Application image | 1,678,240 bytes | 1,713,264 bytes | 35,024 bytes |
| App-partition use | 81.95% | 83.66% | 1.71 percentage points |
| App-partition free | 369,760 bytes | 334,736 bytes | -35,024 bytes |

XFSM increases the matching application image by 2.09%. The enabled build
passes ESP-IDF's partition-size check with 334,736 bytes, or 16.34%, free. The
linked RISC-V ELF contains `jswrap_xfsm_createMachine`.

## Interpretation

The stock full-feature ESP32-C3 configuration advances to **Build verified**.
Flash capacity is not a blocker for this target.

Physical qualification must still prove that the image boots, that the XFSM
module and representative Profile 1 behavior execute on RISC-V, and that its
JavaScript/native memory split is viable. The classic ESP32's 65,000-byte
native-heap override must not be copied to the C3 without C3-specific runtime
measurements. WiFi, TLS, BLE, and combined WiFi/BLE activity must then be
exercised while XFSM machines are resident before selecting a C3 product
profile or claiming conformance.
