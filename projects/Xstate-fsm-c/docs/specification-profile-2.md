# Xstate-fsm-c Profile 2 Specification

## Document Status

- Status: Public implementation profile
- Profile version: 2
- Document version: 1.0
- Published: 2026-10-21
- Implementation branch: `feature/xfsm-profile2`
- Qualified implementation revision: `6f42145347d8f4018b2a1ec221b3834bf9561a24`

This document is the normative entry point for Xstate-fsm-c Profile 2. Profile
2 retains the completed Profile 1 contract and adds the qualified shallow- and
deep-history capability. It does not add parallel states or change the public
`XFSM` module API.

## Normative Composition

`P2-001`: An implementation claiming Profile 2 conformance MUST satisfy the
normative composition and precedence defined in this section.

Profile 2 is defined by these documents, in precedence order:

1. this Profile 2 specification;
2. the [history-state requirements](extensions/history-states.md);
3. the frozen [Profile 1 specification](specification.md); and
4. private [Native Format Version 2](native-format-v2.md), where physical
   representation is relevant.

The Profile 1 specification remains the authority for every behavior not
changed explicitly by the history-state requirements. Profile 2 applies these
three precise amendments to Profile 1:

1. `history` is removed from the excluded-feature list in **Scope**;
2. `type: "history"` is accepted only with the placement and property grammar
   in `HIST-001` through `HIST-007`, overriding its rejection in **State node
   and initial-transition grammar**; and
3. history declarations and targets satisfying `HIST-001` through `HIST-018`
   are part of the strict schema rather than the exclusions listed in
   **Definition strictness**.

All other Profile 1 exclusions, limits, diagnostics, ownership rules,
transaction semantics, public interfaces, and compatibility differences
remain unchanged. Where wording conflicts, this document and the history-state
requirements take precedence only for history behavior.

## Profile 2 Capability

Profile 2 supports the complete Profile 1 single-active-branch model plus one
history node in a compound state. A history node may select shallow or deep
restoration and may define one first-use fallback target.

Shallow history restores the immediate child that was active when the owner
was exited and then follows that child's normal initial descent. Deep history
restores the exact previously active leaf. The remembered leaf belongs to an
actor, remains private, and participates in the same transactional operation
boundary as state and context.

The deliberate embedded limits are:

- one history node per compound owner;
- a history target may be entered only from outside its owner's subtree;
- no executable actions on a history fallback;
- no public history property in snapshots;
- no imported or exported XState persisted snapshot; and
- no parallel state regions or multiple active leaves.

These limits and their XState 5.33.2 and SCXML comparisons are recorded in the
[history compatibility decisions](extensions/history-states.md#compatibility-decisions).

## Public Interface

Profile 2 retains the Profile 1 JavaScript surface without additions:

```javascript
const XFSM = require("XFSM");
const machine = XFSM.createMachine(config, implementations);
const actor = XFSM.createActor(machine);
```

`XFSM.assign`, machine objects, actor methods, snapshots, subscriptions,
callback arguments, synchronous dispatch, and exception behavior retain their
Profile 1 contracts. History is expressed only in the machine configuration
and is not a new method or snapshot field.

## Native Format

`P2-002`: A Profile 2 implementation MUST use frozen private Native Format
Version 2.

Format Version 2 adds
the history table and actor-owned transactional history banks described in
[native-format-v2.md](native-format-v2.md). Format Version 1 remains frozen for
Profile 1 and is not modified retroactively.

The public machine and actor objects remain opaque. The format number is an
implementation validation boundary, not an application API or serialized
interchange promise.

## Conformance

An implementation claiming Profile 2 conformance MUST satisfy:

- all applicable Profile 1 requirements, with only the three history-specific
  amendments stated above;
- `HIST-001` through `HIST-018`;
- all twelve `XFC-HIST-*` grouped conformance cases; and
- Native Format Version 2 validation and corruption rejection.

The [Profile 2 conformance record](../tests/profile-2-conformance.md) maps this
composition to the completed Profile 1 audit, the history cases, pinned XState
traces, implementation suites, physical target evidence, and resource results.

The qualified public implementation passes on Linux, original ESP32 IDF5, and
ESP32-C3 IDF5. The established reduced Pico and constrained Bluetooth MDBT42Q
profiles build successfully with Profile 2; they remain build-verified for
Profile 2 until its history runtime cases are repeated physically on those
boards. Their earlier Profile 1 conformance status is unchanged.

`P2-003`: MDBT42Q leaves 1,408 bytes before Storage at the qualified revision.
Any XFSM or upstream Espruino growth MUST repeat that capacity check before a
Profile 2 MDBT42Q build is released.

## Profile Evolution

Profile 1 remains a valid frozen public baseline for implementations that do
not include history. Profile 2 is a strict behavioral superset within the
single-active-branch architecture; applications that conform to Profile 1 do
not need configuration changes to run on Profile 2.

`P2-004`: A later profile may add capabilities or revise limits, but it MUST identify
its base profile, explicit deltas, native-format effect, compatibility effect,
and conformance evidence in the same manner.
