# Repository Guidance

Read [README.md](README.md) and
[docs/project-context.md](docs/project-context.md) before starting work. This
repository contains three parallel implementation directions that arose through
the project's evolution; do not assume that a decision for one direction is a
requirement for another.

The current active development focus is `projects/Xstate-fsm-c/`. For work on
that project, read these documents in order:

1. `projects/Xstate-fsm-c/README.md`
2. `projects/Xstate-fsm-c/docs/specification.md`
3. `projects/Xstate-fsm-c/docs/native-format-v1.md` when physical layout is
   relevant
4. `projects/Xstate-fsm-c/CONTRIBUTING.md` before adding implementation source

The Profile 1 specification is authoritative for Xstate-fsm-c behaviour. Older
ADRs, FSMPlus behaviour, shared examples, archived sources, and XState reference
runs are evidence only unless the specification explicitly adopts them.

For Stage 1 or FSMPlus work, use that project's own README, implementation,
tests, and status documents. Preserve the Git submodule and archive boundaries,
and follow [LICENSING.md](LICENSING.md) for per-path licensing.
