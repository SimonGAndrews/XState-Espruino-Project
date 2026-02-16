# Architectural Decision Records (ADRs)

This folder contains **Architectural Decision Records (ADRs)** for the
XState-Espruino-Project.

An ADR is a short document that captures a **significant technical decision**,
the **context** in which it was made, and the **consequences** of that decision.

The purpose of ADRs in this repository is to preserve *why* certain design
choices were made, not to restate specifications or implementation details.

## Why ADRs Are Used Here

This project explores multiple implementation paths for state machines on
Espruino, including:

- a JavaScript module approach (FSMPlus)
- a native C engine approach (XFSM)
- alignment with XState and SCXML semantics
- deliberate exclusions of certain features

Many of these choices are:

- non-obvious
- difficult to reverse later
- likely to be questioned by future readers (including future maintainers)

ADRs provide a lightweight way to record those decisions once, clearly.

## What Should Be an ADR

An ADR should be created when a decision:

- materially affects architecture or scope
- constrains future implementation choices
- rejects a plausible alternative
- is informed by standards or external references

Examples relevant to this project include:

- excluding parallel states from initial implementations
- representing hierarchical state as path-based identifiers
- preprocessing FSM models rather than resolving structure at runtime
- maintaining parallel JS and native implementations

## What Should NOT Be an ADR

ADRs are **not** used for:

- low-level implementation details
- routine refactoring
- temporary experiments
- bug fixes

Those belong in code comments, commit messages, or notes.

## ADR Format

ADRs in this repository follow a simple structure:

- Title
- Status (e.g. Proposed, Accepted, Superseded)
- Context
- Decision
- Alternatives Considered
- Consequences

They are intentionally brief and written in plain language.

## Naming and Numbering

ADRs are numbered sequentially to provide stable references, for example:

- `0001-no-parallel-states.md`
- `0002-path-based-state-identifiers.md`

Once accepted, ADRs should not be modified except to mark them as superseded.

## Quick Index

- `ADR-0001-no-parallel-states.md` — Exclude parallel states from initial implementations.
- `ADR-0002-state-representation.md` — Use dot-path identifiers and `matches()` semantics.
- `ADR-0003-preprocess-config.md` — Preprocess machine config into lookup tables.
- `ADR-0004-action-order.md` — Entry/exit/transition action ordering for compound transitions.
- `ADR-0005-assign-action.md` — `assign` actions execute before other transition actions.
- `ADR-0006-parent-fallback.md` — Parent fallback transition resolution in compound states.
- `ADR-0007-Tooling-Compatibility.md` — Tooling-first compatibility and v4-shaped runtime API.
- `ADR-0008-espruino-performance-strategy.md` — Phased performance strategy for FSMPlus on Espruino (Proposed).
- `ADR-0009-relative-target-resolution.md` — Relative target support resolved during preprocessing (Proposed).
- `ADR-0010-action-contract-and-execution.md` — Action shape normalization and v4-aligned execution/meta contract (Proposed).

## Relationship to Other Documentation

- Project background and history: `docs/governance/background.md`
- External standards and links: `docs/references/`
- Ongoing summaries and working notes: `docs/notes/`

ADRs sit between background context and implementation, capturing the key
decisions that shape the project.
