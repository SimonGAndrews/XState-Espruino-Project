# GH01 Board-to-Board Interconnect Matrix (Scaffold)

Purpose:
- Define contract nets between AC board and low-voltage board.
- Prevent silent wiring drift when split into two KiCad projects.

Source of truth:
- `hardware/GH01/GH01_hardware.md`
- Combined schematic/netlist currently in `GH01_heater_control_02`

## Interconnect Nets

| Net | Direction | AC/Mains Board Side | LV Board Side | Notes |
|---|---|---|---|---|
| `+5V_OUT` | AC -> LV | Diode output node (`D1-K`) | LV power input | Interface rail is post-diode; this is not raw PSU `+5V` |
| `GND_OUT` | AC -> LV | PSU GND output node | LV GND input | Common LV reference and SSR control return reference |
| `SSR_CONTROL` | LV -> AC | SSR `-DC` control input path | BS170 drain (low-side switched control path) | BS170 driver is on LV board |

## Connector Planning (Draft)

Recommended minimum board-to-board connector pins:
1. `+5V_OUT`
2. `GND_OUT`
3. `SSR_CONTROL`

## Current Design Decision

- Driver split is fixed as:
  - `BS170` on low-voltage board
  - `SSR1` on AC/mains board
- `GND_OUT` is the SSR control return reference; separate `SSR_RETURN` net is not required.

## Validation Rules

1. Any net rename here must be updated in both board projects.
2. Export netlist from each board project and confirm all connector pins match this matrix.
3. Do not approve board split until this matrix and both schematics agree.
