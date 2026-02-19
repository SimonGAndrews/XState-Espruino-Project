# GH01 KiCad Projects

This directory now uses versioned subfolders. Each project version is self-contained with its own `.kicad_pro`, schematic, local symbol libraries, and backups.

## Folder Structure

- `GH01_heater_control_01/`
  - `GH01_heater_control.kicad_pro`
  - `GH01_heater_control.kicad_sch`
  - `GH01_heater_control.kicad_prl`
  - `sym-lib-table`
  - local symbol libraries (`*.kicad_sym`)
  - `GH01_heater_control-backups/`

Open the project from the version folder using `.kicad_pro` (preferred).

## Project Version Summary

| Version Folder | Project Name | Status | Summary |
|---|---|---|---|
| `GH01_heater_control_01` | `GH01_heater_control` | Active baseline | Initial heater control documentation schematic: XIAO GPIO control, AO3400A low-side MOSFET driver, CX240D5 SSR input/output blocks, fused AC live path to warming cable, neutral/PE connection blocks. |
| `GH01_heater_control_02` | `GH01_heater_control` | V2 template | Working copy for migration toward KiCad standard symbols/footprints and cleaner library management. Use this folder to replace symbols with preferred library choices, then re-validate against the connection matrix. |

## Notes

- These are documentation schematics for wiring intent and design review.
- Final build release still requires validation of creepage/clearance, protection parts, and enclosure safety details.
