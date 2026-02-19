# GH01 Heater Control Connection Matrix (V2)

Purpose:
- Single source for connectivity checks for `GH01_heater_control_02`.
- Validate against `hardware/GH01/GH01_hardware.md`.

Scope:
- Heater control path (`U1` -> `R_GATE1` -> `Q1` -> `U2` input)
- AC switched load path (`J_MAINS1` -> `F1` -> `U2` output -> `J_CABLE1`)
- Neutral and PE routing

## Symbol Mapping Used in V2

- XIAO MCU: `U1` (`xiao_esp32c3:XIAO ESP32C3`)
- MOSFET driver: `Q1` (`Transistor_FET:Q_NMOS_GDS`)
  - Pin map: `1=G`, `2=D`, `3=S`
- SSR: `U2` (`CX240D5:CX240D5`)
  - Pin map: `3=IN+`, `4=IN-`, `1=AC_A`, `2=AC_B`

## Net Matrix

| Net Name | Requirement (Must Be) | Current V2 Schematic | Status | Notes |
|---|---|---|---|---|
| GPIO_HEAT_CTRL | `U1:D6` -> `R_GATE1:1` | Connected | Pass | Gate control source |
| GATE_DRIVE | `R_GATE1:2` -> `Q1:1 (G)` | Connected | Pass | Gate series resistor path |
| GATE_PULLDOWN | `Q1:1 (G)` -> `R_PULLDOWN1:1` | Connected | Pass | Boot-safe OFF |
| GND_REF | `R_PULLDOWN1:2` -> `GND` | Connected | Pass | Common LV ground |
| MOSFET_SOURCE | `Q1:3 (S)` -> `GND` | Connected | Pass | Low-side topology retained |
| SSR_IN_PLUS | `+5V` -> `U2:3 (IN+)` | Currently `Q1:2 (D)` -> `U2:3` | **Mismatch** | Swap needed |
| SSR_IN_MINUS | `Q1:2 (D)` -> `U2:4 (IN-)` | Currently `+5V` -> `U2:4` | **Mismatch** | Swap needed |
| AC_L_IN | `J_MAINS1:L` -> `F1:1` | Connected | Pass | Live enters fuse |
| AC_L_FUSED | `F1:2` -> `U2:1 (AC_A)` | Connected | Pass | Fused live to SSR |
| AC_L_SW | `U2:2 (AC_B)` -> `J_CABLE1:L` | Connected | Pass | Switched live out |
| AC_N | `J_MAINS1:N` -> `J_CABLE1:N` | Connected | Pass | Neutral path present |
| AC_PE | `J_MAINS1:PE` -> cable/enclosure PE | Not carried to `J_CABLE1` (2-pin only) | **Open** | Add PE terminal strategy |

## Critical Fixes Before V2 Sign-off

1. Swap SSR input control wiring at `U2`:
- `U2 pin 3 (IN+)` must connect to `+5V`
- `U2 pin 4 (IN-)` must connect to `Q1 pin 2 (D)`

2. Define PE implementation explicitly:
- Either change `J_CABLE1` to 3-pin (`L/N/PE`) or add separate PE terminal block with clear label.

## Validation Checklist

1. Run ERC and save updated `ERC.rpt`.
2. Confirm `SSR_IN_PLUS` and `SSR_IN_MINUS` rows are both `Pass`.
3. Confirm PE routing decision is implemented and documented.
4. Re-check against `hardware/GH01/GH01_hardware.md`.

## Change Log

- `2026-02-19`: Migrated matrix to V2 symbol set (`U1/U2/Q1`) and captured current mismatches.
