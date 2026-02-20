# GH01 Low-Voltage Board (V1 Scaffold)

Purpose:
- Dedicated KiCad project area for GH01 low-voltage board design.
- Covers MCU, sensors, UI, and SSR control-side driver only.

Scope (target):
- XIAO ESP32C3 (`U1`)
- BS170 driver stage (`Q1`, `R_GATE1`, `R_PULLDOWN1`)
- SSR control connector interface (`+5V_OUT`, `GND_OUT`, `SSR_CONTROL`)
- DS18B20, BMP280, OLED, TTP223 touch inputs, status LED
- Logic-analyzer outputs

Out of scope:
- 240V mains routing
- SSR AC load path
- Mains fuse and mains entry terminals

Inputs from AC board:
- `+5V_OUT` (post-diode supply rail from AC board interface)
- `GND_OUT`

Outputs to AC board:
- `SSR_CONTROL` (GPIO output line to BS170/SSR control path)
- `GND_OUT` provides control return reference in current split

Build reference:
- `hardware/GH01/GH01_hardware.md`
- `hardware/GH01/kicad/interfaces/GH01_board_interconnect_matrix.md`
- Combined baseline schematic: `hardware/GH01/kicad/GH01_heater_control_02/GH01_heater_control.kicad_sch`

Next step in KiCad:
1. Create/open project file in this folder.
2. Place only low-voltage symbols and connector(s) for board-to-board interface.
3. Validate against interconnect matrix before PCB layout.
