# Building Xstate-fsm-c

## Status

- Build-document status: Linux runtime and M5 measurements verified; original
  ESP32 IDF5 build verified; MDBT42Q enabled size check blocked
- Current implementation branch: `feature/xfsm-profile1`
- Current implementation base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Current implementation revision: `8794dc1d7`
- Base source: official `espruino/Espruino` `master`

This document records the reproducible two-repository build arrangement. Add a
command here only after it has been run successfully against the recorded
revision.

## Repository Locations

### Specification And Evidence Repository

- Remote: `https://github.com/SimonGAndrews/XState-Espruino-Project`
- Current local clone: `/home/simon/XState-Espruino-Project`
- Project directory: `projects/Xstate-fsm-c/`

### Implementation Repository

- Fork remote: `git@github.com:SimonGAndrews/Espruino.git`
- Official upstream: `https://github.com/espruino/Espruino.git`
- Branch: `feature/xfsm-profile1`
- Current local clone: `/home/simon/Espruino-XFSM-Profile1`
- Canonical library directory: `libs/xfsm/`

The C engine and wrapper are edited only in the implementation repository. Do
not copy them into `projects/Xstate-fsm-c/src/`.

## Obtaining The Implementation Repository

For a new clone:

```bash
git clone --branch feature/xfsm-profile1 \
  git@github.com:SimonGAndrews/Espruino.git Espruino-XFSM-Profile1
cd Espruino-XFSM-Profile1
git remote add upstream https://github.com/espruino/Espruino.git
git fetch upstream
```

Confirm the expected remotes and branch:

```bash
git remote -v
git status -sb
git log -1 --oneline --decorate
```

Before rebasing or merging a later upstream revision, record the proposed base
change in [Implementation Status](implementation-status.md) and rerun the
baseline, enabled build, conformance, and resource checks affected by it.

## Local Environment

The current machine may use these convenience variables:

```bash
export XSTATE_ESPRUINO_ROOT=/home/simon/XState-Espruino-Project
export ESPRUINO_XFSM_ROOT=/home/simon/Espruino-XFSM-Profile1
```

Scripts and committed tests must derive repository-relative paths or accept an
explicit path; they must not require these machine-specific absolute paths.

## Linux Reference Build

The pristine baseline and committed disabled/enabled commands were verified on
2026-09-25. They produce `bin/espruino`; complete metadata is recorded in the
[baseline result](../tests/results/linux/2026-09-25-baseline-build.json) and
[library-shell result](../tests/results/linux/2026-09-25-library-shell-build.json).
The sequence is:

1. build clean Linux Espruino at the recorded base with XFSM absent;
2. record compiler, version, flags, binary size, and build artifact;
3. add the optional XFSM library integration;
4. build the identical configuration with `USE_XFSM=1`; and
5. record the attributable size difference and linker-map evidence.

Verified disabled command:

```bash
cd "$ESPRUINO_XFSM_ROOT"
make clean
make
```

Verified enabled command:

```bash
cd "$ESPRUINO_XFSM_ROOT"
make clean
make USE_XFSM=1
```

Run `make clean` when switching between enabled and disabled configurations;
the generated wrapper source set is configuration-dependent and an incremental
switch does not reliably regenerate it.

Verify the enabled module surface with:

```bash
bin/espruino --test libs/xfsm/tests/test_shell.js
```

Verify the M3 construction slice with:

```bash
bin/espruino --test libs/xfsm/tests/test_compile.js
bin/espruino --test libs/xfsm/tests/test_diagnostics.js
```

Verify the M4 actor execution slice with:

```bash
bin/espruino --test libs/xfsm/tests/test_runtime.js
bin/espruino --test libs/xfsm/tests/test_runtime_errors.js
bin/espruino --test libs/xfsm/tests/test_subscriptions.js
```

At revision `c6505437a`, all six JavaScript tests passed and each returned to
zero retained memory records after garbage collection. The construction
result is recorded in
[the Linux construction result](../tests/results/linux/2026-09-25-construction.json)
and the runtime result is recorded in
[the Linux actor-runtime result](../tests/results/linux/2026-09-25-actor-runtime.json).
They are interpreted in the [construction
report](reports/2026-09-25-linux-construction.md) and [actor-runtime
report](reports/2026-09-25-linux-actor-runtime.md).

The shell-size comparison and its limitations are explained in the
[Linux library-shell report](reports/2026-09-25-linux-library-shell.md).

## Sanitizer Build

Linux native-format and portable-engine tests run independently of the
Espruino JavaScript wrapper with address and undefined-behaviour sanitizers.
The verified native-format command is:

```bash
cd "$ESPRUINO_XFSM_ROOT"
make -C libs/xfsm/tests/native clean test
```

At revisions `d4860d07a`, `80d424772`, `c6505437a`, `de251bd97`, and
`8794dc1d7`, GCC 13.3.0 compiled the C99 suite with strict warnings promoted to
errors and all 66 checks passed without a sanitizer finding. The result is
recorded in the [native-format
result](../tests/results/linux/2026-09-25-native-format.json) and interpreted in the
[native-format report](reports/2026-09-25-linux-native-format.md).
Sanitizer findings are failures and must be linked from the conformance result.

