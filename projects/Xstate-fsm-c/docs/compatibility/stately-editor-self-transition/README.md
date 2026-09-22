# Stately Editor Self-transition Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the generated output as supplied. The
machine has one `Active` state with `recordEntry` and `recordExit` actions and
two targeted self-transition events, `stay` and `restart`. The GUI did not
provide a control to make either transition explicitly re-entering, so both
were left at the editor default. `v5-manual-reenter.js` preserves the separate
manual-import round-trip specimen and is not GUI-authored evidence.

## Result

The generated state and transition structures are identical. Neither output
adds an explicit transition-mode property:

```javascript
stay: [{ target: "Active", actions: [] }]
restart: [{ target: "Active", actions: [] }]
```

Their XState behavior nevertheless differs because the releases assign
different meanings to the omitted property:

| Export | Effective behavior | Event action trace |
| --- | --- | --- |
| XState v4 | External/re-entering by default | `recordExit`, `recordEntry` |
| XState v5 | Non-re-entering by default | No exit or entry action |

The v4 generator does not emit `internal: true` to preserve v5-style default
behavior. Changing only the editor's code-generation selection can therefore
change the runtime behavior of an unchanged visual machine.

## Profile 1 Assessment

Profile 1 deliberately uses the v5 non-re-entering default. The v5 machine
structure therefore has the intended Profile 1 behavior after the already
documented host-source and implementation-binding adaptations.

The v4 structure is syntactically consumable, but its omitted property is
ambiguous once separated from the selected generator version. Executing it
under Profile 1 would produce Profile 1/v5 behavior, not its original XState v4
behavior. Preserving the v4 behavior requires the transition to be migrated to
explicit `reenter: true` (or to v4 `internal: false`, which Profile 1 normalizes
during construction).

Profile 1 should not infer v4 transition defaults merely from the presence of
`predictableActionArguments` or `preserveActionOrder`. Those flags concern
action ordering, not transition semantics, and are not a reliable declaration
of the intended source profile.

Recommended classification:

- v5 export: **accepted after documented host/binding adaptation**;
- v4 export: **requires an explicit semantic migration for v4-default
  self-transitions**.

## Related Round-trip Evidence

Although the GUI does not expose a re-entry control, a manually imported
`reenter: true` property is retained. The output generator emits it as
`reenter: true` for v5 and translates it to `internal: false` for v4. This
confirms that explicit re-entry can round-trip through the tool even though it
cannot currently be authored through its visual controls. The supplied v5
round-trip output is retained as `v5-manual-reenter.js`.
