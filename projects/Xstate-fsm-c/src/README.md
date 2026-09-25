# Source

The Xstate-fsm-c native engine and Espruino wrapper will live in this directory.
Profile 1 requirements are defined by `../docs/specification.md`, with the
provisional physical representation in `../docs/native-format-v1.md`.

Implementation begins with the specified vertical slice. The portable C99
engine must remain separate from Espruino-specific wrapper operations, and the
library must use Espruino's existing `libs` and generated-wrapper build
mechanisms.
