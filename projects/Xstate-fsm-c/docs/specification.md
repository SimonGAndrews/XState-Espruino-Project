# Xstate-fsm-c Specification

## Document Status

- Status: Initial design decisions in progress
- Version: 0.12
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

XState parallel state nodes and simultaneous activation of multiple state
regions are outside the version 1 scope. Construction MUST reject a machine
definition containing a parallel state rather than silently changing its
meaning.

The inclusion or exclusion of other XState features remains to be specified.

A previously compiled machine object is not a state-node configuration and
MUST NOT be accepted as a nested state. Running one machine from another would
require machine invocation or actor composition, which is outside the version
1 scope.

## Terminology

- **Machine definition**: The JavaScript object supplied to `createMachine`
  that describes states, transitions, guards, actions, and initial context.
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
Action exceptions and fault handling.

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
to action and guard implementations. Profile 1 instead calls these functions
with positional `(context, event)` arguments.

The smaller interface avoids constructing an argument object for every
callback, requires fewer property lookups, and does not require JavaScript
destructuring support. XState v5 callbacks must therefore be adapted before
they can be used as Profile 1 callbacks.

### XFC-CD-005: Construction-time implementation binding

XState supports deriving a differently provided machine with
`machine.provide(...)` (or `machine.withConfig(...)` in XState v4). Profile 1
binds implementations in `createMachine(config, options)` and compiles them
into fixed retained-value slots. It does not provide either rebinding method in
version 1.

Creating a machine with different implementations requires another
`createMachine(...)` call. This preserves the fixed-definition guarantee and
keeps rebinding and structural-sharing machinery out of the initial engine.

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
- resolve transition targets to known states;
- preserve the defined ordering of transition candidates; and
- reject invalid initial-state and transition-target references.

Normal event processing MUST operate on the preprocessed execution structures.
It MUST NOT search or traverse the original machine-definition object to
resolve states, parent relationships, initial states, or transition targets.

This requirement defines the logical information and behaviour expected of the
lookup structures. Their storage and lookup requirements are specified below.

### Transition target grammar and resolution

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

Every accepted target MUST be resolved to its native state index during
`createMachine`. The target string, its period-delimited path, and the state-ID
map MUST NOT be searched or parsed during event dispatch.

### Native indexed representation

After validation and preprocessing, the engine MUST store the fixed structural
and executable machine information in native C records.

Relationships between states, transitions, actions, guards, and other compiled
records MUST use numeric indexes rather than JavaScript property lookup or
runtime parsing of state paths. The native representation MUST include at
least:

- state records with parent and resolved initial-state relationships;
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

Construction MUST fail before publishing a machine if any table would require
more than 65535 records or if a relationship cannot be represented without the
reserved value.

Arena sizes, byte offsets, string-pool offsets, and event hashes MUST use
`uint32_t`. All size calculations MUST be checked for overflow before the arena
is allocated.

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

- **State records** contain parent and resolved-initial-state indexes, handler
  range, entry-action range, exit-action range, and state flags.
- **Symbol records** contain a 32-bit hash, string-pool offset, byte length, and
  symbol flags. Repeated state and event names MUST be interned where practical.
- **Handler records** contain an event-symbol index and the ordered range of
  candidate transitions declared for that event by one state.
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

For each active state considered by the transition-selection algorithm, the
engine MUST linearly scan that state's contiguous handler range. A hash match
MUST be confirmed by byte length and exact string comparison, so hash
collisions cannot select an incorrect handler.

Candidates belonging to a matching handler MUST be evaluated in their stored
order. If no candidate is selected, hierarchical fallback MUST continue by
following the state's numeric parent index; it MUST NOT search the source
machine definition or parse a state path.

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

