# Original ESP32 Device Testing

## Status And Provenance

- Last reviewed: 2026-09-27
- XFSM target: original ESP32 using Espruino `ESP32_IDF5`
- Verified device: ESP32-D0WD-V3 revision 3.1, 4 MB flash
- Verified implementation branch: `feature/xfsm-profile1`

This is the Xstate-fsm-c procedure for building, flashing, and testing a
locally connected original ESP32 over USB-UART. It is adapted from the local
handover document
`/home/simon/MaBecker/ESP32_SGATest/docs/handoff/2026-09-25-classic-esp32-flashing-and-direct-test-practice.md`
after the first physical XFSM M5 run. SGA-specific wiring, selector, and
wireless-test instructions are intentionally excluded.

This guide owns the XFSM procedure. The source handover remains useful
background but is not an Xstate-fsm-c requirement.

## Operating Rules

Use separate tools for separate jobs:

1. Build and flash with the selected Espruino checkout's provisioning script
   and Make targets.
2. Use paced direct serial transport for repeatable JavaScript tests.
3. Use EspruinoTools CLI for interactive work, a small one-line probe, or an
   independent transport comparison.
4. Use the matching ESP-IDF monitor only for boot logs, assertions, or decoded
   backtraces.

Do not use EspruinoTools CLI's `-f` option as the normal ESP32 flashing path.
An ESP32 image contains bootloader, partition-table, and application
components at target-specific offsets; Espruino's Make target owns those
details.

The control connection is UART0 over the board's USB-UART adapter. Do not
repurpose UART0 pins for a functional test. Record any attached wiring and
power arrangement that could affect the run, and do not join USB power to an
external supply unintentionally.

## Repository And Device Identity

Use the canonical implementation checkout:

```bash
export ESPRUINO_XFSM_ROOT=/home/simon/Espruino-XFSM-Profile1
```

Prefer the persistent serial link observed for the current adapter:

```bash
export ESP32_PORT=/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0
readlink -f "$ESP32_PORT"
ls -l "$ESP32_PORT"
```

The link resolved to `/dev/ttyUSB0` during the first XFSM physical run. A
persistent name reduces accidental selection but does not prove which board or
firmware is attached. Runtime identity must still be queried after flashing.

Before opening the port, confirm that no other process owns it:

```bash
fuser "$ESP32_PORT" || true
lsof "$ESP32_PORT" 2>/dev/null || true
```

Close the Espruino Web IDE, CLI terminals, `idf.py monitor`, `screen`,
`minicom`, and previous runners. Two processes must never share the REPL;
interleaved input can look like a firmware or parser failure.

## Record Provenance Before Building

Record the exact implementation source and local-diff state:

```bash
cd "$ESPRUINO_XFSM_ROOT"
git status --short --branch
git rev-parse HEAD
git remote -v
git diff --stat
```

`process.env.GIT_COMMIT` identifies the checked-out commit, not uncommitted
changes. Commit the candidate or retain its diff with the evidence.

Use a fresh shell for a target build and activate only one ESP-IDF family in
that shell. Do not activate IDF4 and IDF5 sequentially.

## Build And Verify The Image

Provision ESP-IDF 5, clear any inherited `DEBUG` value, and perform a clean
build whenever the board family or significant configuration changes:

```bash
cd "$ESPRUINO_XFSM_ROOT"
source scripts/provision.sh ESP32_IDF5
unset DEBUG
make BOARD=ESP32_IDF5 clean
make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=1 \
  SETDEFINES=libs/xfsm/tests/esp32_xfsm_profile.make -j2
```

Before flashing, check the generated target identity. A classic ESP32 build
has 40 pins:

```bash
rg 'for board|PC_BOARD_ID|JSH_PIN_COUNT' \
  gen/platform_config.h gen/jspininfo.h
```

Stop and clean if generated files identify another target. Stale generated C3
files have previously contaminated classic ESP32 builds after changing target
without cleaning.

An M5 instrumentation build is separate from normal firmware:

```bash
make BOARD=ESP32_IDF5 clean
make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=1 XFC_MEASURE=1 -j2
```

`XFC_MEASURE=1` exposes private measurement hooks. It must be omitted from the
normal image restored after measurement.

## Flash Through Make

Release any process holding the serial port, then flash the image produced by
the same provisioned checkout:

```bash
make BOARD=ESP32_IDF5 RELEASE=1 USE_XFSM=1 \
  SETDEFINES=libs/xfsm/tests/esp32_xfsm_profile.make \
  flash PORT="$ESP32_PORT"
```

Build and flash are normally separate operations so compilation failure cannot
be confused with transport failure. Do not substitute hand-written `esptool`
offsets unless flashing itself is under investigation.

Routine flashing does not require erasing the full device. Erasure destroys
saved JavaScript and persistent configuration and must be an explicit,
recorded test precondition. A full flash backup is optional and is not required
when the existing image can be reproduced from source.

