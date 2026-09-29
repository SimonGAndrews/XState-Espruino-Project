# Profile 1 Normative Requirement Audit

## Purpose

This audit is the requirement-level traceability record for the Profile 1
specification. It complements the aggregate conformance cases in the
[conformance matrix](conformance-matrix.md) and the executable-suite view in
the [test inventory](test-inventory.md).

The checked-in [requirement registry](normative-requirements.json) freezes each
normative `MUST` and `MUST NOT` occurrence with a stable requirement ID,
section, source text and fingerprint. The reviewed
[mapping](normative-requirement-mapping.json) links every audited requirement
to one or more conformance cases or records a justified non-applicable result.

Run the audit check from the umbrella repository root:

```sh
python3 projects/Xstate-fsm-c/tests/audit_normative_requirements.py
```

The command fails if normative specification text drifts from the registry, a
requirement ID is duplicated or unknown, a requirement lacks a reviewed
mapping, a mapping names an unknown conformance case, or a conformance case has
no mapped requirement.

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
Specification: Profile 1 version 0.52
Normative requirement units: **707**

| Specification section | Total | Reviewed | Pending |
| --- | ---: | ---: | ---: |
| Scope | 5 | 5 | 0 |
| Compatibility Target | 9 | 9 | 0 |
| Machine Model | 151 | 151 | 0 |
| Runtime Semantics | 305 | 305 | 0 |
| Public Interfaces | 27 | 27 | 0 |
| Host Integration | 92 | 92 | 0 |
| Validation and Error Behavior | 50 | 50 | 0 |
| Resource and Performance Requirements | 16 | 16 | 0 |
| Conformance Requirements | 52 | 52 | 0 |
| **Total** | **707** | **707** | **0** |

The completed review has this result:

| Classification | Count | Meaning |
| --- | ---: | --- |
| Mapped, passing evidence | 704 | The named conformance cases demonstrate every applicable obligation for their recorded targets and revisions. |
| Mapped, partial evidence | 0 | No applicable obligation retains partial evidence. |
| Mapped, planned evidence | 0 | No applicable obligation lacks implementation evidence. |
| Not applicable to Version 1 execution evidence | 3 | The statement constrains application use or future API evolution rather than observable Version 1 engine behavior. |

| Specification section | Pass | Partial | Planned | Not applicable |
| --- | ---: | ---: | ---: | ---: |
| Scope | 5 | 0 | 0 | 0 |
| Compatibility Target | 9 | 0 | 0 | 0 |
| Machine Model | 151 | 0 | 0 | 0 |
| Runtime Semantics | 304 | 0 | 0 | 1 |
| Public Interfaces | 25 | 0 | 0 | 2 |
| Host Integration | 92 | 0 | 0 | 0 |
| Validation and Error Behavior | 50 | 0 | 0 | 0 |
| Resource and Performance Requirements | 16 | 0 | 0 | 0 |
| Conformance Requirements | 52 | 0 | 0 | 0 |
| **Total** | **704** | **0** | **0** | **3** |

All 704 applicable requirements map to one or more stable conformance case IDs.
All 62 conformance cases map back to at least one normative requirement. This
completes the M0 inventory, bidirectional orphan review, and evidence closure.

## Audit Findings

The Scope behavior now has passing evidence. The focused construction trace
proves that a compiled machine supplied as a nested state-node configuration
rejects rather than being mistaken for a state definition.

Compatibility governance is mechanically complete. The checked register covers
all 19 intentional differences, all seven Stately specimens, both exact package
pins, every recorded adaptation, ten differential areas, three reasoned
exclusion groups, and the disposition of legacy evidence.

The required public functions, negative surface, receiver validation and
private brands now have a focused canonical trace. That trace exposed and
closed the writable assignment-brand weakness.

Implementation-map validation now explicitly covers option and map shapes,
own callable data properties, exact and path-like names, absence of outer-scope
or inherited lookup, unused-entry acceptance and retained-container ownership.
Symbol-keyed and non-enumerable properties are reasoned skips because Espruino
does not represent those JavaScript constructs.

The runtime-contract closure now covers the complete action and guard forms,
callback arguments and events, snapshot value/matching/cache behavior, and the
remaining event-selection and malformed-input rules on Linux. It exposed and
closed one accessor-evaluation defect in `snapshot.matches(...)`. Shared
action, event-identity, guard-fallback and snapshot shapes pass the pinned
XState 5.33.2 reference; Profile-only callback ABI, event validation,
diagnostics and lazy caching are classified separately.

The canonical portable trace foundation is implemented and used by nine XFSM
traces. Pinned XState 5.33.2 and 4.38.3 reference models reproduce reviewed
56-record and 11-record traces, XFSM matches both on Linux, and the compact v4
trace matches through noisy serial capture on physical Xtensa and RISC-V.

Native layout, host ownership, and diagnostics pass their formal closure
package. Format Version 1 is frozen. Current matched builds also close the
product-profile capacity decision: Pico leaves 12,888 application bytes and a
Bluetooth-capable MDBT42Q profile leaves 3,296 bytes before Storage. Physical
Pico and MDBT42Q execution now pass the applicable portable suites, nine
canonical traces, depth and microstep limits, stack and timing measurements,
allocation faults, callbacks, cleanup, and save/reset behavior. Both
constrained ARM profiles are Conformance verified, completing `BUILD-006` and
`RESOURCE-003`.

These findings are audit outputs, not newly invented semantics. The associated
requirements already exist in the Profile 1 specification.

## Audit-Derived Closure Cases

The review added fourteen stable cases to make the remaining work explicit:

| Case | Closure area |
| --- | --- |
| `XFC-CF-API-002` | Negative public surface and private-brand rejection |
| `XFC-CF-CONFIG-004` | Complete state-node, initial-transition and composition grammar |
| `XFC-CF-CONFIG-005` | Implementation-map property grammar and retention |
| `XFC-CF-ACTION-002` | Complete action, guard and callback contract |
| `XFC-CF-SNAP-002` | Complete snapshot, `matches`, cache and lazy-allocation contract |
| `XFC-CF-TRANS-005` | Remaining event and guard inputs plus differential traces |
| `XFC-CF-FORMAT-003` | Boundary records, portability and final format decision |
| `XFC-CF-HOST-007` | Formal static host-boundary and ownership review |
| `XFC-CF-BUILD-006` | Complete target matrix and result metadata |
| `XFC-CF-DIAG-006` | Exhaustive diagnostic category, path and fallback matrix |
| `XFC-CF-RESOURCE-003` | Final constrained-target resource acceptance |
| `XFC-CF-COMPAT-005` | Compatibility and Stately-corpus governance |
| `XFC-CF-COMPAT-006` | Complete differential corpus and canonical trace |
| `XFC-CF-COMPAT-007` | Bidirectional requirement traceability |

`XFC-CF-COMPAT-007`, `API-002`, `CONFIG-004`, `ACTION-002`, `SNAP-002`,
`TRANS-005`, `FORMAT-003`, `HOST-007`, `DIAG-006`, `COMPAT-005`, `COMPAT-006`,
the applicable Espruino surface of `CONFIG-005`, `BUILD-006`, and
`RESOURCE-003` pass. All fourteen closure cases are complete. Future evidence
changes must update the mapping, conformance matrix and test inventory
together.
