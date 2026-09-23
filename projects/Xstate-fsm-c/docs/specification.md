# Xstate-fsm-c Specification

## Document Status

- Status: Initial design decisions in progress
- Version: 0.21
- Implementation status: Not started

This document is the future normative specification for Xstate-fsm-c. Only
requirements stated explicitly in this document are accepted; unresolved
headings and open questions do not imply architectural or behavioral choices.

## Purpose

To be defined.

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

The inclusion or exclusion of other XState features remains to be specified.

A previously compiled machine object is not a state-node configuration and
MUST NOT be accepted as a nested state. Running one machine from another would
require machine invocation or actor composition, which is outside the version
1 scope. In particular, version 1 state `onDone` support does not imply support
for `invoke.onDone`; invoked actors and services remain outside the version 1
scope.

## Terminology

- **Machine definition**: The JavaScript object supplied to `createMachine`
  that describes states, transitions, guards, actions, and initial context.
- **Compiled arena**: The single contiguous compiled-machine data block that
  stores the fixed native representation of a machine definition.
- **State configuration**: The state or set of states that is currently active.
  This follows the meaning of "configuration" in SCXML and does not refer to
  the machine-definition object.
- **Context**: Application data belonging to a running machine instance and
  available to guards and actions.
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
otherwise supported feature MUST be recorded under Intentional Compatibility
Differences with its behavioural consequence and embedded-system rationale.
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
Scope rather than repeated here.

### XFC-CD-001: Ordered context assignment

The XState v4 default promoted `assign(...)` actions ahead of ordinary actions.
Xstate-fsm-c instead always processes assignments at their declared positions,
equivalent to XState v4 with `predictableActionArguments: true` and to the
ordering adopted by XState v5. Xstate-fsm-c does not provide a flag for the
legacy ordering. See Context assignment and visibility.

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
Action and guard exceptions and fault handling.

This difference avoids requiring an actor error-observer framework in version 1
and makes failures immediately visible to simple Espruino applications.

### XFC-CD-003: Transition re-entry defaults

XState v4 self-transitions and some descendant transitions re-entered their
source by default. Profile 1 follows the XState v5 model: a transition preserves
its source state unless leaving it is required by the target, or `reenter: true`
explicitly requests source re-entry. See Transition re-entry.

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
`xstate.done.state.<state-id>`. See Final states and completion transitions.

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
application event from impersonating an internal completion event. See Event
input and dispatch.

### XFC-CD-008: Exit actions on explicit stop

XState v5 stops a root actor without executing the exit actions of the active
machine states. Profile 1 instead follows the SCXML interpreter-termination
model: explicitly stopping an active actor executes the exit actions of its
complete active state chain in leaf-to-root order.

This difference gives embedded applications a deterministic place to turn off
hardware and release application resources. See Actor lifecycle and Action
locations and ordering.

### XFC-CD-009: Initialization begins at start

XState v5 calculates a machine actor's initial snapshot during
`createActor(...)`, while deferring ordinary initial effects until `start()`.
Profile 1 creates an uninitialised actor and performs context-factory
evaluation, initial-state resolution, initial actions, and completion
processing together in the first `start()` operation.

This means `createActor(...)` cannot invoke application code, and an actor that
is stopped without being started consumes no runtime-specific context-factory
allocation. See Actor lifecycle and Stable snapshots.

### XFC-CD-010: Subscriber exceptions

XState reports exceptions thrown by observer callbacks outside the machine's
transition failure path. Profile 1 reports such exceptions synchronously to
the lifecycle or dispatch caller after notifying the remaining subscribers.
Because notification occurs after publication, a subscriber exception does
not roll back or fault the actor. See Snapshot subscriptions.

### XFC-CD-011: Initial-context factory boundary

Current XState v5 calls a lazy context initializer with an argument object that
can expose actor input, `self`, and spawning facilities, and materialises the
result through its context-assignment machinery. Profile 1 calls a
zero-argument factory and uses its returned object directly.

Actor input, child actors, and spawning are outside the Version 1 scope. The
smaller boundary avoids constructing an argument object and avoids an
additional shallow context copy on startup. Consequently, a Profile 1 factory
that needs external values must close over them, and the identity of its valid
returned object becomes the actor's initial context identity. See Initial
context factory.

