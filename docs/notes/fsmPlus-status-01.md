# FSMPlus Status Summary (from Flat FSM baseline)

This note summarises the **functional changes** from the flat Espruino FSM
(`projects/xstate-fsm-espruino/src/xstate-fsm.js`) to the current FSMPlus engine
(`projects/xstate-fsmPlus/src/xstate-fsmPlus.js`).

## What’s working now

- **Hierarchical state support**: compound (nested) states using dot‑path identifiers.
- **Initial substate resolution**: compound targets resolve to their initial leaf.
- **Parent fallback lookup**: walk ancestors for event handlers; nearest wins.
- **Guarded transition arrays**: multiple candidates per event; first passing guard selected.
- **Preprocessing**: flattened lookup table keyed by dot‑path IDs.
- **Assign precedence**: `assign` actions run before other transition actions.
- **Runtime API continuity**: v4‑shaped `createMachine`, `interpret`, `state.value`/`context`.

## High‑Level Code Changes (as reflected in source comments)

- **Constants and helpers**: centralized enums and utility helpers for event normalization
  and state matching.
- **Transition selection block**: explicit guard handling plus ancestor fallback traversal.
- **Preprocessing block**: flattening of nested config into a lookup and initial resolution.
- **Machine creation block**: transition path that applies assigns first, then actions,
  and resolves compound targets to leaf states.
- **Interpreter lifecycle block**: `start`/`send`/`subscribe` flow retained for v4‑style API.

## What’s still missing for full  Minimum Viable Hierarchical Engine. MVHE semantics

- **Entry/exit action ordering** for compound transitions (ADR‑0004).
- **LCCA‑based exit/entry sets** for hierarchical transitions.
- **Targetless transitions** (actions only, no exit/entry).
- **Self‑transition semantics** (re‑entry with correct exit/entry ordering).

## Summary

FSMPlus is now a **hierarchical extension** of the flat Espruino FSM. It adds
compound states, parent fallback resolution, and guarded transition selection
while maintaining the same runtime API and Espruino constraints. The remaining
work is to complete hierarchical action semantics (entry/exit/LCCA and related
ordering) to reach full MVHE parity.
