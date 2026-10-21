# XState V5 Reference Environment

This package pins the primary Profile 1 differential reference to
`xstate@5.33.2`. It is evidence and test tooling, not runtime code for
Espruino.

Install exactly the locked dependency tree and verify the reference:

```bash
npm ci
npm test
```

`npm test` checks the installed package version and runs a minimal actor
transition. Differential case runners will be added here as their cases are
entered in the [conformance matrix](../../conformance-matrix.md).

The experimental [history-states extension](../../../docs/extensions/history-states.md)
has separate asserted shallow- and deep-history reference runners:

```bash
npm run test:history
npm run test:history:deep
```

This command records XState behaviour used to define the extension. It does
not claim that XFSM implements the extension and is not part of the completed
Profile 1 totals.

Do not update the dependency version or regenerate `package-lock.json` without
reviewing the Profile 1 reference version and the affected expected traces.
