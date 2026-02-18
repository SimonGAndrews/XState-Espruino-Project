# GH01 Hardware Notes

Initial definition for GH01 prototype hardware.

## Purpose

Control soil temperature in a plant tray by switching a 240V AC soil warming cable on/off based on measured soil temperature.

## Controller

- MCU module: Seeed Studio XIAO ESP32C3
- Reference: https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/
- Runtime/application model: Espruino JavaScript app using xstate engines from this repository

## Main Components

- Soil temperature sensor: DS18B20 (1-Wire interface)
- Reference air sensor: BMP280 digital sensor module
  - Used for ambient/reference air temperature and barometric pressure sensing/reporting
  - Connected on the shared I2C bus with the OLED display
- Load switch: DC-AC single-phase solid state relay (example: SSR-40DA)
  - Input: 3-32V DC
  - Output: 24-380V AC
  - Current class: 40A (device example rating)

## User Interface

- Display: 0.96 inch OLED module, 128x64 SSD1306, 4-pin, 3.3V-5V
  - Interface options: I2C/IIC/SPI serial variants (module-dependent)
- Touch inputs:
  - 3 x TTP223 capacitive touch button modules
  - Single-channel, self-locking touch switch sensor type

## Diagnostics

- 2 x dedicated GPIO outputs for external logic analyzer connection
- Intended use: timing/performance testing and trace visibility

## Enclosure and Mechanical

- Enclosure with Perspex lid
- OLED positioned for viewing through the lid
- Touch sensors mounted on the inside of the lid with minimal air gap
  - Mounting approach: double-sided tape
  - Activation method: user touch/contact on outside of the lid

## MCU IO Map (Draft)

| Function | Device/Signal | Direction (MCU) | Interface | XIAO Pad | ESP32-C3 GPIO | Notes |
|---|---|---|---|---|---|---|
| Status LED | LED (active-low) | Output | Digital GPIO | D0 | GPIO2 | Strap pin, must be HIGH at boot; wire LED anode to 3.3V and cathode via resistor to D0 |
| Touch input 1 | TTP223 #1 OUT | Input | Digital GPIO | D1 | GPIO3 | Through-lid capacitive touch input |
| Soil temperature | DS18B20 DQ | Input | 1-Wire | D2 | GPIO4 | 4.7k pull-up to 3.3V |
| Touch input 2 | TTP223 #2 OUT | Input | Digital GPIO | D3 | GPIO5 | Through-lid capacitive touch input |
| I2C bus SDA | OLED SSD1306 + BMP280 SDA | Bidirectional | I2C | D4 | GPIO6 | Shared I2C data line |
| I2C bus SCL | OLED SSD1306 + BMP280 SCL | Output/Clock | I2C | D5 | GPIO7 | Shared I2C clock line |
| Heater control | SSR input + | Output | Digital GPIO | D6 | GPIO21 | Use 220R series resistor; set LOW early in startup to keep SSR off |
| Logic analyzer ch1 | LA_OUT_1 | Output | Digital GPIO | D7 | GPIO20 | Timing/performance instrumentation |
| Logic analyzer ch2 | LA_OUT_2 | Output | Digital GPIO | D8 | GPIO8 | Strap-related caution: keep HIGH at boot when D9 is LOW |
| Boot strap / recovery | Boot switch | Input | Boot strap | D9 | GPIO9 | Normally HIGH via 10k pull-up; switch to GND for forced download mode |
| Touch input 3 | TTP223 #3 OUT | Input | Digital GPIO | D10 | GPIO10 | Through-lid capacitive touch input |

### Wiring Notes (Boot Safety)

- `D0/GPIO2` is a strapping pin and must be HIGH at boot.
- `D8/GPIO8` and `D9/GPIO9` are strapping-related pins; avoid external loads that pull them LOW during boot unless intentionally forcing flash mode.
- Ensure common GND between XIAO and logic analyzer for valid pulse capture.
- Confirm I2C pull-ups are present on the OLED/BMP280 bus.

## Antenna Arrangements (Draft)

This draft summarizes antenna options for the Seeed XIAO ESP32-C3 in the GH01 enclosure.

### 1) Standard Option: FPC Flexible Antenna (Supplied with Board)