If automatic entry to the ROM loader fails:

1. Check again that no process owns the port.
2. Reconnect USB and resolve the persistent link again.
3. Retry at a lower flash baud if the USB path is marginal.
4. Use the board's BOOT and RESET controls only if automatic reset still fails.

## Verify The Running Firmware

Allow the post-flash reset to complete before uploading a test. Query at least:

```javascript
print(JSON.stringify({
  board: process.env.BOARD,
  version: process.version,
  gitCommit: process.env.GIT_COMMIT,
  console: process.env.CONSOLE,
  createMachine: typeof require("XFSM").createMachine,
  measurementApi: typeof require("XFSM")._measure
}));
```

For a normal XFSM build, `createMachine` must be `"function"` and
`measurementApi` must be `"undefined"`. For an intentional M5 build,
`measurementApi` must be `"function"`.

Do not continue a qualification run if `BOARD`, version, commit, module
surface, or instrumentation state differs from the intended image.

## Direct Serial Runner

The paced direct runner used for the first XFSM physical evidence currently
lives in another local project:

```text
/home/simon/MaBecker/ESP32_SGATest/tools/repl/run_test.py
```

That path is an interim test-tool dependency, not an XFSM implementation or
specification dependency. Its recorded revision for the first run was
`1b740f5e3cb2a0ace6c57bd729a24c9c71b875d3`. A future project-owned runner
should preserve the same synchronization, metadata, pacing, structured-output,
and raw-transcript behavior.

Run a focused test from the runner repository root:

```bash
cd /home/simon/MaBecker/ESP32_SGATest
python3 tools/repl/run_test.py \
  "$ESPRUINO_XFSM_ROOT/libs/xfsm/tests/measure_m5_gc_relocation.js" \
  --port "$ESP32_PORT" \
  --baud 115200 \
  --timeout 30 \
  --show-raw
```

The direct transport is preferred for repeatable evidence because it
synchronizes the REPL, resets ordinary JavaScript state, paces multiline
uploads, captures metadata, and retains raw output. Use `--show-raw` while
investigating missing output, resets, or parse failures.

The current runner fails its process exit status when it sees an explicit
`FAIL ` assertion line. Tests must therefore emit assertion lines as well as a
final `DONE=` marker; `DONE=FAIL` alone is not sufficient protection against a
misleading zero exit status.

The M7.1 application-integration fixture is physical-target-only. It uses the
original ESP32 board's `LED1`/GPIO2, writes and removes a temporary `xfc_m7`
Storage module, and leaves the output low:

```bash
cd /home/simon/MaBecker/ESP32_SGATest
python3 tools/repl/run_test.py \
  "$ESPRUINO_XFSM_ROOT/libs/xfsm/tests/test_host_application.js" \
  --port "$ESP32_PORT" \
  --baud 115200 \
  --timeout 45 \
  --show-raw
```

The M7.2 production-memory and event-serialization fixtures use the same
runner and require no private firmware instrumentation:

```bash
python3 tools/repl/run_test.py \
  "$ESPRUINO_XFSM_ROOT/libs/xfsm/tests/test_host_memory_cleanup.js" \
  --port "$ESP32_PORT" --baud 115200 --timeout 60 --show-raw
python3 tools/repl/run_test.py \
  "$ESPRUINO_XFSM_ROOT/libs/xfsm/tests/test_host_event_serialization.js" \
  --port "$ESP32_PORT" --baud 115200 --timeout 60 --show-raw
```

The M7.3 profile and allocation fixtures require the product-profile build
above. They check maximum-depth execution directly and from flash Storage,
recoverable construction failure and retry, and compact diagnostic fallback:

```bash
for test in \
  test_transition_depth.js \
  test_transition_depth_storage.js \
  test_host_allocation_pressure.js \
  test_host_diagnostic_pressure.js; do
  python3 tools/repl/run_test.py \
    "$ESPRUINO_XFSM_ROOT/libs/xfsm/tests/$test" \
    --port "$ESP32_PORT" --baud 115200 --timeout 180 --show-raw
done
```

`test_transition_depth_storage.js` writes and erases `xfc_d32` in Storage.
The allocation fixtures intentionally consume much of the JsVar pool; run
them only after ordinary application state has been cleared by the runner.

## Test Program Contract

A device test must be standalone, bounded, and machine-readable:

```javascript
echo(false);
print("TEST=short_descriptive_name");

var passed = true;
// Run the focused check and update passed.

print((passed ? "PASS " : "FAIL ") + "check_name");
print("DONE=" + (passed ? "PASS" : "FAIL"));
```

A complete test must:

- print one `TEST=` identifier;
- print one `PASS ` or `FAIL ` line for each assertion;
- print compact `METRIC ` lines where measurements are required;
- print exactly one final `DONE=PASS` or `DONE=FAIL` marker;
- set Espruino's global `result` when the same file also runs under
  `bin/espruino --test`;
