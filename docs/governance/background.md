# Background and Project Context

## Overview

This repository contains a structured exploration, implementation, and
evaluation of finite state machines and statecharts for
[Espruino](https://www.espruino.com/), informed by
[XState](https://xstate.js.org/). It focuses particularly on hierarchical
(compound) states suitable for real-world control and UI problems.

The work began with a practical requirement: to express **non-trivial control logic** (menus, modes, automation flows) on constrained embedded hardware in a way that is:

- readable and maintainable
- deterministic and testable
- suitable for event-driven systems
- small enough to run on microcontrollers
- extensible to model-driven tooling and AI-assisted development

This document provides the **background, motivation, and evolution** of the
project and explains why the repository contains multiple parallel
implementation directions. Current status and document authority are recorded
in the [project context](../project-context.md).

---

## Original Motivation

Early Espruino projects (including greenhouse automation and embedded UI work) exposed limitations in ad-hoc state handling:

- rapidly growing `if/else` logic
- implicit modes and flags
- difficulty testing and reasoning about transitions
- lack of a clear model for “what state the system is in”

A declarative state machine approach was preferred, particularly one aligned with **XState semantics**, due to:

- clear event → transition mapping
- explicit entry/exit actions
- guard conditions
- separation of state, context, and side effects

Statecharts also offer a **compact, explicit contract** for microcontroller behaviour. This makes them a strong foundation for:

- model-driven tooling (visual designers, code generation, trace-based testing)
- automated review of system logic and edge cases
- AI-assisted workflows that can propose or refine statecharts as the primary logic model

---

## Starting Point: XState FSM

The project began by evaluating **`xstate/fsm`**, the lightweight finite state machine package maintained by the [XState](https://xstate.js.org/) project.

Reasons for selecting this as a starting point:

- minimal footprint compared to full XState
- clear and well-defined semantics
- permissive MIT licence
- proven design used widely in larger systems

However, `xstate/fsm` is written for modern JavaScript runtimes and **cannot run directly on Espruino** without modification.

---

## Stage 1: Flat FSM Port for Espruino

The first development stage focused on creating a **compatible Espruino port** of `xstate/fsm`, with the goal of preserving behaviour while adapting to Espruino’s JavaScript constraints.

Key adaptations included:

- removal of unsupported ES6+ language features
- replacement of unsupported data structures (e.g. `Set`)
- explicit handling of defaults and optionals
- conservative memory usage
- predictable execution order

This stage resulted in a **stable flat FSM engine** suitable for simple state machines and small UI flows.

> This flat Espruino FSM remains a useful baseline and reference implementation.

In this umbrella repository, the Stage 1 engine is maintained as a **Git submodule** under `projects/xstate-fsm-espruino/`.

---

## Stage 2: FSMPlus — Hierarchical FSM in JavaScript

As real use cases evolved, limitations of flat FSMs became apparent:

- state explosion for related modes
- duplicated transitions across states
- difficulty expressing “global” or parent-level behaviour

This led to the development of **FSMPlus**, a JavaScript-based hierarchical FSM engine inspired by:

- XState compound states
- SCXML hierarchical semantics (compound state behaviour)
- practical constraints of Espruino hardware

Key goals of FSMPlus:

- support **compound (nested) states**
- allow **parent-level fallback transitions**
- resolve initial substates automatically
- preserve correct action ordering
- remain small, inspectable, and debuggable

FSMPlus is designed as a **drop-in Espruino module**, allowing users to adopt hierarchical state machines **without requiring custom firmware builds**.

Looking forward, the project is also motivated by **[Stately](https://stately.ai/) tooling** and similar model-driven workflows. If XState-compatible statecharts can execute directly on Espruino, then:

- microcontroller logic can be designed in standard statechart tools
- validation can use shared traces across JS and embedded runs
- AI-assisted generation of statecharts becomes a viable, testable path to embedded applications

---

## Stage 3: Native FSM Engine (XFSM)

While FSMPlus demonstrated that hierarchical FSMs are viable on Espruino in JavaScript, it also highlighted longer-term concerns:

- increasing implementation complexity
- reliance on JavaScript workarounds
- performance and determinism limits
- difficulty perfectly matching hierarchical transition semantics

To address these concerns, the project expanded to include a **native C-based FSM engine**, referred to as **XFSM**.

The native engine aims to:

- implement FSM semantics directly in C
- integrate cleanly with Espruino’s `JsVar` system
- offer faster event handling and lower overhead
- provide stronger guarantees around memory and execution order

XFSM Profile 1 begins with hierarchical machines composed of atomic and
compound states. Its first implementation step is a vertical slice on Linux
Espruino that exercises the native engine and wrapper, measures the provisional
physical design, and establishes evidence before full implementation. The
[Profile 1 specification](../../projects/Xstate-fsm-c/docs/specification.md)
defines the current plan.

---

## Parallel Paths and Evaluation Strategy

This repository intentionally maintains **three parallel implementation
directions**. They arose in sequence but have independent scopes, compatibility
references, and development lifecycles:

1. **Flat FSM Espruino port**
   - compact baseline derived from `@xstate/fsm`
   - suitable for simpler flat machines
   - maintained as a separate Git submodule

2. **FSMPlus (JavaScript module)**
   - fast to deploy
   - optional at runtime
   - no custom firmware required
   - ideal for rapid development and experimentation

3. **XFSM (native C engine)**
   - higher performance and determinism
   - tighter integration with Espruino internals
   - higher development and maintenance cost
   - suited to demanding or large-scale deployments

Shared scenarios can provide behavioural and performance evidence across these
directions, but each project decides which cases it adopts and which external
reference defines the expected result. Xstate-fsm-c is the current active
development focus.

---

## Use of Real Applications as Test Cases

Rather than relying solely on synthetic tests, this project uses real embedded control problems as primary validation:

- temperature control
- watering logic
- mode supervision and fault handling

These examples serve simultaneously as:

- functional tests
- regression tests (trace comparison)
- performance benchmarks
- documentation and reference designs

---

## Documentation Structure

Documentation is structured to separate **intent**, **decisions**, and **external references**:
```
docs/
  project-context.md # current direction and document authority
  governance/ # this background, status, and testing strategy
  decisions/ # architectural decision records (ADRs)
  notes/ # development notes and historical discussions
  references/ # standards, links, and external material
```
---

## References Folder

The `docs/references/` folder is intended to contain:

- `links.md`
  - curated links to XState documentation, SCXML, Espruino internals, and provenance discussions
- copies (where licensing permits) of relevant standards documents
  - for example, SCXML specification PDFs or HTML snapshots

This provides a stable reference base for understanding decisions made in this project.
