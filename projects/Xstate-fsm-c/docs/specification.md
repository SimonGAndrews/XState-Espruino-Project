# Xstate-fsm-c Specification

## Document Status

- Status: Profile 1 implementation candidate
- Version: 0.48
- Implementation status: M4 actor execution vertical slice complete on Linux;
  resource evaluation is the next implementation gate

This document is the normative implementation candidate for Xstate-fsm-c
Profile 1. Only requirements stated explicitly in this document are accepted.
The hierarchy and microstep limits and the native physical layout remain
subject to their explicitly identified first-vertical-slice review gates.

## Contents

- [Purpose](#purpose)
- [Architecture Summary](#architecture-summary)
- [Scope](#scope)
- [Terminology](#terminology)
- [Compatibility Target](#compatibility-target)
- [Intentional Compatibility Differences](#intentional-compatibility-differences)
- [Machine Model](#machine-model)
- [Runtime Semantics](#runtime-semantics)
- [Public Interfaces](#public-interfaces)
- [Host Integration](#host-integration)
- [Validation and Error Behavior](#validation-and-error-behavior)
- [Resource and Performance Requirements](#resource-and-performance-requirements)
- [Conformance Requirements](#conformance-requirements)
- [Licensing and Provenance](#licensing-and-provenance)
- [Design References](#design-references)
- [Open Questions](#open-questions)

## Purpose

[XState](https://github.com/statelyai/xstate) is an open-source JavaScript and
TypeScript library for managing complex application logic using finite state
machines, statecharts, and the actor model.
[Espruino](https://github.com/espruino/Espruino) is an open-source JavaScript
interpreter and runtime environment designed to run directly on small,
low-power microcontroller boards.

Xstate-fsm-c provides a compact native C state-machine engine for Espruino. It
accepts the subset of XState JavaScript machine-configuration syntax defined by
Profile 1 and implements the profile's documented XState-compatible semantics.
It validates and compiles the fixed machine definition once into an indexed
native arena and executes separately owned actor instances through the `XFSM`
JavaScript module.

Xstate-fsm-c integrates with Espruino as an optional native library selected
when firmware is built. When included, its generated wrapper registers the
built-in `XFSM` module with the Espruino interpreter, exposing
`createMachine`, `createActor`, and `assign` to application JavaScript while
the compiled machine representation and execution coordinator run in native C.
Firmware builds that do not select the library contain neither the module nor
its associated code.

The engine is intended for reliable control applications in which state
transitions coordinate JavaScript or native actions that interact with
hardware. Construction performs structural validation and reference
resolution; steady-state dispatch uses bounded native traversal, predictable
run-to-completion semantics, and no structural JavaScript collection
allocation. Application context, events, guards, actions, and observations
remain available through the documented JavaScript interface.

Profile 1 prioritises deterministic behaviour, actionable failure information,
bounded RAM use, and measurable flash and execution costs on representative
Espruino microcontrollers. It is an intentionally limited compatibility
profile, not a claim to implement every XState, actor-model, or SCXML feature.

## Architecture Summary

The detailed normative requirements in the sections that follow take
precedence if a summary phrase is incomplete or ambiguous.

| Concern | Profile 1 position |
| --- | --- |
| Integration | Xstate-fsm-c is an optional Espruino native library selected at firmware build time and exposed to application JavaScript through `require("XFSM")`. |
| Compatibility | Profile 1 is an explicitly limited XState compatibility profile. It primarily follows XState v5 semantics, accepts selected v4 migration aliases, and records deliberate differences. |
| Construction | `createMachine()` validates and compiles the supported JavaScript definition once into a fixed indexed native arena. The source definition is not searched during execution. |
| Ownership | Actors may share one compiled machine, while each actor separately owns its lifecycle state, active leaf, context, snapshot, retained fault, subscriptions, and execution bookkeeping. |
| Execution | One synchronous native coordinator performs each lifecycle or dispatch operation and returns to the interpreter only when an application callback or required JavaScript operation must run. |
| Actions | JavaScript functions, flash-backed functions, and native Espruino functions use the same callback boundary. Actions are the application's principal boundary for hardware effects. |
| Memory | Arenas, actor blocks, and retained JavaScript values remain Espruino GC-owned. The engine uses no persistent native JavaScript pointers, native heap allocation, global actor registry, or structural JavaScript collection allocation during dispatch. |
| Failure model | State and context publication is transactional across an operation. Application or hardware side effects from actions that already ran cannot be reversed if a later callback or engine operation fails. |
| Concurrency | A public operation cannot re-enter the same actor. A callback may synchronously operate a different idle actor, and Version 1 provides no application-event mailbox or cross-actor transaction. |
| Limits and evidence | Hierarchy depth, microsteps, stack, flash, RAM, and representative timings are bounded or measured through the first vertical slice and target qualification matrix. |
| Evolution | The public machine is opaque and the private arena is versioned, allowing later profiles and implementation revisions without exposing the physical record layout as API. |

The intended Espruino integration is a self-contained optional `libs`
component using the existing generated-wrapper, garbage-collection,
flat-string, board-build, and whole-interpreter `save()` mechanisms. Profile 1
does not require a new JavaScript execution model, event loop, garbage
collector model, or permanent VM-global state. Any Espruino core change found
necessary during implementation requires separate architectural review rather
than becoming an implicit library dependency.

The `XFSM` module implements the Profile 1 public interface. Profile 1 is an
independent, limited XState-compatible implementation and not the complete
XState JavaScript package.
Architectural review of that compatibility claim should consider the supported
and excluded feature boundary, v5 semantic baseline, positional callback
arguments, synchronous execution without an application-event mailbox,
intentional compatibility-difference register, and pinned differential tests.

## Scope

Version 1 supports hierarchical machines composed of atomic states and nested
compound states. Each running machine instance has exactly one active atomic
leaf state. Its active ancestors are derived by following the compiled parent
indexes.

Version 1 supports atomic final states and completion transitions declared as
`onDone` on their compound parent states. Completion MUST be processed to a
stable state before a lifecycle or event-dispatch operation returns. Final-state
and machine output values are outside the version 1 scope.

XState parallel state nodes and simultaneous activation of multiple state
regions are outside the version 1 scope. Construction MUST reject a machine
definition containing a parallel state rather than silently changing its
meaning.

Version 1 excludes eventless and delayed transitions, invocation, activities,
history, tags, output values, actor definitions and spawning, XState actor
persistence or restored-snapshot input, and custom state-path
delimiters. Construction MUST reject configuration requesting one of these
recognised features as `E_UNSUPPORTED_FEATURE`; it MUST NOT silently discard
or reinterpret it. This exclusion does not prohibit the separately specified
whole-interpreter Espruino `save()` mechanism. The exact accepted root and
state-node properties are specified under
[State node and initial-transition grammar](#state-node-and-initial-transition-grammar).

A previously compiled machine object is not a state-node configuration and
MUST NOT be accepted as a nested state. Running one machine from another would
require machine invocation or actor composition, which is outside the version
1 scope. In particular, version 1 state `onDone` support does not imply support
for `invoke.onDone`; invoked actors and services remain outside the version 1
scope.

## Terminology

- **Profile 1**: The Version 1 compatibility and execution contract defined by
  this specification, rather than a claim of complete compatibility with an
  XState release or the complete SCXML standard.
- **Machine definition**: The JavaScript object supplied to `createMachine`
  that describes states, transitions, guards, actions, and initial context.
- **Compiled arena**: The single contiguous compiled-machine data block that
  stores the fixed native representation of a machine definition.
- **State configuration**: The state or set of states that is currently active.
  This follows the meaning of "configuration" in SCXML and does not refer to
  the machine-definition object.
- **Context**: Application data belonging to a running machine instance and
  available to guards and actions.
- **Run-to-completion operation**: One synchronous public `start()` or
  `send(...)` operation, including every consequent completion transition,
  which ends only when the actor reaches a stable state or the operation
  faults.
- **Microstep**: One startup entry sequence, selected external-event
  transition, or selected completion transition within a run-to-completion
  operation. Guard candidates that reject and individual actions are not
  separate microsteps.
- **Transition domain**: The exclusive hierarchy boundary used to derive the
  states exited and entered by a targeted transition.
- **Native coordinator**: The per-call C execution frame that performs lookup,
  traversal, sequencing, and pending-state bookkeeping for one lifecycle or
  dispatch operation, invoking the Espruino wrapper when JavaScript work is
  required.
- **Retained-value container**: A garbage-collector-visible JavaScript owner
  holding the functions and other JavaScript values referenced by indexes in a
  compiled machine arena.
- **Stable snapshot**: The public actor observation published only after a
  successful run-to-completion operation, or retained as diagnostic state when
  a later operation faults.
- **Faulted runtime**: A runtime that encountered an escaping application
  exception and cannot process further events or lifecycle actions.

## Compatibility Target

Version 1 targets **Xstate-fsm-c Profile 1**, an explicitly defined embedded
subset of XState machine behaviour. It does not claim complete compatibility
with any single XState release.

Profile 1 uses XState v5 terminology and behaviour where they improve clarity
or predictability without imposing unsuitable runtime cost. In particular, its
canonical configuration uses `guard` and `reenter`, transitions do not re-enter
their source state by default, assignments execute in declared order, and the
runtime is created with `createActor(...)`.

Profile 1 deliberately retains the positional `(context, event)` callback
interface because it is compact and directly usable in Espruino. Named
implementations are bound by `createMachine(config, options)` and fixed when
the native representation is compiled. Version 1 does not implement
`machine.provide(...)` or `machine.withConfig(...)`.

For each semantic or public-interface decision, the documented behaviour and,
where necessary, source behaviour of the current stable XState release MUST be
examined as the compatibility baseline. Compatibility evidence MUST identify
the examined release or source revision. A deliberate difference within an
otherwise supported feature MUST be recorded under
[Intentional Compatibility Differences](#intentional-compatibility-differences)
with its behavioural consequence and embedded-system rationale.
Permissive handling of inputs outside XState's documented contract need not be
replicated, but stricter Profile 1 validation MUST be stated explicitly.

The compiled native representation is version-independent internal machinery.
It MUST encode the Profile 1 semantics established during construction and
MUST NOT expose XState-version-specific record formats through the public API.
This permits a later source-profile adapter without changing the execution
arena or runtime contract.

XState v4.38.3 remains a local historical reference for features retained from
the earlier XState/FSMPlus work. Current Stately-generated examples are also
used as compatibility evidence. Neither source overrides an explicit Profile 1
requirement.

### Stately-generated compatibility examples

Representative configurations produced or exported by Stately tooling will be
kept as a compatibility corpus. Each example MUST identify the producing tool
and version where known, and its assessment MUST state one of:

- accepted unchanged by Profile 1;
- accepted after a documented construction-time normalization;
- intentionally unsupported by version 1; or
- evidence requiring an explicit Profile 1 design decision.

Acceptance of generated syntax does not imply support for features outside the
version 1 scope. Host-only TypeScript syntax, imports, and other build-time
wrappers MAY be removed when the executable machine configuration is otherwise
unchanged; any such adaptation MUST be recorded with the example.

## Intentional Compatibility Differences

This section is an informative register of deliberate behavioural differences
within otherwise supported features. The normative requirements are stated in
the referenced sections. Features excluded from version 1 are recorded in
[Scope](#scope) rather than repeated here.

### XFC-CD-001: Ordered context assignment

The XState v4 default promoted `assign(...)` actions ahead of ordinary actions.
Xstate-fsm-c instead always processes assignments at their declared positions,
equivalent to XState v4 with `predictableActionArguments: true` and to the
ordering adopted by XState v5. Xstate-fsm-c does not provide a flag for the
legacy ordering. See
[Context assignment and visibility](#context-assignment-and-visibility).

This difference makes the context received by an action depend only on actions
that precede it in the specified execution sequence.

### XFC-CD-002: Escaping action exceptions

Current XState actors capture an escaping action exception, stop in an error
state, and report the error through an actor error observer rather than throwing
it synchronously from `send(...)`. Historical XState v4 behaviour could allow
the exception to escape without establishing the same fail-stop lifecycle.

Xstate-fsm-c combines synchronous propagation with a mandatory faulted runtime:
the calling operation throws, the incomplete result is not published, and the
runtime cannot continue. A failed startup publishes no active snapshot. See
[Action and guard exceptions and fault handling](#action-and-guard-exceptions-and-fault-handling).

This difference avoids requiring an actor error-observer framework in version 1
and makes failures immediately visible to simple Espruino applications.

### XFC-CD-003: Transition re-entry defaults

XState v4 self-transitions and some descendant transitions re-entered their
source by default. Profile 1 follows the XState v5 model: a transition preserves
its source state unless leaving it is required by the target, or `reenter: true`
explicitly requests source re-entry. See
[Transition re-entry](#transition-re-entry).

This avoids unintended repetition of hardware-facing exit and entry actions.
An unannotated XState v4 transition that depended on source re-entry therefore
requires review and usually an explicit `reenter: true`.

Profile 1 also follows XState v5 when a compound source targets a child that is
already active: the child is exited and entered again while the compound source
is preserved. XState v4 could preserve the already-active child for the same
dot-prefixed internal target. This difference does not require
`reenter: true`, because that property would additionally re-enter the compound
source.

### XFC-CD-004: Positional implementation arguments

XState v5 passes one object containing `context`, `event`, and other actor data
to action, guard, and assignment implementations. Profile 1 instead calls
these functions with positional `(context, event)` arguments.

The smaller interface avoids constructing an argument object for every
callback, requires fewer property lookups, and does not require JavaScript
destructuring support. XState v5 callbacks, including property expressions
supplied to `assign(...)`, must therefore be adapted before they can be used as
Profile 1 callbacks.

### XFC-CD-005: Construction-time implementation binding

XState supports deriving a differently provided machine with
`machine.provide(...)` (or `machine.withConfig(...)` in XState v4). Profile 1
binds implementations in `createMachine(config, options)` and compiles them
into fixed retained-value slots. It does not provide either rebinding method in
version 1.

Creating a machine with different implementations requires another
`createMachine(...)` call. This preserves the fixed-definition guarantee and
keeps rebinding and structural-sharing machinery out of the initial engine.

### XFC-CD-006: Completion-event type

XState v4 supplied `done.state.<state-id>` to callbacks in a state-completion
transition. Profile 1 follows XState v5 and supplies
`xstate.done.state.<state-id>`. See
[Final states and completion transitions](#final-states-and-completion-transitions).

This affects actions and guards that inspect `event.type` while processing
`onDone`. It does not change the generated `type: "final"` or `onDone`
configuration syntax, which is stable across the examined v4 and v5 exports.

### XFC-CD-007: Embedded event ingress

XState v5 requires event objects and uses an actor mailbox to defer events sent
while another event is being processed. Profile 1 additionally accepts a
string as shorthand for `{ type: string }`, preserving the compact event style
used by existing Espruino applications.

Profile 1 does not provide a version 1 application-event mailbox. A re-entrant
`send(...)` is rejected instead of being queued, an event sent before startup
is rejected instead of being held until `start()`, and engine-owned `xstate.`
and `@xstate.` event namespaces cannot be supplied through public `send(...)`.
These restrictions avoid an unbounded GC-visible event queue and prevent an
application event from impersonating an internal completion event. See
[Event input and dispatch](#event-input-and-dispatch).

A callback executing for one Profile 1 actor may call an otherwise idle second
actor, whose operation runs synchronously in a nested coordinator frame. XState
instead routes actor messages through the target actor's mailbox. A completed
nested Profile 1 operation is independently committed and is not rolled back if
the outer actor later faults. See
[Wrapper lifecycle and global state](#wrapper-lifecycle-and-global-state).

### XFC-CD-008: Exit actions on explicit stop

XState v5 stops a root actor without executing the exit actions of the active
machine states. Profile 1 instead follows the SCXML interpreter-termination
model: explicitly stopping an active actor executes the exit actions of its
complete active state chain in leaf-to-root order.

This difference gives embedded applications a deterministic place to turn off
hardware and release application resources. See
[Actor lifecycle](#actor-lifecycle) and
[Action locations and ordering](#action-locations-and-ordering).

### XFC-CD-009: Initialization begins at start

XState v5 calculates a machine actor's initial snapshot during
`createActor(...)`, while deferring ordinary initial effects until `start()`.
Profile 1 creates an uninitialised actor and performs context-factory
evaluation, initial-state resolution, initial actions, and completion
processing together in the first `start()` operation.

This means `createActor(...)` cannot invoke application code, and an actor that
is stopped without being started consumes no runtime-specific context-factory
allocation. See [Actor lifecycle](#actor-lifecycle) and
[Stable snapshots](#stable-snapshots).

### XFC-CD-010: Subscriber exceptions

XState reports exceptions thrown by observer callbacks outside the machine's
transition failure path. Profile 1 reports such exceptions synchronously to
the lifecycle or dispatch caller after notifying the remaining subscribers.
Because notification occurs after publication, a subscriber exception does
not roll back or fault the actor. See
[Snapshot subscriptions](#snapshot-subscriptions).

### XFC-CD-011: Initial-context factory boundary

Current XState v5 calls a lazy context initializer with an argument object that
can expose actor input, `self`, and spawning facilities, and materialises the
result through its context-assignment machinery. Profile 1 calls a
zero-argument factory and uses its returned object directly.

Actor input, child actors, and spawning are outside the Version 1 scope. The
smaller boundary avoids constructing an argument object and avoids an
additional shallow context copy on startup. Consequently, a Profile 1 factory
that needs external values must close over them, and the identity of its valid
returned object becomes the actor's initial context identity. See
[Initial context factory](#initial-context-factory).

### XFC-CD-012: Event wildcard scope

Current XState supports both the full `*` event wildcard and partial prefix
wildcards such as `sensor.*`. Profile 1 supports the full wildcard but rejects
partial wildcards and any other event descriptor containing `*`.

The full wildcard compiles to one distinguished fallback handler and requires
only one bounded check after exact candidates reject. Partial wildcards would
require prefix matching and additional specificity ordering during dispatch.
Applications requiring that grouping in Version 1 must declare the exact event
types or perform routing in an ordinary guard or action. See
[Event lookup](#event-lookup).

### XFC-CD-013: Parameterless guard references

Current XState supports parameterised guard descriptors and built-in composite
guards including `and`, `or`, `not`, and `stateIn`. Profile 1 accepts direct
guard functions and parameterless named references, but does not expose guard
parameters or composite-guard helpers.

Equivalent application logic can be placed in one direct or named guard. This
avoids compiled parameter values, parameter-mapper callbacks, and a family of
built-in guard record types in Version 1. See
[Guard implementation binding](#guard-implementation-binding).

### XFC-CD-014: Strict state-node and initial-transition shape

Current XState infers atomic and compound nodes but can accept some explicit
node-type combinations that contradict their child structure. Its initial
transition type also inherits general transition fields that are not all used
by initial-transition execution. Profile 1 rejects contradictory node types
and rejects ineffective fields on an initial-transition descriptor.

This stricter construction rule prevents a definition from appearing to request
behaviour that the runtime would silently ignore, and lets every compiled node
have one unambiguous native shape. Profile 1 still supports XState's effective
initial-transition target, actions, description, and empty metadata. See
[State node and initial-transition grammar](#state-node-and-initial-transition-grammar).

### XFC-CD-015: Exact-key-first target resolution

Current XState treats unescaped periods in a bare or dot-prefixed target as
hierarchical path separators. Profile 1 additionally considers the complete
unescaped text as one direct state key. When only one interpretation resolves,
that state is selected; when both interpretations resolve to different states,
construction rejects the target as ambiguous.

Hierarchy continues to be defined only by nested `states` objects, not by
punctuation in a state key. This extension lets common punctuated state names be
targeted without escapes, while preventing a model from silently changing
meaning when a conflicting nested path is later added. XState-compatible
backslash escaping remains available for explicit path segmentation, and a
simple explicit state ID provides the preferred ambiguity-free reference. The
additional resolution work occurs only during construction and adds no arena,
actor, or dispatch cost.

To keep implicit effective IDs unique, Profile 1 escapes period and backslash
bytes within their state-key segments. Current XState joins the raw keys, so a
completion event's `type` can differ when a completed state's implicit path
contains either character; compiled `onDone` behaviour is unaffected. See
[Transition target grammar and resolution](#transition-target-grammar-and-resolution).

### XFC-CD-016: Opaque compiled machine

Current XState exposes a rich actor-logic object and utilities for calculating
transitions outside a running actor. Profile 1 exposes its compiled machine only
as an opaque handle accepted by `createActor(...)`; Version 1 does not expose a
pure-transition route, a JavaScript state-node graph, or an action-description
result.

This preserves one native execution path and avoids retaining or recreating
JavaScript representations of compiled structure. The restriction applies only
to the Version 1 surface: the machine object's public namespace and the
versioned arena format deliberately permit later properties, methods, or
inspection facilities. See [Public Interfaces](#public-interfaces) and
[Record organisation](#record-organisation).

### XFC-CD-017: Function-only subscriptions

Current XState accepts either a snapshot-listener function or an observer
object with `next`, `error`, and `complete` callbacks. Profile 1 accepts only
the listener-function form and does not provide separate error or completion
callbacks.

Stable `done` and `stopped` snapshots are delivered through the ordinary
listener before automatic unsubscription. Actor faults follow Profile 1's
synchronous exception contract and remain inspectable through `getSnapshot()`.
This smaller interface avoids observer-shape validation, three optional
callback references per registration, and a second error-reporting route. See
[Snapshot subscriptions](#snapshot-subscriptions).

### XFC-CD-018: Categorised synchronous runtime diagnostics

Current XState does not specify Profile 1's stable compact runtime categories
and can report actor failures through observer error handling. Profile 1 reports
engine-detected runtime failures synchronously using the `XFC` diagnostic
grammar and its documented categories. Application values thrown by callbacks
remain unwrapped under the separately recorded fail-stop rule.

The fixed category vocabulary and bounded detail provide actionable embedded
diagnostics without retaining configuration paths or implementing an actor
error-observer channel. See [Runtime diagnostics](#runtime-diagnostics).

### XFC-CD-019: Subscription method receiver

Current XState returns an `unsubscribe` arrow closure that can be called after
being detached from its subscription object. Profile 1 requires
`unsubscribe()` to be called with the originating subscription object as its
receiver. A borrowed, forged, or detached call is rejected as
`E_RECEIVER_INVALID`.

This permits all subscription objects to use one shared native method instead
of allocating a bound function or closure for each registration. Normal
`subscription.unsubscribe()` use is unchanged, remains idempotent, and
continues to work after automatic subscription removal. See
[Snapshot subscriptions](#snapshot-subscriptions) and
[Runtime diagnostics](#runtime-diagnostics).

## Machine Model

### Machine-definition lifetime

After `createMachine` has successfully consumed a machine definition, the
compiled state structure and callback bindings of the resulting machine are
fixed.

Changes subsequently made by application code to structural parts of the
original JavaScript definition object MUST NOT affect that machine. A changed
state structure, transition, action declaration, guard declaration, or callback
binding requires creation of a new machine.

This structural guarantee does not deep-copy or freeze JavaScript values that
the machine explicitly retains for use at runtime. Retained callbacks and
literal initial context have the identity and ownership semantics specified in
their respective sections.

This requirement does not make runtime state fixed. The current state
configuration and context continue to change as the machine executes.

The engine validates and compiles the definition into the native machine
representation specified below during `createMachine`.

This separation follows the SCXML execution model: an SCXML document defines
the machine, while an executing session changes its active state configuration
and data model.

### Application bindings and configuration composition

Where version 1 accepts an application callback, the supplied value MAY be any
JavaScript function callable by Espruino. This includes a local function, a
closure, an exported module function, a native function, or a function whose
source is backed by flash storage. The compiled machine MUST retain the actual
callable JavaScript value through its garbage-collector-visible reference
container; it MUST NOT copy the function source into the native arena.

Retaining a closure MUST retain its normal JavaScript lexical environment. The
identity of the callback bound to the machine is fixed after construction, but
the callback MAY observe changing values in its lexical environment and MAY
interact with changing application or hardware state.

A string naming an action or guard MUST NOT cause a lexical-scope, global-name,
`eval`, or module search. Named implementations MUST be bound explicitly through
the applicable `createMachine` options map. The machine MUST resolve and retain
the resulting function during construction.

Callbacks are invoked as functions without a meaningful receiver object. The
wrapper MUST supply `undefined` as the receiver and MUST NOT bind the actor,
machine, implementation map, descriptor, context, or event as `this`. Normal
JavaScript handling inside a non-strict callback is outside the engine's
control. An implementation that requires a particular `this` value MUST be
supplied as a bound function or through a wrapper function created by the
application.

Before calling `createMachine`, application JavaScript MAY compose any portion
of the definition from outer-scope objects, arrays, constants, or factory
results. This includes state-node configurations, nested `states` maps,
transition definitions, transition-candidate arrays, action arrays, initial
context data, and implementation maps.

Configuration composition has no special runtime meaning. `createMachine`
MUST consume the final object graph it receives, compile its structural
information, and retain only values required after construction. A JavaScript
function used to produce a configuration fragment runs before `createMachine`;
it is not a configuration callback and MUST NOT be invoked later by the engine.
Changes to structural source fragments after successful construction MUST NOT
affect the compiled machine. JavaScript values explicitly retained for runtime
use are governed by their own lifetime and ownership requirements.

### Construction-time preprocessing

During `createMachine`, the engine MUST preprocess the complete state
hierarchy into fixed execution lookup structures. This preprocessing MUST:

- enumerate the states while retaining their hierarchical relationships;
- record each state's parent relationship;
- resolve the initial descendant of each compound state;
- validate final states and compile compound-state completion transitions;
- resolve transition targets to known states;
- preserve the defined ordering of transition candidates; and
- reject invalid initial-state and transition-target references.

Normal event processing MUST operate on the preprocessed execution structures.
It MUST NOT search or traverse the original machine-definition object to
resolve states, parent relationships, initial states, or transition targets.

This requirement defines the logical information and behaviour expected of the
lookup structures. Their storage and lookup requirements are specified below.

### State node and initial-transition grammar

The root configuration MAY contain only `id`, `type`, `context`, `initial`,
`states`, `on`, `entry`, `exit`, `description`, `meta`, and the two accepted v4
compatibility flags `predictableActionArguments` and `preserveActionOrder`.
Subject to the node-type restrictions below, a non-root state-node
configuration MAY contain only `id`, `type`, `initial`, `states`, `on`,
`onDone`, `entry`, `exit`, `description`, and `meta`. Any other own enumerable
property MUST be rejected as either a recognised `E_UNSUPPORTED_FEATURE` or an
`E_UNKNOWN_PROPERTY`.

When present at either location, `description` MUST be a string and `meta` MUST
be an empty non-null, non-array object. Construction MUST validate and discard
both fields; neither receives an arena record or appears in a Version 1
snapshot. A non-empty `meta` object is unsupported because Profile 1 does not
expose XState's active-state metadata facilities.

The root MAY declare `context`, but a non-root state MUST NOT. `entry` and
`exit` use the common action grammar and are valid on root, atomic, compound,
and final nodes. `on` is valid on the root and every non-final state. `onDone`
is valid only on a non-root compound state. `initial` and a non-empty `states`
object are valid only on a compound node, subject to the inference and
validation rules below.

A state node with a non-empty `states` object is compound when `type` is
omitted. A node with no `states` property or an empty `states` object is atomic
when `type` is omitted. Construction MUST accept and discard an empty `states`
object on an atomic node.

Version 1 MUST accept explicit `type: "atomic"`, `type: "compound"`, and
`type: "final"`. An atomic node MUST NOT contain child states or `initial`. A
compound node MUST contain at least one child state and MUST declare `initial`.
A final node follows the additional restrictions under
[Final states and completion transitions](#final-states-and-completion-transitions).
The root machine MAY be atomic or compound but MUST
NOT be final. Explicit or inferred node type and structure MUST agree;
construction MUST reject a contradictory combination as `E_CONFIG_TYPE`.
Parallel and history node types remain unsupported and MUST be rejected as
`E_UNSUPPORTED_FEATURE`.

Every own enumerable property of a `states` object MUST have a non-empty state
key and a non-null, non-array state-node configuration object as its value.
Construction MUST traverse those objects subject to the hierarchy-depth limit
and strict schema rules. A period or other punctuation in a state key is part
of that one exact key and MUST NOT create hierarchy; only nesting through a
child `states` object establishes a parent-child relationship.

A compound node's `initial` MUST use either a direct-child key string or this
object form:

```javascript
initial: {
  target: "ChildA",
  actions: ["prepareChild"],
  description: "Begin in Child A",
  meta: {}
}
```

The object form MUST contain `target`, which MUST be one exact direct-child key.
It MAY contain `actions` using the standard action grammar, a string
`description`, and an empty `meta` object. `description` and `meta` MUST be
validated and discarded during construction. Guards, `reenter`, general target
paths, target arrays, and every other field MUST be rejected; an initial
transition is unconditional and selects one direct child.

Construction MUST report a missing compound initial state as
`E_INITIAL_REQUIRED` at that node's `initial` path and an unknown initial child
as `E_INITIAL_UNKNOWN`. It MUST resolve a valid initial child to a native state
index and compile the object form's actions into their declared order. Runtime
entry MUST NOT look up the child key or inspect the source initial descriptor.

When entry into a compound node requires resolution through its initial child,
the action order MUST be:

1. that compound node's entry actions;
2. that compound node's initial-transition actions;
3. the initial child's entry actions; and
4. repetition of the same initial-transition and entry sequence for each
   initial compound descendant.

The initial-transition actions MUST receive the event responsible for the
entry: `xstate.init` during startup, or the current external or completion event
during later entry. They participate in normal ordered `assign(...)` context
visibility and exception handling. Initial descent is part of the enclosing
startup or selected-transition microstep and MUST NOT increment the microstep
count independently.

### Transition target grammar and resolution

Every state node MUST have one effective ID. The root effective ID is its
explicit `id`, or `(machine)` when the root `id` is omitted. A non-root state's
effective ID is its explicit `id` when supplied; otherwise it is the root
effective ID followed by the state-key path from the root. In that implicit
path, construction MUST escape each backslash and period within a state-key
segment with a preceding backslash before joining segments with periods. Thus
the literal sibling key `Heating.Mode` and the nested path `Heating` then
`Mode` have different implicit effective IDs.

An explicit ID on an ancestor names only that ancestor and MUST NOT replace the
root-and-key prefix used by its descendants' implicit IDs. Effective IDs MUST
be built and validated during construction. An explicit ID MUST be a non-empty
string within the symbol length limit; an explicitly supplied empty ID MUST NOT
be treated as if the property were omitted.

Version 1 MUST accept the following XState target-string forms:

- A bare path such as `ChildB` identifies a sibling of the state on which the
  transition is declared. Resolution begins at that source state's parent.
- A dot-prefixed path such as `.ChildA` identifies a descendant of the state on
  which the transition is declared. Resolution begins at the source state.
- An ID-based path such as `#machineId.Outside` identifies a state by its ID and
  then follows any remaining descendant path from that state.

A path MAY contain multiple period-delimited state-key segments. An unescaped
backslash MUST escape the next character, which becomes part of the current
segment without syntactic meaning. A trailing unpaired backslash is invalid.
In JavaScript source, the backslash itself normally requires string-literal
escaping; for example, `target: "Heating\\.Mode"` represents one path segment
whose key is `Heating.Mode`.

For a bare target containing no backslash, construction MUST attempt both of
these interpretations relative to the source state's parent:

1. the complete target text as one exact sibling key; and
2. the target text as a period-delimited hierarchical path.

For a dot-prefixed target containing no backslash, construction MUST remove the
leading descendant marker and attempt the same two interpretations relative to
the source state: one exact direct-child key and one hierarchical descendant
path. The leading unescaped `.` and `#` characters remain reserved syntax. A
state key beginning with either character can be targeted through an escaped
path segment or, preferably, a simple explicit ID.

If only one interpretation resolves, construction MUST select it. If both
resolve to the same state, construction MUST select that state. If both resolve
to different states, construction MUST reject the target as
`E_TARGET_AMBIGUOUS`; it MUST NOT apply a precedence rule. A target containing
a backslash is an explicitly segmented path and MUST use only the escaped-path
interpretation.

ID-based targets retain XState path semantics: the first unescaped segment
after `#` is the explicit or root ID and any remaining segments are descendants
of that state. Periods or backslashes within an ID MUST be escaped. Applications
SHOULD use short punctuation-free explicit IDs when disambiguating a punctuated
state key.

State keys and IDs are case-sensitive strings. Spaces and other valid Espruino
string bytes are significant and MUST be preserved exactly; implementations
MUST NOT trim, case-fold, or otherwise normalize them. Empty segments make a
hierarchical interpretation invalid but do not invalidate a separately
resolved exact-key interpretation.

Construction MUST build the state-ID information needed by ID-based targets and
MUST reject duplicate effective IDs, a malformed explicitly escaped path, an
unknown ID, an unknown state key, or a target that does not resolve
unambiguously to exactly one state. The root machine's `id` participates in the
same ID lookup as state-node IDs. The root's default effective ID `(machine)`
participates when no explicit root ID was supplied.

Every accepted target MUST be resolved to its native state index during
`createMachine`. The target string, its period-delimited path, and the state-ID
map MUST NOT be searched or parsed during event dispatch.

### Event-handler and transition grammar

The root machine and every non-final state MAY declare an `on` object. Each own
enumerable property key in that object is an event descriptor and each value is
one transition definition or a non-empty array of ordered transition
candidates. An event descriptor MUST be a non-empty string within the symbol
length limit.

Version 1 MUST accept exact event descriptors and the full wildcard descriptor
`*`. The wildcard has the lowest priority at its declaring state. A descriptor
containing `*` in any other form, including `sensor.*`, MUST be rejected with
`E_UNSUPPORTED_FEATURE`; it MUST NOT be treated as an exact event type.

One transition candidate MUST use one of these forms:

- a target string shorthand, equivalent to `{ target: "target" }`;
- a transition descriptor object; or
- `undefined`, equivalent to an empty transition descriptor.

A transition descriptor MAY contain `target`, `actions`, `guard`, `reenter`,
`description`, and an empty `meta` object. The already specified `cond` and
`internal` migration aliases MAY replace `guard` and `reenter` respectively,
subject to their mutual-exclusion rules. `description` MUST be a string and
MUST be discarded during construction; it has no native record or runtime
cost. Unknown fields and non-empty `meta` MUST be rejected under the strict
schema rules.

`target` MUST be one target string, `undefined`, or omitted. An explicit
`target: undefined` MUST normalize to an omitted target. Target arrays,
including an array containing one string, MUST be rejected with
`E_UNSUPPORTED_FEATURE`; multi-target transitions belong to parallel state
configurations outside the Version 1 scope. `null` is not a targetless
shorthand and MUST be rejected as `E_CONFIG_TYPE`.

The `actions` field uses the grammar specified under
[Action definition and resolution](#action-definition-and-resolution). The
`guard` field uses the grammar specified under
[Guard implementation binding](#guard-implementation-binding). A candidate
array MUST contain at least one candidate;
an empty array or a candidate of any other type MUST be rejected as
`E_CONFIG_TYPE`. A single candidate and a one-element candidate array have
identical runtime meaning after construction.

Candidates MUST retain definition order. The first candidate whose guard is
absent or returns truthy is selected. An unguarded candidate therefore makes
later candidates unreachable, but construction MUST accept that ordering to
match XState. If every exact candidate rejects, the state's wildcard candidates
MUST be considered in their defined order. Only when neither exact nor wildcard
candidates select a transition may lookup continue at the parent state.

A selected candidate with no target preserves the active state configuration
and follows the targetless-transition action rules. A selected candidate with
no target or actions is a forbidden transition: it performs no action but MUST
stop wildcard and parent fallback. A guard on that candidate controls whether
it is selected and does not change the consequence once selected.
Consequently, `EVENT: {}`, `EVENT: { target: undefined }`, and a present
`EVENT: undefined` handler have the same forbidden-transition behaviour. An
omitted event property declares no handler and does not block fallback.

### Native indexed representation

After validation and preprocessing, the engine MUST store the fixed structural
and executable machine information in native C records.

Relationships between states, transitions, actions, guards, and other compiled
records MUST use numeric indexes rather than JavaScript property lookup or
runtime parsing of state paths. The native representation MUST include at
least:

- state records with parent and resolved initial-state relationships;
- final-state flags and compound-state completion-transition ranges;
- transition records owned by their declaring states;
- transition targets resolved to state indexes;
- ordered guard-candidate information; and
- entry, exit, and transition-action ranges or equivalent indexed references.

Normal event processing MUST NOT use the source machine-definition object as
the execution representation. The source object may therefore be released
after successful construction, except for JavaScript values explicitly retained
by the compiled machine.

The compiled machine MAY retain JavaScript values where JavaScript identity or
execution is required, including JavaScript guard functions, action functions,
and descriptor values exposed to JavaScript. Such values MUST remain visible to
Espruino's garbage collector through an ordinary JavaScript container owned by
the compiled machine.

Native records MUST NOT contain persistent `JsVar *` pointers or `JsVarRef`
values. They MUST refer to retained JavaScript values by numeric slot index.
This ensures that Espruino can move JavaScript variables during defragmentation
without invalidating the compiled machine.

The native record format is an internal implementation detail and MUST NOT form
part of the public JavaScript API.

### Index and offset widths

Indexes between native record tables MUST use `uint16_t`. Index value `0xFFFF`
is reserved as `XFC_INDEX_NONE`; valid table indexes therefore range from zero
through 65534 inclusive.

Each indexed native table or retained-JavaScript-value slot collection MUST
contain at most 65535 records. This limit applies independently to states,
symbols, handlers, transitions, guards, actions, assignments, retained values,
and any later indexed record kind. Construction MUST fail before publishing a
machine if a collection would require more than 65535 records or if a
relationship cannot be represented without the reserved value.

A record range MAY contain all 65535 records. An empty range MUST use
`first = XFC_INDEX_NONE` and `count = 0`. Range validation and the calculation
of `first + count` MUST use checked arithmetic at least 32 bits wide; the sum
MUST NOT wrap through a 16-bit field. Version 1 MUST NOT impose a smaller
per-state, per-handler, or per-transition record limit merely for validation
convenience.

Arena sizes, byte offsets, string-pool offsets, and event hashes MUST use
`uint32_t`. All size calculations MUST be checked for overflow before the arena
is allocated.

Symbol byte lengths MUST use `uint16_t`; an individual state key, ID, action or
guard name, event type, or other interned symbol is therefore limited to 65535
bytes. The same byte-length limit applies to an event type supplied to public
`send(...)`.

The complete arena size MUST fit `uint32_t`, the target's maximum Espruino flat
string length, and the argument type accepted by its flat-string allocator.
Exceeding a representational or configured target limit MUST report
`E_LIMIT_EXCEEDED`. Failure to obtain a representable contiguous allocation
MUST instead report `E_NO_MEMORY`.

### Hierarchy depth

The root machine has hierarchy depth zero and each top-level state has depth
one. Version 1 provisionally supports state depths through 32 inclusive;
construction MUST reject a state at depth 33 or greater with
`E_LIMIT_EXCEEDED` at that state's configuration path.

Runtime hierarchy algorithms MUST use bounded native storage. An implementation
MAY, for example, use a fixed `uint16_t ancestry[33]` work area covering the
root and the maximum state depth. It MUST NOT allocate a JavaScript ancestry
array or recurse without a verified bound during dispatch.

The depth limit is fixed for all machines in a Version 1 build and MUST NOT
have a per-machine override.

### Compiled arena and ownership

Construction MUST use two logical passes. The first pass validates the source,
counts records and string bytes, and calculates the complete arena size. The
second pass populates one exact-sized arena; it MUST NOT allocate individual
native records.

The arena MUST be backed by an Espruino flat string owned as a hidden child of
the JavaScript machine object. The engine MUST NOT use `jsvMalloc` for compiled
machine storage. Releasing the machine object MUST therefore make the arena and
its retained-JavaScript-value container eligible for garbage collection without
a separate native destructor.

A flat string requires a contiguous run of Espruino variable-storage blocks.
Construction MUST treat failure to obtain that run as a normal allocation
failure: it MUST release all temporary locks and references, publish no partial
machine, and report a JavaScript exception. It MUST NOT silently substitute a
linked normal string, because the native engine requires contiguous random
access. Construction MAY make one defragment-and-retry attempt after the first
allocation failure. Event processing MUST NOT invoke defragmentation.

Code entering the native engine from JavaScript MUST obtain the current arena
data pointer for that call and MUST keep the owning arena `JsVar` locked for the
entire period in which that pointer is used. A pointer into the arena MUST NOT
be retained after the arena is unlocked. All relationships within the arena
MUST use indexes or offsets so that the entire arena remains valid if Espruino
relocates its backing flat string.

The compiled definition and changing runtime data MUST be separate. Multiple
runtime instances MAY share one compiled definition. Current state, context,
and other per-instance execution data MUST NOT be stored in the compiled arena.
The version 1 runtime MUST represent its active state configuration with one
active leaf-state index; it MUST NOT allocate an active-state set.

### Record organisation

The arena MUST begin with a header containing a format identifier, internal
format version, total byte size, flags, and an offset and count for each native
table. Table starts MUST be naturally aligned for their record type.

[Native Format Version 1](native-format-v1.md) defines the normative
provisional physical layout, record sizes, flag meanings, actor native block,
and validation invariants. The first vertical-slice measurements MUST review
that layout before it is declared frozen.

Version 1 of the internal representation consists of the following contiguous
record tables and a byte-string pool:

- **State records** contain parent and resolved-initial-state indexes, normal
  handler range, completion-transition range, initial-transition-action range,
  entry-action range, exit-action range, and state flags including whether the
  state is final.
- **Symbol records** contain a 32-bit hash, string-pool offset, byte length, and
  symbol flags. Repeated state and event names MUST be interned where practical.
- **Handler records** contain an event-symbol index or full-wildcard marker and
  the ordered range of candidate transitions declared for that event by one
  state.
- **Transition records** contain the resolved target-state and precomputed
  transition-domain indexes, guard-record index, transition-action range, and
  transition flags.
- **Guard records** contain a retained-JavaScript-value slot index and guard
  flags.
- **Action records** contain an action kind, a retained-JavaScript-value or
  assignment-record index, and action flags.
- **Assignment records** contain the indexes and flags required by the context
  assignment semantics specified later.
- **Assignment-entry records** contain a context-key symbol, retained fixed
  value or expression slot, and flags distinguishing literals from callable
  expressions.

Ranges MUST be represented by a first-record index and record count. Records
owned by a state, handler, or transition MUST be contiguous and stored in their
defined execution order. Record fields MUST use fixed-width integer types and
MUST NOT depend on compiler pointer size. The C implementation MUST use
compile-time size assertions for every arena record type.

Unknown or reserved record flags MUST be rejected as specified by the native
format appendix. New semantics MAY add record kinds, flags, or fields by
incrementing the private arena format version; they MUST NOT change the public
JavaScript API merely to expose this representation.

### Event lookup

Event types MUST be interned as symbols during construction. The engine MUST
use 32-bit FNV-1a over the event type's Espruino string bytes. At runtime the
event hash MUST be calculated once per event.

For each state considered by the transition-selection algorithm, beginning at
the active leaf and ending at the root, the engine MUST linearly scan that
state's contiguous handler range. A hash match MUST be confirmed by byte length
and exact string comparison, so hash collisions cannot select an incorrect
handler.

Candidates belonging to the exact matching handler MUST be evaluated in their
stored order. If none is selected and that state declares a full-wildcard
handler, its candidates MUST then be evaluated in stored order without a
prefix or pattern search. If neither handler selects a candidate, hierarchical
fallback MUST continue by following the state's numeric parent index; it MUST
NOT search the source machine definition or parse a state path.

Version 1 MUST NOT allocate a per-machine hash table or allocate memory while
performing event lookup. A later implementation MAY introduce an alternative
lookup strategy only if it preserves the specified selection behaviour and is
supported by measurements on representative Espruino targets.

### Espruino integration pattern

The implementation MUST separate the portable native engine from its Espruino
binding. The native engine owns validation-independent table traversal and
state-selection logic. The wrapper owns JavaScript argument validation,
construction from the JavaScript definition, hidden-child storage, exception
reporting, and invocation of retained JavaScript guards and actions.

This integration deliberately follows established Espruino mechanisms: a
JavaScript wrapper owning hidden native storage, construction-time conversion
of JavaScript options into native records, and a native execution path that
returns to JavaScript only when JavaScript behaviour must be invoked.
The principal host references are the
[Espruino native-library guide](https://github.com/espruino/Espruino/blob/master/libs/README.md)
and [Espruino Interpreter Internals](https://www.espruino.com/Internals).

## Runtime Semantics

### Actor lifecycle

`createActor(machine)` MUST accept a successfully compiled Profile 1 machine
and return a distinct actor in the `notStarted` lifecycle state. Version 1 MUST
NOT accept a second actor-options argument other than explicit `undefined`.
Restored snapshots, actor input, actor-system membership, and child actors are
outside the version 1 scope. A non-`undefined` second argument MUST fail as
`E_UNSUPPORTED_FEATURE` at `createActor.options` before actor allocation.

Each actor MUST be a JavaScript object with stable identity, a private engine
brand, and hidden runtime storage. Version 1 guarantees only the public methods
`start`, `send`, `stop`, `getSnapshot`, and `subscribe`; state and context MUST
be observed through snapshots rather than direct actor properties. The
remaining public property namespace is reserved for later versions, and
applications MUST NOT add properties or depend on property enumeration.

Every actor method MUST validate that its receiver is a live compatible actor.
A detached or borrowed method invoked without its originating actor as receiver
MUST fail synchronously as `E_ACTOR_INVALID`. Extra arguments to the
zero-argument `start()`, `stop()`, and `getSnapshot()` methods MUST be ignored
in normal JavaScript fashion. `send(event)` MUST ignore arguments after its
first; an omitted first argument remains an invalid event.

An actor MUST retain its compiled machine for the actor's lifetime. Multiple
actors MAY share one compiled machine, its native arena, and its retained
implementation slots. Each actor MUST separately own its lifecycle status,
active leaf index, current context, last snapshot, retained fault, and bounded
execution bookkeeping.

`createActor(...)` MUST NOT call an initial-context factory, execute an action,
evaluate a guard, or resolve completion transitions. It MUST NOT allocate an
event mailbox. A newly created actor has no active state configuration.

The first `start()` call on a `notStarted` actor MUST synchronously:

1. obtain the actor's initial context;
2. enter the root and resolve its nested initial states;
3. execute root, state-entry, and initial-transition actions in their specified
   interleaved order using the `xstate.init` event;
4. process generated completion transitions to stability; and
5. publish one stable `active` or `done` snapshot.

`start()` MUST return the actor. Calling it again while the actor is `active`
MUST be an idempotent no-op. A `done`, `stopped`, or faulted actor MUST NOT be
restartable; attempting to start a `done` or `stopped` actor MUST fail
synchronously as `E_ACTOR_STATE`, and attempting to start a faulted actor MUST
fail as `E_ACTOR_FAULTED`. Applications requiring another execution MUST create
another actor.

The internal lifecycle states MUST be representable without JavaScript string
comparison and MUST distinguish `notStarted`, `active`, `done`, `stopped`, and
faulted. Their public snapshot spelling is specified under
[Stable snapshots](#stable-snapshots).

Public `send(...)` is valid only while the actor is `active`. Sending before
startup MUST fail synchronously as `E_ACTOR_STATE` and MUST NOT queue the
event. Sending after normal completion or explicit stop MUST be an ignored
no-op. Sending to a faulted actor MUST fail synchronously as
`E_ACTOR_FAULTED`. `send(...)` MUST return `undefined` after any normally
returning operation.

Calling `stop()` on a `notStarted` actor MUST move it directly to `stopped` and
publish and notify a stopped snapshot with undefined state and context, without
obtaining initial context or executing actions. Calling `stop()` on an `active`
actor MUST synchronously execute the exit actions of its complete active state
chain in leaf-to-root order using `{ type: "xstate.stop" }`, then publish and
notify a `stopped` snapshot. The retained state value and context are diagnostic
after stop and MUST NOT represent an active configuration.

Calling `stop()` on an actor already in `done` or `stopped` MUST be an
idempotent no-op. Calling it on a faulted actor MUST fail synchronously as
`E_ACTOR_FAULTED`. `stop()` MUST return the actor after a normally returning
operation.

An actor MUST reject a public `start()`, `send(...)`, or `stop()` begun while
another lifecycle, dispatch, or subscriber-notification operation on that
actor is still in progress as `E_ACTOR_BUSY`. Engine-generated completion
processing is part of the current operation and is not a re-entrant public
call.

Stopping an actor MUST release transient operation references and its retained
subscriptions, but MUST retain the last snapshot while the actor remains
reachable. No separate public `dispose()` method is required. The actor's
native runtime storage is released when the actor becomes unreachable through
the normal Espruino garbage-collection integration.

### Stable snapshots

`getSnapshot()` MUST synchronously return the actor's current stable snapshot.
The snapshot MUST expose at least:

- `value`, containing the current hierarchical state value or `undefined`
  before startup;
- `context`, containing the current context or `undefined` before startup;
- `status`, whose value is `notStarted`, `active`, `done`, `stopped`, or
  `error`; and
- `matches(value)`, which tests the supplied state value against the snapshot's
  current state configuration.

The public `error` status corresponds to the specification's term *faulted
runtime*. An error snapshot MUST retain the exact thrown JavaScript value in an
`error` property. Its state value and context MUST be the last successfully
published values, or `undefined` if startup failed before any active snapshot
was published.

For an atomic root machine with no child states, `value` MUST be the empty
object `{}`, matching current XState's state-value representation for that
shape. For an active top-level atomic child, `value` MUST be that state's exact
key as a string. For an active nested state, `value` MUST use the XState
hierarchical state-value shape: each active compound state contributes an
object property whose key is that state's exact key and whose value represents
its active child. The final child is represented by its key as a string. For
example:

```javascript
"Outside"
{ Parent: "ChildA" }
{ Parent: { ChildA: "Grandchild" } }
```

Except for the atomic-root empty object, each object level contains exactly one
active branch because Profile 1 excludes parallel states. State keys MUST NOT
be split, trimmed, or otherwise interpreted while constructing this value.

`matches(value)` MUST accept either a top-level state-key string or the same
single-branch nested object grammar. A non-empty string MUST match that exact
active key at its supplied hierarchy level and, when the key names a compound
state, MUST match regardless of which deeper descendant is active. A valid
object at each supplied level MUST be a non-null, non-array object with exactly
one own enumerable string-keyed data property. It performs a partial
hierarchical match: every supplied state key and child value must be active,
while deeper active descendants omitted by ending with a string are ignored.
A string MUST NOT be parsed as a period-delimited path.

The empty object is valid only for the atomic-root state value. For an active
atomic root, `matches({})` MUST return `true` and any non-empty state-value
object or string MUST return `false`. For every other machine shape, an empty
object MUST return `false`.

An unknown but well-formed state value MUST return `false`. An omitted value,
empty string, `null`, array, function, non-string primitive, accessor-bearing
object, multiple-branch object, malformed nested value, or nesting beyond the
active hierarchy MUST also return `false`; `matches(...)` MUST be a total
boolean predicate and MUST NOT throw merely because its argument is malformed.
It MUST ignore arguments after the first and MUST perform matching without
allocating a state-value object, property-name array, or other JavaScript
collection.

`matches(...)` MUST return `false` when the snapshot has no published state.
For a `done`, `stopped`, or `error` snapshot that retains a previously
published state value, it MUST match that retained value even though the actor
no longer has an active configuration.

The `matches` method MUST validate that its receiver is the originating live
Xstate-fsm-c snapshot. A borrowed, forged, or detached invocation MUST fail
synchronously as `E_RECEIVER_INVALID`; this receiver failure is distinct from
a malformed match value, which returns `false`.

A snapshot MUST describe only a stable, published result. It MUST NOT expose
an intermediate configuration from within completion processing. A snapshot
MUST NOT expose an `actions` array or any native execution-plan records.
Application data that must remain observable after actions finish MUST be
placed in context through `assign(...)`.

Published snapshot and context values MUST be treated as read-only by the
application. The engine is not required to freeze them or detect unsupported
mutation.

The actor's persistent runtime representation MUST store the active leaf index
and lifecycle status in its native block and retain the current context as a
GC-visible hidden child. It MUST NOT maintain a parallel JavaScript object tree
for the active hierarchy. Snapshot publication is a semantic boundary and does
not by itself require eager construction of a JavaScript snapshot object. The
native block's exact Version 1 layout is specified by the native-format
appendix.

The wrapper MUST materialize and cache a JavaScript snapshot only when
`getSnapshot()` or a current subscriber requires one. It MUST derive the
hierarchical `value` from the active leaf and its compiled ancestor indexes.
Calling `matches(...)` MUST compare against the stored leaf and compiled
ancestry without constructing another state-value object.

When state, context, or lifecycle status changes, the actor MUST invalidate its
current snapshot cache. A later observation MUST produce a different snapshot
object, and any previously returned snapshot MUST remain unchanged. When all
three remain unchanged, including after an unhandled event or an action-only
targetless transition, the actor MUST reuse the cached snapshot object if one
exists. An actor that is never observed MUST NOT allocate a JavaScript snapshot
object solely because it starts or processes events.

### Snapshot subscriptions

Listener execution is triggered only after the actor successfully completes
and publishes the stable result of its first `start()`, a valid `send(...)`
while active, or a `stop()` that changes the actor to `stopped`. Calling
`subscribe(...)` or `getSnapshot()` does not itself execute a listener.
Idempotent lifecycle calls, rejected operations, and operations that fault
before publication MUST NOT notify listeners.

`subscribe(listener)` MUST accept a JavaScript function and retain it as a
garbage-collector-visible value owned by the actor. It MUST return an object
with an idempotent `unsubscribe()` method. Multiple listeners MUST be supported
and notified in subscription order.

`subscribe(...)` MUST receive exactly one callable listener. Observer objects,
omitted or non-callable listeners, and separate error or completion callback
arguments MUST be rejected synchronously as `E_LISTENER_INVALID`. A listener is
invoked as a function without a meaningful `this` value. Each successful call
creates an independent registration even when the same function is already
subscribed. The returned subscription object MUST have stable identity, and
`unsubscribe()` MUST return `undefined`.

`unsubscribe()` MUST validate that its receiver is the originating compatible
subscription object. A borrowed, forged, or detached invocation MUST fail
synchronously as `E_RECEIVER_INVALID`. A valid call MUST ignore extra
arguments and remain idempotent after explicit or automatic removal. All
subscription objects MUST be able to use one shared native method; the engine
MUST NOT allocate a bound function or closure for each registration.

Subscribing before startup MUST register the listener without calling it. A
successful `start()` MUST notify every current listener exactly once with the
first stable snapshot. Subscribing after startup MUST NOT immediately call the
listener; the application MUST use `getSnapshot()` when it needs the current
value immediately. Subscribing to a `done`, `stopped`, or faulted actor MUST
retain nothing and return an already inactive subscription whose
`unsubscribe()` method is a no-op.

Every valid `send(...)` that returns normally MUST notify every current
listener exactly once after the complete run-to-completion operation. This
includes an unhandled event and a targetless transition whose stable snapshot
object is unchanged. No listener may observe an intermediate completion
configuration.

Each listener MUST receive as its sole argument the exact snapshot object that
`getSnapshot()` returns for that published result. Subscriber notification is
observation after publication; it is not an action and cannot change the
machine's pending state or action sequence.

Subscription changes during notification MUST be deterministic. A listener
unsubscribed before its turn MUST be skipped, including when another listener
performs the unsubscription. A listener added after notification begins MUST
not receive that publication and becomes eligible for the next one. A listener
MAY unsubscribe itself. `getSnapshot()`, `subscribe(...)`, and
`unsubscribe()` MAY be called from a listener; the existing re-entrancy rule
continues to reject `start()`, `send(...)`, and `stop()` until notification
finishes. The implementation MUST provide these semantics without allocating a
temporary JavaScript listener array for each publication.

If a listener throws, the engine MUST retain the first thrown value, continue
notifying the listeners that remain in the current notification sequence, and
then propagate the first thrown value synchronously to the caller. The actor's
already-published snapshot and lifecycle status MUST remain committed, and the
actor MUST NOT become faulted solely because a listener threw.

After publishing and notifying a `done` or `stopped` snapshot, the actor MUST
remove all subscriptions. A faulted actor MUST remove all subscriptions
without notifying them of an incomplete operation. Calling `unsubscribe()`
after automatic removal MUST remain a no-op.

### Event input and dispatch

The canonical Profile 1 event is a non-null JavaScript object whose `type`
property is a non-empty string. Other properties are application payload and
MUST remain available to guards and actions through the supplied event object.
The engine MUST NOT clone, freeze, or retain that object after the synchronous
dispatch operation completes.

As an embedded convenience, public `send(...)` MUST also accept a non-empty
event-type string. A string event is logically equivalent to an object
containing only that `type`. If a JavaScript guard or action requires the event
value, the wrapper MUST materialize one object and reuse it for every callback
in that event's microstep. It SHOULD create no JavaScript event object when a
string event completes without invoking a JavaScript callback.

Any other input, an object without a string `type`, or an empty event type MUST
be rejected synchronously as `E_EVENT_INVALID` before transition selection,
guard evaluation, or action execution begins. An event type longer than 65535
bytes MUST be rejected synchronously with `E_LIMIT_EXCEEDED` at the public
boundary. Event types beginning with `xstate.` or `@xstate.` are reserved for
engine use and MUST be rejected as `E_EVENT_INVALID` at the public
`send(...)` boundary.

For an object event, every guard and action in the external-event microstep
MUST receive the exact supplied object. The engine MUST read and validate its
type and calculate the event hash once when dispatch begins. Later mutation of
the event object MUST NOT change the handler being processed or redirect the
current dispatch. Applications SHOULD treat a supplied event object as
read-only until `send(...)` returns.

Dispatch MUST be synchronous and run to completion. After the selected
external-event transition, the same operation MUST process generated state
completion events and any consequent completion transitions until the machine
reaches a stable state or faults.

A valid event for which no transition candidate is enabled MUST be an
unhandled no-op. It MUST NOT change the active state or context, execute an
action, or fault the runtime. It MUST return and notify subscribers as
specified under [Actor lifecycle](#actor-lifecycle) and
[Snapshot subscriptions](#snapshot-subscriptions).

An actor MUST NOT begin another public `send(...)` while one of its lifecycle,
dispatch, or subscriber-notification operations is in progress. A re-entrant
call MUST throw synchronously without selecting a transition for the new event.
If it escapes from an action, the existing action-exception rule faults the
in-progress operation; an action MAY catch the rejection itself and return
normally. If it escapes from a subscriber, the subscriber-exception rule
applies because the snapshot is already committed. Engine-generated completion
processing is part of the current operation and is not a re-entrant public
send.

### Action definition and resolution

Entry, exit, event/completion-transition, and initial-transition actions are
locations for the same action definition grammar. In each location the machine
definition MAY supply either one action or an array of actions. Construction
MUST normalise both forms to an ordered native action range.

Version 1 MUST accept the following action forms in every action location:

- an inline JavaScript function;
- a string naming an implementation in `options.actions`;
- an object descriptor of the form `{ type: "name" }`, naming the same
  implementation; and
- an action produced by the supported `assign(...)` helper.

String and object-descriptor references to the same name MUST have identical
resolution semantics. Parameterised user-action descriptors, user-supplied
`exec` properties, and the XState v4 action `meta` argument are outside the
version 1 scope. Construction MUST reject unsupported descriptor fields rather
than silently ignore them. Fields belonging to a recognised built-in action,
including the assignment carried by `assign(...)`, are not user-action
parameters and MUST be validated according to that built-in action's schema.

Named action implementations MUST be supplied through the `actions` map in the
second argument to `createMachine(config, options)`. Construction MUST resolve
every named action. A missing implementation, non-function implementation, or
malformed action definition MUST cause construction to fail; it MUST NOT become
a runtime no-op.

Repeated references to the same named implementation MUST share one retained
JavaScript-value slot. Normal event processing MUST use the resolved native
action record and slot index; it MUST NOT search `options.actions` or the source
definition at runtime.

Named and direct action forms are alternatives. An action supplied directly as
a function requires no entry in `options.actions`. A string or an object
descriptor of the form `{ type: "name" }` requires a corresponding function in
`options.actions`.

### Guard implementation binding

A guard MAY be supplied directly as a JavaScript function, by a string name, or
by a parameterless object descriptor of the form `{ type: "name" }`. The two
named forms MUST resolve identically to a function explicitly bound in
`options.guards`; a direct function requires no `options.guards` entry.
Construction MUST resolve, validate, and retain each guard function and MUST
reject an unresolved or non-function implementation. Runtime transition
selection MUST use the retained slot and MUST NOT search the source definition,
surrounding JavaScript scope, or `options.guards`.

A guard object MUST contain exactly the string `type` field. Version 1 MUST
reject `params` and any other guard-descriptor field, and MUST NOT export or
recognise composite-guard helpers such as `and`, `or`, `not`, or `stateIn`.
Applications MAY express equivalent logic inside an ordinary direct or named
guard function.

The canonical transition property is `guard`. For construction-time migration
of XState v4 definitions, Profile 1 MUST also accept `cond` as an alias for
`guard`. A transition containing both properties MUST be rejected, even if the
values appear equal. The alias MUST be normalized during construction and MUST
have no representation or lookup cost during event dispatch.

A version 1 user guard implementation has this interface:

```javascript
function guard(context, event) {
  return booleanResult;
}
```

The engine MUST invoke a guard synchronously with the runtime's currently
committed context and the event being considered. Its result MUST be converted
to a boolean using normal JavaScript truthiness. A guard exception MUST use the
same synchronous fail-stop behaviour specified for an escaping action
exception.

### Omitted initial context

When the machine definition omits the `context` property, each actor's first
`start()` MUST create a distinct empty JavaScript object as that actor's initial
context. Initial actions and guards MUST receive that object, the active
snapshot MUST expose it, and `assign(...)` MAY add the first context properties
to it. Omission MUST NOT be represented to running application callbacks as
`undefined`.

The compiled machine need not retain a context template for this case, and
`createActor(...)` MUST NOT allocate the empty object before startup. An actor
stopped before startup therefore retains undefined context as already
specified. If the empty object cannot be allocated during startup, the actor
MUST fault with runtime category `E_NO_MEMORY`, execute no entry action, and
publish no active snapshot.

### Literal initial context ownership

When the machine definition supplies a literal JavaScript object as `context`,
the compiled machine MUST retain that exact object through its
garbage-collector-visible reference container. It MUST use the object as a
shared initial context template and MUST NOT make a per-runtime copy during
startup.

The literal MUST be a non-null, non-array JavaScript object. Construction MUST
reject `null`, an array, a primitive, or any other non-function value as
`E_CONFIG_TYPE` at `config.context`. This is strict enforcement of XState's
documented object-shaped context contract; Profile 1 does not preserve
permissive results from malformed JavaScript configurations. Nested property
values are application data and MAY themselves have any JavaScript type.

Every runtime created from the compiled machine therefore initially refers to
the same literal context object, including the same nested object and array
values. The application MUST treat that object graph as read-only. Direct
mutation of the literal context or any nested retained value is unsupported;
the engine is not required to detect, copy, freeze, or reverse such mutation.

When `assign(...)` first updates a runtime, the new shallow context object
belongs to that runtime. The shared template and the current contexts of other
runtimes MUST remain unchanged. Nested values not replaced by the assignment
remain shared references and MUST continue to be treated as read-only.

An application that requires a fresh outer context, independently owned nested
values, or runtime-specific initial values MUST use an initial context factory
instead of a literal context object.

### Initial context factory

The `context` property of a machine definition MAY be a zero-argument
JavaScript factory function. The compiled machine MUST retain that function in
its garbage-collector-visible reference container.

The factory MUST be called exactly once when each new actor first attempts
`start()`, before any initial entry action executes. Its returned value becomes
that actor's initial context. The engine MUST NOT call the factory during
`createMachine(...)` or `createActor(...)` and MUST NOT copy its result. An
actor stopped before startup MUST never call the factory.

The factory MUST return a non-null, non-array JavaScript object. An invalid
return MUST cause the engine to create an `E_CONTEXT_INVALID` `TypeError` at
`actor.start.context`, fault that actor, execute no initial entry action, and
publish no active snapshot. This runtime check is required because construction
validates the factory's callability but cannot validate its eventual result.

The factory is responsible for returning a fresh object graph when independent
context ownership is required. If application code deliberately returns an
object also returned for another runtime, those runtimes share that object; the
engine does not add automatic isolation. If the factory throws, runtime
initialisation MUST fail, no initial entry action may execute, the actor MUST
become faulted, and no active snapshot may be published.

### Action callback contract

A version 1 user action implementation has this interface:

```javascript
function action(context, event) {
  // synchronous side effect
}
```

The engine MUST invoke an action synchronously and exactly once when execution
reaches that action in the selected sequence. The function's return value MUST
be ignored. Returning a Promise or other asynchronous value MUST NOT delay the
machine or change the action sequence. An action MAY use Espruino facilities to
schedule later work itself.

The supported engine mechanism for changing context is `assign(...)`. An
ordinary user action's return value MUST NOT replace or update context. Direct
mutation of the supplied context by an ordinary action is unsupported.

Exit, transition, and entry actions caused by an event MUST receive the same
event object. Startup entry and initial-transition actions MUST receive
`{ type: "xstate.init" }`. Exit actions caused by explicitly stopping a runtime
MUST receive `{ type: "xstate.stop" }`.

Actions in the external-event microstep that enters a final state, including
that final state's entry actions, MUST receive the original event object.
Actions in a consequent completion microstep MUST receive that completed
state's generated completion-event object as specified under
[Final states and completion transitions](#final-states-and-completion-transitions).

### Context assignment and visibility

The public `assign(assignment)` helper MUST produce an engine-recognised action
descriptor. `assignment` MUST use one of these two forms:

```javascript
assign(function (context, event) {
  return { count: context.count + 1 };
})

assign({
  count: function (context, event) {
    return context.count + 1;
  },
  mode: "active"
})
```

The first form is a partial assigner function. It MUST be invoked with the
context and event visible at the assignment's action position and MUST return a
non-null, non-array JavaScript object. The returned object's own enumerable
string-keyed properties form the partial update. Values in that returned object
are update values, including values that are themselves functions.

The second form is a property-assignment map. It MUST be a non-null, non-array
object whose assignment entries are own enumerable string-keyed data
properties. A function-valued entry is a property expression and MUST be
invoked with positional `(context, event)` arguments; any other entry is a
fixed update value. Assigning a function itself as context data therefore
requires the partial-assigner form. Accessor properties are unsupported under
the general structural-configuration rule.

Construction MUST enumerate a property-assignment map once, retain its property
order, and compile its property names, expressions, and fixed values. Later
mutation of that map MUST NOT alter the compiled assignment. Fixed object and
array values MUST be retained as garbage-collector-visible values and assigned
by reference; the engine MUST NOT deep-copy them. An empty property-assignment
map is valid.

An `assign(...)` descriptor MUST occur directly in an entry, exit,
event/completion-transition, or initial-transition action position. It MUST NOT
be registered as an ordinary named function in `options.actions`.
`createMachine(...)` MUST reject an assignment argument of any other form as a
malformed action definition.

Every guard used to select a transition MUST be evaluated before any action of
that transition executes and MUST see the runtime's currently committed
context.

The engine MUST form the complete action sequence specified under
[Action locations and ordering](#action-locations-and-ordering) and process
that sequence in order. An `assign(...)`
action MUST execute at its declared position; it MUST NOT be promoted ahead of
an earlier ordinary action.

An `assign(...)` action MUST receive the context visible at its position. Its
result MUST become the context visible to every later assignment and ordinary
action in the same sequence. An earlier action MUST NOT observe the result of a
later assignment. Multiple assignments MUST therefore build on one another in
their declared execution order.

For an object-form assignment, every property expression MUST be evaluated
against the same context that entered that single `assign(...)` action. A
property expression MUST NOT observe the result calculated for another property
in the same assignment. Expressions MUST be evaluated in their compiled
property order. After all property expressions have completed, their partial
update MUST be applied together.

Each successful `assign(...)` MUST produce a new shallow context object
containing the preceding context's own enumerable string-keyed properties and
then that assignment's partial update. Update properties replace preceding
properties with the same key. It MUST NOT mutate a previously published context
object. Even an empty partial update MUST produce the new shallow object. The
new object MUST remain pending until the complete action sequence succeeds.

For property-assignment form, the engine SHOULD write evaluated results
directly into that pending shallow copy and MUST NOT create a temporary
JavaScript partial-update object. The expressions nevertheless receive the
unchanged context that entered the assignment. A partial-assigner function
supplies its own returned partial-update object, which the engine MUST merge
into the pending shallow copy.

If a partial assigner returns `null`, an array, or any other non-object value,
the engine MUST create an `E_CONTEXT_INVALID` `TypeError` at the current
operation's `assign` stage and apply the normal escaping-assignment fault
behaviour. If a property expression, property read, or merge operation throws,
the same behaviour applies. If the engine cannot allocate the pending context,
it MUST fault the actor with runtime category `E_NO_MEMORY`. In every case, a
previously published context MUST remain unchanged and external side effects
already completed cannot be reversed.

After the complete sequence succeeds, the engine MUST publish the resulting
context and target state configuration as the completed operation. Context
objects created during an incomplete operation MUST NOT replace the last
successfully published context.

Compatibility evidence for these rules includes the pinned
[XState context-assignment implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/actions/assign.ts).

### Action locations and ordering

Entry actions MUST execute whenever their state is actually entered. Initial
startup MUST execute entry actions and intervening initial-transition actions
from the root down to the resolved initial leaf state. For later transitions,
entered states MUST execute their entry actions in ancestor-to-descendant order,
with an initial-transition action range immediately after its owning compound
state's entry actions whenever initial descent is required. Actions declared
together on one state or initial transition MUST retain their declared order.

Exit actions MUST execute whenever their state is actually exited. Exited
states MUST execute their exit actions from the active leaf towards the
transition boundary. Explicitly stopping a running instance MUST execute the
exit actions of its complete active state chain in leaf-to-root order. Actions
declared together on one state MUST retain their declared order.

The actions declared on the selected transition MUST execute after all
applicable exit actions and before all applicable entry actions. Their declared
order MUST be retained, subject only to the separately specified semantics of
built-in actions such as `assign(...)`.

A targetless transition MUST execute only its transition actions. The
transition re-entry rules below determine which entry and exit actions surround
the transition actions of a targeted transition.

### Action and guard exceptions and fault handling

An exception that escapes from a guard, a user action, or an expression
evaluated by `assign(...)` MUST immediately abort the operation. No transition
may be selected after an escaping guard exception, and no remaining exit,
transition, entry, or assignment action belonging to an aborted action sequence
may execute.

The engine MUST discard the pending state configuration and pending context of
the incomplete operation, mark the runtime as faulted, retain the exact thrown
JavaScript value, and propagate that value synchronously to the caller of the
public lifecycle or event-dispatch operation.

For an exception during event dispatch or explicit stop, the most recent
successfully completed state and context MUST remain available as the last
stable snapshot. That snapshot is diagnostic information and MUST NOT be taken
to mean that application or hardware side effects have been reversed. For an
exception during startup, no active snapshot may be published.

A faulted runtime MUST NOT evaluate another guard or execute another action.
Any subsequent attempt to dispatch an event or perform a lifecycle operation
MUST fail synchronously as `E_ACTOR_FAULTED`. The exact public status and
retained-error access are specified under
[Stable snapshots](#stable-snapshots).

The engine cannot roll back external side effects completed before the
exception, nor can it reliably reverse unsupported direct mutation of context
or nested objects by application code. An application action MAY catch an
exception internally and return normally when it deliberately chooses to treat
that condition as handled; in that case the engine observes no escaping
exception and continues the sequence.

### Transition re-entry

The source of a selected transition is the state on which that transition is
declared, which may be an ancestor of the active leaf state. Re-entry is a
property of the transition, not of its actions. It determines the state exit
and entry sets surrounding the selected transition's actions.

For the rules below:

- `L` is the currently active leaf state;
- `S` is the selected transition's source state;
- `T` is its single resolved target state; and
- `D` is its transition domain, used as the exclusive exit and entry boundary.

`S` MUST be on the active chain from the root through `L`. A *proper ancestor*
is an ancestor that is not the state itself. The hierarchy has a conceptual
outside-root boundary immediately above the root. That boundary is not a
state, has no actions, and exists only so that exiting and re-entering the root
has the same algorithm as every other transition.

The canonical Profile 1 property is `reenter`, whose value MUST be boolean.
For construction-time migration of XState v4 definitions, Profile 1 MUST also
accept `internal` as an inverse alias: `internal: true` normalizes to
`reenter: false`, and `internal: false` normalizes to `reenter: true`. A
transition containing both properties MUST be rejected. The alias MUST have no
runtime representation or dispatch cost after normalization.

When neither property is present, `reenter` MUST default to `false`.

A targetless transition MUST preserve the complete active state configuration,
regardless of its `reenter` value. It MUST execute its transition actions
without executing state exit or entry actions. It has no transition domain;
`reenter: true` on a targetless transition has no behavioural effect.

For a targeted transition, construction MUST determine `D` as follows:

1. If `reenter` is `false` and `T` is `S` or a proper descendant of `S`, then
   `D` is `S`.
2. Otherwise, `D` is the deepest state that is a proper ancestor of both `S`
   and `T`.
3. If no state satisfies the preceding rule, `D` is the conceptual
   outside-root boundary.

This definition deliberately uses a *proper* common ancestor. Consequently, a
transition from a descendant to an explicitly targeted active ancestor exits
and re-enters that target. `reenter` changes the domain only for a transition
from its source to that same source or one of its descendants; it has no
additional effect when the target already lies outside the source subtree.

The exit set MUST contain every active state from `L` upwards to but excluding
`D`. Exit actions MUST execute in that descendant-to-ancestor order. When `D`
is the outside-root boundary, the exit set includes the root. When `D` is `S`,
the source is preserved and only its active descendants are exited.

After the exit actions, all transition actions MUST execute in declared order.
The engine MUST then enter every state on the unique hierarchy path immediately
below `D` through `T`, in ancestor-to-descendant order. If `D` is the
outside-root boundary, that path begins with the root. If `D == S == T`, the
path to `T` is empty and `S` itself is not re-entered.

After reaching `T`, a compound target MUST resolve through its initial child
and continue to one atomic or final leaf. Entry and initial-transition actions
MUST use the interleaving specified under
[State node and initial-transition grammar](#state-node-and-initial-transition-grammar).
This initial descent is required even when `T` or the same descendant
path was active before the transition.

These rules have the following required consequences:

- a non-reentering targeted atomic self-transition executes only its
  transition actions;
- a non-reentering targeted compound self-transition preserves the source but
  exits its active descendants and enters the source's initial descendant
  path;
- a re-entering targeted self-transition exits and enters the source as well
  as the affected descendants;
- a non-reentering source-to-descendant transition preserves the source but
  replaces its active descendant path;
- a re-entering source-to-descendant transition exits and enters the source;
- a sibling transition preserves their parent;
- a descendant-to-ancestor transition exits and re-enters the targeted
  ancestor; and
- a cross-branch transition preserves only the deepest proper common ancestor
  of its source and target.

Construction MUST precompute and store the transition-domain state index after
resolving `S` and `T`. The outside-root boundary and the absence of a domain
for a targetless transition MUST use the no-index sentinel and are
distinguished by whether the transition has a target. Normal dispatch MUST use
that stored domain; it MUST NOT repeat a least-common-ancestor search.

Because Version 1 has one active leaf, one target, and no parallel regions, the
runtime MUST implement exit and entry sets as bounded traversal of parent
indexes rather than allocate state sets or JavaScript arrays. The transition
domain, exit sequence, transition actions, target-entry sequence, and initial
descent MUST be covered by pinned XState v5 differential tests, including root,
self, active-ancestor, active-descendant, sibling, cross-branch, and
maximum-depth cases.

Compatibility evidence for these rules includes the
[XState transition documentation](https://stately.ai/docs/transitions), the
pinned
[XState state-node implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/StateNode.ts),
and the [W3C SCXML 1.0 Recommendation](https://www.w3.org/TR/scxml/).

### Final states and completion transitions

An atomic state MAY declare `type: "final"`. A final state MUST NOT declare
child `states`, `initial`, event handlers, or `onDone`. Construction MUST reject
such a combination. Entry and exit actions remain valid on a final state.
Version 1 MUST reject a final-state or root-machine `output` property because
completion output values are outside its scope.

A compound state MAY declare `onDone` using the same single-transition or
ordered transition-candidate-array forms supported for an event handler.
Targets, guards, and actions in those candidates MUST be validated, resolved,
and compiled by the same construction-time rules as their normal-transition
counterparts. `onDone` belongs to state completion; an `onDone` nested inside
an `invoke` definition is outside the version 1 scope.

A compound state becomes complete when its active atomic child is final. On
first becoming complete during a startup or event-dispatch operation, the
engine MUST create the logical internal event:

```javascript
{ type: "xstate.done.state.<effective-state-id>" }
```

The suffix MUST be the completed compound state's effective ID. The event type
string MUST be constructed or interned during `createMachine`; completion
processing MUST NOT build state paths or concatenate strings at runtime.

The engine MUST evaluate the completed state's ordered `onDone` candidates
against the context produced by preceding actions in the operation. Guards and
actions belonging to that completion transition MUST receive the generated
completion event. A candidate selected for the completion event MUST use the
normal exit, transition-action, entry, assignment, target, and re-entry rules.

Entering a final child and taking its parent's enabled `onDone` transition are
separate microsteps within one run-to-completion operation. After each
microstep, the engine MUST detect newly completed ancestors and process their
completion transitions until no new completion is pending. Cascaded completion
of multiple ancestors MUST finish before the public operation returns.

A completed state MUST offer its completion event at most once for each time
it newly becomes complete. A targetless `onDone` transition or a candidate set
with no enabled transition MUST NOT cause the same completion event to be
repeated continuously. Leaving and subsequently completing the state again
creates a new completion occurrence.

If a top-level final state is reached, its entry actions MUST run and the actor
MUST enter the `done` status. The engine MUST then execute the exit actions of
that final state and all remaining entered ancestors in descendant-to-ancestor
order, using the event that caused top-level completion. The terminal snapshot
MUST retain the reached final state as its state value even though the actor no
longer has an active configuration. An implementation MAY retain the terminal
leaf index to represent that snapshot value, but MUST NOT treat it as active
for subsequent dispatch. Subsequent sent events MUST NOT select transitions,
evaluate guards, or execute actions. Such sends MUST be ignored as specified
under [Actor lifecycle](#actor-lifecycle).

The runtime MUST publish only the stable result of a successful
run-to-completion operation. If entering a nested final state immediately
enables a completion transition out of its parent, that final child is an
intermediate configuration and MUST NOT be published as a separate stable
snapshot. For the compatibility example, `send("finish")` therefore returns
with `Success`, not `Workflow.Completed`, as the stable state.

The engine MUST protect the device from an unbounded run-to-completion sequence.
One public `start()` or `send(...)` operation MUST execute no more than 256
microsteps. The startup entry sequence counts as one microstep. A selected
external-event transition and each selected completion transition each count
as one further microstep. Rejected guard candidates, an offered completion
event for which no candidate is selected, an unhandled external event, and
individual actions do not count as microsteps.

Before beginning a 257th microstep, the engine MUST fault the operation without
executing any action belonging to that microstep. It MUST throw and retain a
JavaScript `Error` using the runtime diagnostic category
`E_MICROSTEP_LIMIT`. Its compact message MUST identify the public operation,
for example:

```text
XFC E_MICROSTEP_LIMIT @ actor.send: max=256
```

The pending state and context for the entire incomplete operation MUST be
discarded and the last stable snapshot retained. Startup failure before a
snapshot has been published retains undefined state and context. Actions and
other external side effects completed during earlier microsteps cannot be
reversed. These publication, rollback, and faulted-actor consequences are the
same as for an escaping action exception.

The 256-microstep limit is fixed for Version 1 machines and MUST NOT have a
per-machine override.

### Native execution boundary

One public event-dispatch operation MUST enter the native coordinator once and
perform the complete native portion of that event's processing before it
returns. State and handler lookup, candidate selection, hierarchy traversal,
and state update MUST NOT be split into repeated JavaScript-to-C wrapper calls.

When the compiled sequence requires a user guard or action, the native
coordinator MUST identify its retained-value slot and request its invocation
through the Espruino wrapper. The wrapper MUST obtain and lock the current
callable value from the machine's garbage-collector-visible container, invoke
it synchronously using Espruino's normal callable mechanism, and return its
result or exception to the coordinator. A callable may itself be implemented
in JavaScript, backed by flash-resident source, or exposed as a native Espruino
function; the coordinator treats all of these as JavaScript callable values.

Invoking a callback does not end the enclosing lifecycle or dispatch
operation. The native coordinator remains responsible for the action position,
pending context and state, and remaining macrostep work when control returns.
User action bodies MUST NOT be copied into or interpreted by the native arena,
and the version 1 public API MUST NOT expose or require a JavaScript effect
list. The coordinator MAY stream actions directly from compiled records or use
a bounded native scratch plan if measurements justify it. Either strategy MUST
preserve the specified ordering, context visibility, publication, and exception
semantics and MUST NOT construct a JavaScript action array during dispatch.

The supported `assign(...)` action is an engine-recognized built-in. The
coordinator MUST invoke any JavaScript assignment expressions at their ordered
positions, construct the required pending shallow context through the wrapper,
and continue with that pending context. It MUST NOT invoke `assign(...)` as an
ordinary side-effect callback.

Native lookup and traversal MUST NOT allocate JavaScript arrays, objects, or
temporary property names during event processing. Allocations explicitly
required by later context, action, event, or result semantics are outside this
structural requirement and MUST be specified separately.

## Public Interfaces

The Espruino module name MUST be `XFSM`. Application code MUST load the
engine with `require("XFSM")`. The project, implementation, and specification
name is `Xstate-fsm-c`.

```javascript
var XFSM = require("XFSM");
var machine = XFSM.createMachine(config, options);
var actor = XFSM.createActor(machine);
```

The version 1 public naming surface MUST include `createMachine(...)`,
`createActor(...)`, and the supported `assign(...)` helper. `createActor(...)`
is the only version 1 name for creating a running instance; the XState v4
`interpret(...)` alias MUST NOT be provided.

Machine implementations MUST be supplied as the second argument to
`createMachine(config, options)`. Version 1 MUST NOT expose
`machine.provide(...)` or `machine.withConfig(...)`.

`config` is required and MUST be a non-null, non-array configuration object.
`options` MAY be omitted or `undefined`, in which case it is equivalent to an
empty object. Any other supplied value MUST be a non-null, non-array object.

Version 1 accepts `actions` and `guards` implementation maps in `options`.
Either map MAY be omitted or `undefined`; any other supplied value MUST be a
non-null, non-array object. Each implementation-map entry MUST be an own
enumerable string-keyed data property whose value is callable. Accessor,
symbol-keyed, inherited, and non-enumerable properties do not define
implementations. Action and guard names are matched as exact, case-sensitive
strings and MUST NOT be interpreted as paths.

Every referenced named action or guard MUST resolve to the applicable map as
specified under
[Action definition and resolution](#action-definition-and-resolution) and
[Guard implementation binding](#guard-implementation-binding). A valid
implementation that is not referenced by the machine MUST be
accepted but MUST NOT be placed in the compiled machine's retained-value
container. This permits shared implementation maps without imposing persistent
RAM cost for unused entries. The source `options` object and its maps MUST NOT
be retained after successful construction.

Except for the accepted empty exporter maps specified under
[Definition strictness](#definition-strictness), an unknown own enumerable
property of `options` MUST be rejected as
`E_UNKNOWN_PROPERTY`. Invalid option or map shapes and non-callable map values
MUST be rejected as `E_CONFIG_TYPE` at their exact `options` object path.

`createMachine(...)` MUST return a JavaScript object with stable identity and a
private engine brand identifying a live Xstate-fsm-c compiled machine. The
object MUST own its compiled arena and retained callback container and MAY be
shared by any number of actors. `createActor(...)` MUST verify the private brand
and reject an ordinary, forged, incompatible-format, or otherwise invalid
object synchronously as `E_MACHINE_INVALID` before allocating actor state.

Version 1 defines no public properties or methods on the compiled machine
object. In particular, it MUST NOT expose its source configuration, state-node
graph, native records, `transition(...)`, `getInitialSnapshot(...)`,
`getStateNodeById(...)`, serialization, or cloning. Applications MUST treat the
object only as an opaque machine argument: adding application properties,
depending on property enumeration, modifying hidden representation, and
serializing or cloning it are unsupported.

The absence of Version 1 members MUST NOT reserve a permanently empty surface.
The public property namespace is reserved for future Xstate-fsm-c versions,
which MAY add properties, methods, transition results, or inspection features
without changing machine identity or the ability for actors to share one
compiled machine. Such additions MAY require a later arena format version and
MUST NOT cause a Version 1 implementation to retain otherwise unused source
configuration speculatively.

An actor MUST expose `start()`, `send(event)`, `stop()`, `getSnapshot()`, and
`subscribe(listener)` with the behaviour specified under
[Runtime Semantics](#runtime-semantics).
The XState v4 `onTransition(...)` observer name MUST NOT be provided; Profile 1
uses the current `subscribe(...)` name. A snapshot MUST NOT expose the legacy
`state.actions` execution list.

## Host Integration

### Firmware build integration

Xstate-fsm-c MUST use Espruino's existing native-library build mechanism. Its
firmware build-library identifier is `XFSM`, and its JavaScript library class
and module name is `XFSM`.

The implementation MUST reside under Espruino's `libs` structure and provide
the normal JSON-formatted wrapper declarations, including a library declaration
whose class is `XFSM`. The Espruino build files MUST recognise
`USE_XFSM=1` and add the Xstate-fsm-c wrapper, engine sources, include path,
and any required compile definition through the same conditional mechanisms as
other optional native libraries. Xstate-fsm-c MUST NOT require a separate
post-link step or a project-specific replacement for Espruino's wrapper
generation.

A board includes Xstate-fsm-c by listing `XFSM` in the `libraries` collection
of its `boards/<BOARD>.py` build definition, for example:

```python
info = {
  "build": {
    "libraries": [
      "XFSM"
    ]
  }
}
```

The standard Espruino board-processing script then emits the corresponding
`USE_XFSM` make variable. Board definitions that do not list `XFSM` MUST
not include the engine or its public `require("XFSM")` module in their
firmware. Selection is therefore a firmware-build decision rather than a
runtime installation or dynamic-loading decision.

The core engine and wrapper MUST remain board-independent. A board file MAY
select the library and the board's ordinary resource settings, but MUST NOT
contain Xstate-fsm-c execution semantics or duplicate its source-file list.

### Host object representation and branding

The generated Version 1 API of the `XFSM` library object MUST consist of
`createMachine(...)`, `createActor(...)`, and `assign(...)`. Objects produced
by those functions MUST use Espruino's generated class and method mechanisms so
that native methods are shared rather than stored as separately allocated
function properties on every instance.

The wrapper MUST define private library-scoped host classes for compiled
machines, actors, snapshots, subscriptions, and assignment descriptors as
needed. It MUST NOT export their constructors as module properties or global
names. Applications obtain instances only through the public factory and actor
methods and MUST NOT depend on private class names, constructor identity,
`instanceof` results, prototype identity, or hidden-property names.

A compiled-machine object MUST expose no Version 1 public own data properties
or methods. Its arena and retained-value container MUST be hidden GC-visible
children. An actor's five public methods MUST be shared native methods supplied
by its private class; they MUST NOT be five own function values allocated for
each actor. Its machine, native block, context, snapshot cache, retained fault,
and subscription storage MUST likewise use hidden GC-visible children.

A snapshot MUST contain its specified public snapshot properties as own data
properties and obtain `matches(...)` as one shared native method. A
subscription object MUST obtain `unsubscribe()` as a shared native method and
retain only the hidden registration state required while that registration is
active. Unsubscribing or automatic removal MUST release any hidden actor or
listener references no longer required by the inactive subscription.

`assign(...)` MUST return an opaque, privately branded assignment descriptor.
The descriptor MUST retain its assignment function or property map through a
hidden GC-visible child until a `createMachine(...)` call consumes it. Machine
construction MUST recognise only a live compatible descriptor, compile its
contents as specified, and MUST NOT retain the descriptor itself merely to
execute the resulting assignment.

Machine and actor validation MUST use wrapper-controlled host branding together
with the applicable native magic and format-version fields. A writable
JavaScript property, constructor name, or prototype identity alone MUST NOT be
sufficient to forge a valid native-backed object. Snapshot and subscription
methods MUST likewise reject a receiver that lacks their wrapper-owned private
state before accessing it. Exact host-class and hidden-child names are private
implementation details and MUST NOT become serialized or documented API.

### Save, restoration, and reset lifecycle

Version 1 supports both ordinary source boot and Espruino whole-interpreter
hibernation. When JavaScript source is stored in flash and executed at boot, it
MUST construct fresh machines and actors in the normal way. This is the
recommended deployment model when startup actions are required to establish
physical hardware state.

When the host provides `save()`, a saved interpreter image MAY contain compiled
machines and actors. Restoration is supported only when Espruino accepts that
image for the identical firmware build. The restored JavaScript object graph,
hidden flat strings, retained callbacks, actor state, context, snapshots, and
subscriptions MUST remain usable subject to the normal private-brand, native
magic, and format-version checks.

Espruino defers `save()` until the interpreter returns to idle. Consequently,
a save requested by an action, guard, assignment expression, or listener MUST
capture the actor only after the enclosing synchronous operation and its error
handling have finished. It MUST NOT capture a pending state, pending context,
non-idle operation marker, or partially completed notification sequence.

Restoration MUST NOT itself call `start()`, execute entry or exit actions,
process completion transitions, or notify subscribers. An actor resumes with
the stable lifecycle status, active leaf, context, and registrations contained
in the saved interpreter image. Calling `start()` on a restored active actor
remains the specified idempotent no-op; it MUST NOT be a mechanism for replaying
hardware initialisation. Applications MAY inspect the restored state with
`getSnapshot()` and SHOULD use `E.on("init", ...)` for any physical-device
initialisation that must occur after power is restored.

Xstate-fsm-c MUST NOT maintain a global actor registry or automatically stop
actors during `save()`, `load()`, `reset()`, interpreter shutdown, or power
loss. Those host operations MUST NOT cause actor exit actions to run merely
because the JavaScript environment is being suspended or discarded. An
application remains free to call `stop()` explicitly before requesting such an
operation when its own hardware requires orderly shutdown.

An Espruino saved interpreter image is a host-specific hibernation mechanism,
not an XState persisted snapshot. Version 1 continues to exclude public actor
persistence, snapshot serialization, rehydration into a new actor, and
cross-firmware or cross-device restoration APIs.

### Interpreter and interrupt boundary

All Version 1 public functions and actor methods MUST be entered through
Espruino's normal JavaScript interpreter context. Xstate-fsm-c provides no
interrupt-safe, thread-safe, or direct native event-ingress API. Its private
coordinator MUST NOT be called from an interrupt service routine or another
native task concurrently with interpreter execution.

JavaScript callbacks dispatched normally by Espruino for timers, watches,
serial data, networking, or other hardware events MAY call `actor.send(...)`.
An interrupt that occurs while an actor operation is running may enqueue such
host work, but the associated JavaScript callback and actor call MUST wait
until the current synchronous interpreter operation has returned.

One lifecycle or dispatch operation MUST run to completion without yielding
between transition selection, actions, completion transitions, publication,
and subscriber notification. A public lifecycle or dispatch call made
synchronously by a guard, action, assignment expression, or listener on the
same actor remains a prohibited re-entrant call and MUST report
`E_ACTOR_BUSY`. Application code requiring a later event MAY schedule a timer
or use another ordinary Espruino event facility and call `send(...)` from that
later JavaScript callback.

A native Espruino library that needs to stimulate a Version 1 actor MUST arrange
normal interpreter-context JavaScript delivery; it MUST NOT call the private
coordinator directly from an ISR. Xstate-fsm-c MUST NOT add per-actor mutexes,
atomic state fields, or interrupt masking merely to protect actor execution.
The Espruino interpreter boundary and the existing busy-state check provide the
Version 1 serialization contract.

User callbacks and completion chains execute synchronously and can delay the
rest of the Espruino event loop. Xstate-fsm-c cannot pre-empt an application
callback; application code remains responsible for callback duration and the
target's watchdog requirements. The microstep budget provides a bound on
engine-controlled completion processing but not on time spent inside user
code.

Loss of a hardware or communication event before its JavaScript callback runs,
including loss caused by exhaustion of an Espruino host event queue, is a host
condition rather than an Xstate-fsm-c actor fault. Any host diagnostic remains
the responsibility of Espruino and MUST NOT be translated into a fabricated
actor event or transition.

### Wrapper lifecycle and global state

Version 1 MUST NOT keep mutable machine, actor, coordinator, subscription, or
JavaScript-reference state in C global or file-static storage. In particular,
it MUST NOT retain a global current-actor pointer, actor registry, shared
execution scratch buffer, `JsVar *`, or `JsVarRef`. Immutable `static const`
tables, diagnostic text, and compile-time configuration do not constitute
runtime state and MAY be shared.

The library MUST NOT require Espruino wrapper `hwinit`, `init`, `kill`, or
`idle` hooks in Version 1. All persistent ownership MUST be reachable through
the machine, actor, snapshot, subscription, or assignment-descriptor object
graphs. Temporary native coordinator state and `JsVar *` locks MUST belong to
the current call and MUST be released correctly on every success and exception
path.

The coordinator MUST be re-entrant for different actors. While actor A is
executing a guard, action, assignment expression, or listener, application code
MAY synchronously invoke a lifecycle or dispatch method on an otherwise
eligible actor B. Actor B MUST execute in an independent coordinator frame and
follow its own lifecycle and publication rules. Calling back into actor A while
A remains busy MUST fail under the existing `E_ACTOR_BUSY` rule.

A stable result committed by actor B MUST NOT be rolled back if actor A later
faults. If B's operation throws into A's application callback, A follows the
normal callback-exception rule unless that callback catches the value. No
cross-actor transaction, shared pending context, or shared microstep budget
exists. This permission does not add actor spawning, actor systems, `sendTo`,
or another public actor-composition API.

Before marking any target actor busy, the wrapper MUST verify that the host has
the configured minimum free stack required for one coordinator frame in
addition to Espruino's normal safety margin. If that reserve is unavailable,
the target operation MUST throw `E_LIMIT_EXCEEDED` with `stack` as its short
detail before changing or faulting the target actor. If that exception escapes
from an outer actor's callback, the outer actor's existing exception rule still
applies.

The minimum stack reserve is a private target/build constant, not a per-machine
or JavaScript option. The first vertical slice MUST measure the maximum C stack
usage of one coordinator frame, including maximum-depth hierarchy traversal,
and document the selected reserve for each representative build. Nested calls
remain subject to the remaining host stack and therefore fail safely rather
than promising a fixed number of simultaneously nested actors.

### Wrapper and variable ownership

Public bindings MUST use Espruino's JSON-formatted `jswrap_` declarations so
the normal build tools generate the wrapper symbol table and API metadata.

The wrapper MUST follow Espruino's lock ownership rules on every success and
error path. A `JsVar *` returned locked by an Espruino API MUST be unlocked by
the wrapper when it is no longer required. Persistent JavaScript ownership MUST
be expressed using normal parent-child references so that Espruino performs
reference counting and garbage-collection tracing.

The retained-JavaScript-value container is an exception to the rule that the
execution representation is wholly native. It MUST contain only values that
must remain visible to the garbage collector; structural state, transition,
handler, symbol, and action metadata MUST remain in the native arena. This
minimises the number of linked-list elements and `JsVar` storage blocks used by
each compiled machine.

Retaining a flash-backed function keeps its JavaScript function value reachable
but does not copy its backing code into RAM. Application documentation MUST warn
that Storage or module contents backing a live function must not be erased,
replaced, or compacted while a runtime may still invoke that function.

Executable Espruino examples MUST use syntax supported by Espruino itself,
including `require()` for modules and `Object.assign()` where object composition
is needed. Examples using `import`, `export`, or object spread MUST be clearly
identified as host-side or transpiled examples rather than directly executable
Espruino code.

### Compiler and target contract

The portable native engine MUST be valid standard C99 and MUST NOT require a
GNU language extension. The Espruino wrapper MAY use established Espruino
project conventions and APIs, but target-specific headers and behaviour MUST
remain outside the portable engine.

The implementation requires an eight-bit byte and exact-width `uint8_t`,
`uint16_t`, and `uint32_t` types. It MUST verify those assumptions and every
normative arena size and offset at compile time. It MUST NOT depend on the width
or representation of `int`, `long`, `size_t`, pointers, C enumeration types, or
plain `char` signedness. An unsupported fundamental representation MUST produce
a clear compilation failure rather than a different native layout.

Neither the portable engine nor its wrapper traversal code may use packed C
structures, unaligned typed access, variable-length arrays, or C recursion.
Fixed native workspaces MUST have compile-time bounds. Xstate-fsm-c MUST NOT use
`malloc()` or `free()`; the wrapper MUST obtain persistent storage through the
specified Espruino values and hidden-child ownership, while the portable engine
operates on caller-owned arenas, records, and bounded call-local workspaces.

The sources MUST compile correctly under the normal optimisation and
link-time-optimisation settings of each selected Espruino target, including
size optimisation where that target uses it. Correctness MUST NOT depend on
optimisation being disabled, structure packing, compiler-specific enum size,
or undefined integer overflow. Library code SHOULD compile without introducing
new compiler warnings in every required conformance build.

An arena uses the native byte order of the firmware that created it and is not
a cross-target serialization format. The arena header MUST continue to identify
byte order, and runtime validation MUST reject a mismatch. Version 1 does not
claim verified big-endian execution because none of its selected Espruino
targets is big-endian; host tests MUST nevertheless cover rejection of a
mismatched byte-order flag.

Every reported build or conformance result MUST identify at least the Espruino
source revision, compiler and version, board definition, relevant build and
optimisation flags, CPU architecture, pointer width, byte order,
`process.memory().blocksize`, and Xstate-fsm-c stack-reserve setting.

### Version 1 target and test matrix

Target support MUST be evidence-based and recorded using one of these statuses:

- **Conformance verified**: the applicable runtime, validation, resource, and
  physical-integration tests pass on the target;
- **Build verified**: the firmware builds and links with Xstate-fsm-c, but the
  complete applicable runtime suite has not passed on that target; or
- **Not yet verified**: neither of the preceding claims has current recorded
  evidence.

Sharing a CPU family with a verified board or merely compiling successfully
MUST NOT be described as conformance support.

Linux Espruino is the Version 1 reference-test host. It MUST run the complete
portable semantic, validation, native-format corruption, allocation-failure,
and diagnostic suite. A supported host toolchain SHOULD additionally run
address and undefined-behaviour sanitizers. Its wider pointers provide explicit
evidence that the arena and engine do not assume a 32-bit host pointer.

The initial candidate product targets are:

- **Espruino Pico**, using its STM32F401 ARM Cortex-M4F build;
- **MDBT42Q**, using its nRF52832 ARM Cortex-M4F build;
- **ESP32-C3**, representing the 32-bit RISC-V ESP-IDF build; and
- **one Xtensa ESP32 target**, selected from the original ESP32 or ESP32-S3 and
  identified in the test report.

The Pico and MDBT42Q MUST be assessed separately despite sharing the ARM
instruction set. They exercise different vendor integration, linker and memory
layouts, Espruino configurations, and available resource envelopes. The
MDBT42Q is the primary constrained-RAM target; the Pico additionally provides
the constrained-flash STM32 build. ESP32-C3 and the selected Xtensa target are
separate architecture qualifications and MUST NOT substitute for one another.

Each candidate product target MUST at least pass the common machine-behaviour
and native-format suite, callback integration using JavaScript and native
functions, representative pin/timer actions, exception and allocation-failure
paths feasible on that target, save/restoration tests where the host provides
`save()`, and the resource and timing measurements required below. A target
remains Build verified or Not yet verified until all applicable evidence for
Conformance verified has been recorded.

ESP8266, nRF51, nRF54/Zephyr, Emscripten, big-endian processors, and other
Espruino boards are not Version 1 qualification targets. The portable-C rules
deliberately leave room for later ports, but Version 1 MUST NOT imply support
for those targets without adding them to this matrix and collecting the
required evidence.

## Validation and Error Behavior

### Construction transaction

`createMachine(...)` MUST be synchronous and transactional. It MUST either
return one completely validated and populated compiled machine or throw a
JavaScript `Error`. On failure it MUST release every temporary allocation,
native arena, and retained JavaScript reference acquired by that construction
attempt. No partially usable machine may be returned or published.

Machine-definition errors MUST be detected during `createMachine(...)`; they
MUST NOT be deferred until actor startup or until an event happens to select an
invalid record. Construction MUST resolve and validate at least all initial
states, target references, effective IDs, action and guard bindings, supported
descriptor shapes, state relationships, record counts, index values, and
string-pool ranges.

Construction MUST validate all counts, byte lengths, indexes, offsets, and
alignment calculations before writing them to their native fields. A value that
does not fit the specified representation MUST cause construction to fail; it
MUST NOT be truncated or wrapped. Cycles in the structural object graph and
nesting beyond the supported implementation limit MUST also be rejected. Reuse
of one acyclic configuration fragment in separate branches is composition, not
a cycle, and MAY be compiled independently at each position.

The engine MAY perform the already specified single defragment-and-retry
attempt after a native arena allocation failure. If that attempt fails,
construction MUST release its temporary resources and report a memory error.

### Definition strictness

The supported configuration is a strict schema. A malformed supported field,
an unknown structural property, or a recognised but unsupported semantic
feature MUST cause construction to fail. In particular, construction MUST NOT
silently reinterpret a misspelled property such as `intial` or `gaurd`, and
MUST explicitly reject version 1 exclusions including parallel states,
history states, invocation, delayed transitions, eventless transitions,
activities, output values, tags, actor definitions, XState actor
persistence and restored-snapshot input, and custom state-path delimiters.

Profile 1 defines the following narrow exceptions for inert output generated
by the examined Stately v4 and v5 exporters or accepted current XState
transition schema:

- root `predictableActionArguments: true` and `preserveActionOrder: true`;
- empty `services`, `actors`, and `delays` implementation maps; and
- empty `meta` objects and string `description` fields in the state-node,
  initial-transition, and transition locations specified above.

Construction MUST accept and discard those exact inert forms. It MUST reject a
different value, a non-empty unsupported implementation map, or non-empty
metadata whose observable semantics Profile 1 does not implement. Additional
ignored fields MUST NOT be introduced without an explicit specification
change.

Structural configuration MUST use ordinary data properties containing the
accepted objects, arrays, primitive values, and callback values. Property
accessors and other definitions that can produce different structural values
between validation and arena-population passes are unsupported and MUST be
rejected. Configuration-producing application code remains free to run before
`createMachine(...)` and pass its completed stable object graph.

Construction MUST validate that callback positions contain callable values but
MUST NOT invoke an initial-context factory, guard, action, assignment
expression, or other application callback. Callback execution belongs to the
actor lifecycle and dispatch rules.

### Construction diagnostics

A construction failure MUST throw one normal JavaScript `Error` containing a
stable diagnostic category and the position of the failure in the supplied
object graph. The position MUST be expressed as an unambiguous JavaScript-like
property path rooted at `config` or `options`. Identifier-like keys SHOULD use
dot notation; other keys MUST use quoted bracket notation. Array positions MUST
use zero-based bracket indexes. For example:

```text
config.states.Parent.states.Child.on.NEXT[0].target
config.states["Parent state"].initial
options.actions.reset
```

The path identifies the object property, not a source-file line or column;
`createMachine(...)` receives an object graph and has no reliable source-map
information.

At minimum, stable categories MUST distinguish configuration type, unknown
property, unsupported feature, missing initial state, invalid initial state,
unknown target, ambiguous target, duplicate ID, unresolved action, unresolved
guard, representation limit, and allocation failure. Their symbolic codes are:

```text
E_CONFIG_TYPE
E_UNKNOWN_PROPERTY
E_UNSUPPORTED_FEATURE
E_INITIAL_REQUIRED
E_INITIAL_UNKNOWN
E_TARGET_UNKNOWN
E_TARGET_AMBIGUOUS
E_ID_DUPLICATE
E_ACTION_UNRESOLVED
E_GUARD_UNRESOLVED
E_LIMIT_EXCEEDED
E_NO_MEMORY
```

Construction MUST report the first error encountered in deterministic
definition order. It MUST NOT allocate an array of every detected error. The
diagnostic MAY include a bounded offending value or other short detail when it
materially helps identify the problem. Static explanatory prose SHOULD remain
brief; the documentation and conformance suite MUST provide the expanded
meaning of every stable category.

Version 1 construction messages MUST use this single compact grammar:

```text
XFC <CATEGORY> @ <OBJECT_PATH>[: <SHORT_DETAIL>]
```

`XFC`, the category, and the separators are fixed library text. Category names
SHOULD be stored once in a shared flash-resident table rather than duplicated in
individual message templates. The object path and optional detail MUST be
formed only on failure and MUST NOT add storage to a successfully compiled
machine.

The object path MUST normally be complete. The optional detail MUST be limited
to 48 bytes, with any truncation occurring at a valid character boundary.
User-supplied string details MUST be quoted and escaped. For example:

```text
XFC E_TARGET_UNKNOWN @ config.states.Parent.on.NEXT[0].target: "Missing"
XFC E_TARGET_AMBIGUOUS @ config.states.Parent.on.NEXT[0].target: "Heating.Mode"
XFC E_UNKNOWN_PROPERTY @ config.states.Idle.entyr
XFC E_LIMIT_EXCEEDED @ config.states: states=65536 max=65535
```

If allocation failure prevents construction of the normal diagnostic, the
implementation MUST be able to throw the fixed fallback message without
attempting to build an object path:

```text
XFC E_NO_MEMORY @ createMachine
```

Version 1 MUST NOT provide separate compact and verbose diagnostic builds.
Expanded category explanations belong in project documentation and conformance
tests. A later version MAY revise the diagnostic detail only after measurements
show the flash and failure-path RAM consequences on representative targets.

### Runtime diagnostics

An engine-created runtime failure MUST use the same bounded message grammar as
a construction failure:

```text
XFC <CATEGORY> @ <RUNTIME_POSITION>[: <SHORT_DETAIL>]
```

A runtime position identifies the public API operation or execution stage; the
compiled machine MUST NOT retain source-object paths solely for runtime error
formatting. Defined positions include `createActor.machine`,
`createActor.options`, `actor.<method>.this`, `actor.start`,
`actor.start.context`, `actor.send`, `actor.send.event`,
`actor.send.event.type`, `actor.<operation>.assign`, `actor.stop`,
`actor.getSnapshot`, `actor.subscribe.listener`, `snapshot.matches.this`, and
`subscription.unsubscribe.this`. The position and optional detail follow the
same bounded construction and 48-byte detail limit specified above.

Version 1 defines these runtime categories:

```text
E_MACHINE_INVALID
E_ACTOR_INVALID
E_RECEIVER_INVALID
E_ACTOR_STATE
E_ACTOR_BUSY
E_ACTOR_FAULTED
E_EVENT_INVALID
E_LISTENER_INVALID
E_CONTEXT_INVALID
E_MICROSTEP_LIMIT
E_LIMIT_EXCEEDED
E_NO_MEMORY
E_INTERNAL
```

The already defined `E_UNSUPPORTED_FEATURE` category also applies at the
runtime API boundary when `createActor.options` is supplied; it is an ordinary
JavaScript `Error` and does not fault or create an actor.

Their meanings are:

- `E_MACHINE_INVALID`: the value supplied to `createActor(...)` is not a live,
  compatible Xstate-fsm-c compiled machine;
- `E_ACTOR_INVALID`: an actor method's receiver is not its live compatible
  actor;
- `E_RECEIVER_INVALID`: a snapshot or subscription method's receiver is not
  its originating compatible object;
- `E_ACTOR_STATE`: the requested operation is invalid in the actor's current
  non-faulted lifecycle state;
- `E_ACTOR_BUSY`: a prohibited re-entrant lifecycle or dispatch call was made;
- `E_ACTOR_FAULTED`: a lifecycle or dispatch operation was attempted on an
  actor that had already faulted;
- `E_EVENT_INVALID`: an event has an invalid shape or type, including an empty
  or reserved event type;
- `E_LISTENER_INVALID`: a subscription listener is missing, non-callable, or
  uses an unsupported observer or additional-callback form;
- `E_CONTEXT_INVALID`: an initial-context factory or `assign(...)` partial
  assigner produced a value outside the required object shape;
- `E_MICROSTEP_LIMIT`: another microstep would exceed the fixed operation
  budget;
- `E_LIMIT_EXCEEDED`: a runtime value exceeds a fixed representational limit;
- `E_NO_MEMORY`: a required Espruino allocation failed; and
- `E_INTERNAL`: the engine detected an invalid arena header, corrupt record, or
  impossible internal invariant before unsafe execution.

Invalid arguments, invalid receivers, invalid event or listener values, and
invalid context-return shapes MUST create a JavaScript `TypeError`. Lifecycle,
busy, faulted-actor, limit, allocation, and internal failures MUST create a
normal JavaScript `Error`. Representative messages are:

```text
XFC E_MACHINE_INVALID @ createActor.machine
XFC E_ACTOR_INVALID @ actor.send.this
XFC E_RECEIVER_INVALID @ snapshot.matches.this
XFC E_RECEIVER_INVALID @ subscription.unsubscribe.this
XFC E_ACTOR_STATE @ actor.send: status=notStarted
XFC E_ACTOR_BUSY @ actor.send: operation=send
XFC E_ACTOR_FAULTED @ actor.start
XFC E_EVENT_INVALID @ actor.send.event.type: reserved
XFC E_LISTENER_INVALID @ actor.subscribe.listener
XFC E_CONTEXT_INVALID @ actor.start.context: expected=object
XFC E_MICROSTEP_LIMIT @ actor.send: max=256
XFC E_NO_MEMORY @ actor.send
```

An exception or other JavaScript value thrown by an application context
factory, guard, action, assignment expression, property access, or listener is
not an engine-created diagnostic. The engine MUST propagate that exact value
without wrapping it, replacing its message, or adding an `XFC` category. When
the applicable rule faults the actor, the error snapshot MUST retain that same
value by identity.

An error detected completely at the public boundary MUST NOT fault an otherwise
usable actor. This includes an invalid machine, actor, snapshot, or subscription
handle, unsupported actor options, invalid event input, invalid listener input,
lifecycle-state misuse, a rejected re-entrant call, failure to allocate a
subscription registration, and failure to materialise a snapshot requested
only by `getSnapshot()`. The failing call throws, but no pending machine
operation has begun. An `E_ACTOR_BUSY` rejection does not itself fault the
actor; if that rejection escapes from an action or other application callback
in the operation already in progress, the separately specified
callback-exception rule still applies to that enclosing operation.

An engine-created failure after a lifecycle or dispatch operation has begun
MUST abort that operation and fault the actor. This includes an invalid runtime
context result, microstep exhaustion, failure to allocate pending context,
event, state, or publication data, and a detected internal inconsistency. The
pending state and context MUST be discarded according to the existing
transactional fault rules.

When current subscribers require a JavaScript snapshot for a pending
publication, the engine MUST materialise that snapshot before committing the
publication or invoking any listener. Failure to materialise it MUST fault the
operation as `E_NO_MEMORY`; no listener may observe the incomplete result. A
later standalone `getSnapshot()` allocation failure instead follows the
non-faulting public-boundary rule above.

Formatting `E_NO_MEMORY` MUST NOT depend on another successful dynamic
allocation. When the normal operation-specific message cannot be built, the
implementation MUST throw the fixed fallback:

```text
XFC E_NO_MEMORY @ runtime
```

## Resource and Performance Requirements

The implementation MUST treat construction and steady-state dispatch as
separate performance profiles. Construction MAY perform validation, hashing,
counting, exact-sized allocation, and one optional defragmentation retry.
Steady-state structural dispatch MUST perform no native heap allocation and no
JavaScript collection construction.

Resource measurements MUST report at least:

- firmware binary-size increase with Xstate-fsm-c enabled, measured against the
  same Espruino build configuration without the library;
- the diagnostic category table and formatting code contribution when a linker
  map or equivalent tool can identify it;
- final compiled-arena bytes;
- retained JavaScript value count;
- total Espruino variable-block change caused by machine construction;
- peak variable-block usage during construction;
- peak variable-block and native-memory use while formatting a representative
  construction error with a deeply nested object path;
- per-runtime-instance variable-block change;
- the additional cost of materialising the first snapshot and registering the
  first subscriber; and
- event-dispatch time for a local hit, parent fallback, guarded candidates,
  and an unhandled event.

Measurements MUST record `process.memory().blocksize`, because the size of an
Espruino variable-storage block varies between targets. Representative tests
MUST include a constrained target and MUST distinguish native structural cost
from time spent inside application-supplied JavaScript guards and actions.

The first executable vertical slice MUST produce this resource baseline early
enough for record layout, diagnostics, snapshot materialisation, and retained
JavaScript ownership to be revised before the full Profile 1 implementation is
committed to those mechanisms.

The hierarchy-depth limit of 32 and the run-to-completion budget of 256
microsteps are provisional design values for the first vertical slice. That
slice MUST measure native and Espruino variable-block use attributable to the
bounded hierarchy work area, hierarchy traversal time at representative depths,
and execution time for completion chains approaching the microstep limit. The
results MUST be documented and both values explicitly retained or revised
before the full Profile 1 implementation proceeds. Any revision MUST preserve
a fixed, statically bounded runtime cost; Version 1 MUST NOT introduce
per-machine limit settings as a substitute for that review.

The version 1 implementation MUST allocate the compiled arena once and retain
it for the machine lifetime. It MUST NOT repeatedly create typed arrays, flat
strings, or other contiguous buffers during dispatch.

The offset-based, pointer-free arena layout SHOULD remain compatible with a
future read-only, precompiled image backed by Espruino Storage or another native
string source. Loading such an image without runtime compilation is not a
version 1 requirement.

## Conformance Requirements

### Authority and evidence

This specification is the normative authority for Profile 1. Reviewed expected
results in the Profile 1 conformance corpus are executable statements of this
specification, but a conflict MUST be resolved in favour of the specification
and the affected expected result MUST be corrected through review.

Pinned Node XState releases, Stately-generated examples, XState v4.38.3,
FSMPlus traces, and applicable SCXML tests are compatibility evidence. They
MUST NOT silently add, remove, or change a Profile 1 requirement. The exact
package version or source revision used as evidence MUST be recorded; an
unpinned dependency such as `latest` MUST NOT produce release evidence.

The conformance corpus MUST distinguish:

- **Profile 1 normative cases**, whose expected results are derived from this
  specification;
- **XState differential cases**, which execute semantically equivalent models
  in a pinned Node XState release;
- **intentional-difference cases**, which demonstrate both the reference
  behaviour and the specified Profile 1 behaviour;
- **native implementation cases**, for which Node XState has no equivalent;
  and
- **legacy evidence**, including existing FSMPlus and XState v4 traces that
  have not been adopted as Profile 1 expectations.

Legacy examples MUST NOT become normative merely by being copied into the new
test tree. Any adopted example MUST be reviewed against Profile 1, assigned a
stable case identifier, and given an explicit expected result.

### Requirement traceability

Every normative `MUST` or `MUST NOT` in this specification MUST be covered by
at least one of:

- an automated public-behaviour test;
- an automated validation, fault-injection, or native-format test;
- a build or static-inspection check; or
- a recorded resource, stack, or timing measurement.

The conformance matrix MUST link each requirement to its evidence and each test
to the specification section it exercises. Test cases MUST use stable
identifiers, using the `XFC-CF-<AREA>-<NUMBER>` form. A test that cannot run on
a target MUST report a reasoned skip and MUST NOT count as a pass for that
requirement.

Each machine-behaviour case MUST identify its machine definition, ordered
input operations, reviewed expected trace, applicable targets, and reference
classification. A differential case MUST additionally identify the reference
engine version and every source adaptation needed to make the models
semantically equivalent.

### Node XState differential execution

Every Profile 1 requirement describing externally observable statechart
behaviour MUST have a differential comparison with a pinned Node XState
release unless the case is explicitly classified as Profile-specific, an
intentional compatibility difference, or having no equivalent public XState
behaviour. The reason for any such exclusion MUST be recorded.

The initial conformance corpus MUST pin `xstate@5.33.2` as the primary reference
for semantics shared with Profile 1 and `xstate@4.38.3` as the secondary
reference for retained v4 features and migration syntax. The repository's
archived v4.38.3 source MAY satisfy the latter pin. XState v4 results MUST NOT
be used as the expected Profile 1 result where the releases differ, including
default self-transition re-entry behaviour. Updating either reference version
MUST be a reviewed evidence change and MUST NOT silently rewrite accepted
expected traces.

Equivalent reference models MAY differ textually from the Profile 1 model.
Permitted adaptations include `guard` to `cond`, `reenter` to `internal`,
callback argument shape, assignment syntax, imports, and actor lifecycle API.
The harness MUST record each adaptation. It MUST NOT adapt the state topology,
event sequence, guard decisions, intended context changes, or intended action
ordering merely to make traces agree.

Differential coverage MUST include, where applicable:

- ordered transition candidates, guards, parent fallback, and exact-event and
  wildcard selection;
- exit, transition, and entry action ordering;
- ordered assignment, context visibility, and context isolation between actor
  instances;
- startup, initial-state descent, initial-transition actions, and initial
  context creation;
- targetless, self, re-entering, relative, explicit-ID, descendant, ancestor,
  sibling, and cross-hierarchy transitions;
- final states, `onDone`, completion cascades, and final actor status;
- string and object event visibility; and
- committed snapshots and subscription notification timing.

Hierarchy cases MUST include shallow and generated deep models, transitions at
several ancestry levels, least-common-ancestor exit and entry paths, and depths
at and immediately around the Profile 1 limit. Only supported depths are
required to match XState execution; rejection beyond the limit is a
Profile-specific validation case.

Reference actions MUST record observable action order and reference guards
MUST record or otherwise prove their decisions without changing the model's
semantics. The reference output MUST be normalized into the common trace form,
reviewed, and committed with the case. Embedded targets compare against that
reviewed result and do not run Node. A reference-engine update or mismatch
MUST trigger review; tooling MUST NOT automatically replace an accepted
expected trace.

### Test layers

The Version 1 suite MUST cover these layers:

- **Public behaviour**: construction, actor lifecycle, events, transition
  selection, actions, context, snapshots, subscriptions, completion, and
  faults through the documented JavaScript API.
- **Construction validation**: every accepted grammar form, each strictness
  rule, target resolution, diagnostic category and object-graph position, and
  transactional cleanup after rejection.
- **Runtime failure**: callback exceptions, allocation failure, limits, busy
  actors, subscriber failure, and the specified post-fault lifecycle.
- **Native format**: record encoding and decoding, bounds checks, malformed or
  corrupted arena data, byte-order rejection, and index and offset limits.
- **Host integration**: JavaScript and native callbacks, GC ownership, save and
  restoration, reset, interrupt restrictions, representative pins and timers,
  and nested calls between different actors.
- **Resources**: attributable flash, arena and Espruino variable-block use,
  construction and dispatch stack use, and representative construction and
  dispatch timing.
- **Compatibility**: pinned Node differential cases, Stately-generated input,
  migration aliases, intentional differences, and reviewed legacy evidence.

Public-behaviour tests MUST use only the documented public interface. Internal
test seams MAY be compiled into test builds for deterministic allocation
failure, arena corruption, and similar faults that cannot be induced reliably
through that interface. Such seams MUST NOT alter production behaviour or be
present in a release build.

### Canonical trace

Portable behaviour tests MUST emit a versioned, newline-delimited JSON trace.
Each line MUST be one complete JSON object and MUST be emitted as the observed
operation occurs; an embedded runner MUST NOT retain the complete trace in RAM.
The trace vocabulary MUST represent at least case identity, public calls,
actions, selected context observations, committed snapshots, errors, explicit
assertions, and the final test result.

State configurations MUST be represented structurally in JSON and MUST NOT be
flattened into ambiguous period-separated paths. Raw JSON object-property order
MUST NOT affect comparison; the host comparator MUST parse and canonicalize
records before comparing them. Array order and the order of trace records
remain significant.

The trace format MUST NOT require arbitrary application context to be JSON
serializable. A test involving functions, cycles, native objects, or object
identity MUST emit a case-defined serializable projection or explicit boolean
assertion. Values such as timestamps, addresses, allocation identifiers, or
platform-specific exception text MUST NOT appear in a portable expected trace
unless the case explicitly tests them.

Existing plain-text FSMPlus traces remain legacy evidence and MUST NOT be used
as the canonical Profile 1 trace format without reviewed conversion.

### Conformance result

A test run MUST record the implementation revision and the build and target
metadata required by
[Compiler and target contract](#compiler-and-target-contract). Results MUST
identify every pass, failure, and reasoned skip. A run is conforming for its
declared scope only when:

- all applicable normative cases match their reviewed expected results;
- all applicable validation and negative-path cases pass;
- there is no unexpected assertion, sanitizer finding, arena corruption,
  leaked busy state, or unhandled diagnostic;
- required physical host-integration cases pass; and
- required resource, timing, and maximum-stack observations are recorded.

Resource observations do not constitute a pass merely because the program
completed. They MUST be assessed against the fixed limits in this
specification and the available memory and watchdog constraints of the target.
The first vertical-slice report MUST explicitly retain or revise the
provisional hierarchy-depth and microstep limits as required under
[Resource and Performance Requirements](#resource-and-performance-requirements).

The status **Conformance verified** applies only under the target criteria in
[Version 1 target and test matrix](#version-1-target-and-test-matrix). Passing
the Node or Linux semantic suite does not by itself qualify a physical Espruino
target.

## Licensing and Provenance

This section records project-governance considerations rather than Profile 1
runtime requirements. It does not replace the applicable licence texts or
legal review for a particular distribution.

XState is distributed under the
[MIT License](https://github.com/statelyai/xstate/blob/main/LICENSE). The local
[XState v4.38.3 source archive](../../../archive/xstate-xstate-4.38.3/)
preserves its upstream
[licence text](../../../archive/xstate-xstate-4.38.3/LICENSE). The intended
Xstate-fsm-c implementation is based on the behaviour specified here and on
recorded differential observations. If implementation code, tests, comments,
or other substantial material are copied or adapted from XState, the XState
copyright and MIT permission notice need to accompany that material and its
distribution.

Espruino is distributed under the
[Mozilla Public License 2.0](https://github.com/espruino/Espruino/blob/master/LICENSE).
Existing Espruino files modified for integration remain covered files, and
copied Espruino source remains subject to its licence. Distribution of an
executable containing modified MPL-covered files carries the MPL source and
notice obligations for those files. The
[Espruino repository guidance](https://github.com/espruino/Espruino#using-espruino-in-your-projects)
also explains its file-level treatment of modified and newly created files.

Xstate-fsm-c, including its implementation, tests, and documentation, is
licensed under the [Mozilla Public License 2.0](../LICENSE). New implementation
source files use the MPL-2.0 Exhibit A notice. Contributions are accepted under
the same licence and provenance rules recorded in
[CONTRIBUTING.md](../CONTRIBUTING.md). The
[third-party notice](../THIRD_PARTY_NOTICES.md) must be updated whenever
external material is incorporated.

The umbrella repository uses explicit per-path licensing rather than a blanket
root licence. Its [licence map](../../../LICENSING.md) records Xstate-fsm-c,
the XState source archive, and the Stage 1 Git submodule as separate licensing
boundaries. The Xstate-fsm-c licence does not relicense an archive, dependency,
submodule, sibling project, or separately identified third-party file.

The software licences do not grant rights to project names, logos, or an
official-endorsement claim. Public documentation should use "XState-compatible"
and "for Espruino" descriptively, state that Profile 1 is an independent
limited implementation, and avoid implying affiliation with or endorsement by
Stately or Espruino.

Compatibility fixtures taken from a Stately tool, upstream documentation, or
another repository should record their source and version. Project-authored
minimal configurations are preferred where they demonstrate the same behaviour
without copying an upstream example.

## Design References

The following official documentation informs the requirements and compatibility
notes above but is not itself normative for Xstate-fsm-c.

### Espruino

- [Espruino Performance Notes](https://www.espruino.com/Performance)
- [Espruino Interpreter Internals](https://www.espruino.com/Internals)
- [Espruino Modules](https://www.espruino.com/Modules)
- [Espruino Feature List](https://www.espruino.com/Features)
- [Saving Code on Espruino](https://www.espruino.com/Saving)
- [Espruino native-library guide](https://github.com/espruino/Espruino/blob/master/libs/README.md)
- [Espruino firmware build guide](https://github.com/espruino/Espruino/blob/master/README_Building.md)

### XState and SCXML

- [XState: Migrating from v4 to
  v5](https://stately.ai/docs/migration)
- [XState: Actors](https://stately.ai/docs/actors)
- [XState: Events and transitions](https://stately.ai/docs/transitions)
- [XState: Guards](https://stately.ai/docs/guards)
- [XState v5.33.2: Actor implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/createActor.ts)
- [XState v5.33.2: Machine initial-context implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/StateMachine.ts)
- [XState v5.33.2: Context-assignment implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/actions/assign.ts)
- [XState v5.33.2: State-node and initial-transition implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/StateNode.ts)
- [XState v5.33.2: Target-path parsing implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/utils.ts)
- [XState: Migrating from v5 to v6
  alpha](https://dev.stately.ai/docs/xstate/v6/xstate-v5-to-v6)
- [Stately: Predictable events and actions in
  XState v5](https://dev.stately.ai/blog/2023-05-25-announcing-xstate-v5-beta)
- [Stately: XState for .NET](https://github.com/statelyai/xstate-csharp)
- [XState: Context and lazy initial
  context](https://stately.ai/docs/context)
- [XState: Action errors and actor
  subscribers](https://stately.ai/docs/invoke#how-are-actors-different-from-actions)
- [W3C SCXML 1.0](https://www.w3.org/TR/scxml/)

## Open Questions

No unresolved Profile 1 design questions are currently recorded.

The hierarchy-depth limit, microstep budget, native physical layout, and stack
reserve retain their specified measurement and review gates. Those gates are
implementation evidence required from the first vertical slice rather than
undefined Version 1 semantics. Features explicitly excluded by Scope are
possible subjects for later profiles and are not open Profile 1 requirements.
