# Espruino Test Workflow

This note documents the **standard Espruino test flow** used in this repo so
future Codex threads can resume with minimal context loss.

## Summary

- Use the helper tool to **upload modules** and **prepare a results file**.
- Execute the test in the Espruino REPL.
- Paste the trace between `TRACE BEGIN/END` into the prepared results file.
- Run the diff tool offline to compare against expected output.

## Trace Capabilities (What We Compare)

The normalized trace can capture four dimensions of behavior. Each is optional
per scenario, depending on what the harness prints and what the expected trace
contains.

1. **Transition sequence (EVENT lines)**  
   - What it proves: the event ordering and event-to-transition flow.  
   - How to implement: each runner pushes `EVENT <type>` before `send(...)`.

2. **Resulting state (STATE lines)**  
   - What it proves: the resolved leaf state after each transition.  
   - How to implement: use `STATE <state.value> ACTIONS <...>` for each
     emitted state.

3. **Executed actions (ACTIONS in STATE lines)**  
   - What it proves: which action descriptors were emitted for the transition,
     in order.  
   - How to implement: format `state.actions` via a stable string representation
     (e.g., `log:name`, `xstate.assign` filtered out for v4 truth) and join.

4. **Context snapshots (CTX lines)**  
   - What it proves: that `assign` logic and context mutation behave as expected.  
   - How to implement: append a `CTX {...}` line after each `STATE` line.
     Use a stable, sorted key order.  
   - Current usage: enabled in the **greenhouse** scenario.

If a scenario does **not** include CTX lines in its expected trace, the diff tool
will only compare the state + action + event sequence.

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

If you need to compare a **timestamped** results file, pass `--file`:

```
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino --file \
  projects/xstate-fsmPlus/tests/results/espruino/greenhouse.20260210_115242.trace.txt
```

## Notes

- Module names on Espruino Storage **must not contain hyphens**; use underscores.
- The tool expects EspruinoTools CLI; set `ESPRUINO_CLI` if not on PATH.
- USB port varies; typically `/dev/ttyACM0` on WSL.
