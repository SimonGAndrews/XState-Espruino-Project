# XFSM Shallow History Extension

## Status

- Status: experimental specification candidate
- Date: 2026-10-19
- Project branch: `experiment/xfsm-history`
- Implementation branch: `experiment/xfsm-history`
- Compatibility base: XFSM Profile 1 plus this extension
- XState reference: `xstate@5.33.2`

This document defines a possible shallow-history extension to the completed
[Profile 1 specification](../specification.md). It is normative only for an
implementation claiming conformance to this extension. It does not add history
states to Profile 1 or change Profile 1's conformance result.

The extension is deliberately small. It supports returning to the immediate
child that was active when a compound state was last exited. Deep history,
parallel states, and general persisted-snapshot import remain outside scope.

## Use Case

The motivating machine has a compound `working` state with `fast` and `slow`
children. A reset temporarily leaves `working`; when reset finishes, the
machine must resume the child that was active before reset.

```javascript
const machine = XFSM.createMachine({
  id: "controller",
  initial: "working",
  states: {
    working: {
      id: "working",
      initial: "fast",
      states: {
        history: { type: "history" },
        fast: { on: { SLOW: "slow" } },
        slow: { on: { FAST: "fast" } }
      },
      on: { RESET: "resetting" }
    },
    resetting: {
      on: { RESET_DONE: "#working.history" }
    }
  }
});
```

If `RESET` is received in `working.slow`, `RESET_DONE` restores
`working.slow`. Context and guarded transitions could reproduce this result,
but history makes it part of the state-machine structure.

## Terms

- **history node**: a state-node declaration whose `type` is `"history"`.
  It is a transition target and never a stable active state.
- **history owner**: the compound parent containing the history node.
- **remembered child**: the owner's immediate non-history child that was
  active when the owner was most recently exited.
- **empty history**: the state before an actor has recorded a remembered child
  for that owner.
- **fallback**: the child entered when a history target is used while history
  is empty.

## Supported Configuration

### History declarations

`HIST-001`: A conforming implementation MUST accept these declarations as
shallow history:

```javascript
history: { type: "history" }
history: { type: "history", history: "shallow" }
history: { type: "history", target: "slow" }
history: {
  type: "history",
  history: "shallow",
  target: "slow"
}
```

The property name `history` in these examples is an ordinary state key. It has
no special meaning; `type: "history"` identifies the node.

`HIST-002`: A history node MUST be a direct child of a non-root compound state.
Its owner MUST also contain at least one ordinary child. An owner's `initial`
target MUST NOT select a history node.

`HIST-003`: An owner MUST contain no more than one history node. XState and
SCXML permit more than one, but multiple shallow-history nodes differ only in
their first-use fallback in the XFSM single-branch model. This extension uses
one node to keep compilation, actor storage, and validation bounded and clear.

`HIST-004`: `history: "deep"` MUST be rejected as
`E_UNSUPPORTED_FEATURE`. A history value other than `"shallow"` or `"deep"`
MUST be rejected as `E_CONFIG_TYPE`.

Except for `type`, optional `history`, and optional `target`, a history node
MUST NOT contain state behaviour such as `initial`, `states`, `on`, `onDone`,
`entry`, or `exit`.

### Targets and fallback

`HIST-005`: A transition target MAY use any Profile 1 target form that resolves
at compile time to a history node. The compiled target remains the history
node; the effective child is selected from that actor's history at execution
time.

`HIST-006`: A transition MAY target a history node only when its source state
is outside the history owner's subtree. XState permits an inside-owner target,
but excluding it preserves Profile 1's statically compiled transition domains
and covers the reset-and-resume use case without runtime domain selection.
Such a target MUST be rejected as `E_UNSUPPORTED_FEATURE`.

`HIST-007`: A history node's optional `target` is its first-use fallback. It
MUST resolve to one immediate, ordinary child of the owner. It MUST NOT target
the history node, another history node, the owner, an ancestor, or a deeper
descendant. Normal Profile 1 target diagnostics apply when it cannot be
resolved.

The history declaration has no `actions` property. SCXML permits executable
content on a history default transition, but the XState configuration form
used here exposes only a target.

