# Stately Editor Targetless Transition Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the generated output as supplied. The
machine has one initial state, `Active`, with entry and exit actions. Event
`stay` has a transition action but no target. Event `restart` has a transition
action and explicitly targets `Active`.

## Result

The GUI can author and preserve the structural distinction in both export
profiles:

```javascript
stay: [{ actions: [{ type: "recordTargetless" }] }]
restart: [{ target: "Active", actions: [{ type: "recordTargeted" }] }]
```

Switching the generator between v4 and v5 does not add a target to `stay`,
remove the target from `restart`, or emit an explicit `internal` or `reenter`
property.

Reference runs against XState 4.38.3 and XState 5.33.2 produced these action
traces after startup:

| Event | XState v4 | XState v5 / Profile 1 |
| --- | --- | --- |
| `stay` | `recordTargetless` | `recordTargetless` |
| `restart` | `recordExit`, `recordTargeted`, `recordEntry` | `recordTargeted` |

The `restart` difference arises from the version-specific default for a
targeted self-transition. The transition text itself is identical: XState v4
re-enters by default, whereas XState v5 and Profile 1 preserve the source state
when `reenter` is omitted.

## Profile 1 Assessment

Both transition structures are accepted after the standard host/binding
adaptation. Profile 1 MUST retain the absence of a target as a first-class
compiled property; it must not normalize a targetless transition into a
targeted transition to its source.

For `stay`, Profile 1 executes only `recordTargetless` and preserves the entire
active state configuration. For `restart`, it executes `recordTargeted` without
state exit or entry actions because Profile 1 follows the v5 non-re-entering
default.

As in the earlier self-transition example, a v4 definition that relies on the
v4 re-entry default requires an explicit semantic migration to `reenter: true`
when run under Profile 1.
