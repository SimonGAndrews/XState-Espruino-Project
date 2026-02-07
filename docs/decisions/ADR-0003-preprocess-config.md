# ADR-0003: Preprocess Machine Configuration into Lookup Tables

## Status

Accepted

## Context

FSMPlus introduces hierarchical (compound) states and parent fallback transition resolution.
Naively resolving transitions by walking the raw machine configuration on every event would:

- be slow on constrained runtimes (Espruino)
- require repeated traversal of nested configuration objects
- increase code complexity and risk subtle bugs in ancestor resolution

FSMPlus is intended to support **frequent event dispatch** (e.g. control loops, UI interaction,
sensor-driven transitions), so transition resolution must be efficient and predictable.

Additionally, several FSMPlus features require *pre-resolved information*, such as:

- resolving a compound state to its initial leaf state
- determining ancestor relationships quickly
- validating state references early rather than at runtime

## Decision

FSMPlus will **preprocess the machine configuration once at creation time** into a set of
lookup tables and derived properties.

At runtime, transition resolution and state updates will operate exclusively on these
preprocessed structures rather than the raw configuration object.

## Preprocessing Responsibilities

During machine creation, FSMPlus will:

1. **Flatten the state hierarchy** into a lookup table keyed by dot-path state identifiers.

   Example:
   - `"system.ui.menu"` → `{ config, parent, initialResolved, on, entry, exit }`

2. **Resolve initial leaf states** for compound states and store the result as
   `initialResolved`.

3. **Record parent relationships** explicitly, enabling efficient ancestor traversal
   without repeated string parsing.

4. **Validate machine structure early**, including:
   - duplicate state identifiers
   - invalid initial state references
   - transitions targeting unknown states

5. Optionally attach the lookup table to the machine instance (e.g. `_stateLookup`) so
   it is available during transition resolution without repeated parameter passing.

## Runtime Behaviour

At runtime:

- Event handling uses the lookup table to:
  - locate the current state
  - walk ancestor states for fallback resolution (ADR-0006)
  - resolve target states in O(1) time per lookup

- The raw configuration object is not traversed during normal event processing.

## Alternatives Considered

1. **Resolve transitions directly from the raw configuration**  
   Rejected due to repeated traversal cost and complexity.

2. **Partial preprocessing only (e.g. initial state resolution)**  
   Rejected because parent fallback resolution and validation still require a full view
   of the hierarchy.

3. **Lazy preprocessing on first use**  
   Rejected to avoid unpredictable runtime behaviour and hidden latency.

## Consequences

### Positive

- Predictable and efficient runtime performance
- Simplifies transition resolution logic
- Centralises validation and error detection
- Makes hierarchical semantics easier to reason about and test

### Negative

- Slightly higher upfront cost when creating a machine
- Requires careful implementation to ensure preprocessing remains correct as features evolve

## Notes

- Preprocessing is considered a **core architectural feature** of FSMPlus.
- Any future changes that weaken or bypass preprocessing should require a new ADR.
- This decision supports later parity with a native C-based FSM engine, where preprocessing
  is even more critical.

