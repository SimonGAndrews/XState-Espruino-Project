# Repository Guidance

Read [README.md](README.md) and
[docs/project-context.md](docs/project-context.md) before starting work. This
repository contains three parallel implementation directions that arose through
the project's evolution; do not assume that a decision for one direction is a
requirement for another.

The current active development focus is XFSM, now maintained in the standalone
[`SimonGAndrews/Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM)
repository. Its current local clone is `/home/simon/Espruino-XFSM`; read its
`AGENTS.md` before XFSM work. `projects/Xstate-fsm-c/` is the umbrella history
and relocation record and must not receive new implementation, specification,
test, or evidence work. The final complete umbrella snapshot is preserved by
the `xfsm-umbrella-snapshot-final` tag.

Canonical XFSM implementation code is under `xfsm/` in the standalone
repository. It is deployed unchanged under `libs/xfsm/` in the
`feature/xfsm-profile2` branch of `SimonGAndrews/Espruino`. The current local
Espruino integration clone is `/home/simon/Espruino-XFSM-Profile1`.

The standalone repository's Profile 2 specification and its incorporated
Profile 1 and history requirements are authoritative for current XFSM
behaviour. Older ADRs, the umbrella relocation record, FSMPlus behaviour,
shared examples, archived sources, the tagged umbrella snapshot, and XState
reference runs are evidence only unless the current specification explicitly
adopts them.

For Stage 1 or FSMPlus work, use that project's own README, implementation,
tests, and status documents. Preserve the Git submodule and archive boundaries,
and follow [LICENSING.md](LICENSING.md) for per-path licensing.
