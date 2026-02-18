# GH01 Prototype Board

GH01 is an Espruino-based ESP32-C3 prototype for soil tray temperature control.

- Controller: Seeed Studio XIAO ESP32C3
- Control objective: switch a 240V AC soil warming cable using a solid state relay
- Primary sensing: DS18B20 soil probe
- Additional sensing: BMP280 reference air sensor (shared I2C with OLED)
- UI: 0.96 inch SSD1306 OLED + 3 x TTP223 touch inputs
- Diagnostics: 2 GPIO outputs for logic-analyzer timing/performance tests

Detailed board notes and evolving specification are maintained in:
`hardware/GH01/GH01_hardware.md`
