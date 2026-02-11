# Espruino Test Helper
// tools/README_espruino.md

This document covers two different Espruino test workflows:

- `Suite test`: run a defined scenario test with supporting files, then compare trace output.
- `Interactive test`: manually run one or more files in REPL against `xstate_fsmPlus` stored in flash.

Both workflows are used in this repo and share the same shell setup.

## Prerequisites

Install EspruinoTools (CLI). You can set the CLI path with `ESPRUINO_CLI`.

Local clone option:

```
cd /home/simon/SGAdev
git clone https://github.com/espruino/EspruinoTools.git
cd /home/simon/SGAdev/EspruinoTools
npm install
```

Example:

```
export ESPRUINO_CLI=/path/to/EspruinoTools/bin/espruino-cli.js
```

Set your port with `--port`, `ESPRUINO_PORT`, or `espPort` (after one-off setup).

## One-Off Shell Setup (WSL / VS Code terminal)

To enable both testing methods: Add Espruino defaults and helper aliases to `~/.bashrc` so every new terminal
session has the same command set.

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

Reload shell config:

```bash
source ~/.bashrc
```

Verify:

```bash
echo "$ESPRUINO_CLI"
echo "$ESPRUINO_PORT"
type esprepl
type espflash
type espram
type espEraseAll
type espboot
type espbootrepl
type espFsmPlus
type espPort
echo "$XFSMPLUS_SRC"
```

## Workflow Types

### Suite Test (scenario + trace compare)

A suite test uses a scenario package and expected output in the repo.
For example, `greenhouse` includes:

- `examples/<scenario>/<scenario>.machine.js`
- `examples/<scenario>/<scenario>.events.js`
- `projects/xstate-fsmPlus/tests/expected/<scenario>.trace.txt`
- `projects/xstate-fsmPlus/tests/espruino/run_<scenario>.js`

The helper script uploads required modules and prepares a result file for pasting REPL output.

Suite result files are written under:
- `projects/xstate-fsmPlus/tests/results/espruino/`

When running in REPL, copy only the streamed trace lines between:
- `TRACE_START`
- `TRACE_END`

Paste those lines into the prepared results file for diff/compare.

### Interactive Test (manual REPL execution)

An interactive test is a manual experiment, usually under:

- `examples/espruino_interactive/`

You keep `xstate_fsmPlus` in flash, then run test files either:

- from storage via `require("<module_name>")`, or
- directly to RAM with `espram <file.js>`.

If you want WebIDE-like behavior (flash bootcode + execute), use:
- `espboot <file.js>` to upload and execute bootcode
- `espbootrepl <file.js>` to upload, execute, and remain attached in terminal

## Suite Test Commands

If your board path changed, update the default first:

```bash
espPort /dev/ttyACM1
```

Upload modules for a scenario:

```bash
node tools/espruino_test.js upload greenhouse --port "$ESPRUINO_PORT"
```

`greenhouse` is the scenario name. It maps to scenario files under
`examples/greenhouse/` and runner/expected files that use the same name
(`run_greenhouse.js`, `greenhouse.trace.txt`).

Prepare results file only:

```bash
node tools/espruino_test.js prep greenhouse
```

Upload + prepare results file:

```bash
node tools/espruino_test.js run greenhouse --port "$ESPRUINO_PORT"
```

Then in REPL:

```js
var t = require('run_greenhouse');
t.run();
```

Paste trace output into the results path printed by the helper script.

## Interactive Test Command List (VS Code WSL)

### Quick Card: Interactive Mode

Assumes `One-Off Shell Setup` above has already been completed once.

For CLI upload commands (for example `espFsmPlus`, `espflash`, `espboot`),
wait for `Upload Complete` in terminal output before running the next REPL step.

Upload latest engine to flash:

```bash
espFsmPlus
```

Switch default port (if board path changes):

```bash
espPort /dev/ttyACM1
espFsmPlus
```

Or override port for one command only:

```bash
espFsmPlus /dev/ttyACM1
```

Upload one interactive test to flash:

```bash
espflash ImplementAction_inline examples/espruino_interactive/ImplementAction_inline.js
```

Attach REPL:

```bash
esprepl
```

Run test in REPL:

```js
reset();
require("ImplementAction_inline");
```

This `require("<name>")` form is for a module already uploaded to flash
(`Storage`) with that module name.
For files not uploaded as storage modules, use RAM execution instead:

```bash
espram examples/espruino_interactive/ImplementAction_inline.js
```

Stop test in REPL (only if the interactive script created `intervalId` via `setInterval` - typically to generate events):

```js
clearInterval(intervalId);
```

List loaded flash modules in REPL:

```js
require("Storage").list()
```

Erase all flash storage from REPL:

```js
require("Storage").eraseAll();
reset();
```

Erase all flash storage using CLI shortcut (no REPL needed):

```bash
espEraseAll
```

Run a JS file directly in RAM (not saved to flash):

```bash
espram examples/espruino_interactive/ImplementAction_inline.js
```

Upload as flash bootcode and execute (no per-module storage name):

```bash
espboot examples/espruino_interactive/ImplementAction_inline.js
```

Upload as flash bootcode, execute, and stay attached to view logs:

```bash
espbootrepl examples/espruino_interactive/ImplementAction_inline.js
```

### Upload Without Staying in REPL

Use this when you do not want the terminal to remain in Espruino REPL mode:

```bash
espFsmPlus
```

Upload a single interactive script as a storage module:

```bash
espflash ImplementAction_inline examples/espruino_interactive/ImplementAction_inline.js
```

### Attach REPL

```bash
esprepl
```

Exit REPL and return to shell: `Ctrl+C`

### REPL Checks

List storage modules:

```js
require("Storage").list()
```

Confirm current FSMPlus source has action runner code:

```js
var s = require("Storage").read("xstate_fsmPlus");
s.indexOf("runActions(")
```

Reset runtime:

```js
reset();
```

## Suite Test Compare Commands

Run scenario in REPL:

```js
var t = require("run_greenhouse");
t.run();
```

Diff results offline:

```bash
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
```

Diff a specific timestamped file:

```bash
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino --file \
  projects/xstate-fsmPlus/tests/results/espruino/greenhouse.20260210_120522.trace.txt
```
