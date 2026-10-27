# Xstate-fsm-c (XFSM)

XFSM is the Stage 3 native C state-machine project that grew from the
XState-Espruino-Project exploration of state machines for Espruino.

The project is now developed and maintained in the standalone
[`SimonGAndrews/Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM)
repository. This directory is retained as a permanent record of XFSM's place
in the umbrella project's development journey. It is not a second project
copy, and no implementation, specification, test, or evidence work is
maintained here.

## Current Project

| Information | Current location |
| --- | --- |
| Project overview | [Espruino-XFSM README](https://github.com/SimonGAndrews/Espruino-XFSM#readme) |
| Public Profile 2 contract | [Profile 2 specification](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/specification-profile-2.md) |
| Current progress and qualified revisions | [Implementation status](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/implementation-status.md) |
| Canonical native library | [`xfsm/`](https://github.com/SimonGAndrews/Espruino-XFSM/tree/main/xfsm) |
| Tests and recorded evidence | [`tests/`](https://github.com/SimonGAndrews/Espruino-XFSM/tree/main/tests) |
| Build and device guidance | [Building XFSM](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/building.md) |
| Examples | [`examples/`](https://github.com/SimonGAndrews/Espruino-XFSM/tree/main/examples) |
| Contribution guidance | [CONTRIBUTING.md](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/CONTRIBUTING.md) |

The canonical `xfsm/` library is exported unchanged into Espruino's
`libs/xfsm/` directory for integration builds. The standalone
[Espruino integration workflow](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/espruino-integration.md)
explains that process.

## Place In The Umbrella Project

The umbrella project records three implementation directions:

1. Stage 1 adapted the compact `@xstate/fsm` model for Espruino.
2. Stage 2 developed the hierarchical JavaScript FSMPlus engine.
3. Stage 3 developed XFSM as a native C hierarchical state-machine engine
   exposed through Espruino's `XFSM` module.

XFSM began here as a specification-led design and evidence project while its
native implementation was developed through an Espruino integration branch.
It progressed through Profile 1, added shallow and deep history in Profile 2,
and was then consolidated into a self-contained repository holding the source,
specifications, tests, evidence, examples, tools, and project guidance.

The umbrella [project context](../../docs/project-context.md) describes how the
three directions relate to one another.

## Historical Snapshot

The last complete copy of this directory is preserved by the annotated tag
[`xfsm-umbrella-snapshot-final`](https://github.com/SimonGAndrews/XState-Espruino-Project/tree/xfsm-umbrella-snapshot-final/projects/Xstate-fsm-c)
at umbrella commit
[`b00c90af5169e7192772976d19991344d631aaa8`](https://github.com/SimonGAndrews/XState-Espruino-Project/commit/b00c90af5169e7192772976d19991344d631aaa8).
Use that tag when investigating the former umbrella layout or an old path.

Early native implementation commits were extracted from the Espruino
repository into the standalone repository. The standalone
[migrated commit map](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/docs/migrated-commit-map.md)
connects the original Espruino commit identifiers with their standalone XFSM
equivalents. Historical reports retain their original identifiers and paths as
evidence.

## Licensing

This placeholder and the tagged XFSM snapshot are licensed under the Mozilla
Public License 2.0. See [LICENSE](LICENSE). The standalone repository has its
own [licensing map](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/LICENSING.md),
including its MIT-licensed examples boundary.