### XFC-CD-012: Event wildcard scope

Current XState supports both the full `*` event wildcard and partial prefix
wildcards such as `sensor.*`. Profile 1 supports the full wildcard but rejects
partial wildcards and any other event descriptor containing `*`.

The full wildcard compiles to one distinguished fallback handler and requires
only one bounded check after exact candidates reject. Partial wildcards would
require prefix matching and additional specificity ordering during dispatch.
Applications requiring that grouping in Version 1 must declare the exact event
types or perform routing in an ordinary guard or action. See Event lookup.

### XFC-CD-013: Parameterless guard references

Current XState supports parameterised guard descriptors and built-in composite
guards including `and`, `or`, `not`, and `stateIn`. Profile 1 accepts direct
guard functions and parameterless named references, but does not expose guard
parameters or composite-guard helpers.

Equivalent application logic can be placed in one direct or named guard. This
avoids compiled parameter values, parameter-mapper callbacks, and a family of
built-in guard record types in Version 1. See Guard implementation binding.

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

Callbacks are invoked as functions without a meaningful receiver object. An
implementation that requires a particular `this` value MUST be supplied as a
bound function or through a wrapper function created by the application.

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

### Transition target grammar and resolution

Every state node MUST have one effective ID. The root effective ID is its
explicit `id`, or `(machine)` when the root `id` is omitted. A non-root state's
effective ID is its explicit `id` when supplied; otherwise it is the root
effective ID followed by the exact state-key path from the root. An explicit ID
on an ancestor names only that ancestor and MUST NOT replace the root-and-key
prefix used by its descendants' implicit IDs. Effective IDs MUST be built and
validated during construction.

Version 1 MUST accept the following XState target-string forms:

- A bare path such as `ChildB` identifies a sibling of the state on which the
  transition is declared. Resolution begins at that source state's parent.
- A dot-prefixed path such as `.ChildA` identifies a descendant of the state on
  which the transition is declared. Resolution begins at the source state.
- An ID-based path such as `#machineId.Outside` identifies a state by its ID and
  then follows any remaining descendant path from that state.

A path MAY contain multiple period-delimited state-key segments. State keys and
IDs are case-sensitive strings. Spaces and other valid Espruino string bytes
are significant and MUST be preserved exactly; implementations MUST NOT trim,
case-fold, or otherwise normalize them.

Construction MUST build the state-ID information needed by ID-based targets and
MUST reject duplicate IDs, an empty path segment, an unknown ID, an unknown
state key, or a target that does not resolve unambiguously to exactly one state.
The root machine's `id` participates in the same ID lookup as state-node IDs.
The root's default effective ID `(machine)` participates when no explicit root
ID was supplied.

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

The `actions` field uses the action grammar specified under Action definition
and resolution. The `guard` field uses the guard grammar specified under Guard
implementation binding. A candidate array MUST contain at least one candidate;
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
is reserved as `XFSM_INDEX_NONE`; valid table indexes therefore range from zero
through 65534 inclusive.

Each indexed native table or retained-JavaScript-value slot collection MUST
contain at most 65535 records. This limit applies independently to states,
symbols, handlers, transitions, guards, actions, assignments, retained values,
and any later indexed record kind. Construction MUST fail before publishing a
machine if a collection would require more than 65535 records or if a
relationship cannot be represented without the reserved value.

A record range MAY contain all 65535 records. An empty range MUST use
`first = XFSM_INDEX_NONE` and `count = 0`. Range validation and the calculation
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

Version 1 of the internal representation consists of the following contiguous
record tables and a byte-string pool:

- **State records** contain parent and resolved-initial-state indexes, normal
  handler range, completion-transition range, entry-action range, exit-action
  range, and state flags including whether the state is final.
- **Symbol records** contain a 32-bit hash, string-pool offset, byte length, and
  symbol flags. Repeated state and event names MUST be interned where practical.
- **Handler records** contain an event-symbol index or full-wildcard marker and
  the ordered range of candidate transitions declared for that event by one
  state.
- **Transition records** contain the resolved target-state index, guard-record
  index, transition-action range, and transition flags.
- **Guard records** contain a retained-JavaScript-value slot index and guard
  flags.
- **Action records** contain an action kind, a retained-JavaScript-value or
  assignment-record index, and action flags.
- **Assignment records** contain the indexes and flags required by the context
  assignment semantics specified later.

Ranges MUST be represented by a first-record index and record count. Records
owned by a state, handler, or transition MUST be contiguous and stored in their
defined execution order. Record fields MUST use fixed-width integer types and
MUST NOT depend on compiler pointer size. The C implementation MUST use
compile-time size assertions for every arena record type.

The exact meanings of action, guard, assignment, and transition flags will be
specified with their runtime semantics. New semantics MAY add record kinds or
fields by incrementing the private arena format version; they MUST NOT change
the public JavaScript API merely to expose this representation.

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

## Runtime Semantics

### Actor lifecycle

`createActor(machine)` MUST accept a successfully compiled Profile 1 machine
and return a distinct actor in the `notStarted` lifecycle state. Version 1 MUST
NOT accept a second actor-options argument. Restored snapshots, actor input,
actor-system membership, and child actors are outside the version 1 scope.

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
2. resolve the root and nested initial states;
3. execute initial entry actions in their specified order using the
   `xstate.init` event;
4. process generated completion transitions to stability; and
5. publish one stable `active` or `done` snapshot.

`start()` MUST return the actor. Calling it again while the actor is `active`
MUST be an idempotent no-op. A `done`, `stopped`, or faulted actor MUST NOT be
restartable; attempting to start one MUST fail synchronously. Applications
requiring another execution MUST create another actor.

The internal lifecycle states MUST be representable without JavaScript string
comparison and MUST distinguish `notStarted`, `active`, `done`, `stopped`, and
faulted. Their public snapshot spelling is specified under Stable snapshots.

Public `send(...)` is valid only while the actor is `active`. Sending before
startup MUST fail synchronously and MUST NOT queue the event. Sending after
normal completion or explicit stop MUST be an ignored no-op. Sending to a
faulted actor MUST fail synchronously under the fault-handling requirements.
`send(...)` MUST return `undefined` after any normally returning operation.

Calling `stop()` on a `notStarted` actor MUST move it directly to `stopped` and
publish and notify a stopped snapshot with undefined state and context, without
obtaining initial context or executing actions. Calling `stop()` on an `active`
actor MUST synchronously execute the exit actions of its complete active state
chain in leaf-to-root order using `{ type: "xstate.stop" }`, then publish and
notify a `stopped` snapshot. The retained state value and context are diagnostic
after stop and MUST NOT represent an active configuration.

Calling `stop()` on an actor already in `done` or `stopped` MUST be an
idempotent no-op. Calling it on a faulted actor MUST fail synchronously.
`stop()` MUST return the actor after a normally returning operation.

An actor MUST reject a public `start()`, `send(...)`, or `stop()` begun while
another lifecycle, dispatch, or subscriber-notification operation on that
actor is still in progress. Engine-generated completion processing is part of
the current operation and is not a re-entrant public call.

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

For an active top-level atomic state, `value` MUST be that state's exact key as
a string. For an active nested state, `value` MUST use the XState hierarchical
state-value shape: each active compound state contributes an object property
whose key is that state's exact key and whose value represents its active child.
The final child is represented by its key as a string. For example:

```javascript
"Outside"
{ Parent: "ChildA" }
{ Parent: { ChildA: "Grandchild" } }
```

Because Profile 1 excludes parallel states, each object level contains exactly
one active branch. State keys MUST NOT be split, trimmed, or otherwise
interpreted while constructing this value.

`matches(value)` MUST accept either a top-level state-key string or the same
nested object grammar. A string MUST match that exact active top-level key and,
when the key names a compound state, MUST match regardless of which descendant
is active. An object MUST perform a partial hierarchical match: every state key
and child value supplied by the caller must be active, while deeper active
descendants omitted by the caller are ignored. A string MUST NOT be parsed as a
period-delimited path.

A snapshot MUST describe only a stable, published result. It MUST NOT expose
an intermediate configuration from within completion processing. A snapshot
MUST NOT expose an `actions` array or any native execution-plan records.
Application data that must remain observable after actions finish MUST be
placed in context through `assign(...)`.

