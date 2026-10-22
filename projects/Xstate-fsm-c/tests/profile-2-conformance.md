# Profile 2 Conformance Record

## Status

- Status: Complete for qualified Profile 2 revision `6f4214534`; current public
  revision is Linux regression verified pending target repetition
- Profile authority: [Profile 2 specification](../docs/specification-profile-2.md)
- Profile 1 base: version 0.52, 704 applicable requirements passing and three
  requirements classified not applicable
- Profile 2 addition: `HIST-001` through `HIST-018`
- Qualified implementation: `6f42145347d8f4018b2a1ec221b3834bf9561a24`
- Public implementation: `55f45513f1e0024bd032d4bcc506c3573067fc57`
  (official upstream through `3b5c8d97f`, plus the required string-comparison
  API adaptation)

## Composition

Profile 2 retains the frozen Profile 1 requirement registry, mapping, and
aggregate conformance matrix. The only base-text overrides are the three
history exclusions identified by the Profile 2 specification. Their remaining
excluded-feature obligations continue to apply; accepted history declarations
are instead governed by the history requirements and cases below.

This keeps the published Profile 1 identifiers stable. It also avoids
misrepresenting Profile 2 as a fresh, unreviewed copy of the 707-unit base
contract.

## Added Cases

The Profile 2-level requirements map as follows:

| Requirement | Coverage | Status |
| --- | --- | --- |
| `P2-001` | Completed Profile 1 audit plus the twelve history cases below, with the three explicit history overrides | Pass |
| `P2-002` | `XFC-HIST-FORMAT-001`, 96 native checks, cross-architecture builds and physical ESP32 validation | Pass |
| `P2-003` | Exact `6f4214534` MDBT42Q capacity build and recorded 1,408-byte release constraint | Pass |
| `P2-004` | Profile-versioning rule recorded for later governance; no current runtime behavior | Not applicable |

| Case | Profile 2 coverage | Evidence | Status |
| --- | --- | --- | --- |
| `XFC-HIST-REF-001` | XState-compatible shallow history | Pinned XState 5.33.2 eight-scenario runner | Pass |
| `XFC-HIST-DEEP-REF-001` | XState-compatible deep history | Pinned XState 5.33.2 five-group runner | Pass |
| `XFC-HIST-CONFIG-001` | Grammar, placement, target resolution, strict rejection and paths | Linux plus target-sized original-ESP32 and C3 suites | Pass |
| `XFC-HIST-RUNTIME-001` | Latest-child restoration and action order | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-SHALLOW-001` | Immediate-child restoration and normal initial descent | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-DEEP-001` | Exact leaf, nested owners, descendant fallback, completion and rollback | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-FALLBACK-001` | Normal initial and explicit first-use fallback | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-ACTOR-001` | Actor isolation, transactional rollback and cleanup | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-FINAL-001` | Remembered final state and immediate completion | Linux, original ESP32 and C3 | Pass |
| `XFC-HIST-HOST-001` | Stop, whole-interpreter save/restoration and reset | Linux stop plus original-ESP32 and C3 physical lifecycle | Pass |
| `XFC-HIST-FORMAT-001` | Frozen Format Version 2 layout and corruption rejection | 96 sanitizer-backed native checks | Pass |
| `XFC-HIST-RESOURCE-001` | Flash, arena, actor RAM, construction, stack and timing | Linux, original-ESP32 and C3 measurements; Pico/MDBT42Q capacity builds | Pass |

The detailed requirement-to-case association remains in the
[history-state requirements](../docs/extensions/history-states.md#conformance-evidence).
Profile 1 requirement-level traceability remains in the
[normative audit](normative-audit.md) and its machine-readable registry and
mapping.

## Target Status

| Target profile | Profile 2 status | Basis |
| --- | --- | --- |
| Linux reference build | Conformance verified | 26 JavaScript suites, both pinned history runners, 96 sanitizer checks, static audit and resource scaling |
| Original ESP32 IDF5 | Conformance verified | Exact optimized production and instrumented physical rerun |
| ESP32-C3 IDF5 | Conformance verified | Exact optimized production and instrumented physical rerun |
| Espruino Pico reduced profile | Build verified | Exact Profile 2 candidate fits with 11,024 bytes free; Profile 2 history runtime not repeated physically |
| MDBT42Q constrained Bluetooth profile | Build verified | Exact Profile 2 candidate fits with 1,408 bytes before Storage; Profile 2 history runtime not repeated physically |

The Pico and MDBT42Q retain their completed Profile 1 Conformance verified
status. Their Profile 2 rows may advance only after the target-sized shallow
and deep history, diagnostics, lifecycle, and production-private-API checks
run on the exact released Profile 2 candidate.

## Evidence

- [Shallow-history physical qualification](../docs/reports/2026-10-20-shallow-history-physical-qualification.md)
- [Deep-history qualification](../docs/reports/2026-10-20-deep-history-qualification.md)
- [History integration optimization](../docs/reports/2026-10-21-history-integration-optimization.md)
- [Exact-candidate promotion rerun](../docs/reports/2026-10-21-history-promotion-rerun.md)

The exact-candidate rerun is the release evidence for implementation revision
`6f4214534`. Earlier reports remain supporting development and differential
evidence rather than replacing that final result.
