# XFSM History States Extension

## Status

- Status: experimental; technically qualified and ready for promotion review
- Last reviewed: 2026-10-21
- Project branch: `experiment/xfsm-history`
- Implementation branch: `experiment/xfsm-history`
- Compatibility base: XFSM Profile 1 plus this extension
- XState reference: `xstate@5.33.2`

This document defines a possible history-state extension to the completed
[Profile 1 specification](../specification.md). It is normative only for an
implementation claiming conformance to this extension. It does not add history
states to Profile 1 or change Profile 1's conformance result.

The extension supports shallow restoration to the immediate child that was
active when a compound state was last exited and deep restoration to the exact
active leaf below that child. Parallel states and general persisted-snapshot
import remain outside scope.

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

Deep history serves the same purpose when an ordinary child is itself
compound. For example, if `working.automatic.cooling` was active, shallow
history restores `working.automatic` and follows its normal initial path,
whereas deep history restores `working.automatic.cooling` exactly.

## Terms

- **history node**: a state-node declaration whose `type` is `"history"`.
  It is a transition target and never a stable active state.
- **history owner**: the compound parent containing the history node.
- **remembered leaf**: the single active atomic or final descendant recorded
  when the owner was most recently exited.
- **restoration target**: the immediate child derived from the remembered leaf
  for shallow history, or the remembered leaf itself for deep history.
- **empty history**: the state before an actor has recorded a leaf for that
  owner.
- **fallback**: the state entered when a history target is used while history
  is empty.

## Supported Configuration

### History declarations

`HIST-001`: A conforming implementation MUST accept these declarations:

```javascript
history: { type: "history" }
history: { type: "history", history: "shallow" }
history: { type: "history", target: "slow" }
history: {
  type: "history",
  history: "shallow",
  target: "slow"
}
history: { type: "history", history: "deep" }
history: {
  type: "history",
  history: "deep",
  target: "automatic.cooling"
}
```

An omitted `history` property means shallow history. The explicit values
`"shallow"` and `"deep"` select the corresponding mode.

The property name `history` in these examples is an ordinary state key. It has
no special meaning; `type: "history"` identifies the node.

`HIST-002`: A history node MUST be a direct child of a non-root compound state.
Its owner MUST also contain at least one ordinary child. An owner's `initial`
target MUST NOT select a history node.

`HIST-003`: An owner MUST contain no more than one history node. XState and
SCXML permit multiple nodes with different modes or first-use fallbacks. This
extension uses one node to keep compilation, actor storage, and validation
bounded and clear.

`HIST-004`: A `history` value other than `"shallow"` or `"deep"`, or a
non-string value, MUST be rejected as `E_CONFIG_TYPE`.

Except for `type`, optional `history`, and optional `target`, a history node
MUST NOT contain state behaviour such as `initial`, `states`, `on`, `onDone`,
`entry`, or `exit`.

### Targets and fallback

`HIST-005`: A transition target MAY use any Profile 1 target form that resolves
at compile time to a history node. The compiled target remains the history
node; the effective restoration target is selected from that actor's history
at execution time.

`HIST-006`: A transition MAY target a history node only when its source state
is outside the history owner's subtree. XState permits an inside-owner target,
but excluding it preserves Profile 1's statically compiled transition domains
and covers the reset-and-resume use case without runtime domain selection.
Such a target MUST be rejected as `E_UNSUPPORTED_FEATURE`.

`HIST-007`: A history node's optional `target` is its single first-use
fallback. For shallow history it MUST resolve to an immediate ordinary child
of the owner. For deep history it MUST resolve to an ordinary descendant at
any depth below the owner. It MUST NOT resolve to a history node, the owner,
or a state outside the owner's subtree. Normal Profile 1 target diagnostics
apply when it cannot be resolved.

The history declaration has no `actions` property. SCXML permits executable
content on a history default transition, but the XState configuration form
used here exposes only a target.

## Runtime Semantics

### Actor-owned history

`HIST-008`: History belongs to an actor, not to its compiled machine. Actors
created from the same machine MUST keep independent remembered leaves. A new
actor starts with empty history for every owner.

The implementation MUST store the last active leaf state index for each
history-enabled owner. It derives the owner's immediate child for shallow
restoration and uses the stored leaf directly for deep restoration. The
logical empty value is `XFC_INDEX_NONE`.

History is private runtime state. It MUST NOT add a public property to an XFSM
snapshot, change `snapshot.value`, or make the history node observable through
`matches()`.

### Recording

