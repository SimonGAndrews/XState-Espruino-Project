# ADR-0009: Support Relative Target Resolution via Preprocessing

## Status

Proposed

## Context

FSMPlus currently uses dot-path strings as canonical state identity (ADR-0002)
and preprocesses machine configuration for runtime lookup efficiency (ADR-0003).

In practical Stately/XState authoring workflows, transitions are commonly written
with relative targets inside nested states, for example `target: "minTemp"`
within `menu.maxTemp` to mean `menu.minTemp`.

Without relative target support:

- common tool-generated machine configs are not directly compatible
- users must manually rewrite targets to absolute dot paths
- runtime may enter invalid states if unknown targets are not resolved and
  validated early
- error-free use of XState VS Code plugin/Stately-generated nested targets is
  blocked

At the same time, Espruino runtime constraints favor moving string parsing and
resolution work out of the event hot path and into one-time preprocessing
(see `docs/references/Espruino/Performance.md` and `docs/references/Espruino/Internals.md`).

## Decision

FSMPlus will support relative transition targets and resolve them during machine
preprocessing into canonical absolute dot-path targets.

Runtime transition execution will only use pre-resolved canonical targets and
must not perform relative-resolution work per event.
This ADR is a required compatibility step for error-free usage of VS Code
XState plugin/Stately nested target output within FSMPlus scope.

## Resolution Rules

Given a transition declared on source state `S` with target string `T`:

1. If `T` matches an existing absolute dot-path state id, treat as absolute.
2. Otherwise, resolve as relative to the parent scope of `S`:
   - try `parent(S) + "." + T`
   - if not found, walk upward by parent scopes until a match is found
   - first match in nearest ancestor scope wins
3. If no match is found, preprocessing throws a fail-fast error.

Resolved targets are canonicalized to absolute dot-path ids before runtime use.
If a resolved target is compound, existing initial-leaf resolution applies.

## Validation Requirements

During preprocessing, FSMPlus must fail fast for:

- unresolved relative targets
- ambiguous targets (if multiple matches could apply under future rule changes)
- any target form outside supported rules in this ADR

Errors should include machine id (if present), source state path, event type,
and original target string.

## Runtime Requirements

- `transition()` uses pre-resolved target values only.
- No parent-chain target resolution is performed at event dispatch time.
- Existing LCCA, exit/entry ordering, and assign semantics remain unchanged.

## Out of Scope

- `#id` target addressing
- SCXML-style deep relative syntax beyond plain relative segment lookup
- wildcard/descriptor target patterns

These require separate decisions.

## Alternatives Considered

1. Resolve relative targets at runtime per transition  
   Rejected due to avoidable per-event overhead and higher complexity in hot
   paths on constrained runtimes.

2. Require absolute targets only  
   Rejected due to poor compatibility with common tool output and higher authoring
   friction.

3. Add broad target syntax support (`#id`, advanced relative forms) now  
   Rejected to keep semantics narrow, testable, and deliverable in v15.x.

## Consequences

### Positive

- Improved compatibility with common Stately/XState-authored machines
- Better runtime performance by shifting work to preprocess phase
- Earlier and clearer config error detection

### Negative

- More preprocessing complexity and validation logic
- Additional tests required for resolution and failure paths
- Some target forms remain intentionally unsupported until future ADRs

## Relationship to Existing ADRs

- Extends ADR-0002 by adding relative target authoring support while retaining
  canonical dot-path state identity.
- Reinforces ADR-0003 by requiring target resolution and validation at preprocess
  time.

## References

- `docs/decisions/ADR-0002-state-representation.md`
- `docs/decisions/ADR-0003-preprocess-config.md`
- `docs/references/Espruino/Internals.md`
- `docs/references/Espruino/Performance.md`
