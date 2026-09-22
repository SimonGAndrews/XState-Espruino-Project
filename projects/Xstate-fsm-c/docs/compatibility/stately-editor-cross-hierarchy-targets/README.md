# Stately Editor Cross-hierarchy Target Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the generated output as supplied. The
machine contains two top-level compound states. `Left.Source` targets
`Right.Destination`, and `Right.Destination` targets `Left.Source`.

The GUI exposed no obvious facility for assigning a custom `id` to an
individual state. Consequently, this example establishes the generated form
for absolute paths anchored at the root machine ID; it does not establish the
GUI's handling of user-assigned state-node IDs.

## Result

The v4 and v5 generators emit identical transition structures and absolute
target strings:

```javascript
target: "#Explicit IDs and cross-hierarchy targets.Right.Destination"
target: "#Explicit IDs and cross-hierarchy targets.Left.Source"
```

The target begins with `#`, preserves the root machine ID including its spaces,
and appends the complete sequence of nested state keys. This allows a
transition to cross from a child in one branch to a child in another branch
without depending on the source state's local target namespace.

Reference runs against XState 4.38.3 and XState 5.33.2 produced the same active
state sequence:

```text
start:  { Left: "Source" }
cross:  { Right: "Destination" }
return: { Left: "Source" }
```

## Profile 1 Assessment

The machine structure is accepted after the standard host/binding adaptation.
During `createMachine`, Profile 1 MUST resolve the ID anchor and then each child
path segment to a state index. Dispatch MUST use that resolved index without
parsing the original string.

Resolution is exact and case-sensitive. An unknown ID, absent child segment,
or traversal through a state that does not contain the requested child MUST
cause construction to fail.

Custom state-node IDs remain part of the specified target grammar, but their
round-trip behavior cannot be claimed as GUI-authored evidence from this
example. A separate manual-import specimen may be used later if that tool
compatibility question becomes important.
