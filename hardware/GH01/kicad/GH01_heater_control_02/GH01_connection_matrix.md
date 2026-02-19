# GH01 Heater Control Connection Matrix

Purpose:
- Single source for schematic connectivity checks for `GH01_heater_control_01`.
- Validate against `hardware/GH01/GH01_hardware.md`.

Scope (this matrix only):
- Heater control path (XIAO D6 -> AO3400A -> CX240D5 input)
- AC switched load path (mains L via fuse and SSR to warming cable)
- Neutral and PE routing

## Net Matrix

| Net Name | From | To | Domain | Status | Notes |
|---|---|---|---|---|---|
| GPIO_HEAT_CTRL | `J_XIAO1:D6 (GPIO21)` | `R_GATE1:1` | LV 3.3V logic | Active | Heater ON/OFF command |
| GATE_DRIVE | `R_GATE1:2` | `Q_DRV1:G` | LV 3.3V logic | Active | Gate series resistor net |
| GATE_PULLDOWN | `Q_DRV1:G` | `R_PULLDOWN1:1` | LV 3.3V logic | Active | Holds MOSFET off at boot |
| GND | `R_PULLDOWN1:2` | `#PWR01:GND` | LV return | Active | Common low-voltage reference |
| GND | `Q_DRV1:S` | `#PWR01:GND` | LV return | Active | AO3400A source to ground |
| MOSFET_D | `Q_DRV1:D` | `J_SSR_IN1:2` | LV control (5V switched return) | Active | SSR input negative (IN-) |
| +5V | `#PWR02:+5V` | `J_SSR_IN1:1` | LV power | Active | SSR input positive (IN+) |
| AC_L_IN | `J_MAINS1:L` | `F1:1` | AC mains | Active | Incoming live to fuse |
| AC_L_FUSED | `F1:2` | `J_SSR_OUT1:1` | AC mains | Active | Fused live to SSR load input |
| AC_L_SW | `J_SSR_OUT1:2` | `J_CABLE1:L` | AC mains switched | Active | Switched live to heater cable |
| AC_N | `J_MAINS1:N` | `J_CABLE1:N` | AC neutral | Active | Neutral unswitched |
| AC_PE | `J_MAINS1:PE` | `J_CABLE1:PE` | Protective earth | Active | Bond to enclosure earth point |

## Pin Mapping Constraints (Must Hold)

- `J_SSR_IN1 pin 1` = `IN+` = `+5V`
- `J_SSR_IN1 pin 2` = `IN-` = `MOSFET_D` (from AO3400A drain)
- `AO3400A` package mapping: `1=G`, `2=S`, `3=D`

## Validation Checklist Per Iteration

1. Confirm iteration marker text updated in schematic.
2. Confirm matrix rows above still match schematic symbol pin numbers.
3. Run ERC and record result summary in `report.txt`.
4. Explicitly re-check the two SSR input rows:
- `+5V -> J_SSR_IN1:1`
- `MOSFET_D -> J_SSR_IN1:2`
5. Only after electrical pass is clean, perform visual cleanup.

## Validation Method (How Codex Should Check)

1. Export connectivity from KiCad for the current schematic revision (net-level source, not visual placement).
2. Normalize output into `Net -> {Ref:Pin...}` pairs.
3. Compare each matrix row directly against those pairs.
4. Run ERC and capture warnings/errors in `report.txt`.
5. Report only deltas:
- missing expected connection
- wrong pin number
- unexpected short/shared net
- unconnected required pin
6. Gate the iteration on critical nets:
- `+5V -> J_SSR_IN1:1`
- `MOSFET_D -> J_SSR_IN1:2`
- `Q_DRV1:S -> GND`
- AC live path only through `J_MAINS1:L -> F1 -> J_SSR_OUT1 -> J_CABLE1:L`

## Change Log

- `2026-02-19`: Initial matrix created for `GH01_heater_control_01`.
