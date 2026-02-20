# GH01 Heater Control V2 Template

Purpose:
- Workspace for building V2 using preferred KiCad libraries (standard where possible).
- Keep wiring intent unchanged from V1 unless explicitly updated in `hardware/GH01/GH01_hardware.md`.

Use these files for validation:
- `GH01_connection_matrix.md`
- `GH01_validation_template.md`

## Suggested V2 Workflow

1. Open `GH01_heater_control.kicad_pro` from this folder.
2. Define one small objective (single net/path) before editing.
3. Edit only one electrical domain per step (`AC/mains` or `low-voltage`).
4. Replace symbols with KiCad standard-library symbols where available.
5. For non-standard parts (for example XIAO-specific symbol), use vetted custom symbol(s).
6. Keep pin-level mapping aligned with the matrix.
7. Save schematic, export netlist (`GH01_heater_control.net`), and validate touched nets against matrix rows.
8. Run ERC after netlist validation and record the delta.
9. Complete one validation record using `GH01_validation_template.md`.

## Netlist Export (Current Working Method)

Because KiCad is installed on Windows in this setup, export netlist from Windows terminal:

1. Open PowerShell.
2. Run from repo root:

```powershell
& "C:\Program Files\KiCad\9.0\bin\kicad-cli.exe" sch export netlist "\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\hardware\GH01\kicad\GH01_heater_control_02\GH01_heater_control.kicad_sch" -o "\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\hardware\GH01\kicad\GH01_heater_control_02\GH01_heater_control.net"
```

3. Confirm file updated:
- `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.net`

## Rule

Do not sign off visual layout until electrical connectivity passes against `GH01_connection_matrix.md`.

Additional rule:
- Do not introduce new custom symbols/libraries while fixing connectivity unless library resolution is verified first in-project.

Validation rule:
- Do not sign off connectivity from `.kicad_sch` coordinate/geometry inspection.
- Use only KiCad-resolved netlist connectivity plus a visual screenshot check for builder clarity.

Editing rule:
- Make electrical schematic changes in KiCad UI (Schematic Editor), then save and export netlist.
- Do not use direct `.kicad_sch` geometry/text editing as a primary change method.
