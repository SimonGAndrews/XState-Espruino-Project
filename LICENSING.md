# Repository Licensing

This is an umbrella repository containing independently licensed projects,
upstream source archives, and a Git submodule. There is no blanket licence that
relicenses every path in the repository.

## Licence Map

| Path | Licence and provenance |
| --- | --- |
| `projects/Xstate-fsm-c/` | XFSM history and relocation record under the Mozilla Public License 2.0. See its [retained project licence](projects/Xstate-fsm-c/LICENSE). The final complete umbrella snapshot at tag `xfsm-umbrella-snapshot-final` remains under the same licence. |
| `archive/xstate-xstate-4.38.3/` | Upstream XState source under the MIT License. See its [archived licence](archive/xstate-xstate-4.38.3/LICENSE). |
| `projects/xstate-fsm-espruino/` | Separate Git submodule under its own MIT License. See its [project licence](projects/xstate-fsm-espruino/LICENSE). |

Files or paths not listed above remain subject to any licence notice contained
within them. Where no licence notice exists, this repository does not make an
additional licence grant for that material.

The project-level licence does not alter the ownership or licensing of an
upstream archive, dependency, submodule, or separately identified third-party
file. See each project's notices for further provenance information.

Current XFSM source, specifications, tests, and documentation are maintained in
the standalone
[`SimonGAndrews/Espruino-XFSM`](https://github.com/SimonGAndrews/Espruino-XFSM)
repository. Its own
[licensing map](https://github.com/SimonGAndrews/Espruino-XFSM/blob/main/LICENSING.md)
governs that repository, including its separately licensed examples. Moving
XFSM out of this umbrella repository did not change the licence of the retained
or tagged material.
