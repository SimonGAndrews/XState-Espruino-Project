# GH01 Heater Control Connection Matrix (V2 Current)

Purpose:
- Electrical validation source for `GH01_heater_control_02`.
- Cross-check KiCad netlist against `hardware/GH01/GH01_hardware.md`.

Primary files:
- Schematic: `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.kicad_sch`
- Netlist: `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.net`
- ERC: `hardware/GH01/kicad/GH01_heater_control_02/ERC.rpt`

## Symbol Mapping (Current V2)

- MCU: `U1` (`XIAO ESP32C3`)
- MOSFET: `Q1` (`BS170`) pin map `1=D`, `2=G`, `3=S`
- Gate resistor: `R_GATE1`
- Gate pulldown: `R_PULLDOWN1`
- SSR: `SSR1` (`CX240D5`) pin map `1=AC_A`, `2=AC_B`, `3=+DC`, `4=-DC`
- AC-DC PSU: `J_PSU2` (`AC_L`, `AC_N`, `+5V_OUT`, `GND`)
- Mains in: `J_MAINS1` (`L/N/PE`)
- Heater cable out: `J_CABLE1` (`L/N/Earth`)
- Fuse: `F2`
- Diode: `D1` (`1=K`, `2=A`)

## Net Matrix

| Net Name | Requirement (Design Intent) | Current V2 Netlist | Status | Notes |
|---|---|---|---|---|
| HEAT_CTRL_GPIO | `U1:D6 -> R_GATE1:1` | `U1:D6 -> R_GATE1:1` | Pass | Aligned with design intent |
| GATE_DRIVE | `R_GATE1:2 -> Q1:2 (G)` | `R_GATE1:2 -> Q1:2` | Pass | Gate drive path correct |
| GATE_PULLDOWN | `Q1:2 (G) -> R_PULLDOWN1:1` | Connected | Pass | Boot-safe OFF path present |
| MOSFET_SOURCE_GND | `Q1:3 (S) -> GND` | Connected | Pass | Low-side topology correct |
| SSR_IN_PLUS | `+5V rail -> SSR1:3 (+DC)` | `J_PSU2:+5V_OUT -> D1:A -> D1:K -> SSR1:3` | Pass | Diode-isolated +5V feed |
| SSR_IN_MINUS | `Q1:1 (D) -> SSR1:4 (-DC)` | Connected | Pass | SSR return switched by MOSFET |
| VUSB_FEED | `D1:K -> U1:VUSB` | Connected | Pass | External 5V via series diode |
| AC_L_IN | `J_MAINS1:L -> F2` | Connected | Pass | Live enters fuse path |
| AC_L_FUSED_BRANCH | `F2 -> SSR1:1 and J_PSU2:AC_L` | Connected | Pass | Fuse covers both board AC branches |
| AC_L_SWITCHED_OUT | `SSR1:2 -> J_CABLE1:L` | Connected | Pass | Switched live to heater cable |
| AC_N | `J_MAINS1:N -> J_PSU2:AC_N and J_CABLE1:N` | Connected | Pass | Neutral shared as intended |
| AC_PE | `J_MAINS1:PE -> J_CABLE1:Earth` | Connected | Pass | PE continuity through connector |

## Open Decision from Matrix

- No open GPIO mapping mismatch at this revision.

## Validation Checklist

1. Save schematic and export netlist (`GH01_heater_control.net`).
2. Check touched matrix rows against netlist refs/pins.
3. Run ERC and save `ERC.rpt`.
4. Confirm no regressions before next edit.
5. Keep screenshot check for readability only (not electrical sign-off).

Rule:
- Do not mark any row `Pass` from `.kicad_sch` coordinate/geometry inspection.
