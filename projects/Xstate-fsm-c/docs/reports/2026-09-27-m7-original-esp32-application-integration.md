# M7.1 Original ESP32 Application Integration

## Purpose

This report records the first M7 physical application-integration slice on the
original ESP32 IDF5 target. It tests the callback sources and host facilities a
real Espruino state-machine application is expected to combine. It does not by
itself advance the target from `Build verified` to `Conformance verified`.

The machine-readable result is
[2026-09-27-m7-application-integration.json](../../tests/results/esp32-xtensa/2026-09-27-m7-application-integration.json).

## Configuration

| Item | Value |
| --- | --- |
| Target | Original ESP32, `ESP32_IDF5` |
| Processor | ESP32-D0WD-V3 revision 3.1, Xtensa LX6 |
| Firmware | Production XFSM image, Espruino `2v29.439` |
| Engine source | `1589218d30bcd761d1e323cd09b93187417a4797` |
| Physical test revision | `21154897f3c5a76864989ade0c5ac959e35bd8f7` |
| Test | `libs/xfsm/tests/test_host_application.js` |
| Test SHA-256 | `be729898697299522e8ee4fec2c28d2c7919da8827a30d21b9e69865a363c4d0` |
| Transport | Paced direct serial at 115200 baud |
| Physical output | Board `LED1`, GPIO2 |

The production image exposes neither the private measurement API nor the
allocation-fault seam.

## Application Shape

The test writes a small JavaScript module into Espruino `Storage`, loads its
guard and action exports with `require()`, and binds them explicitly through
the second `createMachine()` argument. The same machine also binds:

- an ordinary outer-scope action;
- a closure with retained lexical state;
- the native `Boolean` function as a guard; and
- `digitalWrite` bound to `LED1` high and low as native actions.

After compilation, the source configuration, implementation map, module-cache
entry, and direct application references to the callbacks are discarded. A
garbage-collection request precedes actor execution. The stored module remains
present while its live functions are in use, as required by the specification.
Source inspection confirms the physical backing: `jswrap_require()` reads the
file with `jsfReadFile()`, the memory-mapped ESP32 path returns a native string
over flash, and Espruino's parser retains native substrings for function bodies
parsed from that source.

The first event enters `Active` and drives GPIO2 high. A `setTimeout` callback
then sends the second event, which exits `Active`, drives GPIO2 low, runs the
flash-backed action, commits `Done`, and publishes its snapshot. Finally, a
flash-backed action throws an application object so exact exception identity
and rollback to the stable `Done` state can be checked.

## Result

The application test passed 13 checks twice with the same ordered trace:

```text
sub:Idle|nativeGuard|sub:Idle|outer:3|closure:3|flash:3|pinHigh:1|
sub:Active|timerBefore|pinLow:0|flash:7|sub:Done|timerAfter|flashFail
```

The trace proves that native GPIO effects are visible to the following action,
that the timer's JavaScript callback enters and returns from synchronous
`actor.send()`, and that publication occurs only after the operation reaches a
stable state. The thrown flash-module object was retained as the actor error,
and state and context remained at their preceding stable values.

Each run removed the temporary Storage file and module-cache entry and left
GPIO2 low. A subsequent `test_shell.js` run passed. Initial and final test
process usage was 1,236 and 427 JsVar blocks respectively; those figures
include changing uploaded-source and parser lifetime and are evidence of
cleanup context, not a standalone zero-leak measurement.

## Interrupt Boundary

Static inspection confirms that runtime actor operations are private static
callables installed on Espruino-owned prototypes. Production JavaScript exposes
only `createMachine`, `createActor`, and `assign`; XFSM contains no ISR, native
task, mutex, atomic, mailbox, or host-event-queue entry path. The physical timer
test therefore uses the specified boundary: Espruino dispatches an ordinary
JavaScript callback, and that callback calls `actor.send()`.

Calling the private coordinator from an ISR is prohibited by design and is not
a meaningful dynamic success test. Same-actor synchronous re-entry remains
covered by the existing lifecycle suites.

## Conclusion

M7.1 passes for the original ESP32. The evidence closes the currently planned
flash-backed/native callback, representative pin, timer-ingress, callback
exception, and cleanup slice on this target. Full original-ESP32 M7
qualification still requires the final product-profile decision, remaining
physical allocation/cleanup review, and release-candidate rerun. Other target
families require their own evidence.
