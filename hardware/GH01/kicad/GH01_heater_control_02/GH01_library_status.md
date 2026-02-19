# GH01 V2 Library Status

Date: 2026-02-19
Project: `GH01_heater_control_02`

Purpose:
- Show which project libraries are currently required by the schematic.
- Identify cleanup candidates for later once symbol migration is complete.

## Current Symbol Library Table

Source: `sym-lib-table`

- `GH01_custom` -> `${KIPRJMOD}/GH01_custom.kicad_sym`
- `xiao_esp32c3` -> `${KIPRJMOD}/xiao_esp32c3.kicad_sym`
- `CX240D5` -> `${KIPRJMOD}/CX240D5/CX240D5.kicad_sym`
- `Device` -> `${KIPRJMOD}/Device.kicad_sym`
- `Connector_Generic` -> `${KIPRJMOD}/Connector_Generic.kicad_sym`
- `power` -> `${KIPRJMOD}/power.kicad_sym`

## Libraries Referenced by Schematic (lib_id scan)

- `xiao_esp32c3:XIAO ESP32C3`
- `CX240D5:CX240D5`
- `GH01_custom:SSR_IN_01x02`
- `Device:R`
- `Device:Q_NMOS_GDS`
- `Device:Fuse`
- `Connector_Generic:Conn_01x02`
- `Connector_Generic:Conn_01x03`
- `Connector_Generic:Conn_01x04`
- `power:+3V3`
- `power:+5V`
- `power:GND`

## Required Now (Do Not Remove)

- `xiao_esp32c3`
- `CX240D5`
- `GH01_custom`
- `Device`
- `Connector_Generic`
- `power`

## Cleanup Candidates (Later)

Only after symbol migration/normalization is complete:

1. `GH01_custom`
- Keep if custom SSR symbol remains needed.
- Remove only if replaced by a standard/custom library symbol with equivalent pin mapping.

2. `Device`, `Connector_Generic`, `power` project-local copies
- Keep now for deterministic project portability.
- Optional future cleanup: switch to global KiCad standard libs if team environment is consistent.

3. `CX240D5` custom library
- Keep if using the specific SSR symbol.
- Optional replacement with generic connector-based symbol if project chooses simpler abstraction.

## Footprint Libraries

Source: `fp-lib-table`

- `XIAO_ESP32C3` -> `${KIPRJMOD}/XIAO_ESP32C3.pretty`

Status:
- Required for current XIAO symbol footprint link (`XIAO_ESP32C3:ESP32-C3`).

## Rule

Do not remove any library unless:
1. its symbols are no longer referenced by `lib_id` in `GH01_heater_control.kicad_sch`, and
2. the post-change schematic still passes matrix validation in `GH01_connection_matrix.md`.
