import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { assign, createActor, createMachine } from "xstate";

const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));
assert.equal(packageMetadata.version, "5.33.2");

let sequence = 0;
let passed = true;
const caseId = "XFC-CF-COMPAT-006";
function emit(kind, fields = {}) {
  const record = {
    schema: "xfc.trace",
    version: 1,
    case: caseId,
    sequence: sequence++,
    kind
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) record[key] = value;
  }
  console.log(JSON.stringify(record));
}
function check(name, ok, actual, expected) {
  if (!ok) passed = false;
  const fields = { name, pass: Boolean(ok) };
  if (arguments.length >= 3) fields.actual = actual;
  if (arguments.length >= 4) fields.expected = expected;
  emit("assertion", fields);
}
function traceAction(name, context, event) {
  emit("action", { name, context: context?.count, eventType: event.type });
}
function snapshot(point, value) {
  emit("snapshot", { point, status: value.status, value: value.value });
}

emit("case", {
  name: "shared Profile 1 and XState 5.33.2 statechart semantics",
  classification: "differential"
});
emit("context", {
  point: "reference",
  value: {
    engine: "xstate",
    version: "5.33.2",
    adaptations: [
      "callback argument shape",
      "assign callback syntax",
      "actor lifecycle API",
      "imports and module wrapper"
    ]
  }
});

const action = (name) => ({ context, event }) => traceAction(name, context, event);
const basicNotifications = [];
const basic = createActor(createMachine({
  initial: { target: "Idle", actions: action("initial") },
  states: {
    Idle: {
      entry: action("enterIdle"),
      exit: action("exitIdle"),
      on: { GO: { target: "Done", actions: action("go") } }
    },
    Done: { entry: action("enterDone") }
  }
}));
basic.subscribe((value) => basicNotifications.push(value.value));
emit("call", { operation: "start", input: null });
basic.start();
snapshot("basic started", basic.getSnapshot());
emit("call", { operation: "send", input: { type: "GO" } });
basic.send({ type: "GO" });
snapshot("basic transitioned", basic.getSnapshot());
check("committed subscription timing",
  basicNotifications.join(",") === "Idle,Done",
  basicNotifications, ["Idle", "Done"]);

const selection = [];
const selectionActor = createActor(createMachine({
  initial: "Parent",
  states: {
    Parent: {
      initial: "Child",
      states: {
        Child: {
          on: {
            GO: { guard: "never", actions: action("wrong") },
            BLOCK: [{ guard: "never", actions: action("wrong") }, {}],
            "*": { guard: "notFall", actions: "childWildcard" }
          }
        }
      },
      on: { FALL: { actions: "parentFall" } }
    }
  }
}, {
  guards: {
    never: ({ event }) => {
      selection.push(`never:${event.type}`);
      emit("context", { point: "guard", value: {
        name: "never", event: event.type, decision: false
      }});
      return false;
    },
    notFall: ({ event }) => {
      const decision = event.type !== "FALL";
      selection.push(`notFall:${event.type}:${decision}`);
      emit("context", { point: "guard", value: {
        name: "notFall", event: event.type, decision
      }});
      return decision;
    }
  },
  actions: {
    childWildcard: ({ event }) => {
      selection.push(`child:${event.type}`);
      emit("action", { name: "childWildcard", eventType: event.type });
    },
    parentFall: ({ event }) => {
      selection.push(`parent:${event.type}`);
      emit("action", { name: "parentFall", eventType: event.type });
    }
  }
})).start();
selectionActor.send({ type: "GO" });
selectionActor.send({ type: "FALL" });
selectionActor.send({ type: "BLOCK" });
check("ordered guards wildcard and parent fallback",
  selection.join("|") ===
    "never:GO|notFall:GO:true|child:GO|notFall:FALL:false|parent:FALL|never:BLOCK",
  selection.join("|"),
  "never:GO|notFall:GO:true|child:GO|notFall:FALL:false|parent:FALL|never:BLOCK");

const suppliedEvent = { type: "UPDATE", payload: 7 };
let seenEvent;
const ordered = [];
const assignmentActor = createActor(createMachine({
  context: { count: 0 },
  initial: "Active",
  states: {
    Active: {
      on: {
        UPDATE: {
          actions: [
            ({ context, event }) => {
              ordered.push(`before:${context.count}`);
              seenEvent = event;
            },
            assign({
              count: ({ context, event }) => context.count + event.payload
            }),
            ({ context, event }) => {
              ordered.push(`after:${context.count}`);
              seenEvent = seenEvent === event ? event : undefined;
            }
          ]
        }
      }
    }
  }
})).start();
assignmentActor.send(suppliedEvent);
emit("context", { point: "assigned", value: {
  count: assignmentActor.getSnapshot().context.count
}});
check("ordered assignment and exact object event",
  ordered.join("|") === "before:0|after:7" && seenEvent === suppliedEvent,
  ordered.join("|"), "before:0|after:7");

let factorySequence = 0;
const factoryMachine = createMachine({
  context: () => ({ count: ++factorySequence, nested: {} }),
  initial: "Active",
  states: { Active: {} }
});
const factoryA = createActor(factoryMachine).start();
const factoryB = createActor(factoryMachine).start();
check("factory context isolation",
  factoryA.getSnapshot().context !== factoryB.getSnapshot().context &&
  factoryA.getSnapshot().context.nested !== factoryB.getSnapshot().context.nested &&
  factoryA.getSnapshot().context.count === 1 &&
  factoryB.getSnapshot().context.count === 2);

