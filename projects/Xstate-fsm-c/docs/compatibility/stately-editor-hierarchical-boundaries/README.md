# Stately Editor Hierarchical Boundary Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the corrected generated output as
supplied. `Outside` is initially active. `Parent` contains initial `ChildA` and
sibling `ChildB`. Entry and exit action stubs are attached to all four states.

## Generated Target Forms

The v4 and v5 generators emit identical machine structure and target strings:

| Transition | Generated target | Resolution |
| --- | --- | --- |
| `Outside` to `Parent` | `Parent` | Sibling of source |
| `ChildA` to `ChildB` | `ChildB` | Sibling of source |
| `Parent` to `ChildA` | `.ChildA` | Child of declaring source |
| `ChildB` to `Outside` | `#Hierarchical entry/exit boundaries.Outside` | Descendant of explicitly identified root |

Profile 1 target parsing must therefore preserve spaces in IDs and support bare
sibling targets, dot-prefixed descendant targets, and `#id.path` targets.
Construction must resolve all three forms to state indexes; dispatch must not
parse these strings.

## Common Reference Trace

Reference runs against XState 4.38.3 and XState 5.33.2 produced the same trace
for this event sequence:

```text
start: enterOutside
enter: exitOutside, enterParent, enterChildA
next:  exitChildA, enterChildB
reset: exitChildB, enterChildA
next:  exitChildA, enterChildB
leave: exitChildB, exitParent, enterOutside
```

This confirms leaf-to-ancestor exit ordering, ancestor-to-leaf entry ordering,
initial-child resolution, parent-handler fallback, and preservation of the
compound `Parent` during its default transition to `.ChildA`.

## Active-child Difference

The identical `reset` transition has different behavior if it is sent while
`ChildA` is already active:

```javascript
reset: [{ target: ".ChildA", actions: [] }]
```

The reference traces are:

```text
XState v4: no exit or entry actions
XState v5: exitChildA, enterChildA
```

XState v5 always re-enters a targeted child while preserving the compound
source unless `reenter: true` also requests source re-entry. Profile 1 follows
this v5 rule, so its expected trace is `exitChildA, enterChildA` without
`exitParent` or `enterParent`.

The version cannot be inferred from the generated transition because its text
is identical. As with targeted self-transitions, a v4 machine relying on the
old omitted-property behavior requires semantic migration rather than syntax
normalization alone.

## Profile 1 Assessment

The machine structure is accepted after the standard host/binding adaptation.
The v5 callback stubs require conversion to Profile 1's positional callback
ABI; the v4 stubs already have the required shape. Transition `meta` and empty
unsupported implementation maps remain subject to the general compatibility
decisions recorded by the new-machine example.
