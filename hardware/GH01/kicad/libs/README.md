# GH01 Shared KiCad Libraries

Purpose:
- Hold custom GH01 symbols/footprints that are shared by multiple GH01 board projects.

Use this folder for:
- Non-standard parts not guaranteed in global KiCad libraries.
- Project-specific symbols/footprints you want consistent across boards.

Current shared symbol libs:
- `symbols/AZ_Delivery.kicad_sym`
- `symbols/xiao_esp32c3.kicad_sym`
- `symbols/CX240D5/CX240D5.kicad_sym`
- `symbols/GH01_custom.kicad_sym`

Current shared footprint libs:
- `footprints/CX240D5.pretty/`
- `footprints/XIAO_ESP32C3.pretty/`

Guidance:
- Keep KiCad standard libraries (`Device`, `Connector_Generic`, `power`, etc.) global in KiCad install.
- In each project `sym-lib-table` / `fp-lib-table`, reference these shared custom libs via relative paths:
  - `${KIPRJMOD}/../libs/...`
- Do not duplicate large standard-library files into each project folder.