## M5 Measurement Builds

The verified Linux measurement command is:

```bash
make clean
make USE_XFSM=1 XFC_MEASURE=1 -j2
bin/espruino --test libs/xfsm/tests/measure_m5.js
```

`XFC_MEASURE=1` adds two private measurement methods and native counters. They
are absent from normal builds and are not XFSM API. The stack-reserve negative
path was verified separately:

```bash
make clean
make USE_XFSM=1 XFC_STACK_RESERVE=2000000 -j2
bin/espruino --test libs/xfsm/tests/test_stack_reserve.js
```

Normal builds default to a 512-byte XFSM coordinator reserve plus Espruino's
512-byte safety allowance. See the [M5
report](reports/2026-09-25-m5-first-evidence.md) and [Linux
result](../tests/results/linux/2026-09-25-m5-resource-evidence.json).

## Physical Builds

Commands and required toolchain revisions will be recorded separately for:

| Target | Board/build definition | Command status |
| --- | --- | --- |
| Espruino Pico | STM32F401 | Not established |
| MDBT42Q | nRF52832 | Stock DFU verified; XFSM ELF links but fails the Storage-overlap size check |
| Original ESP32 | `ESP32_IDF5`, 32-bit Xtensa | Build verified; XFSM image leaves 528,128 bytes in the app partition |
| ESP32-C3 | `ESP32C3_IDF5`, 32-bit RISC-V | Secondary architecture qualification; stock capacity established |
| ESP32-S3 | `ESP32S3_IDF5`, 32-bit Xtensa | Later expansion target after sufficient Espruino port testing |

The library must be selected through Espruino's normal optional-library
mechanism. Target-specific board files may select `XFSM`, but must not contain
engine semantics or duplicate its source list.

The 2026-09-25 MDBT42Q attempt used the target provisioning script, its pinned
EspruinoBuildTools ARM GCC 13.2.1 archive, and the existing nRF5 SDK 12 tree.
`DEBUG` is removed because the Codex host exports `DEBUG=release`, which GNU
Make otherwise treats as enabled and uses to replace `-Os` with `-g`:

```bash
source scripts/provision.sh MDBT42Q
env -u DEBUG make clean
env -u DEBUG make BOARD=MDBT42Q RELEASE=1 DFU_UPDATE_BUILD=1 USE_XFSM=0 -j2
env -u DEBUG make clean
env -u DEBUG make BOARD=MDBT42Q RELEASE=1 DFU_UPDATE_BUILD=1 USE_XFSM=1 -j2
```

The stock build passed and created its DFU ZIP with 112 bytes before reserved
Storage. The XFSM-enabled ELF linked, adding 22,288 flash bytes (7.07%), but
failed Espruino's size check because it overlapped Storage by 22,176 bytes.
XFSM was therefore not added to the stock board definition. Exact results are
in the [MDBT42Q build record](../tests/results/mdbt42q/2026-09-25-m5-build-attempt.json).

The original ESP32 comparison uses ESP-IDF 5.5.3 and the provisioned Xtensa
GCC 14.2.0 toolchain. Both builds use the same implementation revision and
remove the inherited `DEBUG` setting:

```bash
source scripts/provision.sh ESP32_IDF5
env -u DEBUG make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=0 clean
env -u DEBUG make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=0 -j2
env -u DEBUG make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=1 clean
env -u DEBUG make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=1 -j2
```

The disabled app image was 1,491,968 bytes. The enabled image was 1,519,872
bytes, a 27,904-byte or 1.87% increase, and passed the partition-size check
with 528,128 bytes free. See the [ESP32 IDF5 build
report](reports/2026-09-25-esp32-idf5-build.md) and [result
record](../tests/results/esp32-xtensa/2026-09-25-m5-idf5-build.json).

## Development CI

The implementation branch contains a dedicated `.github/workflows/xfsm.yml`
development workflow. It verifies the disabled and enabled Linux builds, all
current XFSM JavaScript suites, the native-format sanitizer suite, and an
XFSM-enabled `ESP32_IDF5` build. It selects `USE_XFSM=1` explicitly and does
not add XFSM to a stock board definition. The ordinary firmware workflow uses
the `**` branch pattern so pushes to slash-named branches such as
`feature/xfsm-profile1` are not silently omitted.

This workflow is branch-development infrastructure. It can remain fork-local
or be excluded from a future upstream implementation pull request without
changing the XFSM library or its optional build mechanism.

## Required Build Record

Every result must identify:

- XState-Espruino-Project revision;
- Espruino implementation revision and upstream base;
- compiler and version;
- board definition;
- relevant build, optimization, and link-time-optimization flags;
- CPU architecture, pointer width, and byte order;
- `process.memory().blocksize` where available;
- XFSM stack-reserve setting;
- enabled or disabled XFSM selection; and
- output artifact, test result, and measurement-report paths.

Store reviewed evidence under `tests/results/` and measurement narratives under
`docs/reports/` as described by their index files.

## Troubleshooting Log

Do not accumulate unresolved build problems as prose in this guide. Record an
issue in the appropriate repository and link it from
[Implementation Status](implementation-status.md). Add a troubleshooting entry
here only after the cause and repeatable remedy are known.