## Runtime Semantics

### Actor-owned history

`HIST-008`: History belongs to an actor, not to its compiled machine. Actors
created from the same machine MUST keep independent remembered children. A new
actor starts with empty history for every owner.

The implementation SHOULD store the last active leaf state index for each
history-enabled owner and derive that owner's immediate child when restoring
shallow history. This keeps the actor representation useful if deep history is
considered later. The logical empty value is `XFC_INDEX_NONE`.

History is private runtime state. It MUST NOT add a public property to an XFSM
snapshot, change `snapshot.value`, or make the history node observable through
`matches()`.

### Recording

`HIST-009`: When a successful transition exits a history owner, the actor MUST
remember the immediate ordinary child that was active immediately before the
owner was exited. The value replaces any child previously remembered for that
owner.

Nested history-enabled owners that are exited by the same transition MUST each
record their own child. Merely moving between children without exiting the
owner MUST NOT replace its remembered child.

Calling `stop()` is lifecycle termination rather than a statechart transition
and MUST NOT record new history.

### Restoration

`HIST-010`: When a transition targets a history node:

1. If the owner has a remembered child, the machine enters that child.
2. If history is empty and the node has a fallback `target`, the machine enters
   that child.
3. If history is empty and the node has no fallback `target`, the machine uses
   the owner's normal `initial` transition.

The history node itself MUST NOT be entered and MUST NOT appear in the stable
configuration.

`HIST-011`: Entry and exit actions retain Profile 1 order:

1. exit active states from inner to outer;
2. execute the selected transition's actions;
3. enter states from outer to inner.

On restoration, the owner and any other entered ancestors run their normal
entry actions. The remembered or fallback child then runs its entry actions.
The owner's normal initial transition and its actions do not run when a
remembered child or explicit fallback is selected.

`HIST-012`: Shallow history remembers only the owner's immediate child. If
that child is compound, restoration enters its normal initial descendants; it
does not restore the earlier deep leaf.

For compatibility with XState 5.33.2, that descendant initial descent MUST NOT
execute the compound child's initial-transition actions during shallow-history
restoration. This differs from a direct reading of the SCXML entry algorithm,
which executes default history content and then normal initial transitions.
The state value and state entry actions otherwise match both models.

### Completion

`HIST-013`: A final state MAY be remembered as the owner's child. Restoring a
remembered final child enters it and then processes the owner's `onDone`
transition in the same run-to-completion sequence. The actor publishes only
the resulting stable snapshot, following the existing Profile 1 completion
rules.

### Faults, stop, and Espruino save

`HIST-014`: History changes are part of the same transition transaction as
state and context changes. A callback or allocation fault MUST retain the last
committed history. No listener observes an uncommitted history change.

Stopped, done, and faulted actors have no public history inspection or reuse
contract. Starting a stopped actor remains invalid under Profile 1.

`HIST-015`: Espruino whole-interpreter `save()` MUST preserve the history of a
reachable active actor with the rest of that actor's private native state.
Restoration MUST NOT execute state actions, transitions, or subscriber
notifications. This requirement does not introduce XState persisted-snapshot
import or a public history serialization API.

## Validation and Diagnostics

`HIST-016`: History validation MUST be transactional and follow Profile 1's
diagnostic and object-path rules. At minimum:

| Invalid configuration | Category | Path location |
| --- | --- | --- |
| `history: "deep"` | `E_UNSUPPORTED_FEATURE` | the history node's `.history` property |
| unknown `history` value or wrong property type | `E_CONFIG_TYPE` | the invalid property |
| second history node under one owner | `E_UNSUPPORTED_FEATURE` | the second node's `.type` property |
| root or non-compound placement | `E_CONFIG_TYPE` | the node's `.type` property |
| transition from inside the owner's subtree | `E_UNSUPPORTED_FEATURE` | the transition's target property |
| unresolved or malformed history/fallback target | existing Profile 1 target category | the relevant target property |
| behaviour property on a history node | existing strict-schema category | the unsupported property |

The first deterministic error MUST be reported, and failed construction MUST
release all temporary and retained storage as required by Profile 1.

