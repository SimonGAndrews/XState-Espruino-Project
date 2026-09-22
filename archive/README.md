# Source Archive

This directory preserves upstream source snapshots used as historical reference
for the XState Espruino projects. Archived sources are reference material and
are not active project implementations.

## `xstate-fsm`

- **Local path:** `archive/xstate-fsm/`
- **Upstream project:** `statelyai/xstate`
- **Source release:**
  [XState 4.37.2](https://github.com/statelyai/xstate/releases/tag/xstate%404.37.2)
- **Archived package:** `@xstate/fsm`
- **Package version:** `2.0.0`
- **Archived:** 2026-09-22
- **Licence:** MIT; see `archive/xstate-fsm/LICENSE`

The package version differs from the enclosing XState monorepo release version.
This snapshot is the small, flat `@xstate/fsm` implementation from the XState
4.37.2 release, not the full hierarchical XState core package.

The snapshot is retained to document the upstream implementation from which the
Espruino FSM work developed. In particular, it provides reference source for
machine creation, transition handling, actions, guards, context assignment, and
the interpreter lifecycle.

Files beneath `archive/xstate-fsm/` should remain unchanged so that they continue
to represent the upstream snapshot. Project-specific analysis or adaptations
belong elsewhere in this repository.
