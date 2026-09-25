# Linux Actor Runtime Vertical-Slice Report

## Scope

This report covers the M4 actor-execution slice over the hierarchical machine
subset delivered by M3. It does not claim final-state and completion-cascade
behaviour, the remaining Profile 1 grammar, resource qualification, or
physical-target conformance.

## Revisions

- XState-Espruino-Project evidence base: `7e7c591`
- Profile 1 specification: `0.48`
- Espruino implementation: `c6505437a`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Branch: `feature/xfsm-profile1`
- Result record:
  [`2026-09-25-actor-runtime.json`](../../tests/results/linux/2026-09-25-actor-runtime.json)

## Method

Linux Espruino was clean-built with `USE_XFSM=1`. The three M1-M3 regression
tests and three M4 tests exercised actor hosting, hierarchical execution,
runtime failures, and deterministic subscriptions:

```bash
make clean
make USE_XFSM=1 -j2
bin/espruino --test libs/xfsm/tests/test_shell.js
bin/espruino --test libs/xfsm/tests/test_compile.js
bin/espruino --test libs/xfsm/tests/test_diagnostics.js
bin/espruino --test libs/xfsm/tests/test_runtime.js
bin/espruino --test libs/xfsm/tests/test_runtime_errors.js
bin/espruino --test libs/xfsm/tests/test_subscriptions.js
```

The portable native-format sanitizer suite was rerun, and a separate clean
build without `USE_XFSM` checked that the library remains optional.

## Results

All six Espruino tests passed. Every test returned to zero retained memory
records after cleanup and garbage collection. The native suite again reported
`PASS 66 XFSM native checks` without an AddressSanitizer or
UndefinedBehaviorSanitizer finding. Clean enabled and disabled builds passed.

The representative actor entered `{ Parent: "ChildA" }`, evaluated two
ordered guard candidates, assigned context between two ordinary actions, and
moved to `{ Parent: "ChildB" }`. It then exercised a targetless transition, a
default non-reentering targeted self-transition, an explicit re-entering
self-transition, parent fallback to `Outside`, return through `Parent`'s
initial state, and explicit leaf-to-root stop exits. The reviewed trace checks
the exact exit, transition-action, entry, event, and context order.

Snapshots covered `notStarted`, `active`, `stopped`, and `error` status; XState
hierarchical values; partial `matches(...)`; context publication; unchanged
snapshot reuse; invalidation after state or context change; and retention of
the last stable state after a fault. Subscription tests covered stable-result
notification, unhandled events, removal before a listener's turn, additions
deferred to the next publication, explicit unsubscribe, automatic stop
removal, and continued notification after a listener throws.

Negative paths retained exact escaping JavaScript values, discarded pending
context and target state, removed faulted subscriptions, rejected same-actor
re-entry as `E_ACTOR_BUSY`, rejected invalid events and borrowed methods, and
kept a listener exception outside the actor fault path.

## Runtime Design

Compiled machines, actors, snapshots, and subscriptions carry private
interpreter-owned identity tokens. Shared native prototypes provide actor,
snapshot, and subscription methods without per-instance method allocation.
The actor owns a validated 16-byte native block and hidden GC-visible machine,
context, snapshot, fault, and subscription references.

Dispatch reads state, handler, transition, guard, action, assignment, and
symbol records directly from the M3 arena. Persistent runtime state is the
native lifecycle/leaf block plus the published context; no JavaScript mirror
of the active hierarchy or source configuration is consulted. Callback
results remain pending until the complete operation succeeds.

## Limitations And Decision

M4 deliberately stops at the M3 construction subset. In particular, final
states, `onDone`, generated completion events, and completion cascades remain
M6 work. The provisional 256-microstep field exists but cannot be meaningfully
validated until completion chains are implemented. Wildcard expansion and the
remaining accepted configuration forms likewise retain their later milestones.

This report records functional execution evidence, not MCU efficiency. Flash,
RAM, variable-block, stack, arena, and dispatch-time measurements remain M5,
as do the evidence-driven decisions on the arena layout and hierarchy and
microstep limits. Physical targets remain unverified.

The M4 exit gate is satisfied on Linux. Development may proceed to M5 resource
evaluation without freezing the provisional format or claiming full Profile 1
conformance.