## Native Representation and Resources

`HIST-017`: Native Format Version 1 remains frozen and does not contain history
records. An implementation of this extension MUST use a later private native
format version, to be specified in `native-format-v2.md` when the physical
layout is chosen. Version 1 readers MUST reject that later version normally.

The compiler needs a history marker, owner association, and optional fallback
target in the compiled machine. Each actor needs logically one 16-bit state
index for each history-enabled owner. The exact packing and offsets remain an
implementation decision; these words do not authorize an unversioned change to
Format Version 1.

`HIST-018`: Actor history storage MUST be bounded by the compiled count of
history-enabled owners and allocated with the actor. Dispatch MUST NOT allocate
an unbounded history structure or traverse the JavaScript configuration. The
existing hierarchy-depth and 256-microstep limits continue to apply.

Before the extension can be accepted, matched measurements MUST report its
firmware, compiled-machine, actor RAM, construction peak, dispatch timing, and
coordinator-stack effects on the Profile 1 reference targets. History support
MUST NOT silently reduce the published Profile 1 limits.

## Compatibility Decisions

The primary compatibility reference is the pinned XState 5.33.2 runtime. The
[W3C SCXML history specification](https://www.w3.org/TR/scxml/#history) is the
algorithmic cross-check.

| Area | XState 5.33.2 / SCXML | This extension |
| --- | --- | --- |
| shallow history and first-use fallback | supported | supported |
| deep history | supported | rejected |
| multiple history nodes per owner | supported | one only |
| target history from inside its owner | XState supports it | rejected |
| fallback executable content | SCXML supports it | no action form |
| public persisted history | XState persisted snapshots expose it | private XFSM actor data |
| initial actions below a restored compound child | SCXML algorithm implies execution; XState 5.33.2 omits them | follows XState 5.33.2 |

These are intentional extension limits or compatibility differences, not
changes to Profile 1.

## Conformance Evidence

The exploratory Node runner is
[`trace-history-exploration.mjs`](../../tests/reference/xstate-v5/trace-history-exploration.mjs).
It pins XState 5.33.2 and asserts eight cases covering action order, shallow
restoration, first-use fallback, multiple-node reference behaviour,
inside-owner targeting, final-state completion, stop/persisted history, actor
isolation, and failure during exit.

Run it from its package directory after `npm ci`:

```bash
npm run test:history
```

Implementation conformance requires at least these grouped cases:

| Case | Coverage | Current status |
| --- | --- | --- |
| `XFC-HIST-REF-001` | eight pinned XState reference scenarios | Pass |
| `XFC-HIST-CONFIG-001` | accepted grammar, placement, target resolution, strict rejection and paths | Planned |
| `XFC-HIST-RUNTIME-001` | outside-owner restore, latest child and action order | Planned |
| `XFC-HIST-SHALLOW-001` | compound child initial descent and XState-compatible initial-action rule | Planned |
| `XFC-HIST-FALLBACK-001` | normal initial and explicit first-use fallback | Planned |
| `XFC-HIST-ACTOR-001` | actor isolation, rollback and cleanup | Planned |
| `XFC-HIST-FINAL-001` | remembered final child and immediate completion | Planned |
| `XFC-HIST-HOST-001` | stop and whole-interpreter save/restoration | Planned |
| `XFC-HIST-FORMAT-001` | later-format validation and corruption rejection | Planned |
| `XFC-HIST-RESOURCE-001` | flash, RAM, stack, construction and dispatch measurements | Planned |

These cases form a separate extension register. They MUST NOT be counted as
missing Profile 1 evidence or added to the completed Profile 1 requirement
totals.

## Remaining Implementation Decisions

The behavioural contract is ready for implementation. The following physical
choices remain deliberately open until the compiler and runtime design pass:

1. the exact Version 2 history-node and owner record fields;
2. the placement and packing of per-actor history indices;
3. checked size and offset calculations for the extended arena;
4. the final measured target cost and acceptance decision.

Any change to the behaviour in this document requires an updated pinned trace,
extension test-register entry, and compatibility assessment before the change
is implemented.
