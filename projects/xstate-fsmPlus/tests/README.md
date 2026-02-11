# FSMPlus Tests

This folder contains the FSMPlus test harnesses, results, and run log.
Scenarios are **shared** and live under the repo root `examples/` folder.

Canonical references:
- Strategy/policy: `docs/governance/testing-strategy.md`
- Espruino CLI workflow: `tools/README_espruino.md`
- FSMPlus status/TODO: `docs/governance/fsmPlus-status-01.md`

## Structure

- `node/` — Node.js harnesses
- `espruino/` — Espruino harnesses
- `results/` — actual run outputs (gitignored)
- `test_log.md` — append-only run log

## Run (Node)

```
node projects/xstate-fsmPlus/tests/node/run_greenhouse.js
```

Output is written to:

- `projects/xstate-fsmPlus/tests/results/node/greenhouse.trace.txt`

## Run (Espruino)

Load the Espruino harness (module name from flash) and call `run()`:

```
var t = require('run_greenhouse');
t.run();
```

Output is written to:

- `projects/xstate-fsmPlus/tests/results/espruino/greenhouse.trace.txt`

## Diff (offline)

Compare expected vs actual trace:

```
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
```

If you need to diff a timestamped results file, use `--file`:

```
node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino --file \
  projects/xstate-fsmPlus/tests/results/espruino/greenhouse.20260210_115242.trace.txt
```

## Scenarios

Scenario sources are shared at:

- `examples/<scenario>/<scenario>.machine.js`
- `examples/<scenario>/<scenario>.events.js`
- `examples/<scenario>/<scenario>.expected.js`

Expected traces live with the scenarios and are the single source of truth.

## Notes

- This README describes folder-local structure and entry commands only.
- For end-to-end REPL/flash/bootcode command flows, use `tools/README_espruino.md`.
