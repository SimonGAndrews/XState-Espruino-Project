# Stately Editor Context And Ordered Assign Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI and its Sources panel
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the corrected generated output as
supplied. The machine begins with `{ count: 0 }` and performs three ordered
actions on `go`: `observeBefore`, `incrementCount`, and `observeAfter`.

The Sources panel's `assign` template creates a small source module beginning
with `export default assign({ ... })`. The assignment property expression was
then manually entered in the Sources editor using v5 syntax:

```javascript
count: ({ context }) => context.count + 1
```

The generated machine flattens that complete source into a named
implementation:

```javascript
incrementCount: assign({
  count: ({ context }) => context.count + 1,
})
```

## XState v5 Reference Result

The generated assignment form is valid for XState v5. A reference run using
XState 5.33.2, with the two observation stubs replaced by trace functions,
produced:

```text
observeBefore: count = 0
observeAfter:  count = 1
final state:   Done
final count:   1
```

This confirms that the declared action array is preserved and that the named
assignment executes at its declared position.

## XState v4 Reference Result

The v4 generator emits its own ordinary action stubs as `(context, event)` but
preserves the manually supplied Sources code verbatim. It therefore leaves the
v5-form property function inside `assign(...)` unchanged:

```javascript
count: ({ context }) => context.count + 1
```

XState v4 passes context directly to an assignment property function. Running
the generated form against the archived XState 4.38.3 reference produced:

```text
observeBefore: count = 0
TypeError: Cannot read properties of undefined (reading 'count')
```

The faithful v4 form would use `(context, event) => context.count + 1`. The raw
v4 export is therefore not a working XState v4 program, but this is not evidence
of a faulty v4 translation: the editor did not generate or claim to translate
the assignment expression. It preserved version-specific code authored in the
Sources panel.

This establishes that changing the output-version selector does not rewrite
user-authored Sources code. A source intended to work under both generated
profiles must itself avoid version-specific callback assumptions or be adapted
for the selected target.

## Profile 1 Assessment

The example supports Profile 1's ordered-assignment semantics: an earlier
ordinary action sees the incoming context and a later ordinary action sees the
result of the assignment.

It also exposes two requirements not resolved by the current specification:

1. `options.actions` must be able to bind a name to a supported built-in
   `assign(...)` descriptor, not only to an ordinary JavaScript function.
   Construction can resolve and compile the descriptor into an assignment
   record with no additional dispatch-time lookup.
2. The v5 assignment expression authored for this example uses the object
   callback argument and destructuring syntax. Profile 1 currently uses
   positional `(context, event)` action callbacks, and Espruino cannot parse
   destructuring. A documented source-adaptation step or a revised
   assignment-expression ABI is therefore required; accepting the machine
   structure alone does not solve this source incompatibility.

Recommended classification:

- v5 export: **semantically valid, requiring documented host/callback
  adaptation and support for named built-in assignments**;
- v4 export: **not executable under v4 because the manually supplied assigner
  uses the v5 callback convention and is preserved verbatim**.