- Standard offering: Seeed 2.4 GHz FPC antenna supplied/package option for XIAO ESP32-C3.
- Type: Flexible Printed Circuit (FPC) antenna with PCB radiator structure.
- Connector/interface: U.FL to board RF connector.
- Nominal impedance: 50 ohm.
- Typical antenna size: 20 x 40 mm.
- Operating band: 2400-2500 MHz (2.4 GHz ISM).
- Protocol support context: Wi-Fi 802.11b/g/n and Bluetooth BLE (2.4 GHz only, not 5 GHz).
- Typical peak gain: up to about 2.9 dBi.
- Polarization: linear.

### 2) FPC Fitting for Best Performance in Perspex Enclosure

- Perspex/acrylic is generally RF-transparent enough for practical 2.4 GHz use.
- Main risk is detuning from close dielectric loading, not severe bulk attenuation.
- Keep an air gap between antenna and enclosure wall: target 3-5 mm minimum.
- Place near an outer edge/corner of enclosure to reduce obstruction by internal assemblies.
- Keep clearance from metal parts and noisy assemblies: target 10-20 mm minimum from screws, large metal masses, display metalwork, battery cans, etc.
- Test orientation in-situ (vertical/horizontal) because FPC radiation is not perfectly omnidirectional.
- Keep antenna-zone wall section thin where possible: around <=2.5 mm preferred.
- Avoid conductive/loaded plastics in RF path (carbon/metal-filled or metallic-finish plastics).
- Mechanically secure the FPC (e.g., quality double-sided adhesive) to prevent movement-based detuning drift.
- Keep a simple RF keep-out area around the antenna and its short feed cable:
  - no relay wiring runs
  - no mains cable runs
  - no dense cable bundles crossing the antenna area

### 3) Optional External Pigtail + Rod Antenna Alternative

- Alternative arrangement: external 2.4 GHz rod/dipole antenna mounted outside enclosure.
- Typical interconnect: U.FL to SMA or RP-SMA pigtail, with bulkhead connector through Perspex wall.
- Typical rod antenna gain range: about 3-6 dBi.

Typical advantages:
- Better range/sensitivity than stock FPC in many installs (often improved link margin).
- Avoids enclosure/internal component detuning effects by moving radiator outside box.
- More predictable broad horizontal coverage when mounted vertical (omnidirectional donut pattern).

Typical trade-offs:
- Pigtail insertion loss (commonly ~0.1-0.5 dB depending on cable quality/length).
- Extra mechanical parts and weather/mechanical exposure for external antenna.

Fitting guidance for optimal performance:
- Keep pigtail as short as practical.
- Use correct connector polarity/type end-to-end (SMA vs RP-SMA).
- Mount bulkhead firmly with strain relief and bend-radius protection on pigtail.
- Keep rod antenna clear of nearby metal surfaces for stable radiation pattern.
- Preferred orientation: mount rod vertical when you want broad horizontal coverage.
- Validate final RSSI/packet reliability in intended install position before freezing mechanical design.

### 4) Practical Selection Guide (GH01)

- Start with the supplied FPC antenna for first prototype builds.
- Move to external pigtail + rod if range is weak, reconnects are frequent, or signal drops once the enclosure is fully assembled.
- Keep antenna wiring and antenna position away from SSR area and mains cable routing.
- Keep the antenna area clear of large metal items, bracketry, and dense cable bundles.
- Avoid frequent disconnect/reconnect of the small U.FL connector; secure cables to prevent pull or vibration stress.
- For FPC installs, test two or three physical orientations and keep the best measured result.

### 5) Simple Validation Checklist (Before Build Freeze)

- Measure and record RSSI at 3 fixed locations around the target install area.
- Run a 30-60 minute stability test and log disconnect/reconnect events.
- Check behavior with all high-noise loads active (SSR switching, display updates, sensor reads).
- Compare two final mechanical options (internal FPC vs external rod) using the same test points.
- Run one quick coexistence check with both Wi-Fi and BLE active.
- Lock antenna placement/orientation only after repeatable results are achieved.
- Use region-appropriate 2.4 GHz antenna parts consistent with product compliance requirements.

## Status

- Draft v0 notes; more specification details to be added.
