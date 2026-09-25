# Source

This directory is an ownership and navigation marker. It does not contain a
second copy of the Xstate-fsm-c implementation.

The canonical native engine, Espruino wrapper, and build integration are
developed under `libs/xfsm/` in the
[`SimonGAndrews/Espruino` `feature/xfsm-profile1` branch](https://github.com/SimonGAndrews/Espruino/tree/feature/xfsm-profile1).
The current local implementation clone is `/home/simon/Espruino-XFSM-Profile1`;
the initial optional-library shell is committed there.

This umbrella repository retains the
[Profile 1 specification](../docs/specification.md),
[native format](../docs/native-format-v1.md),
[implementation plan](../docs/implementation-plan.md), conformance definitions,
and reviewed evidence. Do not copy implementation source back into this
directory; link compatible revisions of the two repositories in result
records instead.
