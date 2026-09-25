# Building Xstate-fsm-c

## Status

- Build-document status: Linux firmware and native-format sanitizer builds
  verified
- Current implementation branch: `feature/xfsm-profile1`
- Current implementation base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Current implementation revision: `d4860d07a93a725176f6216321b3d47f2d0a14cf`
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

Verify the enabled module surface with:

```bash
bin/espruino --test libs/xfsm/tests/test_shell.js
```

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

At revision `d4860d07a`, GCC 13.3.0 compiled the C99 suite with strict warnings
promoted to errors and all 66 checks passed without a sanitizer finding. The
result is recorded in the
[native-format result](../tests/results/linux/2026-09-25-native-format.json)
and interpreted in the
[native-format report](reports/2026-09-25-linux-native-format.md).
Sanitizer findings are failures and must be linked from the conformance result.

## Physical Builds

Commands and required toolchain revisions will be recorded separately for:

| Target | Board/build definition | Command status |
| --- | --- | --- |
| Espruino Pico | STM32F401 | Not established |
| MDBT42Q | nRF52832 | Not established |
| ESP32-C3 | ESP-IDF, 32-bit RISC-V | Not established |
| Xtensa target | Original ESP32 or ESP32-S3, to be selected | Not established |

The library must be selected through Espruino's normal optional-library
mechanism. Target-specific board files may select `XFSM`, but must not contain
engine semantics or duplicate its source list.

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
