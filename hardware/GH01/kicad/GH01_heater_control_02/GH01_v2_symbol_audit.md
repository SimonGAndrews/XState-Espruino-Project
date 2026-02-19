# GH01 V2 Symbol/Library Audit

Date: 2026-02-19
Project: `GH01_heater_control_02`

## Current Dependency Baseline

From `GH01_heater_control.kicad_sch`:

Standard KiCad library IDs currently used:
- `Connector_Generic:Conn_01x02`
- `Connector_Generic:Conn_01x03`
- `Connector_Generic:Conn_01x04`
- `Device:Fuse`
- `Device:Q_NMOS_GDS`
- `Device:R`
- `power:+5V`
- `power:GND`

Custom/non-standard currently used:
- `GH01:SSR_IN_01x02`
  - This symbol definition is embedded in the schematic `lib_symbols` block.
  - It is not currently provided as an external `.kicad_sym` file in V2.

## What This Means

- V2 can open and function from the current schematic content because symbols are embedded in the schematic file.
- For long-term maintainability and cleaner migration, custom symbols should be moved into a versioned project library file (instead of only embedded definitions).
- The current V2 folder has no local `sym-lib-table`; KiCad will rely on global symbol libraries unless local table is created.

## Recommended V2 Migration Steps

1. Keep connectivity fixed while replacing symbols.
2. Replace generic connector symbols only where this improves clarity (not required for correctness).
3. Move `GH01:SSR_IN_01x02` to a local project symbol library file (for example `GH01_custom.kicad_sym`) and add project `sym-lib-table` entry.
4. If using a non-standard XIAO symbol, add it to the same project custom library.
5. Re-run validation using:
- `GH01_connection_matrix.md`
- `GH01_validation_template.md`

## Critical Rule During Migration

Do not accept symbol-library cleanup changes unless these remain true:
- `+5V -> J_SSR_IN1:1`
- `MOSFET_D -> J_SSR_IN1:2`
- `Q_DRV1:S -> GND`
- AC live path remains `J_MAINS1:L -> F1 -> J_SSR_OUT1 -> J_CABLE1:L`
