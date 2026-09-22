# Stately Compatibility Corpus

This directory preserves raw Stately-generated examples and records what each
one establishes for Xstate-fsm-c Profile 1.

## Completed Examples

| Example | Main evidence |
| --- | --- |
| `stately-editor-new-machine/` | v4/v5 wrapper, guard, callback, option-map, nested-state, and target syntax |
| `stately-editor-self-transition/` | Identical omitted transition property has different v4/v5 re-entry defaults |
| `stately-editor-context-ordered-assign/` | Ordered assignment works in v5; user-authored Sources code is preserved across output profiles |
| `stately-editor-hierarchical-boundaries/` | Stable target forms and action order; targeted active-child behavior differs between v4/v5 |
| `stately-editor-targetless-transition/` | The GUI preserves targetless and explicitly targeted self-transitions as distinct structures |
| `stately-editor-cross-hierarchy-targets/` | Cross-branch targets use the root machine ID followed by the complete nested-state path |
| `stately-editor-final-state/` | Nested final states generate `onDone`; v4/v5 action order agrees but completion-event names differ |

## Further Scope-boundary Examples

After the core profile is settled, small examples should be captured for
eventless transitions, delayed transitions, invoked actors, history states,
and parallel states. These are scope-boundary examples: they may establish a
required construction-time rejection rather than a supported feature.

Every example should retain the unmodified v4 and v5 exports when both are
available. GUI limitations, manual-import round trips, and hand-authored XState
tests must be identified separately from visually authored output.
