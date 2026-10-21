# History Promotion Rerun

Date: 2026-10-21

## Purpose

This report records the final physical and constrained-target rerun of the
optimized shallow/deep-history candidate. It closes the target-validation
question raised during the review of whether history is ready for promotion
from an experimental extension into a public XFSM profile.

Machine-readable evidence is recorded for the
[original ESP32](../../tests/results/esp32-xtensa/2026-10-21-history-promotion-rerun.json),
[ESP32-C3](../../tests/results/esp32-riscv/2026-10-21-history-promotion-rerun.json),
[Pico](../../tests/results/pico/2026-10-21-history-capacity.json), and
[MDBT42Q](../../tests/results/mdbt42q/2026-10-21-history-capacity.json).

## Candidate

| Item | Value |
| --- | --- |
| Project branch and revision | `experiment/xfsm-history` at `2778396b75821848e611303b120a555406a2e9c6` |
| Implementation branch and revision | `experiment/xfsm-history` at `6f42145347d8f4018b2a1ec221b3834bf9561a24` |
| Runtime | Espruino `2v29.459`, reported commit `6f4214534` |
| Toolchains | ESP-IDF 5.5.3 GCC 14.2.0; ARM GNU Toolchain 13.2.Rel1 |
| Native format | Experimental Version 2 |

Both repositories were clean before the run. The two ESP32 targets used their
stock full-feature IDF5 profiles with `RELEASE=1 USE_XFSM=1` and no
`SETDEFINES` override.

## Production Physical Rerun

The normal production image was built, flashed, and hash-verified on each
board. Both reported the intended board, runtime version, and implementation
commit.

| Check | Original ESP32 | ESP32-C3 |
| --- | --- | --- |
| Target-sized shallow/lazy-bank suite | Pass | Pass |
| Deep-history suite | Pass | Pass |
| History diagnostics | Pass | Pass |
| Compact strict/private validation | Pass | Pass |
| Save and hard-reboot restoration | Pass | Pass |
| Reset without synthetic exit | Pass | Pass |
| Saved image erased | Pass | Pass |
| Production image | 1,527,840 bytes | 1,718,000 bytes |
| Free application partition | 520,160 bytes (25%) | 330,000 bytes (16%) |

The target-sized suite includes the post-optimization invariants: unhandled
and within-owner transitions do not switch the history bank, while exiting a
history owner does. Save/reboot restored the exact remembered deep leaf without
replaying actions or notifications. The original ESP32 saved 39,284
interpreter bytes as 9,759 bytes; the C3 saved 39,351 bytes as 9,627 bytes.

## Instrumented Resource Rerun

Each board was temporarily flashed with `XFC_MEASURE=1`, measured, and then
restored to the normal production image. Compact validation passed after
restoration and confirmed that `_measure` and `_failNext` were absent.

| Measurement | Original ESP32 shallow/deep | ESP32-C3 shallow/deep |
| --- | ---: | ---: |
| Arena bytes | 660 / 660 | 660 / 660 |
| Persistent machine blocks | 99 / 99 | 104 / 104 |
| Construction peak blocks | 168 / 168 | 174 / 174 |
| Persistent actor blocks | 16 / 16 | 16 / 16 |
| Actor native bytes | 20 / 20 | 20 / 20 |
| Restore temporary blocks | 2 / 2 | 2 / 2 |
| Restore coordinator stack | 304 / 224 bytes | 336 / 256 bytes |

The compiler optimization reduces the matched construction peak by one block
on each physical target. Actor storage, restore temporary allocation, and
coordinator stack are unchanged from the earlier qualified candidate.

Production firmware timed 500 exit/restore pairs:

| Target | Shallow | Deep | Deep minus shallow |
| --- | ---: | ---: | ---: |
| Original ESP32 | 2,655.284 us | 2,649.858 us | -5.426 us |
| ESP32-C3 | 3,414.696 us | 3,401.566 us | -13.130 us |

The small differences remain operational noise rather than evidence of a
mode-dependent cost. Deep history has no practical dispatch penalty.

## Constrained Target Capacity

The established optional product profiles were rebuilt at the same candidate:

| Target and profile | Result | Current size | Remaining capacity |
| --- | --- | ---: | ---: |
| Pico reduced profile | Pass | 316,656 bytes | 11,024 bytes |
| MDBT42Q constrained Bluetooth profile | Pass | 313,832 bytes before Storage | 1,408 bytes |

The Pico retains useful headroom. MDBT42Q still fits, but its margin is narrow
and MUST be rechecked after any XFSM or upstream Espruino growth. This remains
an explicit optional profile rather than a proposed stock-board change.

## Outcome

The exact optimized candidate passes physical semantics, diagnostics,
transactional history behavior, save/restoration, lifecycle cleanup, private
format validation, resource measurement, and production timing on Xtensa and
RISC-V. It also builds within both qualified constrained ARM product profiles.

The technical promotion gate is complete. Accepting history into a public
profile remains a specification-governance and branch-integration decision;
there is no remaining implementation, conformance, resource, or target-fit
failure blocking that decision.
