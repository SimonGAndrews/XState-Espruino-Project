# GH01 AC/Mains Board (V1 Scaffold)

Purpose:
- Dedicated KiCad project area for GH01 mains-domain board design.
- Keeps AC creepage/clearance and safety review isolated from low-voltage design.
- Seeded from current `GH01_heater_control_02` schematic as a starting point for manual split.

Scope (target):
- Mains input connector (`L/N/PE`)
- Fuse path on Live (`F2` equivalent)
- AC-DC PSU module (`J_PSU2` equivalent)
- SSR (`SSR1`) AC load path and control input connector
- Warming cable output connector (`L/N/PE`)

Out of scope:
- MCU and UI circuitry
- Sensor buses and logic-level peripherals

Outputs to LV board:
- `+5V_OUT` (post-diode rail, node `D1-K`; not raw PSU `+5V`)
- `GND_OUT`

Inputs from LV board:
- `SSR_CONTROL` (from low-voltage driver output)
- Control return reference is `GND_OUT`

Build reference:
- `hardware/GH01/GH01_hardware.md`
- `hardware/GH01/kicad/interfaces/GH01_board_interconnect_matrix.md`
- Combined baseline schematic: `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.kicad_sch`

Next step in KiCad:
1. Open `GH01_ac_mains.kicad_pro` in this folder.
2. Manually remove low-voltage-only circuitry from the copied schematic.
3. Keep mains symbols and explicit board-to-board connector pins only.
4. Validate AC paths and PE continuity first, then interface nets.

Shared library note:
- This project points to shared custom libraries under `hardware/GH01/kicad/libs`.
- Keep standard KiCad libraries global (`Device`, `Connector_Generic`, `power`).
