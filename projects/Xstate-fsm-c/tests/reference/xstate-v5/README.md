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

Do not update the dependency version or regenerate `package-lock.json` without
reviewing the Profile 1 reference version and the affected expected traces.
