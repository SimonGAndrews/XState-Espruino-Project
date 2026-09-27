# M7.2 Original ESP32 Memory And Serialization

## Purpose

This report records the second M7 physical integration slice on the original
ESP32 IDF5 target. It closes the target's planned production-firmware cleanup
accounting for shared, repeatedly constructed, and faulted runtime graphs, and
checks that Espruino timer work cannot interleave with a synchronous XFSM
operation sequence.

The machine-readable result is
[2026-09-27-m7-memory-serialization.json](../../tests/results/esp32-xtensa/2026-09-27-m7-memory-serialization.json).

## Configuration

| Item | Value |
| --- | --- |
| Target | Original ESP32, `ESP32_IDF5` |
| Processor | ESP32-D0WD-V3 revision 3.1, Xtensa LX6 |
| Firmware | Production XFSM image, Espruino `2v29.439` |
| Engine source | `1589218d30bcd761d1e323cd09b93187417a4797` |
| Implementation base | `21154897f3c5a76864989ade0c5ac959e35bd8f7` |
| Physical test revision | `b7b6d88d79ab8602574f1551804bd1baa672f96f` |
| Memory test | `libs/xfsm/tests/test_host_memory_cleanup.js` |
| Serialization test | `libs/xfsm/tests/test_host_event_serialization.js` |
| Transport | Paced direct serial at 115200 baud |

Both fixtures use normal production APIs. The image exposes neither private
measurement helpers nor the deterministic allocation-fault seam.

## Memory Lifecycle

The fixture first exercises one ordinary actor and one faulted actor so shared
prototypes and the relevant interpreter paths exist before measurement. It then
creates eight actors over one compiled machine. Every actor owns an isolated
factory context, registers a subscription, starts, executes a guarded and
assigning transition, survives an explicit garbage-collection request, handles
a further event, stops, and unsubscribes.

The first full multi-actor path established a repeatable eight-block increase
over the smaller pre-stress warm-up. That 112-byte difference is recorded
explicitly rather than treated as reclaimed application memory. A second full
eight-actor graph, six subsequent create/start/send/stop/release cycles, and a
faulted actor all returned exactly to the resulting 1,819-block settled
baseline.

| Measurement | JsVar blocks | Bytes at 14 bytes/block |
| --- | ---: | ---: |
| Pre-stress warm-up | 1,811 | 25,354 |
| Settled baseline | 1,819 | 25,466 |
| Sampled live eight-actor graph | 2,309 | 32,326 |
| Free at sampled live point | 494 | 6,916 |
| Second shared-graph cleanup | 1,819 | 25,466 |
| Maximum after six cleanup cycles | 1,819 | 25,466 |
| Faulted-graph cleanup | 1,819 | 25,466 |
| Final usage | 1,819 | 25,466 |

The live sample used 82.376% of the 2,803-block pool and left 17.624% free.
These values include the uploaded test program and are qualification evidence
for this fixture, not a general per-actor sizing formula. Both final-source
runs produced identical results.

Early fixture-development runs compared cleanup with a baseline taken before
later test-scope and full-path lazy state existed. They consequently reported
stable 12-block and then 8-block deltas. Those were harness-baseline failures,
not state-machine behavioral failures. The final test records the one-time
full-path difference and proves non-accumulation by repeating the same complete
graph before testing the additional normal and fault paths.

## Event Serialization

The second fixture starts an actor, schedules a one-millisecond Espruino timer,
and then performs 128 synchronous targetless sends. Each send assigns a new
context and publishes a snapshot. The send sequence took 666.302 ms and
669.998 ms in the two runs, far longer than the one-millisecond timer delay.
The timer callback nevertheless ran only after the loop completed, observed
count 128, and observed all 129 notifications: one for startup and one for
every send.

This directly exercises the specified host boundary. Timer work may become
pending while JavaScript is busy, but it does not run inside an XFSM operation
or between operations in the same uninterrupted JavaScript call. Both runs
passed with the same counts.

## Conclusion

M7.2 passes for the original ESP32. The target now has repeatable physical
evidence for shared-machine stress, live-graph relocation, ordinary and faulted
graph cleanup, non-accumulating repeated construction, and queued timer
serialization. The target remains `Build verified`: product headroom for the
action-heavy maximum-depth use case, physical allocation-pressure closure, and
the final release-candidate regression remain open.