`HIST-009`: When a successful transition exits a history owner, the actor MUST
remember the active leaf below that owner immediately before it was exited.
The value replaces any leaf previously remembered for that owner.

Nested history-enabled owners that are exited by the same transition MUST each
record that leaf in their own slots. Merely moving between descendants without
exiting the owner MUST NOT replace its remembered leaf.

Calling `stop()` is lifecycle termination rather than a statechart transition
and MUST NOT record new history.

### Restoration

`HIST-010`: When a transition targets a history node:

1. If the owner has a remembered leaf, shallow history enters the immediate
   child below the owner and deep history enters the exact path to that leaf.
2. If history is empty and the node has a fallback `target`, the machine enters
   that state and any required ancestors below the owner.
3. If history is empty and the node has no fallback `target`, the machine uses
   the owner's normal `initial` transition.

The history node itself MUST NOT be entered and MUST NOT appear in the stable
configuration.

`HIST-011`: Entry and exit actions retain Profile 1 order:

1. exit active states from inner to outer;
2. execute the selected transition's actions;
3. enter states from outer to inner.

On restoration, the owner and all states on the selected path run their entry
actions from outer to inner. The owner's normal initial transition and its
actions do not run when remembered history or an explicit fallback is
selected.

`HIST-012`: Shallow history remembers only the owner's immediate child. If
that child is compound, restoration enters its normal initial descendants; it
does not restore the earlier deep leaf.

For compatibility with XState 5.33.2, that descendant initial descent MUST NOT
execute the compound child's initial-transition actions during shallow-history
restoration. This differs from a direct reading of the SCXML entry algorithm,
which executes default history content and then normal initial transitions.
The state value and state entry actions otherwise match both models.

Deep history restores the remembered leaf exactly. It enters each state on the
path from the owner to that leaf and MUST NOT execute an initial transition or
initial-transition action on that path. Because parallel states are excluded,
one leaf completely describes the remembered deep configuration.

When history is empty and has no explicit fallback, XState 5.33.2 runs the
owner's normal initial-transition action but omits an initial-transition action
on the first nested compound child selected by that transition. When an
explicit fallback is compound, it similarly omits that selected state's own
initial-transition action. Further default descent follows the existing
Profile 1 rules. XFSM MUST reproduce this behavior for both history modes.

### Completion

`HIST-013`: A final leaf MAY be remembered. Restoring it enters the complete
path to that final state and then processes applicable parent `onDone`
transitions in the same run-to-completion sequence. The actor publishes only
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
| unknown `history` value or wrong property type | `E_CONFIG_TYPE` | the invalid property |
| second history node under one owner | `E_UNSUPPORTED_FEATURE` | the second node's `.type` property |
| root or non-compound placement | `E_CONFIG_TYPE` | the node's `.type` property |
| transition from inside the owner's subtree | `E_UNSUPPORTED_FEATURE` | the transition's target property |
| shallow fallback below an immediate child, or deep fallback outside the owner's descendants | existing Profile 1 target category | the history node's `.target` property |
| unresolved or malformed history/fallback target | existing Profile 1 target category | the relevant target property |
| behaviour property on a history node | existing strict-schema category | the unsupported property |

The first deterministic error MUST be reported, and failed construction MUST
release all temporary and retained storage as required by Profile 1.

## Native Representation and Resources

`HIST-017`: Native Format Version 1 remains frozen and does not contain history
records. An implementation of this extension MUST use the separate private
[Native Format Version 2](../native-format-v2.md). Version 1 readers MUST
reject that later version normally.

The compiler needs a history marker, owner association, shallow/deep flag, and
optional fallback target in the compiled machine. Each actor needs logically
one 16-bit state index for each history-enabled owner. Version 2 uses one
compiled eight-byte history record per owner and two actor-owned banks of
16-bit leaf indexes so a fault cannot publish a partial history change. The
mode changes neither record size nor actor size. This does not authorize an
unversioned change to Format Version 1.

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
| deep history | supported | supported for one active leaf; parallel configurations remain excluded |
| multiple history nodes per owner | supported | one only |
| target history from inside its owner | XState supports it | rejected |
| fallback executable content | SCXML supports it | no action form |
| public persisted history | XState persisted snapshots expose it | private XFSM actor data |
| deep fallback target | XState and SCXML permit a descendant | one descendant supported; target arrays excluded with parallel states |
| initial actions below a history-selected compound state | SCXML algorithm implies execution in additional cases; XState 5.33.2 omits them | follows XState 5.33.2 |

These are intentional extension limits or compatibility differences, not
changes to Profile 1.

