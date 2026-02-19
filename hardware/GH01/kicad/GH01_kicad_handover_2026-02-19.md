# GH01 KiCad Handover (2026-02-19)

## Purpose

This note captures what was attempted in the first GH01 KiCad schematic work session, what caused repeated iteration, and a tighter process for the next session.

Primary hardware source of truth:
- `hardware/GH01/GH01_hardware.md`

Primary KiCad project folder for this work:
- `hardware/GH01/kicad/GH01_heater_control_01`

## What Was Attempted

Target schematic scope (documentation-level wiring intent):
- XIAO ESP32C3 control output to heater control driver
- AO3400A low-side MOSFET driver stage
- CX240D5 SSR control input and AC load output connectors
- AC live path via fuse and SSR to warming cable
- Neutral and PE connection blocks

Related visual reference diagram (generated separately):
- `hardware/GH01/diagrams/gh01_heater_control_wiring.dot`
- `hardware/GH01/diagrams/gh01_heater_control_wiring.svg`
- `hardware/GH01/diagrams/gh01_heater_control_wiring.png`

## Artifacts Produced

In `hardware/GH01/kicad/GH01_heater_control_01`:
- `GH01_heater_control.kicad_pro`
- `GH01_heater_control.kicad_sch`
- `GH01_heater_control.kicad_prl`
- local project symbol libs:
  - `Connector_Generic.kicad_sym`
  - `Device.kicad_sym`
  - `power.kicad_sym`
- `sym-lib-table`
- `GH01_heater_control-backups/`
- `report.txt`

## Key Wiring Intent That Must Stay True

For SSR input control side:
- `J_SSR_IN1 pin 1` -> `+5V` (SSR IN+)
- `J_SSR_IN1 pin 2` -> AO3400A drain / `MOSFET_D` (SSR IN-)

For MOSFET stage:
- AO3400A source -> GND
- AO3400A gate driven from XIAO D6 through gate resistor
- gate pulldown to GND

## What Caused the Pain (and Why)

1. Symbol orientation vs pin numbering mismatch
- Multiple iterations looked visually close, but pin numbers and labels were swapped.
- Transform operations (especially mirror) changed pin placement relative to wires.

2. Visual interpretation mismatch between tools
- File edits were correct in text, but user display did not always obviously reflect changes until save/reopen/refresh cycles.

3. Library and symbol resolution issues
- Early state showed missing symbols (boxes with question marks).
- Local project symbol libraries and `sym-lib-table` were needed for stable rendering.

4. Schematic readability vs electrical correctness were mixed together
- Layout cleanup and electrical validation were done simultaneously, causing repeated rework.

## Confirmed Learning from Session

- Mirroring the connector symbol vertically can swap top/bottom pin mapping while wires stay in place.
- The same drawing can look "almost right" while still being wrong at pin level.
- We need to validate by connectivity/net, not by appearance alone.

## Environment / Tooling Subtleties

### WSL + Windows KiCad file access
- Windows KiCad can open project files via UNC path, e.g.:
- `\\wsl.localhost\Ubuntu-22.04\home\simon\SGAdev\XState-Espruino-Project\hardware\GH01\kicad\GH01_heater_control_01`

### KiCad project behavior
- Prefer opening `.kicad_pro` instead of raw `.kicad_sch`.
- After symbol/library changes, save + close/reopen can be needed for display consistency.
- Annotate+save can clear temporary `?` reference confusion in some cases.

### Graphviz
- Graphviz was installed and used successfully for reference wiring diagrams (`.dot` -> `.svg`/`.png`).
- This is useful for communication but not a replacement for ERC/net validation in KiCad.

## New Process for Today (Short and Strict)

1. Freeze matrix first
- Build a small connection matrix from `hardware/GH01/GH01_hardware.md` for the current schematic scope only.

2. Separate passes
- Pass A: electrical connectivity only
- Pass B: readability/layout only

3. Validation method (mandatory)
- Validate from KiCad connectivity outputs (ERC/net-level checks), not from symbol geometry.
- After each meaningful edit, confirm key nets:
  - `+5V` reaches `J_SSR_IN1 pin 1`
  - `MOSFET_D` reaches `J_SSR_IN1 pin 2`

4. Iteration control
- Keep one visible iteration marker text in schematic for proof of current file state.
- Limit each iteration to one objective and one verification step.

5. Stop condition
- Stop once connectivity is proven and only cosmetic layout issues remain.

## Suggested First Task Next Thread

- Create `hardware/GH01/kicad/GH01_heater_control_01/GH01_connection_matrix.md` with only active heater-control nets.
- Cross-check schematic pin mapping against the matrix.
- Run ERC/checks and record results in `report.txt`.

## Notes for Any New Codex Thread

- Start from this file and `hardware/GH01/GH01_hardware.md`.
- Use `hardware/GH01/kicad/GH01_heater_control_01` as the active project root.
- Do not assume visual alignment implies correct pin mapping.
- Confirm every critical connection by pin number and net name.
