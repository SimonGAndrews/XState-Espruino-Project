# GH01 Heater Control V2 Template

Purpose:
- Workspace for building V2 using preferred KiCad libraries (standard where possible).
- Keep wiring intent unchanged from V1 unless explicitly updated in `hardware/GH01/GH01_hardware.md`.

Use these files for validation:
- `GH01_connection_matrix.md`
- `GH01_validation_template.md`

## Suggested V2 Workflow

1. Open `GH01_heater_control.kicad_pro` from this folder.
2. Replace symbols with KiCad standard-library symbols where available.
3. For non-standard parts (for example XIAO-specific symbol), use vetted custom symbol(s).
4. Keep pin-level mapping aligned with the matrix.
5. Run ERC and complete one validation record using `GH01_validation_template.md`.

## Initial Migration Targets

- `J_XIAO1` (consider custom symbol if exact standard equivalent is unavailable)
- `Q_DRV1` (AO3400A symbol/footprint mapping)
- `J_SSR_IN1` and `J_SSR_OUT1` connector conventions
- Mains-side connectors and fuse symbols/footprints

## Rule

Do not sign off visual layout until electrical connectivity passes against `GH01_connection_matrix.md`.
