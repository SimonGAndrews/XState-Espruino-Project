# xstate-fsmPlus-Espruino

This repro is work in progress.  For a working version of xstate-Espruino see https://github.com/SimonGAndrews/xstate-fsm-Espruino.

This repro builds on the finite state machine (FSM) package provided by STATELY  (1).
The FSM is part of the [XSTATE](https://xstate.js.org/) library for working with finite state machines
and Statecharts (2) in JavaScript.
Specifically, this FSM is designed as a minimal 1kb implementation of XState to be run for example on microcontrollers.
As such the FSM does not provide the full XState Library for the support of Statecharts. 

This repro provides modifications to enable the FSM to be run as a module within the [Espruino](<https://www.espruino.com/>) JavaScript Interpreter for Microcontrollers (3).  In addition, the repro provides enhancements to enable some basic StateChart features to be supported in the FSM (eg nested states) See also features chart below.

## This repro is currently Work in Progress

This repro is a merge of two of the authors previous repros: one which tackled the initial Espruino version of the FSM, with a second Repro
that tackled the StateChart 'Plus' functionality.
This merged repro is currently evolving using GitHub Issues with linked commits to document the modifications and enhancements. Starting with the changes to the original XState FSM necessary to run in Espruino followed by the 'Plus' enhancements.  
Testing is continuing and examples are being created and published here within the examples folder.

**This software should be considered as experimental.**  
As such this software should be used for amusement only and specifically not be used for any mission critical or safety/health systems.    As per the license below this work is provided without warranty of any kind.

## Features

XState-fsmPlus-Espruino contains all of the features of @XState/fsm with a small set of additional features available within Statechart standards.  Below is an amended copy of the features table from [@XState/fsm](https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm)

|                             | [@XState/fsm](https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm)| **XState-fsmPlus-Espruino**  |[XState](https://github.com/statelyai/XState)   |
| --------------------------- | :-------------: | :----------------:  |:---------------------------------------------: |
| Finite states               |       ✅        |        ✅           |                   ✅                          |
| Initial state               |       ✅        |        ✅           |                   ✅                          |
| Transitions (object)        |       ✅        |        ✅           |                   ✅                          |
| Transitions (string target) |       ✅        |        ✅           |                   ✅                          |
| Delayed transitions         |       ❌        |        ❌           |                   ✅                          |
| Eventless transitions       |       ❌        |        ❌           |                   ✅                          |
| Nested states               |       ❌        |        ✅           |                   ✅                          |
| Parallel states             |       ❌        |        ❌           |                   ✅                          |
| History states              |       ❌        |        ❌           |                   ✅                          |
| Final states                |       ❌        |        ❌           |                   ✅                          |
| Context                     |       ✅        |        ✅           |                   ✅                          |
| Entry actions               |       ✅        |        ✅           |                   ✅                          |
| Exit actions                |       ✅        |        ✅           |                   ✅                          |
| Transition actions          |       ✅        |        ✅           |                   ✅                          |
| Parameterized actions       |       ❌        |        ❌           |                   ✅                          |
| Transition guards           |       ✅        |        ✅           |                   ✅                          |
| Parameterized guards        |       ❌        |        ❌           |                   ✅                          |
| Spawned actors              |       ❌        |        ❌           |                   ✅                          |
| Invoked actors              |       ❌        |        ❌           |                   ✅                          |

## Goals

The goal of XState-fsmPlus-Espruino is to enable the advantages of a finite state machine approach (including a limited set of Statechart functions) to be demonstrated for the programming of Internet of Things (IOT) microcontrollers.  In a way that:

* Supports JavaScript as a mid-level scripting environment for the programming of IOT devices.
* Enables the existing diverse Esprunio module device library of sensors, actuators and other interface components to be incorporated into IOT devices driven by a FSM.
* Allows the the thinking and tools of STATELY (eg [Statechart Visual Editor](https://stately.ai/)) to be utilised in Microcontroller Systems.
* Builds on other resources available within the established open source communities of both XState and Esprunio.
* Is tested on a sample of low-end, connected, IOT microcontroller devices available today eg Esprunio and Espressif ESP32.  (noting that full XState Statechart Library is already enabled on the Raspberry Pi, running under Linux with Node.js)

## References

(1) STATELY FSM Package: <https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm>

(2) XSTATE Docs (Inc. Concepts): <https://xstate.js.org/docs/about/concepts.html>

(3) Espruino:  <https://www.espruino.com/> and <https://github.com/espruino>

* Statecharts an introduction: <https://statecharts.dev/>
* Esprunio Working with Modules: <https://www.espruino.com/Modules>
* Esprunio Index of modules (Devices etc) <http://www.espruino.com/modules/>

## Credits

Both XState and Esprunio are Open Source projects.

Esprunio is the product of Gordon Williams <https://en.wikipedia.org/wiki/Espruino>.  
To support the Esprunio project please see: <https://www.espruino.com/Donate>

XState is the product of David Khourshid and the XState community.  
To support the XState project please see: <https://opencollective.com/XState>

## License

XState/core is Copyright (c) 2015 David Khourshid and utilised here under its MIT license <https://github.com/statelyai/XState/blob/main/packages/core/LICENSE>

XState/fsm is Copyright (c) 2015 David Khourshid and utilised here under its MIT license
<https://github.com/statelyai/xstate/blob/main/packages/xstate-fsm/LICENSE>

The modifications to XState/core and XState/fsm provided here are Copyright (c) 2021 Simon Andrews and are provided for use under MIT License. <https://github.com/SimonGAndrews/xstate-fsmPlus-Espruino/blob/main/LICENSE>