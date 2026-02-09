# ADR-0007: Tooling-First Compatibility via Version-Flexible Machine Import and v4-Shaped Runtime API

## Status

Accepted

## Context

One of the key motivations for implementing FSMPlus on Espruino is the ability to **reuse the
XState / Stately AI authoring, editing, and simulation tools** (e.g. Stately Studio and the
XState VS Code extension) in the microcontroller world.

The XState ecosystem is currently in transition:

- XState v5 introduces a new **actor-based runtime model** (`createActor`, snapshots, actor systems).
- Stately Studio can already export machines targeting **v4 or v5 syntax**.
- The XState VS Code extension is **not yet compatible with XState v5** and continues to work
  primarily with v4-style APIs.

FSMPlus is not designed to implement the full actor model or inspection semantics introduced
in XState v5. Attempting to adopt v5 syntax or APIs without implementing the underlying actor
semantics would create a misleading sense of compatibility and introduce long-term maintenance
risk.

At the same time, long-term tooling compatibility remains strategically important.

## Decision

FSMPlus will:

1. **Maintain a v4-shaped runtime API**, centred on:
   - `createMachine`
   - `interpret`
   - service lifecycle (`start`, `stop`, `send`)
   - `state.value`, `state.matches`, `state.context`

2. **Prioritise compatibility with Stately tooling outputs**, rather than with any single
   runtime API version, by introducing a **machine import boundary**.

3. Support **Stately Studio v4 exports** as the primary authoring and simulation workflow
   during initial development.

4. Allow for **future support of Stately Studio v5 exports** via a translation/adapter layer,
   without changing the FSMPlus runtime semantics.

FSMPlus will not attempt to directly implement XState v5 actor semantics.

## Scope of Compatibility

### In scope
- Machine configuration compatibility (states, transitions, actions, guards)
- Hierarchical state structure (compound states)
- Entry, exit, and transition actions
- Context updates via `assign`
- Tool-driven authoring and simulation workflows

### Out of scope
- Actor systems and spawned actors
- Inspection APIs
- Snapshot identity semantics
- Parallel states (ADR-0001)
- Full XState v5 runtime parity

## Architecture Implication

A clear boundary will exist between:

- **Authoring / tooling representation**
  (e.g. Stately Studio exports, v4 or v5 syntax)

and

- **FSMPlus internal representation**
  (dot-path state identifiers, preprocessed lookup tables, deterministic execution)

This boundary will be implemented as one or more import/normalisation modules, for example:

```projects/xstate-fsmPlus/tools/stately-import/```


The FSMPlus core runtime must remain unaware of tooling-specific formats.

## Alternatives Considered

1. **Adopt XState v5 syntax and APIs directly**  
   Rejected because FSMPlus does not implement actor semantics, leading to partial and misleading
   compatibility.

2. **Freeze strictly on v4 forever**  
   Rejected because it limits future tooling compatibility and creates long-term risk if
   tooling support shifts.

3. **Dual runtime APIs (v4 and v5)**  
   Rejected due to complexity, ambiguity, and maintenance cost.

## Consequences

### Positive

- Immediate access to mature Stately authoring and simulation tools
- Clear and honest compatibility story
- Fast path to an operational FSMPlus engine
- Future-proofing through adapters rather than engine rewrites
- Clean separation of concerns between tooling and runtime execution

### Negative

- Requires implementation and maintenance of import/adapter logic
- Some v5-only concepts will never be representable in FSMPlus
- Tooling compatibility depends on export formats remaining reasonably stable

## Notes

- Summary:  “Don’t chase v5 semantics; use adapters at the boundary.”
- This ADR intentionally prioritises **operational delivery** over theoretical API alignment.
- If FSMPlus later evolves toward native actor semantics, this decision must be revisited
  explicitly via a new ADR.
- Tooling compatibility should be validated using real Stately Studio exports rather than
  inferred from documentation alone.

