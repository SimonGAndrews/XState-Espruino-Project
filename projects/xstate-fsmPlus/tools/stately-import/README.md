# Stately Import (Stub)

This folder defines the **import boundary** between Stately tooling exports
and the FSMPlus runtime configuration format, as required by ADR-0007.

## Purpose

- Accept machine exports from Stately Studio (v4 first, v5 later)
- Normalize them into the FSMPlus config shape
- Keep FSMPlus runtime code independent from tooling formats

## Status

Stub only. No active import logic yet.

## Planned Interface

A single entry point should be provided, for example:

```js
// Example signature (not yet implemented)
function importMachine(toolingExport) {
  // normalize tooling export -> FSMPlus config
  return fsmPlusConfig;
}
```

## Notes

- v4 exports should be supported first.
- v5 exports may require an adapter layer but must not change runtime semantics.