const selfTrace = [];
const selfMark = (name) => ({ event }) => {
  selfTrace.push(name);
  emit("action", { name, eventType: event.type });
};
const selfActor = createActor(createMachine({
  initial: "Active",
  states: {
    Active: {
      entry: selfMark("entry"),
      exit: selfMark("exit"),
      on: {
        TARGETLESS: { actions: selfMark("targetless") },
        PRESERVE: { target: "Active", actions: selfMark("preserve") },
        REENTER: { target: "Active", reenter: true, actions: selfMark("reenter") }
      }
    }
  }
})).start();
selfTrace.length = 0;
selfActor.send({ type: "TARGETLESS" });
selfActor.send({ type: "PRESERVE" });
selfActor.send({ type: "REENTER" });
check("targetless preserved and re-entering self transitions",
  selfTrace.join("|") === "targetless|preserve|exit|reenter|entry",
  selfTrace.join("|"), "targetless|preserve|exit|reenter|entry");

const hierarchyTrace = [];
const hierarchyMark = (name) => ({ event }) => {
  hierarchyTrace.push(name);
  emit("action", { name, eventType: event.type });
};
const hierarchy = createActor(createMachine({
  id: "hierarchy",
  initial: "Parent",
  states: {
    Parent: {
      initial: "A",
      entry: hierarchyMark("enterParent"),
      exit: hierarchyMark("exitParent"),
      states: {
        A: {
          entry: hierarchyMark("enterA"),
          exit: hierarchyMark("exitA"),
          on: { NEXT: "B" }
        },
        B: {
          entry: hierarchyMark("enterB"),
          exit: hierarchyMark("exitB"),
          on: { OUT: "#hierarchy.Outside" }
        }
      },
      on: { RESET: ".A" }
    },
    Outside: { entry: hierarchyMark("enterOutside") }
  }
})).start();
hierarchyTrace.length = 0;
hierarchy.send({ type: "NEXT" });
hierarchy.send({ type: "RESET" });
hierarchy.send({ type: "NEXT" });
hierarchy.send({ type: "OUT" });
snapshot("cross hierarchy", hierarchy.getSnapshot());
check("relative ID and cross-hierarchy boundaries",
  hierarchyTrace.join("|") ===
    "exitA|enterB|exitB|enterA|exitA|enterB|exitB|exitParent|enterOutside",
  hierarchyTrace.join("|"),
  "exitA|enterB|exitB|enterA|exitA|enterB|exitB|exitParent|enterOutside");

const completionTrace = [];
const completionMark = (name) => ({ event }) => {
  completionTrace.push(`${name}:${event.type}`);
  emit("action", { name, eventType: event.type });
};
const completion = createActor(createMachine({
  id: "completion",
  initial: "Workflow",
  states: {
    Workflow: {
      initial: "Working",
      exit: completionMark("exitWorkflow"),
      states: {
        Working: {
          exit: completionMark("exitWorking"),
          on: { FINISH: { target: "Completed", actions: completionMark("finish") } }
        },
        Completed: {
          type: "final",
          entry: completionMark("enterCompleted"),
          exit: completionMark("exitCompleted")
        }
      },
      onDone: { target: "Success", actions: completionMark("done") }
    },
    Success: { entry: completionMark("enterSuccess") }
  }
})).start();
completionTrace.length = 0;
completion.send({ type: "FINISH" });
snapshot("completion stable", completion.getSnapshot());
check("final state completion ordering",
  completionTrace.join("|") === [
    "exitWorking:FINISH", "finish:FINISH", "enterCompleted:FINISH",
    "exitCompleted:xstate.done.state.completion.Workflow",
    "exitWorkflow:xstate.done.state.completion.Workflow",
    "done:xstate.done.state.completion.Workflow",
    "enterSuccess:xstate.done.state.completion.Workflow"
  ].join("|"), completionTrace);

const nested = createActor(createMachine({
  initial: "Parent",
  states: {
    Parent: {
      initial: "Child",
      states: {
        Child: { on: { NEXT: "Grand" } },
        Grand: { initial: "Leaf", states: { Leaf: {} } }
      }
    }
  }
})).start();
nested.send({ type: "NEXT" });
const nestedSnapshot = nested.getSnapshot();
snapshot("nested structural value", nestedSnapshot);
check("structural snapshot matching",
  nestedSnapshot.matches("Parent") &&
  nestedSnapshot.matches({ Parent: "Grand" }) &&
  nestedSnapshot.matches({ Parent: { Grand: "Leaf" } }));

let depthActions = 0;
let depthLeaf = {
  id: "deepLeaf",
  entry: () => { depthActions++; },
  exit: () => { depthActions++; },
  on: { RESET: { target: "#deep.L1", actions: () => { depthActions++; } } }
};
for (let depth = 31; depth >= 1; depth--) {
  const child = `L${depth + 1}`;
  depthLeaf = {
    initial: child,
    entry: () => { depthActions++; },
    exit: () => { depthActions++; },
    states: { [child]: depthLeaf }
  };
}
const deep = createActor(createMachine({
  id: "deep", initial: "L1", states: { L1: depthLeaf }
})).start();
check("depth 32 startup actions", depthActions === 32, depthActions, 32);
depthActions = 0;
deep.send({ type: "RESET" });
check("depth 32 least-common-ancestor action count",
  depthActions === 65, depthActions, 65);

emit("result", { pass: passed });
if (!passed) process.exitCode = 1;
