# Background and Project Context

## Overview

This repository contains a structured exploration, implementation, and evaluation of **XState-style finite state machines (FSMs)** for use on **Espruino-based microcontroller systems**, with a particular focus on **hierarchical (compound) states** suitable for real-world control and UI problems.

The work began with a practical requirement: to express **non-trivial control logic** (menus, modes, automation flows) on constrained embedded hardware in a way that is:

- readable and maintainable
- deterministic and testable
- suitable for event-driven systems
- small enough to run on microcontrollers

This document provides the **background, motivation, and evolution** of the project, and explains why the repository is structured into multiple implementation paths.

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

---

## Starting Point: XState FSM

The project began by evaluating **`xstate/fsm`**, the lightweight finite state machine package maintained by the XState project.

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

In this umbrella repository, the Stage 1 engine is maintained as a **Git submodule** under `js/xstate-fsm-espruino/`.

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

XFSM follows a phased implementation plan, beginning with flat FSM parity and progressing towards hierarchical support once the core engine is proven stable.

---

## Parallel Paths and Evaluation Strategy

This repository intentionally maintains **two active implementation paths**:

1. **FSMPlus (JavaScript module)**
   - fast to deploy
   - optional at runtime
   - no custom firmware required
   - ideal for rapid development and experimentation

2. **XFSM (native C engine)**
   - higher performance and determinism
   - tighter integration with Espruino internals
   - higher development and maintenance cost
   - suited to demanding or large-scale deployments

Both paths are evaluated using shared **greenhouse automation scenarios**, allowing direct behavioural and performance comparison.

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
background.md # this document
decisions/ # architectural decision records (ADRs)
notes/ # development notes and summaries
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
