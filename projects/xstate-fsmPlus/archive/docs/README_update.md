# xstate-fsmPlus-Espruino

⚠️ **Experimental / Legacy Reference Implementation** ⚠️

This repository contains an **experimental implementation of a hierarchical (“FSMPlus”) finite
state machine** for use with the Espruino JavaScript interpreter.

It builds on the lightweight `@xstate/fsm` semantics (as documented for **XState v4**) and explores
how a limited set of Statechart concepts (notably **compound / nested states**) can be supported on
constrained microcontroller platforms.

Active development has since moved to a **private umbrella repository** where the work is being
consolidated, tested, and extended. This repository is retained as a **public reference** for:

- historical design exploration
- code and issue discussion
- early FSMPlus experiments

For a stable, flat FSM implementation suitable for Espruino today, see:

https://github.com/SimonGAndrews/xstate-fsm-Espruino

---

## Background

This work builds on the finite state machine (FSM) package provided by **Stately**
as part of the **XState** project.

The original `@xstate/fsm` package provides a minimal FSM implementation designed for small
JavaScript runtimes. In **XState v5**, this package is deprecated in favour of the full actor-based
XState model, but the v4 FSM semantics remain well-defined and useful for constrained environments.

This repository adapts those semantics to run within the
[Espruino](https://www.espruino.com/) JavaScript interpreter and explores a limited extension
towards Statechart-style behaviour.

---

## Scope and Status

This repository should be considered:

- **experimental**
- **incomplete**
- **not actively developed as a primary target**

It represents a merge of earlier efforts by the author:

- an Espruino-compatible port of `@xstate/fsm`
- an experimental extension adding limited “FSMPlus” (Statechart-style) features

The implementation and issues here document *how the problem was approached*, rather than a
finished or supported solution.

---

## Supported Features

XState-fsmPlus-Espruino contains all of the features of `@xstate/fsm`, with a small number of
additional Statechart-inspired features.

Below is an amended copy of the feature table from `@xstate/fsm`, included for comparison:

|                             | @XState/fsm | XState-fsmPlus-Espruino | XState |
| --------------------------- | :---------: | :---------------------: | :----: |
| Finite states               |     ✅      |           ✅            |  ✅    |
| Initial state               |     ✅      |           ✅            |  ✅    |
| Transitions (object)        |     ✅      |           ✅            |  ✅    |
| Transitions (string target) |     ✅      |           ✅            |  ✅    |
| Nested (compound) states    |     ❌      |           ✅            |  ✅    |
| Parallel states             |     ❌      |           ❌            |  ✅    |
| History states              |     ❌      |           ❌            |  ✅    |
| Final states                |     ❌      |           ❌            |  ✅    |
| Context                     |     ✅      |           ✅            |  ✅    |
| Entry / exit actions        |     ✅      |           ✅            |  ✅    |
| Transition guards           |     ✅      |           ✅            |  ✅    |

**Parallel, history, invoked actors, and delayed transitions are explicitly out of scope.**

---

## Relationship to Current Work

This repository is **not** the canonical implementation of FSMPlus.

Current work is focused on:

- a cleaned and tested **FSMPlus JavaScript engine**
- a parallel **native C FSM engine** integrated into Espruino
- SCXML-aligned semantics for compound states
- shared scenario-based testing (e.g. greenhouse automation)

These efforts are being developed and evaluated in a separate umbrella repository.

This repository remains available as a **public design and code reference** while that work
progresses.

---

## Experimental Disclaimer

**This software should be considered experimental.**

It is provided for exploration and learning purposes only and **must not** be used in
mission-critical, safety-related, or health-related systems.

As per the licence, the software is provided *without warranty of any kind*.

---

## References

- Stately FSM package  
  https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm

- XState documentation  
  https://xstate.js.org/docs/

- Espruino  
  https://www.espruino.com/  
  https://github.com/espruino/Espruino

- Statecharts overview  
  https://statecharts.dev/

---

## Credits

XState is created and maintained by David Khourshid and the XState community.  
Espruino is created and maintained by Gordon Williams.

This repository contains modifications and experimental work by Simon Andrews,
released under the MIT Licence.
