# GH01 KiCad Handover (Updated 2026-02-20)

## Purpose

This document captures the current GH01 KiCad status, what changed since the original 2026-02-19 session, and the validated workflow to continue safely.

Primary hardware source of truth:
- `hardware/GH01/GH01_hardware.md`

Primary active KiCad project:
- `hardware/GH01/kicad/GH01_heater_control_02`

## Current Project State

Implemented in V2 schematic:
- XIAO ESP32C3 symbol/footprint integrated.
- SSR part set to `SSR1` (`CX240D5`).
- Driver MOSFET set to `Q1` (`BS170`, through-hole).
- External AC-DC `J_PSU2` added (AZ-Delivery 240VAC to 5V module symbol).
- Series diode (`D1`, Schottky) added between PSU +5V output and XIAO `VUSB/5V` node.
- Mains fuse moved so fused live feeds both:
  - SSR AC live path
  - AC-DC PSU AC live input
- Diagram in hardware notes switched to KiCad screenshot:
  - `hardware/GH01/diagrams/gh01_heater_control_kicad_v2.png`

## Netlist-Verified Electrical Checks (Current)

From `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.net`:

- MOSFET low-side drive is correct:
  - `Q1 pin 3 (S)` -> `GND`
  - `Q1 pin 1 (D)` -> `SSR1 pin 4 (-DC)`
  - `Q1 pin 2 (G)` -> gate network (`R_GATE1`, `R_PULLDOWN1`)
- SSR control polarity is correct:
  - `SSR1 pin 3 (+DC)` from diode-fed +5V net (`D1-K` net)
  - `SSR1 pin 4 (-DC)` from `Q1 drain`
- Mains fuse placement is correct for board AC live coverage:
  - `J_MAINS1 pin 1 (L)` -> `F2` -> both `J_PSU2 AC_L` and `SSR1 AC_A`

## ERC Status (Current Snapshot)

File:
- `hardware/GH01/kicad/GH01_heater_control_02/ERC.rpt`

Current result:
- `Errors: 0`
- `Warnings: 3`
- Warning type: `lib_symbol_mismatch` (Q1, SSR1, J_CABLE1)

Notes:
- These are symbol/library copy mismatch warnings, not connectivity errors.
- They can be resolved later via symbol/library normalization once wiring is frozen.

## Environment and Tooling Notes

WSL + Windows KiCad setup:
- Schematic files are stored in WSL repo.
- KiCad is installed on Windows and opened via UNC path:
- `\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\...`

Netlist export method in this environment:

```powershell
& "C:\Program Files\KiCad\9.0\bin\kicad-cli.exe" sch export netlist "\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\hardware\GH01\kicad\GH01_heater_control_02\GH01_heater_control.kicad_sch" -o "\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\hardware\GH01\kicad\GH01_heater_control_02\GH01_heater_control.net"
```

## Validated Process (Mandatory)

1. Make electrical edits in KiCad UI only.
2. Save schematic.
3. Export netlist.
4. Validate touched refs/pins from netlist `nets` section.
5. Run ERC and ensure no regression.
6. Use screenshot only for builder readability confirmation.

Rules:
- Do not sign off connectivity from `.kicad_sch` geometry/coordinate interpretation.
- Do not mix AC and low-voltage edits in one iteration.
- Keep one clear objective per iteration.

## Pain Points and Lessons Learned

- Visual symbol placement can look correct while pin mapping is wrong.
- Geometry-based text inspection of `.kicad_sch` is not reliable for electrical sign-off.
- Direct multi-objective edits caused rework and confusion.
- Netlist-first validation is slower per step but reliable.

## Repo Hygiene Updates Applied

- Old Graphviz wiring artifacts removed from `hardware/GH01/diagrams`.
- New diagram reference points to KiCad screenshot PNG.
- `.gitignore` updated for KiCad working/transient files:
  - `#auto_saved_files#`
  - `_autosave-*.kicad_sch`
  - `~*.kicad_sch.lck`
  - `*.kicad_prl`
  - `*.bak`, `*.tmp`
  - `*-backups/*.zip`

## Open Items

1. Recreate or restore `GH01_connection_matrix.md` in V2 folder if matrix-based checks are still required by README/template flow.
2. Resolve/accept current `lib_symbol_mismatch` warnings.
3. Continue hardware freeze checks from `hardware/GH01/GH01_hardware.md`:
- final PE implementation details
- mains suppression part selection
- final enclosure AC/LV partitioning distances

## Notes for a New Codex Thread

Start with:
- `hardware/GH01/GH01_hardware.md`
- `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.kicad_sch`
- `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.net`
- `hardware/GH01/kicad/GH01_heater_control_02/ERC.rpt`

Working rule:
- Electrical truth = netlist + ERC.
- Visual truth = screenshot clarity only.
