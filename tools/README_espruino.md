# Espruino Test Helper

Simple CLI to upload FSMPlus scenario modules and prep a results file for paste.

## Prerequisites

Install EspruinoTools (CLI). You can set the CLI path with `ESPRUINO_CLI`.

Example:

```
export ESPRUINO_CLI=/path/to/EspruinoTools/bin/espruino-cli.js
```

Set your port with `--port` or `ESPRUINO_PORT`.

## Usage

Upload modules for a scenario:

```
node tools/espruino_test.js upload greenhouse --port /dev/ttyACM0
```

Prepare results file for paste:

```
node tools/espruino_test.js prep greenhouse
```

Then run in Espruino REPL:

```
var t = require('run_greenhouse');
t.run();
```

Paste TRACE lines into:

```
projects/xstate-fsmPlus/tests/results/espruino/greenhouse.trace.txt
```
