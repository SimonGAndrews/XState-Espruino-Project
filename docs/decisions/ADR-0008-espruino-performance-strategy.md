# ADR-0008: Performance Strategy for FSMPlus on Espruino

## Status

Proposed (implementation pending)

## Context

FSMPlus is intended to run on constrained Espruino-class devices while preserving
deterministic hierarchical semantics and a v4-shaped runtime API.

Recent work has improved semantic correctness (hierarchy, LCCA traversal,
action ordering, runtime action execution), but current runtime paths still
include patterns that are expensive on Espruino:

- frequent object/array allocations in transition hot paths
- repeated function lookups and callback allocations
- verbose runtime logging inside per-event execution paths
- repeated string and object-key driven lookups

Espruino implementation and performance guidance indicates these are relevant
cost centers:

- code executes directly from source, so execution overhead is sensitive to code
  shape and amount of interpreted work
  (`docs/references/Espruino/Performance.md`, sections:
  "ESPRUINO EXECUTES CODE DIRECTLY FROM SOURCE",
  "EXECUTING CODE HAS A NOTICABLE OVERHEAD")
- object/array data structures are linked-list based with non-trivial key/value
  storage overhead
  (`docs/references/Espruino/Performance.md`, sections:
  "ESPRUINO STORES NORMAL ARRAYS AND OBJECTS IN LINKED LISTS",
  "ARRAYS AND OBJECTS USE TWO STORAGE UNITS PER ELEMENT")
- lookup depth and variable lookup patterns affect runtime speed
  (`docs/references/Espruino/Performance.md`, section:
  "SOME VARIABLE LOOKUPS ARE FASTER THAN OTHERS")
- memory model is fixed-block `JsVar`, making allocation count and object shape
  important for RAM pressure
  (`docs/references/Espruino/Internals.md`, sections:
  "Variable Storage", "Garbage Collection, Reference Counts and Locks")

This ADR establishes a performance optimization strategy that preserves existing
semantics while reducing runtime overhead.

## Decision

FSMPlus will adopt a phased performance strategy:

1. **v15.3 focuses on low-risk runtime optimizations** that do not alter public
   semantics or statechart behavior.
2. **v16 considers structural representation changes** where performance gains
   require architecture-level changes (and therefore broader validation).

Optimization work must remain subordinate to semantic correctness and ADR
constraints already accepted in this repository.

## Performance Scope and Approach

### Phase A (v15.3): low-risk hot-path optimizations

Target areas:

- remove avoidable allocations in `transition()` and action processing
- reduce repeated work in guard/action resolution
- replace callback-heavy array operations in hot paths with indexed loops where
  behavior is equivalent
- gate debug logging behind an explicit runtime flag, default-off in normal runs

Implementation rules:

- no semantic behavior changes unless explicitly approved by existing ADRs or
  dedicated decision docs
- preserve deterministic action ordering and guard selection behavior
- avoid introducing unsupported runtime syntax for Espruino targets

### Phase B (v16): structural optimization candidates

Candidate areas:

- evaluate compact state lookup representations (for example, numeric IDs) to
  reduce string-key and object traversal overhead
- evaluate preprocessing outputs that reduce runtime hierarchy traversal work
  (for example, cached exit/entry plans where valid)
- evaluate memory/lookup tradeoffs of inherited transition representation
  strategies

These changes require dedicated benchmarks and compatibility checks before
adoption.

## Non-Goals

- introducing semantics that conflict with accepted ADRs
- optimizing at the cost of testability or deterministic behavior
- adopting micro-optimizations without measurement evidence

## Validation and Evidence Requirements

For each optimization change:

- include scenario-level regression verification against existing trace suites
- capture before/after timing or throughput measurements where feasible
- include memory-impact observations where feasible (for example via Espruino
  memory tools and run-time behavior checks)

If a change improves performance but reduces behavioral clarity or correctness,
correctness wins.

## Alternatives Considered

1. **Defer all performance work until after v16**
   Rejected because low-risk improvements can be delivered now without semantic
   risk.

2. **Perform aggressive structural refactor immediately in v15.3**
   Rejected because it increases delivery and regression risk while the v15.3
   branch is also closing ADR validation gaps.

3. **Treat performance tuning as ad hoc task-level work only**
   Rejected because this project benefits from a stable decision baseline and
   explicit phase boundaries.

## Consequences

### Positive

- clear boundary between immediate tuning and architectural optimization
- reduced runtime overhead in common event-processing paths
- better alignment with Espruino execution and memory model guidance
- easier planning and review for future performance-focused work

### Negative

- requires discipline to benchmark and validate each change
- may defer larger gains to v16
- introduces additional documentation and tracking work

## References

- `docs/references/Espruino/Internals.md`
- `docs/references/Espruino/Performance.md`
- https://www.espruino.com/Internals
- https://www.espruino.com/Performance
