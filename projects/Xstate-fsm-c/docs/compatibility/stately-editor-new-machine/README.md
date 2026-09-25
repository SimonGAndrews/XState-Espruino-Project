# Stately Editor New Machine Template

## Provenance

- Producer: XState Editor, web version
- Template: New machine
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the generated output as supplied. They
are evidence for Profile 1 design and are not directly executable Espruino
examples.

## Structural Comparison

The state hierarchy, events, ordered transition candidates, targets, empty
action arrays, transition metadata, named `reset` action, and named
`some condition` guard are structurally the same in both exports.

The significant generated differences are:

| Concern | v4 export | v5 export |
| --- | --- | --- |
| Guard property | `cond` | `guard` |
| Callback arguments | `(context, event)` | `({ context, event })` |
| Guard second argument | Event | Optional `params` |
| Ordering flags | Both set to `true` | Omitted; ordered by default |
| Unsupported implementation map | Empty `services` | Empty `actors` |

Both exports use ES modules, which Espruino does not support directly. They also
put a trailing comma after the final `createMachine(...)` argument; Espruino
supports trailing commas in object and array literals, but not in function-call
argument lists. Arrow functions, quoted property names, spaces in names, and
the other object/array trailing commas are supported Espruino syntax.

## Profile 1 Assessment

Status: **assessed; decisions incorporated into Profile 1**.

The executable machine structure can fit Profile 1. The following existing
requirements already cover it:

- nested compound states and one active leaf state;
- ordered transition candidate arrays;
- empty or populated action arrays;
- named action descriptors of the form `{ type: "reset" }`;
- named guards, with v4 `cond` normalized to canonical `guard`; and
- positional v4 action and guard callbacks.

The generated module wrapper is host-only. Deployment must replace
`import`/`export` with `var XFSM = require("XFSM");`, use the `XFSM` exports,
and remove the function-call trailing comma. The generated action and guard
functions are empty application placeholders; deployment must bind the real
hardware action and guard functions. A v5 implementation copied verbatim would
additionally require adaptation from destructured arguments to Profile 1's
positional `(context, event)` callback contract.

## Decisions Exposed By This Example

Profile 1 resolves the questions exposed by this example as follows. The linked
specification sections are normative:

1. Accept transition `meta` as non-executable authoring metadata and discard it
   during construction when it is empty. It consumes no compiled-arena or
   retained-value storage. See
   [State node and initial-transition grammar](../../specification.md#state-node-and-initial-transition-grammar).
2. Accept unsupported implementation maps such as `services`, `actors`, and
   `delays` only when they are empty. Reject a non-empty map so unsupported
   behavior cannot silently disappear. See
   [Definition strictness](../../specification.md#definition-strictness).
3. Accept `predictableActionArguments: true` and `preserveActionOrder: true` as
   compatibility assertions and discard them during construction. Reject
   `false`, because it requests ordering contrary to Profile 1. See
   [Definition strictness](../../specification.md#definition-strictness).
4. Preserve exact state and implementation names containing spaces. See
   [Transition target grammar and resolution](../../specification.md#transition-target-grammar-and-resolution).
5. Resolve a bare transition target as a sibling of the state on which the
   transition is declared. This resolves every target in this template,
   including the nested sibling target `Another child state`. See
   [Transition target grammar and resolution](../../specification.md#transition-target-grammar-and-resolution).
6. Accept a root `id`, compile it into the effective-ID lookup, and use it for
   ID-based target resolution. See
   [Transition target grammar and resolution](../../specification.md#transition-target-grammar-and-resolution).

Subject to the documented host and binding adaptation, both exports are
classified as **accepted after documented construction-time
normalization**.

## Re-entry Round-trip Observation

A separate manual-import check found that the editor has no visible control for
setting transition re-entry and shows no graphical difference when code with
explicit re-entry is imported. However, the imported property is retained in
the editor's model and translated reliably by the selected output profile:

- XState v5 output emits `reenter: true`.
- XState v4 output emits the equivalent `internal: false`.

This is not classified as GUI-authored evidence because the property had to be
added to the imported code. It is nevertheless toolchain round-trip evidence:
the editor understands explicit re-entry and performs the expected v4/v5
translation even though its visual controls do not expose the choice.
