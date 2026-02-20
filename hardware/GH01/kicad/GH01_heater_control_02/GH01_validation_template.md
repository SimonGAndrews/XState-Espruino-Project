# GH01 Schematic Validation Record (Template)

Project:
- `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.kicad_pro`

Hardware source of truth:
- `hardware/GH01/GH01_hardware.md`

Connection matrix:
- `hardware/GH01/kicad/GH01_heater_control_02/GH01_connection_matrix.md`

## Revision Metadata

- Date:
- Iteration marker text in schematic:
- Editor/environment (KiCad version + OS):
- Validator:
- Objective for this iteration (single sentence):
- Domain touched (choose one): `AC/mains` or `low-voltage`

## Method Used

1. Confirm objective is single-scope (one path/net change).
2. Save schematic and export KiCad netlist (`GH01_heater_control.net`).
3. Read netlist `nets` section and compare touched rows first, then full critical gates.
4. Run ERC immediately after netlist pass.
5. Record only mismatches and unresolved warnings.
6. If ERC got worse, stop and revert/fix before any additional change.
7. Capture one screenshot of the edited area and confirm visual intent matches netlist result.

## Connectivity Evidence

- Netlist file used:
- Net(s) checked:
- Visual screenshot reference(s):
- Visual vs netlist agreement: Yes/No

## Critical Net Gates

| Check | Expected | Result (Pass/Fail) | Evidence/Notes |
|---|---|---|---|
| SSR input + | `+5V -> U2:3 (IN+)` |  |  |
| SSR input - | `Q1:2 (D) -> U2:4 (IN-)` |  |  |
| MOSFET source ground | `Q1:3 (S) -> GND` |  |  |
| AC live path | `J_MAINS1:L -> F1 -> U2:1 -> U2:2 -> J_CABLE1:L` |  |  |
| PE strategy | `J_MAINS1:PE routed to cable/enclosure PE` |  |  |

## Matrix Row Check

| Net Name | Matrix Expectation | Schematic Observed | Result (Pass/Fail) | Notes |
|---|---|---|---|---|
| GPIO_HEAT_CTRL | `U1:D6 -> R_GATE1:1` |  |  |  |
| GATE_DRIVE | `R_GATE1:2 -> Q1:1 (G)` |  |  |  |
| GATE_PULLDOWN | `Q1:1 (G) -> R_PULLDOWN1:1` |  |  |  |
| GND | `R_PULLDOWN1:2 -> #PWR01:GND` |  |  |  |
| GND | `Q1:3 (S) -> #PWR01:GND` |  |  |  |
| SSR_IN_PLUS | `#PWR02:+5V -> U2:3 (IN+)` |  |  |  |
| SSR_IN_MINUS | `Q1:2 (D) -> U2:4 (IN-)` |  |  |  |
| AC_L_IN | `J_MAINS1:L -> F1:1` |  |  |  |
| AC_L_FUSED | `F1:2 -> U2:1` |  |  |  |
| AC_L_SW | `U2:2 -> J_CABLE1:L` |  |  |  |
| AC_N | `J_MAINS1:N -> J_CABLE1:N` |  |  |  |
| AC_PE | `J_MAINS1:PE -> cable/enclosure PE strategy` |  |  |  |

## ERC Summary

- ERC run: Yes/No
- ERC before change (Errors/Warnings):
- ERC after change (Errors/Warnings):
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

## Process Gate (Must Pass)

- `PASS` only if:
1. Exactly one objective was changed.
2. Only one domain was touched.
3. ERC count did not regress.
4. No new unresolved library/symbol warnings were introduced.
5. Netlist connectivity and visual intent both agree.

## Not Allowed

- Do not accept a connection using `.kicad_sch` coordinate/geometry inference alone.