Published snapshot and context values MUST be treated as read-only by the
application. The engine is not required to freeze them or detect unsupported
mutation.

The actor's persistent native runtime representation MUST store the active leaf
index, context reference, and lifecycle status; it MUST NOT maintain a parallel
JavaScript object tree for the active hierarchy. Snapshot publication is a
semantic boundary and does not by itself require eager construction of a
JavaScript snapshot object.

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

`subscribe(listener)` MUST accept a JavaScript function and retain it as a
garbage-collector-visible value owned by the actor. It MUST return an object
with an idempotent `unsubscribe()` method. Multiple listeners MUST be supported
and notified in subscription order.

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
be rejected synchronously before transition selection, guard evaluation, or
action execution begins. An event type longer than 65535 bytes MUST be rejected
synchronously with `E_LIMIT_EXCEEDED` at the public boundary. Event types
beginning with `xstate.` or `@xstate.` are reserved for engine use and MUST be
rejected at the public `send(...)` boundary.

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
specified under Actor lifecycle and Snapshot subscriptions.

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

Entry, exit, and transition actions are three locations for the same action
definition grammar. In each location the machine definition MAY supply either
one action or an array of actions. Construction MUST normalise both forms to an
ordered native action range.

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
return MUST cause the engine to create a `TypeError`, fault that actor, execute
no initial entry action, and publish no active snapshot. This runtime check is
required because construction validates the factory's callability but cannot
validate its eventual result.

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
event object. Initial entry actions MUST receive `{ type: "xstate.init" }`.
Exit actions caused by explicitly stopping a runtime MUST receive
`{ type: "xstate.stop" }`.

Actions in the external-event microstep that enters a final state, including
that final state's entry actions, MUST receive the original event object.
Actions in a consequent completion microstep MUST receive that completed
state's generated completion-event object as specified under Final states and
completion transitions.

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

An `assign(...)` descriptor MUST occur directly in an entry, exit, or
transition action position. It MUST NOT be registered as an ordinary named
function in `options.actions`. `createMachine(...)` MUST reject an assignment
argument of any other form as a malformed action definition.

Every guard used to select a transition MUST be evaluated before any action of
that transition executes and MUST see the runtime's currently committed
context.

The engine MUST form the complete action sequence specified under Action
locations and ordering and process that sequence in order. An `assign(...)`
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
the engine MUST create a `TypeError` and apply the normal escaping-assignment
fault behaviour. If a property expression, property read, or merge operation
throws, the same behaviour applies. If the engine cannot allocate the pending
context, it MUST fault the actor with runtime category `E_NO_MEMORY`. In every
case, a previously published context MUST remain unchanged and external side
effects already completed cannot be reversed.

After the complete sequence succeeds, the engine MUST publish the resulting
context and target state configuration as the completed operation. Context
objects created during an incomplete operation MUST NOT replace the last
successfully published context.

### Action locations and ordering

Entry actions MUST execute whenever their state is actually entered. Initial
startup MUST execute entry actions from the highest entered state down to the
resolved initial leaf state. For later transitions, entered states MUST execute
their entry actions in ancestor-to-descendant order. Actions declared together
on one state MUST retain their declared order.

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
MUST fail synchronously and report that the runtime is faulted. The exact public
status and retained-error access are specified under Stable snapshots.

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

The canonical Profile 1 property is `reenter`, whose value MUST be boolean.
For construction-time migration of XState v4 definitions, Profile 1 MUST also
accept `internal` as an inverse alias: `internal: true` normalizes to
`reenter: false`, and `internal: false` normalizes to `reenter: true`. A
transition containing both properties MUST be rejected. The alias MUST have no
runtime representation or dispatch cost after normalization.

When neither property is present, `reenter` MUST default to `false`.

A targetless transition MUST preserve the complete active state configuration,
regardless of its `reenter` value. It MUST execute its transition actions
without executing state exit or entry actions.

A targeted transition to its own source state with `reenter: false` MUST
preserve that state and MUST NOT execute its exit or entry actions. With
`reenter: true`, it MUST exit and re-enter the source state, executing its exit
and entry actions around the transition actions.

