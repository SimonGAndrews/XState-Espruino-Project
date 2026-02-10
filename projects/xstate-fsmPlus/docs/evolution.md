# FSMPlus Evolution Notes

## Purpose

This document records the **evolution of the FSMPlus implementation** over time.

It is intentionally **narrative and descriptive**, capturing *why* changes were made and
*how* the implementation progressed, without replacing formal design decisions or
API documentation.

Normative behaviour and architectural decisions are defined in the ADRs under
`/docs/decisions/`. This file provides historical and contextual glue between those decisions
and the code.

## Scope

This document is used to:

- summarise baseline imports and provenance (e.g. V15, V16 snapshots)
- explain the motivation behind refactors and optimisations
- record non-obvious implementation trade-offs
- link code changes to ADRs and resolved issues

It is **not** intended to:

- restate ADR decisions verbatim
- serve as API documentation
- act as a changelog (Git history already provides that)

## Baseline

The initial canonical baseline for FSMPlus is:

- **V15**, imported from `xstatePlusDev`
- Tag: `fsmplus-baseline-v15`

Provenance snapshots are stored in:

- `projects/xstate-fsmPlus/archive/source/`

Subsequent changes should reference this baseline explicitly where relevant.

## Recent Activity

- Added missing `findTransition` helper (parent fallback) and guard-array selection.
- Implemented MVHE action ordering: exit → transition (assigns first) → entry, with LCCA-based
  exit/entry sets and self-reentry handling.
- Added targetless transition handling (actions only, no exit/entry).
- Added test harnesses and shared scenario library under repo-root `examples/`.
- Added XState v4 truth runner and adapter to validate FSMPlus parity.
- Added Espruino test workflow and CLI helper to upload modules and capture traces.
- Renamed scenario/runner filenames to underscores for Espruino module compatibility.

## Planned Sections (to be populated)

The following sections may be added over time as implementation progresses:

- Baseline import and provenance
- Differences observed between V15 and V16
- Transition from flat FSM to hierarchical FSM
- Preprocessing and lookup table introduction
- Parent fallback transition resolution
- Entry/exit action ordering and LCCA handling
- Performance considerations and optimisations
- Espruino compatibility constraints and workarounds

## Relationship to ADRs

All semantic or architectural changes must be backed by an ADR.
This document should reference ADR numbers where applicable, rather

## ongoing additions
Entries should be added only when a change would not be obvious from the ADRs and commit history alone.

V15 snapshot referenced findTransition but omitted its definition; canonical fixed by adding helper consistent with ADR-0006.
