# Profile 1 Normative Requirement Audit

## Purpose

This audit is the requirement-level traceability record for the Profile 1
specification. It complements the aggregate conformance cases in the
[conformance matrix](conformance-matrix.md) and the executable-suite view in
the [test inventory](test-inventory.md).

The checked-in [requirement registry](normative-requirements.json) freezes each
normative `MUST` and `MUST NOT` occurrence with a stable requirement ID,
section, source text and fingerprint. The reviewed
[mapping](normative-requirement-mapping.json) links audited requirements to
conformance cases or records a gap or a justified non-applicable result.

Run the audit check from the umbrella repository root:

```sh
python3 projects/Xstate-fsm-c/tests/audit_normative_requirements.py
```

The command fails if normative specification text drifts from the registry, a
requirement ID is duplicated or unknown, or a mapping names an unknown
conformance case. Pending human review is reported but does not fail the check
while M0 remains in progress.

The registry is bootstrapped only once. After a normative specification edit,
reconcile the reported drift deliberately: retain IDs for unchanged
obligations, keep an existing ID when its requirement is intentionally revised,
and allocate the next unused ID for a genuinely new obligation. Do not
regenerate sequential IDs, because published requirement IDs are stable.

## Counting Rule

One requirement unit is created for each `MUST` or `MUST NOT` occurrence
outside fenced code in these normative specification sections:

- Scope;
- Compatibility Target;
- Machine Model;
- Runtime Semantics;
- Public Interfaces;
- Host Integration;
- Validation and Error Behavior;
- Resource and Performance Requirements; and
- Conformance Requirements.

A paragraph containing two normative keywords therefore creates two separately
reviewed requirement units. This avoids hiding one untested obligation behind
another tested obligation in the same sentence or paragraph. Source line
numbers are navigation aids only; the normalized text fingerprint detects
meaningful registry drift when line wrapping changes.

## Baseline And Progress

Baseline date: 2026-09-28  
Specification: Profile 1 version 0.51  
Normative requirement units: **707**

| Specification section | Total | Reviewed | Pending |
| --- | ---: | ---: | ---: |
| Scope | 5 | 5 | 0 |
| Compatibility Target | 9 | 9 | 0 |
| Machine Model | 151 | 0 | 151 |
| Runtime Semantics | 305 | 0 | 305 |
| Public Interfaces | 27 | 27 | 0 |
| Host Integration | 92 | 0 | 92 |
| Validation and Error Behavior | 50 | 0 | 50 |
| Resource and Performance Requirements | 16 | 0 | 16 |
| Conformance Requirements | 52 | 0 | 52 |
| **Total** | **707** | **41** | **666** |

The first review batch has this result:

| Classification | Count | Meaning |
| --- | ---: | --- |
| Mapped, passing evidence | 14 | The named conformance cases demonstrate the obligation for their recorded targets and revisions. |
| Mapped, partial evidence | 13 | A case covers part of the obligation, but an explicit input, negative surface, target or completeness check remains. |
| Gap, planned evidence | 12 | No current conformance case adequately demonstrates the obligation. |
| Not applicable to Version 1 execution evidence | 2 | The statement constrains application use or future API evolution rather than observable Version 1 engine behavior. |

## Opening Findings

The Scope behavior is substantially covered. One focused construction case is
missing: a compiled machine supplied as a nested state-node configuration must
reject rather than be mistaken for a state definition.

Compatibility evidence is pinned and the Stately corpus records its known
provenance, but governance is not yet mechanically complete. Static checks are
needed for compatibility-difference registration, corpus producer/version and
assessment fields, and recorded adaptations.

The required public functions and ordinary actor operations are exercised.
The negative API surface is weaker: tests do not explicitly prove the absence
of `interpret`, `provide`, `withConfig`, `onTransition`, and snapshot
`actions`. Complete invalid-machine brand rejection also lacks a focused case.

Implementation-map validation has substantial strict-schema evidence, but the
full own/enumerable/string/data-property grammar is not yet explicit. Unused
valid implementations need focused acceptance and retained-container
non-retention assertions.

These findings are audit outputs, not newly invented semantics. The associated
requirements already exist in the Profile 1 specification.

## Remaining Review Order

1. Machine Model, including construction, target grammar and native indexes.
2. Runtime Semantics, split into lifecycle/events, callbacks/context,
   transitions/completion, snapshots and subscriptions.
3. Host Integration.
4. Validation and Error Behavior.
5. Resource and Performance Requirements.
6. Conformance Requirements and a final bidirectional orphan check.

For each batch, update the mapping, add newly discovered cases to the
conformance matrix and test inventory, and rerun the checker. The audit is
complete only when every registered requirement is reviewed and every
applicable requirement has adequate evidence or an explicit planned case.
