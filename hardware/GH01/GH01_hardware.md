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
- Load switch (preferred): Crydom `CX240D5` solid state relay
  - Input: `3-15VDC` (typical `15mA` input current at nominal drive)
  - Output: `12-280VAC`
  - Load class: `5A` (well above GH01 heater load requirement)

## SSR Switching Options (Draft)

GH01 goals for switch choice:
- Keep BOM cost practical.
- Keep build simple with module-based assembly.
- Support long operating life.
- Maintain safe mains switching practice.

### Option 1: Reputable Right-Sized SSR (Preferred)

Typical spec target:
- Output: `12-280VAC` or wider.
- Load class: `5A` (large margin for `27W` heater load).
- Input control: `3-15VDC` or `3-32VDC` type.
- Reputable manufacturer/distributor channel.

Typical device reference:
- [Crydom `CX240D5`](https://cpc.farnell.com/crydom/cx240d5/ssr-5a-240vac/dp/SW03798) (example reputable 5A class SSR)
  - Typical listing values: input `3-15VDC`, output `12-280VAC`, load `5A`
  - Device uses internal opto-isolated input, but GPIO drive-margin still needs to be handled by a driver stage.

Pros:
- Better quality confidence and consistency.
- Better long-term reliability and lower field-failure risk.
- Better traceability/spec clarity for safety review.

Cons:
- Higher unit cost.
- Usually still benefits from a small GPIO driver stage.

### Option 2: Low-Cost Generic SSR Module

Typical profile:
- Very low unit cost.
- Widely available from marketplace vendors.

Pros:
- Lowest upfront BOM cost.
- Simple sourcing and quick prototype availability.

Cons:
- Large variation in real performance/quality.
- Published current ratings may be optimistic.
- Higher risk for long-term and safety-critical mains usage.

### Option Comparison Against GH01 Goals

- Cost: Option 2 wins.
- Simple build: both are simple; Option 1 still straightforward.
- Longevity/reliability: Option 1 wins.
- Safe usage confidence: Option 1 wins.

Interim recommendation:
- Use Option 1 for GH01 baseline build.
- Keep Option 2 as prototype-only fallback where cost is the overriding constraint.

### Implementation (Driver Stage)

Preferred control architecture:
- XIAO GPIO drives an AO3400A MOSFET stage.
- Driver stage switches SSR input current from low-voltage supply.
- Do not rely on direct GPIO-to-SSR input drive for final build.
- Note: SSR opto-isolation protects the AC/load side interface; it does not guarantee direct GPIO current-drive margin.

Recommended wiring (AO3400A low-side MOSFET driver):
- Driver device: `AO3400A` (logic-level N-MOSFET, SOT-23).
- GPIO path:
  - `XIAO D6 (GPIO21)` -> `R_GATE` (`100R` to `220R`) -> AO3400A Gate.
  - AO3400A Gate -> `R_PULLDOWN` (`100k`) -> GND (forces OFF during boot/reset).
- Load-switch path:
  - AO3400A Source -> GND.
  - AO3400A Drain -> SSR input `-` (CX240D5 control negative).
  - SSR input `+` -> `+5V` low-voltage control rail.
- Grounding:
  - XIAO GND, AO3400A Source GND, and SSR control return must be common.

Device and value guidance:
- AO3400A suitability:
  - Logic-level gate operation from `3.3V` GPIO.
  - Large margin for SSR control current (CX240D5 typical input current around `15mA`).
- `R_GATE` (`100R` to `220R`):
  - Limits edge current/noise into gate and protects GPIO pin during transients.
- `R_PULLDOWN` (`100k`):
  - Keeps gate low if MCU pin is floating at startup.
- Optional protection (recommended in noisy enclosure):
  - Add small `TVS` or clamp on control rails if switching noise is observed.
- Layout:
  - Keep AO3400A and SSR control wiring short.
  - Route MOSFET/SSR control traces away from AC wiring and antenna path.

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
| Heater control | Driver stage input (to SSR control) | Output | Digital GPIO | D6 | GPIO21 | Drive AO3400A MOSFET stage; keep OFF by default at boot with gate pulldown |
| Logic analyzer ch1 | LA_OUT_1 | Output | Digital GPIO | D7 | GPIO20 | Timing/performance instrumentation |
| Logic analyzer ch2 | LA_OUT_2 | Output | Digital GPIO | D8 | GPIO8 | Strap-related caution: keep HIGH at boot when D9 is LOW |
| Boot strap / recovery | Boot switch | Input | Boot strap | D9 | GPIO9 | Normally HIGH via 10k pull-up; switch to GND for forced download mode |
| Touch input 3 | TTP223 #3 OUT | Input | Digital GPIO | D10 | GPIO10 | Through-lid capacitive touch input |

### Wiring Notes (Boot Safety)

- `D0/GPIO2` is a strapping pin and must be HIGH at boot.
- `D8/GPIO8` and `D9/GPIO9` are strapping-related pins; avoid external loads that pull them LOW during boot unless intentionally forcing flash mode.
- Ensure common GND between XIAO and logic analyzer for valid pulse capture.
- Confirm I2C pull-ups are present on the OLED/BMP280 bus.

## Power Supply Architecture (Draft)

Target concept: one incoming `240V AC` supply cable feeds both heater control and low-voltage electronics.

### Proposed Topology

- Incoming `240V AC` enters enclosure via dedicated mains entry/strain relief.
- AC branch A: to SSR load side for soil heater cable switching.
- AC branch B: to isolated AC-DC module providing low-voltage DC for control electronics.
- Selected low-voltage path: `5V` AC-DC module output to XIAO power input path (`VIN`/5V rail as implemented).
- XIAO `3.3V` rail powers low-power peripherals (DS18B20, BMP280, OLED, TTP223 modules).

### Candidate AC-DC Module (Current Discussion)

- Candidate family: AZ-Delivery Mini power supply modules.
- Preferred variant for this architecture: `AC-05-3` (nominal `5V`, rated `600 mA`, `3W` class).
- Input range (from copied module data): `100-240V AC`, `48-62Hz`.
- Reference summary table: `misc/240Vto5VPowerModule.md`

### Integration Notes

- Keep mains and low-voltage zones physically separated inside enclosure.
- Keep SSR/mains routing away from antenna, I2C lines, and sensor wiring.
- Use common low-voltage GND reference for MCU, sensors, display, touch inputs, and SSR control side.
- Apply mains-side protection and termination suitable for enclosure use (fuse/protected entry/strain relief).
- Follow Seeed guidance when feeding 5V externally: include diode isolation to prevent backfeed.

### External 5V Diode Isolation (Implementation Instruction)

Required connection (single diode method):
- AC-DC module `+5V OUT` -> diode **anode**
- Diode **cathode** -> XIAO `5V/VUSB` node
- AC-DC module `0V/GND` -> XIAO `GND`

Power-path clarification:
- External PSU power to XIAO is intentionally routed **through this series diode**.
- `VUSB` is a shared 5V node (USB side and external supply side meet at this node).
- With diode fitted in the external feed, backflow from `VUSB` into the AC-DC output is blocked.

Recommended diode type:
- Schottky diode, low forward-drop, `>=1A` continuous rating.
- Practical example class: `SS14` (`1A`, `40V`, SMD).

Orientation check:
- Marked stripe/band on diode body is the **cathode** (connect this side to XIAO `5V/VUSB`).
- This orientation allows external PSU to power XIAO while blocking reverse current toward the PSU/USB side.

Design note:
- Account for Schottky voltage drop in power budget; verify actual XIAO input voltage under load.

### Decision Status (Power)

Decided defaults for GH01 prototype v1:
- `A` External PSU output: use `5V` module (`AC-05-3` candidate).
- `B` XIAO feed path: use `VUSB/5V` path for first bring-up (not `VIN`) with series Schottky isolation diode per section above.
- `C` `3.3V` rail usage: low-power peripherals only (DS18B20/BMP280/OLED/TTP223).
- `D` SSR control drive: prefer transistor/MOSFET driver stage over direct GPIO.
- `E` Service/debug rule: avoid simultaneous ambiguous dual-power states (`USB + external 5V`) until validated.

Still open before final design freeze:
- Confirm measured `3.3V` current and regulator temperature at worst-case load.
- Confirm USB + external 5V coexistence behavior and define final allowed service mode.
- Confirm final mains protection details (fuse rating/type, MOV/snubber choices, terminals).
- Confirm physical AC/LV partition distances in final enclosure layout.

### KiCad Connectivity Review, Findings, Advice and Decisions (Draft)

Source files (moved location):
- `hardware/XIAO_ESP32C3_kicad/02 XIAO ESP32-C3.kicad_sch`
- `hardware/XIAO_ESP32C3_kicad/XIAO ESP32C3_v1.3.kicad_sch`

Key schematic evidence captured:
- Power nets present: `USB_FUSED_5V`, `VUSB`, `VIN`, `VBAT`, `VCC_3V3`.
- PMIC/rails parts present:
  - Charger: `PMIC-XC6802MR`
  - LDO: `TLV75733PDBVR`
  - Power-path PMOS: `LP0404N3T5G`
- Header reference with exposed rails/signals: `J2`.

Connectivity findings summary:
- `VUSB`, `VIN`, `VBAT`, and `VCC_3V3` are distinct named rails in the design.
- USB-side fused 5V exists (`USB_FUSED_5V`) and is part of the board power architecture.
- The board includes charger + PMOS + LDO power-path logic, so external 5V injection choice affects USB coexistence behavior.

Implementation advice for GH01:
- Use isolated external `5V` module as planned and keep all GH01 controls/sensors on low-voltage side.
- Keep AC domain and low-voltage domain physically partitioned in enclosure.
- Keep SSR control on low-voltage side with clean common GND reference.
- Treat simultaneous external 5V + USB connection as a controlled service case (do not assume always-safe without test confirmation).

Decision and validation status is defined in `Decision Status (Power)` above.

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

### 6) Recommended Mechanical Mounting Recipe (FPC Inside Lid)

Assumption: SSR area is locally managed per `SSR EMI Control (Draft)` below.

Recommended layer stack (inside to outside):
- FPC antenna fixed to a thin non-conductive backing plate using supplied 3M tape.
- Air-gap support option A: spacer frame around antenna perimeter to hold stand-off.
- Air-gap support option B: low-density non-conductive foam spacer (kept mainly to perimeter where possible).
- Inside face of Perspex lid.

Practical materials:
- Backing plate: PET, polycarbonate, or acrylic sheet.
- Backing plate thickness: 0.5-1.0 mm (up to 1.5 mm acceptable if layout demands it).
- Air-gap support:
  - Option A: non-conductive spacer frame/tape, 3-5 mm thickness.
  - Option B: low-density non-conductive closed-cell foam, 3-5 mm thickness.
- Adhesive: stable double-sided tape suitable for enclosure temperatures.

Placement and fixing rules:
- Keep the active antenna face mostly over an air gap; avoid full-surface solid pads directly against it.
- If foam is used, prefer low-density non-conductive closed-cell foam and use perimeter support where possible.
- Keep the antenna assembly close to enclosure edge, away from SSR/mains compartment and heavy cable bundles.
- Keep metal fasteners/brackets out of the antenna near-field zone.
- Add strain relief so the U.FL lead cannot pull on the antenna during vibration or service.
- Mark final orientation after testing to avoid accidental reassembly changes.

## SSR EMI Control (Draft)

Use a combined approach: separation + shielding + suppression.

### Physical Separation and Routing

- Keep SSR and 240V AC wiring in a dedicated enclosure zone away from RF/sensor wiring.
- Keep AC live/neutral runs short and close together; avoid running them alongside antenna or I2C/sensor wires.
- Keep low-voltage control wiring to the SSR short and direct.

### Shielding Approach

- If extra isolation is needed, use a grounded metal partition between SSR/AC area and low-voltage electronics.
- Practical material: aluminum or copper sheet.
- Practical thickness: about 0.5-1.0 mm.
- Do not place shielding metal near the antenna mounting zone.

### Source Suppression

- Add noise-control parts on the heater/SSR AC side where needed (for example RC snubber and/or MOV; check correct type and rating for your setup).
- If switching noise is still present, fit ferrite clamp(s) on the AC wires close to the noisy area.
- Keep low-voltage ground wiring simple and solid so control and sensor circuits have a stable reference.

### Verification

- Check Wi-Fi/BLE stability while SSR is actively switching.
- Check logic-analyzer timing outputs during SSR events for noise-related glitches.
- Confirm no measurable degradation when heater cable is connected and operating.

## Status

- Draft v0 notes; more specification details to be added.

## Appendix A: Heater Control Wiring (Text Diagram)

This appendix shows the intended GH01 heater-control wiring using:
- XIAO `D6` GPIO
- `AO3400A` low-side MOSFET driver
- `CX240D5` SSR
- 240V soil warming cable load

Generated diagram files:
- `hardware/GH01/diagrams/gh01_heater_control_wiring.svg`
- `hardware/GH01/diagrams/gh01_heater_control_wiring.png`
- Source: `hardware/GH01/diagrams/gh01_heater_control_wiring.dot`

Embedded wiring diagram:

![GH01 Heater Control Wiring](diagrams/gh01_heater_control_wiring.svg)

If your Markdown viewer does not render SVG, open:
- `hardware/GH01/diagrams/gh01_heater_control_wiring.png`

### A1) Low-Voltage Control Side (MCU -> Driver -> SSR Input)

```text
XIAO D6 (GPIO21)
    |
   [R_GATE 100R..220R]
    |
AO3400A Gate
    |
   [R_PULLDOWN 100k]
    |
   GND

AO3400A Source ------------------------------ GND (common LV ground)
AO3400A Drain ------------------------------- CX240D5 Input (-)

+5V control rail ---------------------------- CX240D5 Input (+)
XIAO GND ------------------------------------ Common LV ground
```

Pin-level view (same circuit, explicit pin mapping):

```text
XIAO ESP32C3
------------
D6 / GPIO21 o----[R_GATE 100R..220R]----o AO3400A Gate (G)
GND        o-----------------------------o AO3400A Source (S)
GND        o-----------------------------o SSR Input (-) return node via AO3400A drain path

AO3400A (SOT-23 N-MOSFET)
-------------------------
Gate (G)   o<--- from XIAO D6 through R_GATE
Source (S) o---- to common GND
Drain (D)  o---- to SSR Input (-)
              |
              +---[R_PULLDOWN 100k from Gate to GND]

CX240D5 SSR (control/input side)
--------------------------------
Input (+) o---- +5V control rail
Input (-) o---- AO3400A Drain (D)

Current path when ON:
+5V rail -> SSR Input (+) -> SSR opto input -> SSR Input (-) -> AO3400A D-S -> GND
```

### A2) AC Load Side (Mains -> SSR Output -> Warming Cable)

```text
240V AC Live (L) ---- Fuse/Protection ---- CX240D5 Output terminal 1
CX240D5 Output terminal 2 ----------------- Soil warming cable Live

240V AC Neutral (N) ------------------------ Soil warming cable Neutral
Protective Earth (PE) ---------------------- Enclosure/earth point as required
```

### A3) Safety and Separation Notes

- Keep low-voltage control wiring physically separated from AC wiring.
- Do not connect AC Neutral/Earth directly to low-voltage GND.
- Keep AO3400A and SSR input wiring short and routed away from antenna/sensor lines.
- Use suitable mains terminals, insulation, strain relief, and fuse/protection per local electrical safety requirements.
