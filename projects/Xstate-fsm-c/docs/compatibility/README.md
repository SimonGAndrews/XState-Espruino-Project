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

## Recommended Next Examples

These are ordered by value to the current specification work.

1. **Targetless transition**: an event with actions but no target, compared with
   a targeted self-transition. This checks whether the GUI can author and
   preserve the distinction.
2. **Explicit state IDs and cross-hierarchy targets**: a transition that cannot
   be expressed as a simple sibling target. This determines the editor's ID and
   path syntax and the minimum Profile 1 target grammar.
3. **Final state and parent done transition**: this informs whether completion
   semantics belong in version 1 and what code the editor emits for them.

After the core profile is settled, small examples should also be captured for
eventless transitions, delayed transitions, invoked actors, history states,
and parallel states. These are scope-boundary examples: they may establish a
required construction-time rejection rather than a supported feature.

Every example should retain the unmodified v4 and v5 exports when both are
available. GUI limitations, manual-import round trips, and hand-authored XState
tests must be identified separately from visually authored output.
