# ADR-0001: Exclude Parallel States from Initial Implementations

## Status

Accepted

## Context

This project aims to deliver a functional, maintainable state machine solution for Espruino-based
microcontrollers with support for **hierarchical (compound) states**.

The project is influenced by XState semantics and SCXML, where statecharts may include both:

- compound (nested) states
- parallel (orthogonal) states

While parallel states are powerful, they introduce significant complexity in both semantics and
implementation, including:

- representing and updating multiple concurrently active state regions
- computing entry and exit sets across orthogonal regions
- resolving transitions involving combinations of active states
- increased memory pressure and execution time
- higher testing burden, especially on constrained embedded devices

Early target applications (including greenhouse automation and embedded UI/menu control) require
compound states for clarity and reuse of transitions, but do not currently require parallel regions.

The project also has an explicit delivery goal: achieve a usable hierarchical state machine engine
in days or a small number of weeks.

## Decision

For the initial implementations in this repository:

- **compound (hierarchical) states are supported**
- **parallel (orthogonal) states are explicitly excluded**

This decision applies to both implementation paths:

- FSMPlus (JavaScript module)
- XFSM (native C engine)

If parallel state behaviour is needed, it should initially be modelled by:

- splitting behaviour into multiple machines, or
- representing concurrency explicitly within context and transitions

## Alternatives Considered

1. Implement full statechart semantics including parallel states  
   Rejected due to complexity, time-to-delivery impact, and increased maintenance burden.

2. Implement a partial / limited form of parallelism (restricted patterns)  
   Rejected initially to avoid ambiguous semantics and incomplete correctness.

3. Simulate parallel states using multiple independent machines  
   Accepted as the recommended workaround if concurrency is required in early applications.

## Consequences

### Positive

- Smaller and simpler engines, easier to maintain and reason about
- Faster progress towards a usable solution for real embedded applications
- Reduced memory and CPU overhead in typical transition execution
- Test effort focuses on compound states, action ordering, and guard behaviour

### Negative

- Some statechart models will need refactoring to run on these engines
- Users cannot directly model orthogonal regions in a single machine
- Future addition of parallel states would require a non-trivial semantic and implementation
  expansion, including additional test coverage

## Notes

This ADR intentionally does not rule out adding parallel states in the future, but establishes a
clear scope boundary for the initial deliverable.

If a future requirement arises that cannot be cleanly addressed with multiple machines, a new ADR
should be created to evaluate parallel state support and the associated cost/benefit trade-offs.
