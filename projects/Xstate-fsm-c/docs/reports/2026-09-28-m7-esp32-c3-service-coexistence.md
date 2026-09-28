# ESP32-C3 Wireless-Service Coexistence

Date: 2026-09-28

## Purpose

This report closes the C3-C loaded-service qualification defined by the
implementation plan. It tests the selected stock `ESP32C3_IDF5` profile with
its 70,000-byte native-heap reserve while XFSM, BLE, WiFi, and HTTPS/TLS are
active together. Exact revisions and per-run measurements are retained in the
[machine-readable result](../../tests/results/esp32-riscv/2026-09-28-m7-service-coexistence.json).

## Bench And Workload

The ESP32-C3 ran `ESP32C3_IDF5` `2v29.444` from XFSM engine revision
`cb5d74e89`. A classic ESP32 running the matching revision acted as the BLE
GATT central. The host was connected to the `SHED` 2.4 GHz network at
`192.168.50.101` and served a run-specific 744-byte response from a controlled
TLS 1.2 endpoint. Credentials were injected with REPL echo disabled and were
not retained in the results.

The preloaded XFSM actor coordinated five external events from BLE connection
through final confirmation. Its machine also contained a 24-level hierarchy.
On `HTTPS_COMPLETE`, the actor entered that branch and returned through a
synthetic `DEPTH_DONE` event, executing 49 checked entry, transition, and exit
actions. The expected result was five ordered context updates, seven stable
snapshot publications including start and the synthetic event, and terminal
state `Complete`.

The service role was transferred to a temporary Espruino `Storage` file,
checked for exact length and CRC-32, and evaluated after the actor was
compiled. Directly pasting the larger role makes the REPL parser's transient
source representation overlap the retained actor. Storage transport isolates
that test-loading cost from runtime coexistence; the runner erased the file
during cleanup.

## Results

An initial reversed-role run without XFSM passed, confirming the C3 BLE
peripheral, WiFi station, HTTPS client, classic-ESP32 central, and host endpoint
before the state-machine workload was added. Four consecutive XFSM runs then
passed:

| Run | Target checks | Peer checks | Native minimum heap | Cleanup native heap | Cleanup JsVars |
| --- | ---: | ---: | ---: | ---: | ---: |
| `20260928T085853Z` | 11 | 7 | 40,624 bytes | 58,312 bytes | 460 |
| `20260928T085946Z` | 11 | 7 | 40,580 bytes | 58,332 bytes | 460 |
| `20260928T090045Z` | 11 | 7 | 40,480 bytes | 58,316 bytes | 460 |
| `20260928T090952Z` | 11 | 7 | 40,600 bytes | 58,336 bytes | 460 |

Every run observed exactly one host HTTPS request, status 200, and 744 response
bytes. The GATT central read and wrote before HTTPS, retained its connection
through the TLS operation, and wrote the final confirmation afterwards. XFSM
reported the exact trace
`BLE_CONNECTED:1|GATT_ACK:2|WIFI_CONNECTED:3|HTTPS_COMPLETE:4|BLE_CONFIRMED:5`,
`depthTransition:true`, and terminal status `done`.

The compiled actor reported 1,520 of 3,027 JsVars used before the service role
was loaded. Runtime sampling peaked at 1,125 used blocks. The lowest native
heap observation was 40,480 bytes, and the smallest reported largest free
block was 43,008 bytes. These figures leave useful margin in both managed and
native memory for the tested workload.

## Capacity Boundary

The existing direct and Storage-backed standalone fixtures still pass the
Profile 1 maximum depth of 32 with 65 ordered actions. A combined machine
containing that same depth plus the six service-coordinator states did not fit
the C3 JsVar pool and returned `E_NO_MEMORY` during `createMachine`, before any
radio-service execution. The depth-24 combined fixture passed.

This does not revise the Profile 1 depth-32 limit: individual conforming
machines at that limit remain supported. It records that maximum structural
limits cannot all be combined with an arbitrary application graph on a finite
heap. Depth 24 is the tested coexistence workload, not a measured maximum for
combined machines.

## Decision

Retain the stock 70 KB native-heap reserve. The tested ESP32-C3 profile can run
XFSM while BLE GATT, WiFi association, and TLS 1.2 HTTPS are active together,
without the 65 KB diagnostic override or removal of board features. C3-C is
complete; the target remains `Build verified` until its remaining portable
coverage and C3-D release-candidate rerun are complete.
