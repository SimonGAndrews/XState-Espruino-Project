# Espruino Test Operations Guide

Purpose: provide operational instructions to execute the test methodology
defined in `docs/governance/testing-strategy.md`.

This guide covers two execution workflows:

- `Suite test`: run a defined scenario package and compare normalized traces.
- `Interactive test`: run one or more manual scripts in REPL against flashed FSMPlus.

Related canonical docs:

- Strategy/policy: `docs/governance/testing-strategy.md`
- FSMPlus status and backlog: `docs/governance/fsmPlus-status-01.md`
- Supporting handover note: `docs/notes/espruino-test-workflow.md`

## Prerequisites

Install EspruinoTools CLI:

```bash
cd /home/simon/SGAdev
git clone https://github.com/espruino/EspruinoTools.git
cd /home/simon/SGAdev/EspruinoTools
npm install
```

You can set port via `--port`, `ESPRUINO_PORT`, or `espPort`.

## Tool Functionality (`tools/espruino_test.js`)

This helper is the suite-test operator tool. It is separate from interactive
bootcode/module commands and focuses on scenario packages.

Supported modes:

- `upload <scenario>`: uploads required scenario modules to Espruino Storage.
- `prep <scenario>`: prepares a local results file for trace paste.
- `run <scenario>`: runs `upload` then `prep` in one command.

What `upload` writes to Storage:

- `xstate_fsmPlus`
- `<scenario>.machine`
- `<scenario>.events`
- `<scenario>.expected`
- `run_<scenario>`

Additional behavior:

- Scenario folder resolution supports underscore/dash variants (for example
  scenario `foo_bar` may map to `examples/foo-bar/`).
- Some scenarios can use short storage prefixes to stay within Espruino
  Storage filename length limits.
- `prep` creates `projects/xstate-fsmPlus/tests/results/espruino/<scenario>.trace.txt`.
- If that file already exists, `prep` creates a timestamped trace file and prints
  the relative prepared path.
- Results template text expects trace capture between `TRACE BEGIN` and `TRACE END`.

## One-Off Shell Setup (WSL / VS Code terminal)

Add helper functions to `~/.bashrc` once:

```bash
nano ~/.bashrc
```

Append:

```bash
export ESPRUINO_CLI=/home/simon/SGAdev/EspruinoTools/bin/espruino-cli.js
export ESPRUINO_PORT=/dev/ttyACM0
export XFSMPLUS_SRC=/home/simon/SGAdev/XState-Espruino-Project/projects/xstate-fsmPlus/src/xstate_fsmPlus.js

espc() { node "$ESPRUINO_CLI" -p "${1:-$ESPRUINO_PORT}" --no-ble "${@:2}"; }
esprepl() { espc "${1:-$ESPRUINO_PORT}"; }
espflash() { # usage: espflash <module_name> <source_js> [port]
  espc "${3:-$ESPRUINO_PORT}" --storage "$1:$2";
}
espram() { # usage: espram <source_js> [port]
  espc "${2:-$ESPRUINO_PORT}" "$1";
}
espEraseAll() { # usage: espEraseAll [port]
  # Erases Espruino Storage files (not firmware), then resets.
  espc "${1:-$ESPRUINO_PORT}" -e 'require("Storage").eraseAll();reset();'
}
espboot() { # usage: espboot <source_js> [port]
  # Save as boot code in flash and run once after upload (load()).
  espc "${2:-$ESPRUINO_PORT}" \
    --config SAVE_ON_SEND=1 \
    --config LOAD_STORAGE_FILE=1 \
    "$1";
}
espbootrepl() { # usage: espbootrepl <source_js> [port]
  # Same as espboot, but keep terminal attached (watch mode).
  espc "${2:-$ESPRUINO_PORT}" \
    --watch \
    --config SAVE_ON_SEND=1 \
    --config LOAD_STORAGE_FILE=1 \
    "$1";
}
espFsmPlus() { espflash xstate_fsmPlus "$XFSMPLUS_SRC" "${1:-$ESPRUINO_PORT}"; }
espPort() { # usage: espPort /dev/ttyACM1
  export ESPRUINO_PORT="$1";
  echo "ESPRUINO_PORT=$ESPRUINO_PORT";
}
```

Reload and verify:

```bash
source ~/.bashrc
echo "$ESPRUINO_CLI"
echo "$ESPRUINO_PORT"
echo "$XFSMPLUS_SRC"
type esprepl
type espflash
type espram
type espEraseAll
type espboot
type espbootrepl
type espFsmPlus
type espPort
```

## Suite Test Quick Card

Assumes one-off shell setup is complete.

### 1. Optional: set current board port.

```bash
espPort /dev/ttyACM1
```

### 2. Upload scenario modules and prepare a results file.

```bash
node tools/espruino_test.js run greenhouse --port "$ESPRUINO_PORT"
```

`greenhouse` is the scenario name in:

