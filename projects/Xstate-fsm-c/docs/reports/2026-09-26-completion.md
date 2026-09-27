# Final-State And Completion Evidence

## Scope

This report records the first implementation and physical evidence for Profile
1 final states, compound-state `onDone` transitions, completion cascades, and
the fixed 256-microstep boundary. It closes the completion-chain evidence gap
identified by the first M5 report; it does not close the separate constrained-
target evidence gate.

## Revisions And Method

- XState-Espruino-Project base: `525a414e5b18cb5a1666defb145e97ad536ada9f`
- Profile 1 specification: `0.49`
- Espruino implementation base: `4d4ef00b904e33618d2c75cf427d1d9af4b3292b`
- Official Espruino base: `84c190da7feb10a976d7ca422be39adaa10fb3c2`
- Pinned differential reference: `xstate@5.33.2`
- Linux result: [completion result](../../tests/results/linux/2026-09-26-completion.json)
- Original ESP32 result: [physical completion result](../../tests/results/esp32-xtensa/2026-09-26-completion.json)

The implementation and evidence changes were still uncommitted when the runs
were recorded, so the result files identify the exact committed base and the
working-tree candidate state. The Linux build used GCC 13.3.0. The original
ESP32 used `ESP32_IDF5`, ESP-IDF 5.5.3, and Xtensa GCC 14.2.0.

## Behavioural Results

Eight Espruino JavaScript suites passed on Linux and on the physical original
ESP32. The focused completion suites cover:

- the Stately editor workflow/final/`onDone` example and exact action order;
- `xstate.done.state.<effective-id>` callback events;
- ordered `assign(...)` within a completion transition;
- a targetless `onDone` offered only once per completion occurrence;
- a two-ancestor completion cascade completed before publication;
- a machine whose initial top-level state is final;
- terminal exit actions, `done` publication, and automatic unsubscription;
- the successful 256th microstep; and
- rejection before the 257th microstep with the last stable state and context
  retained.

The workflow, nested cascade, and initially-final action traces match the
pinned XState 5.33.2 reference exactly. Linux also returned to zero retained
memory records after each semantic and measurement suite. The portable native
format suite retained all 66 sanitizer checks.

## Completion Timing

Five trials produced these medians:

| Target | 256-step chain | Attempted-limit path | Maximum sampled stack |
| --- | ---: | ---: | ---: |
| Linux Espruino | 18.490 ms | 18.094 ms | 672 bytes |
| Original ESP32 IDF5 | 763.553 ms | 738.181 ms | 448 bytes |

The boundary machine's native arena is 432 bytes. Its external `GO` transition
and 255 selected completion transitions total 256 microsteps and leave context
`count` at 255. The unlimited variant attempts a 257th step and reports:

```text
XFC E_MICROSTEP_LIMIT @ actor.send: max=256
```

No action belonging to that rejected step executes. The faulted snapshot
retains the pre-send `Idle` state and original context by identity.

## Decisions

The Version 1 budget remains 256 microsteps. It provides the specified hard
bound and completes without a reset or watchdog failure on the representative
ESP32, although an application using hundreds of JavaScript-assisted
completion transitions should treat the measured approximately 0.76-second
synchronous operation as a deliberate worst case rather than normal control
flow.

The private default coordinator reserve increases from 512 to 768 bytes, plus
Espruino's separate 512-byte safety allowance. This exceeds the 672-byte Linux
and 448-byte ESP32 measurements while retaining a modest margin. Remaining
physical families still require their own stack evidence.

The normal ESP32 image is 1,521,168 bytes and leaves 526,832 bytes in its app
partition. It was restored after measurement, all eight suites passed again,
and the measurement-only API was confirmed absent.