A transition declared on a compound source state and targeting one of its
descendants MUST preserve the compound source when `reenter: false`. States
below the preserved source that are left MUST execute their exit actions, and
the targeted child state and its resolved initial descendants MUST be entered
even when that child was already active. With `reenter: true`, the compound
source itself MUST also be exited and re-entered.

A transition whose target lies outside its source state cannot preserve that
source. It MUST exit the source and every other state required by the hierarchy
regardless of the `reenter` value.

For every selected transition, transition actions MUST execute whether states
are re-entered, preserved, or the transition is targetless. Exit actions,
transition actions, and entry actions MUST retain their separately specified
ordering.

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
under Actor lifecycle.

The runtime MUST publish only the stable result of a successful
run-to-completion operation. If entering a nested final state immediately
enables a completion transition out of its parent, that final child is an
intermediate configuration and MUST NOT be published as a separate stable
snapshot. For the compatibility example, `send("finish")` therefore returns
with `Success`, not `Workflow.Completed`, as the stable state.

The engine MUST protect the device from an unbounded run-to-completion sequence.
One public `start()` or `send(...)` operation MAY execute at most 256
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

Further runtime semantics remain to be defined.

## Public Interfaces

The version 1 public naming surface MUST include `createMachine(...)`,
`createActor(...)`, and the supported `assign(...)` helper. `createActor(...)`
is the only version 1 name for creating a running instance; the XState v4
`interpret(...)` alias MUST NOT be provided.

Machine implementations MUST be supplied as the second argument to
`createMachine(config, options)`. Version 1 MUST NOT expose
`machine.provide(...)` or `machine.withConfig(...)`.

An actor MUST expose `start()`, `send(event)`, `stop()`, `getSnapshot()`, and
`subscribe(listener)` with the behaviour specified under Runtime Semantics.
The XState v4 `onTransition(...)` observer name MUST NOT be provided; Profile 1
uses the current `subscribe(...)` name. A snapshot MUST NOT expose the legacy
`state.actions` execution list.

Remaining helper signatures are still to be defined.

## Host Integration

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

Additional host-integration requirements remain to be defined.

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
activities, and output values.

Profile 1 defines the following narrow exceptions for inert output generated
by the examined Stately v4 and v5 exporters or accepted current XState
transition schema:

- root `predictableActionArguments: true` and `preserveActionOrder: true`;
- empty `services`, `actors`, and `delays` implementation maps; and
- empty `meta` objects in generated descriptors; and
- string `description` fields on transition descriptors.

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
property, unsupported feature, invalid initial state, invalid target, duplicate
ID, unresolved action, unresolved guard, representation limit, and allocation
failure. Their symbolic codes are:

```text
E_CONFIG_TYPE
E_UNKNOWN_PROPERTY
E_UNSUPPORTED_FEATURE
E_INITIAL_UNKNOWN
E_TARGET_UNKNOWN
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

To be defined.

## Design References

The following official documentation informs the requirements and compatibility
notes above but is not itself normative for Xstate-fsm-c.

### Espruino

- [Espruino Performance Notes](https://www.espruino.com/Performance)
- [Espruino Interpreter Internals](https://www.espruino.com/Internals)
- [Espruino Modules](https://www.espruino.com/Modules)
- [Espruino Feature List](https://www.espruino.com/Features)
- [Saving Code on Espruino](https://www.espruino.com/Saving)

### XState and SCXML

- [XState: Migrating from v4 to
  v5](https://stately.ai/docs/migration)
- [XState: Actors](https://stately.ai/docs/actors)
- [XState: Events and transitions](https://stately.ai/docs/transitions)
- [XState: Guards](https://stately.ai/docs/guards)
- [XState v5.33.2: Actor implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/createActor.ts)
- [XState v5.33.2: Machine initial-context implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/StateMachine.ts)
- [XState v5.33.2: Context-assignment implementation](https://github.com/statelyai/xstate/blob/xstate%405.33.2/packages/core/src/actions/assign.ts)
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

No individual design questions are currently recorded here. Broader unfinished
areas remain identified by their specification headings.
