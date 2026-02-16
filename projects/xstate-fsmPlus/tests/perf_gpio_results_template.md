# FSMPlus GPIO Perf Results Template

Purpose: track before/after performance while implementing v15.3 work.

Harness:
- `examples/espruino_interactive/perf_gpio_bench.js`

External measurement:
- Logic analyzer on `PULSE_PIN` (event duration)
- Logic analyzer on `MARKER_PIN` (case boundaries)

Internal measurement:
- REPL console `AVG_US` summaries from harness

## Signal Interpretation

Expected signal shape and markers:

```text
MARKER_PIN: 1 pulse=CASE1, 2=CASE2, 3=CASE3, 4=CASE4, long pulse=end
PULSE_PIN : repeated per-event pulses; measure width `w` and gap `g`
```

Measurement definitions:

- `w`: pulse high width on `PULSE_PIN` (primary external per-event latency).
- `g`: low gap between pulses on `PULSE_PIN` (configured `GAP_MS` + loop overhead).

## Run Metadata

- Date:
- Branch / commit:
- Board:
- Espruino firmware:
- Upload mode (`espram` / `espboot` / storage):
- `WARMUP`:
- `ITER`:
- `GAP_MS`:
- Debug logging mode (on/off):

## Case Definitions

- `CASE1_NOOP`: unknown/no-op event path
- `CASE2_TARGETLESS`: targetless transition with action
- `CASE3_TARGETED_GO`: hierarchical targeted transition (`GO`)
- `CASE4_TARGETED_BACK`: hierarchical targeted transition (`BACK`)

## Results Table

| Run | Case | Internal AVG_US | External Pulse Avg (us) | External Pulse P95 (us) | Notes |
|-----|------|------------------|--------------------------|--------------------------|-------|
| Baseline | CASE1_NOOP | | | | |
| Baseline | CASE2_TARGETLESS | | | | |
| Baseline | CASE3_TARGETED_GO | | | | |
| Baseline | CASE4_TARGETED_BACK | | | | |
| After Change | CASE1_NOOP | | | | |
| After Change | CASE2_TARGETLESS | | | | |
| After Change | CASE3_TARGETED_GO | | | | |
| After Change | CASE4_TARGETED_BACK | | | | |

## Checklist

- Same board and firmware across comparisons.
- Same wiring and analyzer sample rate.
- Warm-up run completed before capture.
- At least 3 repeated captures and median reported.
- Debug logging disabled for performance captures.
