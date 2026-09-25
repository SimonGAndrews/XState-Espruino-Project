# Third-Party Notices

This document records third-party projects and materials relevant to
Xstate-fsm-c. The project licence does not replace their respective licences.

## XState

Xstate-fsm-c implements an independently specified, limited compatibility
profile informed by XState behaviour, documentation, and differential tests.

- Project: XState
- Upstream: https://github.com/statelyai/xstate
- Licence: MIT
- Copyright notice: Copyright (c) 2015 David Khourshid
- Local reference archive: [XState v4.38.3](../../archive/xstate-xstate-4.38.3/)
- Archived licence: [MIT licence](../../archive/xstate-xstate-4.38.3/LICENSE)

At the creation of this notice, no XState implementation source has been
incorporated into the Xstate-fsm-c implementation. If code, tests, comments, or
other substantial material are later copied or adapted from XState, this notice
and the affected file must identify that provenance and preserve the applicable
MIT copyright and permission notice.

## Espruino

Xstate-fsm-c is designed to be compiled as an optional native library within
Espruino.

- Project: Espruino
- Upstream: https://github.com/espruino/Espruino
- Licence: Mozilla Public License 2.0

No Espruino source is currently included within this project directory. Files
copied from or modifications made directly to Espruino remain subject to the
Espruino licence and notices. A distribution combining Xstate-fsm-c with
Espruino must comply with the applicable MPL-2.0 obligations for all covered
files.

## Standards And Tools

The W3C SCXML Recommendation and Stately tooling are compatibility and design
references. Their identification here does not assert that their source code is
included in Xstate-fsm-c. Compatibility fixtures must record their source and
tool version as required by the specification and contribution policy.

Xstate-fsm-c is an independent project. References to XState, Stately, and
Espruino are descriptive and do not imply affiliation with or endorsement by
their maintainers.
