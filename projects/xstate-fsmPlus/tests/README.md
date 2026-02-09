# FSMPlus Tests

This folder contains the FSMPlus test harnesses, results, and run log.
Scenarios are **shared** and live under the repo root `examples/` folder.

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

Load the Espruino harness and call `run()`:

```
var t = require('projects/xstate-fsmPlus/tests/espruino/run_greenhouse');
t.run();
```

Output is written to:

- `projects/xstate-fsmPlus/tests/results/espruino/greenhouse.trace.txt`

## Scenarios

Scenario sources are shared at:

- `examples/<scenario>/<scenario>.machine.js`
- `examples/<scenario>/<scenario>.events.js`
- `examples/<scenario>/<scenario>.expected.js`

Expected traces live with the scenarios and are the single source of truth.