A guard implementation MAY be supplied directly as a JavaScript function or
by a string name explicitly bound to a function in `options.guards`. A direct
function requires no `options.guards` entry. Construction MUST resolve, validate,
and retain each guard function and MUST reject an unresolved or non-function
guard implementation. Runtime transition selection MUST use the retained slot
and MUST NOT search the source definition, surrounding JavaScript scope, or
`options.guards`.

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
to a boolean using normal JavaScript truthiness. A guard's thrown exception and
the resulting runtime behaviour remain to be specified under validation and
fault handling.

### Literal initial context ownership

When the machine definition supplies a literal JavaScript object as `context`,
the compiled machine MUST retain that exact object through its
garbage-collector-visible reference container. It MUST use the object as a
shared initial context template and MUST NOT make a per-runtime copy during
startup.

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

The factory MUST be called exactly once for each new runtime instance, before
any initial entry action executes. Its returned value becomes that instance's
initial context. The engine MUST NOT call the factory during `createMachine`
and MUST NOT copy its result.

The factory is responsible for returning a fresh object graph when independent
context ownership is required. If application code deliberately returns an
object also returned for another runtime, those runtimes share that object; the
engine does not add automatic isolation. If the factory throws, runtime
initialisation MUST fail, no initial entry action may execute, and no partially
started runtime may be published.

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

### Context assignment and visibility

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
in the same assignment. After all property expressions have completed, their
partial update MUST be applied together.

Each successful `assign(...)` MUST produce a new shallow context object
containing the preceding context properties and that assignment's partial
update. It MUST NOT mutate a previously published context object. The new object
MUST remain pending until the complete action sequence succeeds.

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

### Action exceptions and fault handling

An exception that escapes from a user action or from an expression evaluated by
`assign(...)` MUST immediately abort the complete action sequence. No remaining
exit, transition, entry, or assignment action belonging to that operation may
execute.

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
error-access and status API remains to be specified.

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

### Native execution boundary

One public event-dispatch operation MUST enter the native coordinator once and
perform the complete native portion of that event's processing before it
returns. State and handler lookup, candidate selection, hierarchy traversal,
and state update MUST NOT be split into repeated JavaScript-to-C wrapper calls.

The coordinator MAY invoke JavaScript guards and actions when required by the
machine definition. Such callbacks do not end the enclosing dispatch
operation; control returns to the native coordinator so it can continue that
operation.

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

The exact actor lifecycle methods, snapshot shape, subscription behaviour, and
remaining helper signatures are still to be defined.

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

To be defined.

## Resource and Performance Requirements

The implementation MUST treat construction and steady-state dispatch as
separate performance profiles. Construction MAY perform validation, hashing,
counting, exact-sized allocation, and one optional defragmentation retry.
Steady-state structural dispatch MUST perform no native heap allocation and no
JavaScript collection construction.

Resource measurements MUST report at least:

- final compiled-arena bytes;
- retained JavaScript value count;
- total Espruino variable-block change caused by machine construction;
- peak variable-block usage during construction;
- per-runtime-instance variable-block change; and
- event-dispatch time for a local hit, parent fallback, guarded candidates,
  and an unhandled event.

Measurements MUST record `process.memory().blocksize`, because the size of an
Espruino variable-storage block varies between targets. Representative tests
MUST include a constrained target and MUST distinguish native structural cost
from time spent inside application-supplied JavaScript guards and actions.

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
- [XState: Migrating from v5 to v6
  alpha](https://dev.stately.ai/docs/xstate/v6/xstate-v5-to-v6)
- [Stately: Predictable events and actions in
  XState v5](https://dev.stately.ai/blog/2023-05-25-announcing-xstate-v5-beta)
- [XState: Context and lazy initial
  context](https://stately.ai/docs/context)
- [XState: Action errors and actor
  subscribers](https://stately.ai/docs/invoke#how-are-actors-different-from-actions)
- [W3C SCXML 1.0](https://www.w3.org/TR/scxml/)

## Open Questions

No individual design questions are currently recorded here. Broader unfinished
areas remain identified by their specification headings.
