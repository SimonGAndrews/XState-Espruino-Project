# XState v4 Truth Runner

This project provides a reference runner using **XState v4** to validate
scenario behaviour against the shared examples in the repo root.

## Purpose

- Provide a v4-aligned truth source for FSMPlus/XFSM parity testing.
- Emit the same normalized trace format as FSMPlus.

## Install

`npm init` is **not** required here because `package.json` is already provided.

From the repo root:

```
cd projects/xstate-v4-truth
npm install
```

## Execute

From the repo root:

```
cd projects/xstate-v4-truth
npm run run:greenhouse
```

Output is written to:

- `projects/xstate-v4-truth/tests/results/node/greenhouse.trace.txt`

## Inputs

Scenarios are shared at the repo root:

- `examples/<scenario>/<scenario>.machine.js`
- `examples/<scenario>/<scenario>.events.js`
- `examples/<scenario>/<scenario>.expected.js`

## Log

Append results to:

- `projects/xstate-v4-truth/tests/test_log.md`
