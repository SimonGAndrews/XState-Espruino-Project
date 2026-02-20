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
| `GH01_heater_control_01` | `GH01_heater_control` | Active baseline | Initial heater control documentation schematic: XIAO GPIO control, low-side MOSFET driver stage, CX240D5 SSR input/output blocks, fused AC live path to warming cable, neutral/PE connection blocks. |
| `GH01_heater_control_02` | `GH01_heater_control` | V2 template | Working copy for migration toward KiCad standard symbols/footprints and cleaner library management. Use this folder to replace symbols with preferred library choices, then re-validate against the connection matrix. |
| `GH01_low_voltage_01` | (to create in KiCad) | Scaffold | Planned low-voltage-only board project workspace (MCU, sensors/UI, driver/control side). |
| `GH01_ac_mains_01` | (to create in KiCad) | Scaffold | Planned AC/mains-only board project workspace (mains in, fuse, PSU, SSR AC path). |
| `interfaces` | docs only | Active | Shared contract docs for board-to-board nets during split-board design. |
| `libs` | shared custom libs | Active | Shared custom symbols/footprints used across GH01 board projects. |

## Notes

- These are documentation schematics for wiring intent and design review.
- Final build release still requires validation of creepage/clearance, protection parts, and enclosure safety details.

## Validation Standard (All Versions)

Use this process for every electrical change:

1. Edit in KiCad Schematic Editor UI only.
2. Save schematic.
3. Export netlist (`GH01_heater_control.net`) from KiCad.
4. Validate touched nets from netlist refs/pins against `GH01_connection_matrix.md`.
5. Run ERC and confirm no regression.
6. Use screenshot checks only to confirm builder-facing clarity.

Rules:
- Netlist + ERC are the electrical source of truth.
- Do not sign off connectivity from `.kicad_sch` geometry/coordinates.