## Conformance Evidence

The exploratory Node runner is
[`trace-history-exploration.mjs`](../../tests/reference/xstate-v5/trace-history-exploration.mjs).
It pins XState 5.33.2 and asserts eight cases covering action order, shallow
restoration, first-use fallback, multiple-node reference behaviour,
inside-owner targeting, final-state completion, stop/persisted history, actor
isolation, and failure during exit.

The separate
[`trace-deep-history.mjs`](../../tests/reference/xstate-v5/trace-deep-history.mjs)
asserts five deep-history groups covering nested restoration and action order,
normal and descendant fallback, nested owners, final-leaf completion, and
transactional fault rollback.

Run it from its package directory after `npm ci`:

```bash
npm run test:history
npm run test:history:deep
```

Implementation conformance requires at least these grouped cases:

| Case | Coverage | Current status |
| --- | --- | --- |
| `XFC-HIST-REF-001` | eight pinned XState reference scenarios | Pass |
| `XFC-HIST-DEEP-REF-001` | five pinned XState deep-history scenario groups | Pass |
| `XFC-HIST-CONFIG-001` | accepted grammar, placement, target resolution, strict rejection and paths | Linux, original-ESP32 and C3 pass for shallow and deep modes |
| `XFC-HIST-RUNTIME-001` | outside-owner restore, latest child and action order | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-SHALLOW-001` | compound child initial descent and XState-compatible initial-action rule | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-DEEP-001` | exact leaf restoration, nested owners, descendant fallback, action order, completion and rollback | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-FALLBACK-001` | normal initial and explicit first-use fallback | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-ACTOR-001` | actor isolation, rollback and cleanup | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-FINAL-001` | remembered final child and immediate completion | Linux, original-ESP32 and C3 pass |
| `XFC-HIST-HOST-001` | stop and whole-interpreter save/restoration | Pass: Linux stop plus original-ESP32 and C3 save/restoration and reset lifecycle |
| `XFC-HIST-FORMAT-001` | Version 2 validation and corruption rejection | Linux sanitizer pass: 96 checks |
| `XFC-HIST-RESOURCE-001` | flash, RAM, stack, construction and dispatch measurements | Pass: matched Linux, original-ESP32 and C3 shallow/deep measurements and physical timing |

These cases form a separate extension register. They MUST NOT be counted as
missing Profile 1 evidence or added to the completed Profile 1 requirement
totals.

The [shallow-history qualification report](../reports/2026-10-20-shallow-history-physical-qualification.md)
and [deep-history qualification report](../reports/2026-10-20-deep-history-qualification.md)
record the Linux, original-ESP32, and ESP32-C3 procedures and measurements.
The [history integration optimization report](../reports/2026-10-21-history-integration-optimization.md)
records the subsequent compiler-workspace reduction, lazy transactional bank
preparation, scaling fixture, and complete host regression.
The [history promotion rerun](../reports/2026-10-21-history-promotion-rerun.md)
records physical execution of that exact optimized candidate and its current
Pico and MDBT42Q capacity checks.
The deep-history report also records a manual authoring check in which the
shallow and deep example configurations executed successfully through the
XFSM Espruino REPL and were accepted and rendered by the VS Code XState
extension. This is supplementary tooling and usability evidence; it does not
replace the automated conformance cases above.

## Remaining Decisions

The shallow and deep compiler, runtime, Version 2 layout, Linux behaviour, and
physical behavior on the original ESP32 and ESP32-C3 are implemented and pass.
The exact optimized candidate was rebuilt and physically rerun on both boards;
its stock full-feature production images are 1,527,840 and 1,718,000 bytes and
leave 520,160 and 330,000 application-partition bytes respectively. Deep mode
reuses the shallow record and actor slot: matched measurements show no arena,
persistent JsVar, actor-byte, construction-peak, or runtime temporary JsVar
increase.

The measured deep restore used less coordinator stack than shallow restore in
the representative nested machine. A 500-cycle production benchmark found no
practical dispatch penalty. The reduced Pico profile also builds with 11,024
bytes free. The constrained Bluetooth MDBT42Q profile builds with 1,408 bytes
before Storage; this narrow margin MUST be rechecked after any XFSM or upstream
Espruino growth.

The implementation, conformance, resource, and target-fit gates are complete.
Promoting the combined extension into a later public profile remains a
specification-governance and branch-integration decision.

Any change to the behaviour in this document requires an updated pinned trace,
extension test-register entry, and compatibility assessment before the change
is implemented.
