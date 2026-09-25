# Contributing To Xstate-fsm-c

## Contribution Licence

Xstate-fsm-c is licensed under the Mozilla Public License 2.0. By submitting a
contribution, you agree to license that contribution under MPL-2.0 and confirm
that you have the right to do so.

New implementation source files must include the MPL-2.0 Exhibit A notice:

```text
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
```

Do not add the Exhibit B "Incompatible With Secondary Licenses" notice.

## Provenance

Implement behaviour from the Xstate-fsm-c specification and reviewed
conformance evidence. Do not copy XState, Espruino, or other third-party source
merely because it is available for comparison.

When a contribution copies or adapts third-party material:

- confirm that its licence is compatible with MPL-2.0;
- retain all required copyright, licence, and attribution notices;
- identify the upstream project, exact version or commit, source path, and
  nature of the adaptation in the affected file;
- update [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); and
- keep a complete copy of any licence text required by the upstream licence.

Do not combine code with unclear provenance or incompatible terms. Raise the
licensing question before implementation when the status is uncertain.

Compatibility tests should use project-authored minimal machine definitions.
When a fixture is exported from Stately tooling or adapted from an external
example, record the tool or source, version where known, and all adaptations.

## Project Boundaries

The MPL-2.0 licence in this directory covers Xstate-fsm-c. It does not relicense
the XState source archive, the Stage 1 Git submodule, sibling projects, or the
Espruino host project. Consult the repository-level
[LICENSING.md](../../LICENSING.md) and the licence within each external project
or archive.
