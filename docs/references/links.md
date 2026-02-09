# References and External Links

This document collects external references that inform the design, scope, and implementation
choices made in this project. It is intended as a **curated index**, not an exhaustive list.

Where possible, links are grouped by topic and relevance.

---

## XState and Statecharts

### XState (Project and Documentation)

- XState project home  
  https://xstate.js.org/

- XState documentation (guides and concepts)  
  https://xstate.js.org/docs/

- XState state node identification and IDs  
  https://xstate.js.org/docs/guides/ids.html

- XState actions and self-transitions  
  https://xstate.js.org/docs/guides/actions.html

### XState FSM (Lightweight Engine)

- XState FSM package (source)  
  https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm

- XState FSM licence (MIT)  
  https://github.com/statelyai/xstate/blob/main/packages/xstate-fsm/LICENSE

### XState v4 (Pinned References)

These references are pinned to the v4 series because the truth runner targets
v4 semantics and API shape.

- XState v4 package (version pinned)  
  https://www.npmjs.com/package/xstate/v/4.38.2

- XState v4 API (legacy docs for `createMachine`, `interpret`, etc.)  
  https://xstate.js.org/api

- XState v4 → v5 migration guide  
  https://stately.ai/docs/migration

---

## SCXML (State Chart XML)

SCXML provides the formal semantic basis for hierarchical state machines and directly informs
the handling of compound states, entry/exit ordering, and transition semantics used in this project.

- SCXML 1.0 Specification (W3C Recommendation)  
  https://www.w3.org/TR/scxml/

- SCXML Core Introduction (Sections 3.1.4 and 3.1.5)  
  https://www.w3.org/TR/scxml/#CoreIntroduction

- SCXML Algorithm for Entering and Exiting States  
  https://www.w3.org/TR/scxml/#AlgorithmforSCXMLInterpretation

Local copies or extracts of SCXML specifications may be stored under:

docs/references/SCXML/

(subject to licensing constraints)

---

## Espruino

- Espruino project home  
  https://www.espruino.com/

- Espruino documentation  
  https://www.espruino.com/Reference

- Espruino GitHub repository  
  https://github.com/espruino/Espruino

- Espruino JavaScript language limitations  
  https://www.espruino.com/Performance

---

## Project-Specific Provenance (Design Discussions)

The following shared discussions capture the reasoning, trade-offs, and evolution of this project.
They are retained as **historical design context** rather than normative documentation.

- XState FSM → Espruino port → FSMPlus → native XFSM (project evolution)  
  https://chatgpt.com/share/6985f437-e0a8-800e-928b-e6635725cbf7

- SCXML semantics, compound states, and state representation discussion  
  https://chatgpt.com/share/6986220f-d3f0-800e-961a-a56f4d3ee062

- Testing strategy and log-based validation discussion  
  https://chatgpt.com/share/698623f1-3ee4-800e-8500-379193c0b16f

These links provide additional context for architectural decisions recorded in the
`docs/decisions/` folder.

---

## Related Repositories

- xstate-fsm-Espruino (Stage 1 flat FSM, Espruino module)  
  https://github.com/SimonGAndrews/xstate-fsm-Espruino

- XState-Espruino-Project (this umbrella repository)  
  https://github.com/SimonGAndrews/XState-Espruino-Project

---

## Notes

This list will evolve as the project progresses. References that directly influence architectural
decisions should be reflected in corresponding ADRs under `docs/decisions/`.
