# ADR-0010: Action Contract and Execution Model for FSMPlus

## Status

Proposed

## Context

FSMPlus currently supports action execution and named action resolution via
`createMachine(config, options)` and `withConfig(...)`, but action shape handling
and action metadata contract are not yet fully defined for compatibility-focused
use cases.

Recent compatibility testing with Stately-authored machine structures highlights
two practical needs:

- descriptor actions carrying custom fields (for example `params`)
- a stable action execution contract that aligns with XState v4-style semantics
  and remains practical on Espruino
- closing this gap is required for error-free usage of VS Code XState
  plugin/Stately action descriptors in FSMPlus workflows

XState v4 references indicate:

- action implementations receive `(context, event, meta)`
- action metadata includes at least `action` and `state`
- action objects are extensible, so custom fields (like `params`) are valid
  as part of `meta.action`

FSMPlus must define this explicitly while keeping Espruino constraints in scope:

- avoid unnecessary hot-path allocations and work per event
- preserve deterministic ordering semantics already defined by ADR-0004 and
  ADR-0005

## Decision

FSMPlus will adopt a v4-aligned action contract with explicit normalization and
metadata behavior:

1. **Supported action definitions**
   - single string action name
   - single function action
   - single descriptor object (for example `{ type, params, ... }`)
   - array of any of the above

2. **Normalization**
   - transition/entry/exit action inputs are normalized to arrays before
     execution planning.

3. **Execution signature**
   - resolved executable actions are called as:
     `exec(context, event, meta)`
   - backward compatibility is preserved for handlers that only use
     `(context, event)`.

4. **Meta contract**
   - `meta.action`: the resolved action object used for execution
   - `meta.state`: resulting state object at execution point
   - custom descriptor fields (for example `params`) are available under
     `meta.action.<field>`, including `meta.action.params`.

5. **Assign interaction**
   - `assign` precedence remains as defined by ADR-0005.
   - `assign` actions are handled by internal context-update flow and are not
     executed via generic runtime `exec` dispatch.

6. **Resolution via options / withConfig**
   - named action resolution uses merged options maps from
     `createMachine(..., options)` and `machine.withConfig(...)`.
   - `withConfig` overrides take precedence over base machine options for keys
     that overlap.
   - resolution must not mutate source transition/action config objects.

7. **Failure policy**
   - unresolved named actions are treated as non-executable descriptors and must
     not crash runtime dispatch by default.
   - behavior is observable in traces/logs; stricter fail-fast policy may be
     introduced separately if needed.

This ADR is a required compatibility step for plugin-generated descriptor action
usage in v15.3 Stately/Visualizer workflows.

## Non-Goals

- full XState v5 action contract parity
- service/invoke actor semantics
- delay scheduling semantics (`after`) in this ADR
- dynamic expression language for `params`

## Consequences

### Positive

- clearer and stable action API contract for users and tooling adapters
- practical compatibility with common v4-style action descriptor patterns
- explicit location for custom fields (`meta.action.params`)
- preserves existing ordering guarantees

### Negative

- slightly larger runtime surface area for action metadata handling
- additional tests required to lock down normalization and meta behavior
- unresolved-action default policy may differ from stricter environments

## Required Tests

- descriptor action with `params` is visible to handler through
  `meta.action.params`
- entry, transition, and exit action handlers receive `(context, event, meta)`
- single-action shorthand (`string`, `function`, `descriptor`) executes exactly
  once after normalization
- `withConfig` action overrides are honored over base options
- assign precedence remains unchanged relative to non-assign actions

## Relationship to Existing ADRs

- complements ADR-0004 (action ordering)
- complements ADR-0005 (assign precedence)
- aligns with ADR-0007 (v4-shaped runtime API direction)

## References

- `docs/decisions/ADR-0004-action-order.md`
- `docs/decisions/ADR-0005-assign-action.md`
- `docs/decisions/ADR-0007-Tooling-Compatibility.md`
- https://xstate.js.org/docs/guides/actions.html
- https://xstate.js.org/api/interfaces/actionmeta.html
- https://xstate.js.org/api/interfaces/actionobject.html
- https://xstate.js.org/api/interfaces/machineoptions.html
- https://xstate.js.org/api/interfaces/statemachine.html