- `examples/greenhouse/greenhouse.machine.js`
- `examples/greenhouse/greenhouse.events.js`
- `examples/greenhouse/greenhouse.expected.js`
- `projects/xstate-fsmPlus/tests/espruino/run_greenhouse.js`

Results are written under:

- `projects/xstate-fsmPlus/tests/results/espruino/`

### 3. Attach REPL and run the uploaded test runner.

```bash
esprepl
```

```js
var t = require("run_greenhouse");
t.run();
```

### 4. Extract trace from console log

Copy only lines between:

- `TRACE BEGIN`
- `TRACE END`

Paste into the results file path printed by the helper.

### 5. Diff against expected trace.

```bash
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
```

Timestamped file diff:

```bash
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino --file \
  projects/xstate-fsmPlus/tests/results/espruino/greenhouse.20260210_120522.trace.txt
```

## Interactive Test Quick Card

Assumes one-off shell setup is complete.

For CLI upload commands (`espFsmPlus`, `espflash`, `espboot`), wait for
`Upload Complete` before the next step.

### 1. Ensure current FSMPlus engine is in flash.

```bash
espFsmPlus
```

### 2. Test execution (pick one flow)

#### Storage module flow:

This flow uploads a named module to Storage; execution happens on `require()`.
The shell returns after upload, and REPL is attached explicitly with `esprepl`.

```bash
espflash ImplementAction_inline examples/espruino_interactive/ImplementAction_inline.js
esprepl
```

```js
reset();
require("ImplementAction_inline");
```

#### RAM execution flow:

This sends the file to RAM and executes immediately.
Code is not persisted in Storage/bootcode; CLI exits after run.

```bash
espram examples/espruino_interactive/ImplementAction_inline.js
```

#### Bootcode execution flow (WebIDE-like):

This writes code to flash bootcode (`.bootcde`) and runs it via `load()`.
Code persists for boot behavior, but terminal is not kept attached.

```bash
espboot examples/espruino_interactive/ImplementAction_inline.js
```

#### Bootcode execution + attached console:

Same bootcode write/run as `espboot`, but stays attached in terminal (`--watch` mode).
Use this when you want live runtime logs after upload.

```bash
espbootrepl examples/espruino_interactive/ImplementAction_inline.js
```

### 3. Stop timer-driven tests (if script defines `intervalId`):

```js
clearInterval(intervalId);
```

## REPL Reference Commands

List storage modules:

```js
require("Storage").list()
```

Confirm flashed engine contains action runner:

```js
var s = require("Storage").read("xstate_fsmPlus");
s.indexOf("runActions(")
```

Reset runtime:

```js
reset();
```

Erase storage from REPL:

```js
require("Storage").eraseAll();
reset();
```

Erase storage from shell:

```bash
espEraseAll
```

Exit REPL and return to shell: `Ctrl+C`

## Performance Bench (GPIO + Logic Analyzer)

Bench harness:

- `examples/espruino_interactive/perf_gpio_bench.js`

Run quickly (RAM mode):

```bash
espram examples/espruino_interactive/perf_gpio_bench.js
```

For repeat runs from storage:

```bash
espflash perf_gpio_bench examples/espruino_interactive/perf_gpio_bench.js
esprepl
```

```js
require("perf_gpio_bench").run();
```

Result logging template:

- `projects/xstate-fsmPlus/tests/perf_gpio_results_template.md`

Expected analyzer trace shape:

```text
Time --->

MARKER_PIN (D7)
  _|¯|______________________________  Case 1 marker (1 pulse)
  _|¯|_|¯|__________________________  Case 2 marker (2 pulses)
  _|¯|_|¯|_|¯|______________________  Case 3 marker (3 pulses)
  _|¯|_|¯|_|¯|_|¯|__________________  Case 4 marker (4 pulses)
  _______________________|¯¯¯¯|_____  End marker (~20 ms high)

PULSE_PIN (D8) inside each case
  __|¯|__|¯|__|¯|__|¯|__...
     <w>  <w>  <w>
        <--- g --->
```

Measurement points:

- `w` (pulse high width on `PULSE_PIN`): per-event processing window around
  `service.send(...)`; use this as primary external latency metric.
- `g` (low gap on `PULSE_PIN`): includes configured `GAP_MS` + loop overhead;
  use as a consistency/sanity check between runs.
- `MARKER_PIN` pulse count identifies case boundaries:
  - 1 pulse: `CASE1_NOOP`
  - 2 pulses: `CASE2_TARGETLESS`
  - 3 pulses: `CASE3_TARGETED_GO`
  - 4 pulses: `CASE4_TARGETED_BACK`

Interpretation notes:

- Internal `AVG_US` printed by harness includes GPIO toggle + delay overhead and
  is useful for quick comparisons.
- External pulse-width stats (`w`) are the cleaner runtime metric for
  before/after performance changes.
- Disable debug logging for meaningful performance captures.
