# Xstate-fsm-c

Xstate-fsm-c is the Stage 3 native C state-machine project within the
XState-Espruino-Project umbrella repository.

## Status

The project is in the specification and design phase. Native indexed records
have been selected for the compiled machine representation. The index widths,
arena ownership, record organisation, event lookup, and Espruino integration
pattern are now specified. Profile 1 also defines its compatibility direction,
context ownership, action and assignment ordering, exception policy, transition
re-entry model, initial target grammar, final-state completion semantics, actor
lifecycle, stable snapshots, and subscriptions. The remaining validation rules,
conformance requirements, feature scope, and build system are still under
discussion.

Development will be specification-led: observable requirements and
conformance criteria should be agreed before implementation begins.

## Relationship to Existing Work

The existing projects and documents provide evidence and experience for the
design discussion:

- `projects/xstate-fsm-espruino/` provides the flat FSM baseline.
- `projects/xstate-fsmPlus/` provides the hierarchical JavaScript engine.
- `projects/xstate-v4-truth/` provides the current XState v4 reference runner.
- `examples/` contains shared behavioral scenarios and expected traces.
- `docs/decisions/` records earlier umbrella-project decisions.

These sources are design inputs. They are not automatically normative for
Xstate-fsm-c; the specification must explicitly adopt, revise, or reject the
relevant behavior and constraints.

## Project Layout

- `docs/specification.md` - current normative requirements and open areas
- `docs/compatibility/` - raw Stately v4/v5 exports and their assessments
- `src/` - native implementation, intentionally empty at this stage
- `tests/` - conformance and implementation tests, intentionally empty at this stage
