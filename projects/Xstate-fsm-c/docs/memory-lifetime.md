# XFSM Memory Lifetime

This document complements the [memory ownership diagram](memory-ownership.md)
by showing when XFSM memory is created, used, retained, or made eligible for
collection. It is a conceptual lifecycle view rather than a timing diagram.

The sequence below shows when the groups in the companion ownership diagram
are created, used, retained, or made eligible for collection. It describes one
machine and actor; additional actors repeat the per-actor portion while
retaining the same shared machine.

```mermaid
sequenceDiagram
  autonumber
  participant A as Application JavaScript
  participant H as Espruino host and GC
  participant X as XFSM native code in firmware
  participant J as GC-managed JsVar pool
  participant S as Native C stack
  participant F as Persistent Storage / flash

  Note over A,F: Module loading and application definition
  A->>X: require("XFSM")
  X-->>A: createMachine, createActor and assign API
  A->>J: Build application-owned configuration and options graph

  Note over A,F: createMachine - transactional construction
  A->>X: createMachine(configuration, options)
  X->>S: Enter compiler call frames
  activate S
  S->>J: Lock inputs and allocate temporary compiler workspace
  S->>J: Validate and count records and string bytes
  S->>J: Allocate and populate exact-sized arena and retained values
  alt Construction succeeds
    S->>J: Publish machine with hidden arena and retained-value children
    S->>J: Release workspace and all temporary locks
    X-->>A: Return opaque compiled machine
  else Validation or allocation fails
    S->>J: Release workspace, partial outputs and all temporary locks
    X-->>A: Throw without publishing a partial machine
  end
  deactivate S
  A->>J: Source configuration may become unreachable
  H->>J: GC may reclaim source structure not explicitly retained
  Note over J: Retained callbacks, literal context and closure environments remain reachable through the machine

  Note over A,F: createActor - persistent per-instance graph
  A->>X: createActor(machine)
  X->>J: Allocate actor, native block and hidden machine reference
  X-->>A: Return actor in notStarted state
  Note over A,J: No context factory, guard, action or completion processing runs during createActor

  Note over A,F: start, send or stop - one synchronous run-to-completion operation
  A->>X: start(), send(event) or stop()
  X->>S: Check stack reserve and enter independent coordinator frame
  Note over X,S: Insufficient reserve throws before the actor is marked busy or changed
  activate S
  S->>J: Lock actor, machine and arena for the call
  S->>J: Materialize event and temporary pending values as required
  loop Selected event and completion microsteps
    S->>J: Read arena records by bounded index and offset
    S->>J: Invoke retained guards, assignments and actions
    J-->>S: Return callback values or propagate an exception
    S->>J: Prepare pending state, context and publication snapshot
  end
  alt Operation reaches a stable result
    S->>J: Commit state, context and cached snapshot
    S->>J: Notify current subscribers synchronously
    Note over A,J: Listener errors do not roll back an already committed stable result
    S->>J: Release event, pending values, notification copy and locks
    S->>J: Set actor operation back to idle
    X-->>A: Return normally, subject to the specified listener-error result
  else Context factory, guard, action, assignment or pre-commit allocation fails
    S->>J: Discard pending state, context and snapshot values
    S->>J: Preserve last stable state and context and retain exact fault
    S->>J: Mark actor faulted and remove subscriptions without notification
    S->>J: Release transient values and locks
    S->>J: Set actor operation back to idle
    X-->>A: Throw the application value or XFSM error
  end
  deactivate S
  Note over A,S: XFSM rolls back its pending state and context, not external side effects already performed by application actions

  opt Snapshot access between operations
    A->>X: getSnapshot()
    X->>J: Return cached stable snapshot or allocate it lazily
    J-->>A: Return immutable observation object
    Note over A,J: Cache identity is reused until state, context or lifecycle status changes, while older snapshots remain unchanged
  end

  Note over A,F: Stable interval, collection and hibernation
  Note over S: No coordinator frame, arena pointer or JsVar lock survives between calls
  H->>J: GC may relocate live values and reclaim unreachable values
  opt Application requests save()
    A->>H: Request whole-interpreter save
    H->>H: Defer until interpreter and actor operations are idle
    H->>F: Serialize stable reachable JsVar object graph
    F-->>H: Restore only with a compatible identical firmware image
    H->>J: Recreate the saved machine and actor graph
    Note over A,J: Restoration executes no entry, exit or completion actions and sends no notifications
  end

  Note over A,F: Terminal state and final reclamation
  opt Actor reaches done or is stopped successfully
    X->>J: Retain terminal snapshot and diagnostic context while actor is reachable
    X->>J: Release active subscription registrations and operation transients
  end
  A->>J: Drop application actor reference
  H->>J: GC reclaims actor graph when no other reference remains
  Note over J: The actor's hidden machine reference keeps the shared machine alive until the actor is reclaimed
  A->>J: Drop final machine and actor references
  H->>J: GC reclaims machine, arena and retained-value container
  H->>J: Reclaim callbacks and closure data that have no other owners
```

The lifetime boundaries carry several consequences:

- Machine construction is atomic from application JavaScript's perspective.
  A failed `createMachine()` leaves neither an executable partial arena nor a
  published machine object.
- The source definition and compiler workspace may occupy the JsVar pool at the
  same time as the new arena. After successful construction, source structure
  is unnecessary unless the application retains it independently.
- An actor retains its machine, so discarding the application's direct machine
  reference does not release the arena while any actor remains reachable.
- Each public actor operation owns its coordinator frame, arena lock, event,
  pending state, pending context, and publication working values only until the
  synchronous call finishes. A nested call on another actor receives an
  independent frame; a nested call on the same busy actor is rejected.
- Runtime rollback applies to XFSM's pending state and context. It cannot undo
  GPIO changes, output, Storage writes, network activity, or other effects
  already performed by an action.
- Stable snapshots may remain cached between calls. Operation-local events,
  pending values, arena pointers, notification copies, and coordinator frames
  may not.
- GC and `save()` observe only ordinary reachable Espruino objects. Relocation
  is safe because persistent native records contain indexes and offsets rather
  than JavaScript or arena pointers.
