# Espruino Test Workflow

This note documents the **standard Espruino test flow** used in this repo so
future Codex threads can resume with minimal context loss.

## Summary

- Use the helper tool to **upload modules** and **prepare a results file**.
- Execute the test in the Espruino REPL.
- Paste the trace between `TRACE BEGIN/END` into the prepared results file.
- Run the diff tool offline to compare against expected output.

## Tool Summary (`tools/espruino_test.js`)

**Purpose**
- Upload scenario modules to **Espruino Storage**.
- Prepare a local results file for pasting TRACE output.

**Uploads to storage**
- `xstate_fsmPlus`
- `<scenario>.machine`
- `<scenario>.events`
- `<scenario>.expected`
- `run_<scenario>`

**Modes**
- `upload <scenario>` — upload modules only
- `prep <scenario>` — prepare results file only
- `run <scenario>` — upload + prep in one step

When a results file already exists, the tool creates a **timestamped** filename
and prints the **relative path** to use.

## Standard Interaction (Codex)

When asked to run an Espruino test, Codex should respond with:

1. **Tool command** (upload + prep) with the scenario filled in
2. **Results file path** to paste TRACE lines into
3. **REPL command** to execute the test
4. **Diff command** (optional)

## Example (Greenhouse)

**Upload + prep**
```
ESPRUINO_CLI=/home/simon/SGAdev/EspruinoTools/bin/espruino-cli.js \
node tools/espruino_test.js run greenhouse --port /dev/ttyACM0
```

**REPL**
```
var t = require("run_greenhouse");
t.run();
```

**Paste TRACE lines into**
```
projects/xstate-fsmPlus/tests/results/espruino/greenhouse.trace.txt
```

**Diff (offline)**
```
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
```

## Notes

- Module names on Espruino Storage **must not contain hyphens**; use underscores.
- The tool expects EspruinoTools CLI; set `ESPRUINO_CLI` if not on PATH.
- USB port varies; typically `/dev/ttyACM0` on WSL.
