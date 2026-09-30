# XFSM Memory Ownership

## Ownership Map

This is a conceptual ownership diagram, not a literal MCU address map. Exact
flash and RAM addresses depend on the target, linker script, Espruino build,
and enabled services.

The companion [memory lifetime diagram](memory-lifetime.md) shows when these
objects and temporary regions are created, used, retained, and released.

```mermaid
flowchart TB
  APP["Application roots<br/>machine definitions, machine references,<br/>actor references and application data"]

  subgraph FLASH["Firmware flash"]
    CODE["XFSM native code<br/>wrapper metadata, read-only tables<br/>and diagnostic text"]
  end

  subgraph STORAGE["Persistent device Storage / flash"]
    MODULES["Optional flash-backed JavaScript<br/>programs and modules"]
    SAVE["Optional Espruino save() image<br/>stable interpreter object graph"]
  end

  subgraph RAM["RAM"]
    subgraph JSVARS["Espruino JsVar pool - garbage-collector managed"]
      SOURCE["Machine-definition object graph<br/>application-owned; releasable after compile"]
      WORKSPACE["Compiler workspace<br/>temporary metadata, paths and counters"]

      MACHINE["Compiled machine object<br/>opaque shared owner"]
      ARENA["Compiled native arena<br/>exact-sized flat string<br/>indexes and offsets only"]
      RETAINED["Retained-value container<br/>callbacks, literal context and<br/>other runtime JavaScript values"]
      CLOSURES["Callback lexical environments<br/>and referenced application values"]

      ACTOR_A["Actor A object and hidden children<br/>native actor block, context, snapshot,<br/>fault and subscriptions"]
      ACTOR_B["Actor B object and hidden children<br/>native actor block, context, snapshot,<br/>fault and subscriptions"]

      TRANSIENT["Per-operation JavaScript values<br/>event, pending context, temporary snapshot<br/>and notification references"]
    end

    subgraph CSTACK["Native C stack - temporary per call"]
      COMPILE_FRAME["createMachine compiler frames"]
      COORDINATOR["start / send / stop coordinator frame<br/>bounded hierarchy and microstep state"]
      CALLBACK_FRAME["Espruino and native callback frames"]
    end

    subgraph NATIVE_HEAP["Native heap"]
      HOST_HEAP["Espruino, SDK and service allocations<br/>no persistent XFSM-owned allocation"]
    end
  end

  APP -->|"supplies"| SOURCE
  APP -->|"keeps reachable"| MACHINE
  APP -->|"keeps reachable"| ACTOR_A
  APP -->|"keeps reachable"| ACTOR_B

  MACHINE -->|"hidden child owns"| ARENA
  MACHINE -->|"hidden child owns"| RETAINED
  RETAINED -->|"normal GC references may retain"| CLOSURES

  ACTOR_A -->|"retains shared machine"| MACHINE
  ACTOR_B -->|"retains shared machine"| MACHINE

  SOURCE -.->|"consumed during createMachine"| WORKSPACE
  WORKSPACE -.->|"publishes atomically on success"| MACHINE
  WORKSPACE -.->|"builds exact-sized output"| ARENA
  WORKSPACE -.->|"collects runtime values"| RETAINED

  CODE -.->|"executes"| COMPILE_FRAME
  CODE -.->|"executes"| COORDINATOR
  COMPILE_FRAME -.->|"temporarily locks and accesses"| SOURCE
  COMPILE_FRAME -.->|"temporarily locks and writes"| ARENA
  COORDINATOR -.->|"temporarily locks and reads"| ARENA
  COORDINATOR -.->|"temporarily locks and updates"| ACTOR_A
  COORDINATOR -.->|"owns for current operation"| TRANSIENT
  CALLBACK_FRAME -.->|"invokes retained functions"| RETAINED

  RETAINED -.->|"function object may use source backing"| MODULES
  MACHINE -.->|"save at interpreter idle"| SAVE
  ACTOR_A -.->|"save at interpreter idle"| SAVE
  ACTOR_B -.->|"save at interpreter idle"| SAVE

  classDef firmware fill:#d9ead3,stroke:#38761d,color:#111;
  classDef storage fill:#fff2cc,stroke:#bf9000,color:#111;
  classDef gc fill:#d9eaf7,stroke:#3d85c6,color:#111;
  classDef temporary fill:#fce5cd,stroke:#b45f06,color:#111;
  classDef host fill:#eeeeee,stroke:#666666,color:#111;

  class CODE firmware;
  class MODULES,SAVE storage;
  class SOURCE,MACHINE,ARENA,RETAINED,CLOSURES,ACTOR_A,ACTOR_B gc;
  class WORKSPACE,TRANSIENT,COMPILE_FRAME,COORDINATOR,CALLBACK_FRAME temporary;
  class HOST_HEAP host;
```

<div style="page-break-before: always;"></div>

Solid arrows describe persistent ownership or reachability. Dashed arrows
describe temporary access, construction, execution, or persistence activity;
they do not represent a native pointer retained after the call returns.

The important ownership rules are:

- The compiled arena contains native records, but its physical storage is an
  Espruino flat string in the GC-managed JsVar pool.
- The machine owns the arena and retained-value container through hidden,
  garbage-collector-visible children. Releasing the last machine or actor
  reference makes that graph eligible for collection.
- Actors retain their shared compiled machine but separately own all changing
  runtime state. Actor A and Actor B therefore share the arena without sharing
  active state, context, snapshots, faults, subscriptions, or operation state.
- Native records refer to JavaScript values by retained-slot index. They never
  retain a `JsVar *`, `JsVarRef`, or pointer into the arena between calls.
- Compiler workspace, coordinator state, locks, pending values, and callback
  frames are temporary. Every success and failure path must release them before
  returning to application JavaScript.
- XFSM has no persistent native-heap allocation or global actor registry.
  Persistent state remains reachable through ordinary Espruino object graphs.
- Retaining a flash-backed callback keeps its JavaScript function value
  reachable but does not copy its source into RAM. Its Storage or module
  backing must remain valid while the machine can invoke it.
- `save()` records a stable interpreter object graph only after Espruino
  returns to idle. It does not persist a live coordinator frame, arena pointer,
  pending state, or partially completed notification.