- place a timeout on every asynchronous phase;
- avoid large UART JSON dumps when focused metric lines will suffice;
- clean up actors, subscriptions, timers, watches, listeners, and peripherals;
- return pins and outputs to a safe state; and
- avoid `save()` or persistent configuration changes unless persistence is
  the subject of the test.

Keep upload pacing for long scripts. Unpaced multiline uploads have lost input
and created false syntax and runtime failures on this target.

## Reset Levels

Choose the least reset level that establishes the required precondition:

1. **REPL synchronization** sends interrupts and a newline. It stops partial
   input but does not reset firmware or ordinary runtime state.
2. **`reset()`** clears ordinary Espruino JavaScript state. The direct runner
   uses this before a normal focused test.
3. **`ESP32.reboot()`** reboots the chip and reinitializes native drivers. Use
   it for boot, saved-state, driver-lifecycle, or reset-cause behavior.

After `ESP32.reboot()`, allow the boot banner to finish and then resynchronize
the REPL. Do not begin a large upload during boot output.

`E.defrag()` can relocate Espruino values. Do not invoke it while a multiline
program is still being entered through the REPL; the remaining source can be
corrupted. Schedule relocation after upload has completed, as the dedicated
`measure_m5_gc_relocation.js` test does.

## Evidence And Repetition

The minimum device evidence header contains:

- implementation repository, branch, commit, and local-diff state;
- board definition, ESP-IDF version, compiler, and exact build flags;
- resolved serial device and relevant physical wiring or power arrangement;
- runtime `BOARD`, Espruino version, and `GIT_COMMIT`;
- exact JavaScript test and runner command;
- reset level and any erase or recovery operation; and
- assertion, measurement, exclusion, and final result lines.

For a new failure:

1. Preserve the first raw transcript, including boot or reset output.
2. Rerun the unchanged test from the same precondition.
3. Reduce it to the smallest direct serial script that still reproduces it.
4. Repeat after a true chip reboot.
5. Compare firmware builds only after holding target, wiring, and script
   constant.
6. Treat an older build as a comparator, not automatically as the authority.

One clean pass is smoke evidence. Timing and lifecycle claims require enough
repetition to exercise the measured path. Record the run count and what each
run exercised, not only a total pass count.

Use `pipefail` when retaining a transcript so the runner status is not hidden
by `tee`:

```bash
set -o pipefail
python3 tools/repl/run_test.py path/to/test.js \
  --port "$ESP32_PORT" --baud 115200 --timeout 30 --show-raw \
  2>&1 | tee /tmp/xfsm-device-test.log
```

Raw exploratory logs and firmware binaries are normally transient. Commit the
reviewed machine-readable result under `tests/results/esp32-xtensa/` and its
interpretation under `docs/reports/`. Never include credentials in a log.

## Failure Interpretation

| Observation | Interpretation and next action |
| --- | --- |
| No serial device | Check USB seating, power, persistent link, and kernel enumeration before changing firmware. |
| Permission denied or resource busy | Check group access and find the process owning the port. Do not start a second tool. |
| Flash cannot enter download mode | Release the REPL owner, reconnect or power-cycle, retry, then use BOOT/RESET if automatic reset still fails. |
| Prompt warning but structured output follows | Preserve the complete output and judge the run by markers and reset evidence; repeat through direct transport. |
| Missing `DONE` with assertion, backtrace, or boot banner | Treat it as crash or reset evidence and retain the matching build identity. |
| Missing `DONE` without crash output | Check timeout, lost upload, asynchronous stall, and REPL synchronization with a smaller script. |
| First run fails but warm repeats pass | Compare `reset()` with `ESP32.reboot()` and inspect saved configuration or startup state. |
| Large script fails inconsistently | Retain pacing, reduce output, and split the test into focused scripts. |

After a firmware crash, wait for the complete reboot banner and prompt before
reopening the port. If the console remains confused, release it and power-cycle
once. Do not erase flash merely to recover a serial session.

## Execution Checklist

1. Identify the Espruino checkout, branch, commit, local diff, board, and test.
2. Record the physical wiring and power arrangement relevant to the test.
3. Resolve the persistent serial path and prove that it has one owner.
4. Provision one ESP-IDF family in a fresh shell.
5. Clean, build, and verify generated board identity.
6. Flash with the matching Espruino Make target.
7. Query and record the running firmware identity.
8. Run a small XFSM smoke test.
9. Run the focused test with paced direct serial transport.
10. Preserve and repeat raw failures from the required reset level.
11. Restore normal firmware after an instrumentation build.
12. Clean up hardware state, release the port, and record reviewed evidence.

This ordering keeps source, build, flash, transport, runtime, and behavior
evidence distinct enough that a failure can be attributed without guessing.
