# GH01 Schematic Validation Record (Template)

Project:
- `hardware/GH01/kicad/GH01_heater_control_01/GH01_heater_control.kicad_pro`

Hardware source of truth:
- `hardware/GH01/GH01_hardware.md`

Connection matrix:
- `hardware/GH01/kicad/GH01_heater_control_01/GH01_connection_matrix.md`

## Revision Metadata

- Date:
- Iteration marker text in schematic:
- Editor/environment (KiCad version + OS):
- Validator:

## Method Used

1. Export/read KiCad connectivity (net-level source).
2. Normalize to `Net -> {Ref:Pin...}`.
3. Compare against matrix rows.
4. Run ERC.
5. Record only mismatches and unresolved warnings.

## Critical Net Gates

| Check | Expected | Result (Pass/Fail) | Evidence/Notes |
|---|---|---|---|
| SSR input + | `+5V -> J_SSR_IN1:1` |  |  |
| SSR input - | `MOSFET_D -> J_SSR_IN1:2` |  |  |
| MOSFET source ground | `Q_DRV1:S -> GND` |  |  |
| AC live path | `J_MAINS1:L -> F1 -> J_SSR_OUT1 -> J_CABLE1:L` |  |  |

## Matrix Row Check

| Net Name | Matrix Expectation | Schematic Observed | Result (Pass/Fail) | Notes |
|---|---|---|---|---|
| GPIO_HEAT_CTRL | `J_XIAO1:D6 -> R_GATE1:1` |  |  |  |
| GATE_DRIVE | `R_GATE1:2 -> Q_DRV1:G` |  |  |  |
| GATE_PULLDOWN | `Q_DRV1:G -> R_PULLDOWN1:1` |  |  |  |
| GND | `R_PULLDOWN1:2 -> #PWR01:GND` |  |  |  |
| GND | `Q_DRV1:S -> #PWR01:GND` |  |  |  |
| MOSFET_D | `Q_DRV1:D -> J_SSR_IN1:2` |  |  |  |
| +5V | `#PWR02:+5V -> J_SSR_IN1:1` |  |  |  |
| AC_L_IN | `J_MAINS1:L -> F1:1` |  |  |  |
| AC_L_FUSED | `F1:2 -> J_SSR_OUT1:1` |  |  |  |
| AC_L_SW | `J_SSR_OUT1:2 -> J_CABLE1:L` |  |  |  |
| AC_N | `J_MAINS1:N -> J_CABLE1:N` |  |  |  |
| AC_PE | `J_MAINS1:PE -> J_CABLE1:PE` |  |  |  |

## ERC Summary

- ERC run: Yes/No
- Errors:
- Warnings:
- Waived warnings (if any, with reason):

## Issues / Actions

| ID | Severity | Issue | Proposed Fix | Owner | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Sign-off

- Electrical connectivity pass: Yes/No
- Ready for layout/visual cleanup only: Yes/No
- Reviewer:
