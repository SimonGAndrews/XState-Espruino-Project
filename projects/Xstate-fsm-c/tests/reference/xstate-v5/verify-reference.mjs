import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { assign, createActor, createMachine } from "xstate";

const expectedVersion = "5.33.2";
const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));

assert.equal(packageMetadata.version, expectedVersion);

const machine = createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        GO: "done"
      }
    },
    done: {}
  }
});

const observedStates = [];
const actor = createActor(machine);
actor.subscribe((snapshot) => observedStates.push(snapshot.value));
actor.start();
actor.send({ type: "GO" });

assert.deepEqual(observedStates, ["idle", "done"]);

const completionTrace = [];
const completionStates = [];
const mark = (name) => ({ event }) => {
  completionTrace.push(`${name}:${event.type}`);
};
const completionMachine = createMachine({
  id: "Final state and parent done transition",
  initial: "Workflow",
  states: {
    Workflow: {
      initial: "Working",
      entry: "enterWorkflow",
      exit: "exitWorkflow",
      states: {
        Working: {
          entry: "enterWorking",
          exit: "exitWorking",
          on: {
            finish: { target: "Completed", actions: "recordFinish" }
          }
        },
        Completed: {
          type: "final",
          entry: "enterCompleted",
          exit: "exitCompleted"
        }
      },
      onDone: { target: "Success", actions: "recordDone" }
    },
    Success: { entry: "enterSuccess" }
  }
}, {
  actions: Object.fromEntries([
    "enterWorkflow", "exitWorkflow", "enterWorking", "exitWorking",
    "recordFinish", "enterCompleted", "exitCompleted", "recordDone",
    "enterSuccess"
  ].map((name) => [name, mark(name)]))
});
const completionActor = createActor(completionMachine);
completionActor.subscribe((snapshot) => completionStates.push(snapshot.value));
completionActor.start();
completionActor.send({ type: "finish" });

assert.deepEqual(completionStates, [
  { Workflow: "Working" },
  "Success"
]);
assert.deepEqual(completionTrace, [
  "enterWorkflow:xstate.init",
  "enterWorking:xstate.init",
  "exitWorking:finish",
  "recordFinish:finish",
  "enterCompleted:finish",
  "exitCompleted:xstate.done.state.Final state and parent done transition.Workflow",
  "exitWorkflow:xstate.done.state.Final state and parent done transition.Workflow",
  "recordDone:xstate.done.state.Final state and parent done transition.Workflow",
  "enterSuccess:xstate.done.state.Final state and parent done transition.Workflow"
]);

const cascadeTrace = [];
const cascadeMark = (name) => ({ event }) => {
  cascadeTrace.push(`${name}:${event.type}`);
};
const cascadeMachine = createMachine({
  id: "cascade",
  initial: "Outer",
  states: {
    Outer: {
      initial: "Middle",
      exit: "exitOuter",
      states: {
        Middle: {
          initial: "InnerFinal",
          exit: "exitMiddle",
          states: {
            InnerFinal: {
              type: "final",
              entry: "enterInnerFinal",
              exit: "exitInnerFinal"
            }
          },
          onDone: { target: "OuterFinal", actions: "middleDone" }
        },
        OuterFinal: {
          type: "final",
          entry: "enterOuterFinal",
          exit: "exitOuterFinal"
        }
      },
      onDone: { target: "Success", actions: "outerDone" }
    },
    Success: { entry: "enterCascadeSuccess" }
  }
}, {
  actions: Object.fromEntries([
    "enterInnerFinal", "exitInnerFinal", "exitMiddle", "middleDone",
    "enterOuterFinal", "exitOuterFinal", "exitOuter", "outerDone",
    "enterCascadeSuccess"
  ].map((name) => [name, cascadeMark(name)]))
});
const cascadeActor = createActor(cascadeMachine).start();
assert.equal(cascadeActor.getSnapshot().value, "Success");
assert.deepEqual(cascadeTrace, [
  "enterInnerFinal:xstate.init",
  "exitInnerFinal:xstate.done.state.cascade.Outer.Middle",
  "exitMiddle:xstate.done.state.cascade.Outer.Middle",
  "middleDone:xstate.done.state.cascade.Outer.Middle",
  "enterOuterFinal:xstate.done.state.cascade.Outer.Middle",
  "exitOuterFinal:xstate.done.state.cascade.Outer",
  "exitOuter:xstate.done.state.cascade.Outer",
  "outerDone:xstate.done.state.cascade.Outer",
  "enterCascadeSuccess:xstate.done.state.cascade.Outer"
]);

const initialDoneTrace = [];
const initialDoneMark = (name) => ({ event }) => {
  initialDoneTrace.push(`${name}:${event.type}`);
};
const initialDoneMachine = createMachine({
  entry: "enterInitialRoot",
  exit: "exitInitialRoot",
  initial: "Complete",
  states: {
    Complete: {
      type: "final",
      entry: "enterInitialComplete",
      exit: "exitInitialComplete"
    }
  }
}, {
  actions: Object.fromEntries([
    "enterInitialRoot", "exitInitialRoot", "enterInitialComplete",
    "exitInitialComplete"
  ].map((name) => [name, initialDoneMark(name)]))
});
const initialDoneActor = createActor(initialDoneMachine).start();
assert.equal(initialDoneActor.getSnapshot().status, "done");
assert.equal(initialDoneActor.getSnapshot().value, "Complete");
assert.deepEqual(initialDoneTrace, [
  "enterInitialRoot:xstate.init",
  "enterInitialComplete:xstate.init",
  "exitInitialComplete:xstate.init",
  "exitInitialRoot:xstate.init"
]);

const hierarchyTrace = [];
const hierarchyMark = (name) => () => hierarchyTrace.push(name);
const hierarchyMachine = createMachine({
  id: "hierarchy",
  initial: "Parent",
  states: {
    Parent: {
      initial: "A",
      entry: "enterParent",
      exit: "exitParent",
      states: {
        A: {
          entry: "enterA",
          exit: "exitA",
          on: { NEXT: "B" }
        },
        B: {
          entry: "enterB",
          exit: "exitB",
          on: { OUT: "#hierarchy.Outside" }
        }
      },
      on: { RESET: ".A" }
    },
    Outside: { entry: "enterOutside" }
  }
}, {
  actions: Object.fromEntries([
    "enterParent", "exitParent", "enterA", "exitA", "enterB", "exitB",
    "enterOutside"
  ].map((name) => [name, hierarchyMark(name)]))
});
const hierarchyActor = createActor(hierarchyMachine).start();
hierarchyTrace.length = 0;
hierarchyActor.send({ type: "NEXT" });
hierarchyActor.send({ type: "RESET" });
hierarchyActor.send({ type: "NEXT" });
hierarchyActor.send({ type: "OUT" });
assert.equal(hierarchyActor.getSnapshot().value, "Outside");
assert.deepEqual(hierarchyTrace, [
  "exitA", "enterB",
  "exitB", "enterA",
  "exitA", "enterB",
  "exitB", "exitParent", "enterOutside"
]);

const wildcardTrace = [];
const wildcardMachine = createMachine({
  initial: "Parent",
  states: {
    Parent: {
      initial: "Child",
      states: {
        Child: {
          on: {
            "*": { guard: "notFall", actions: "childWildcard" },
            GO: { guard: "never", actions: "wrong" },
            BLOCK: [
              { guard: "never", actions: "wrong" },
              {}
            ],
            STOP: {},
            STOP_UNDEFINED: undefined,
            STOP_TARGET_UNDEFINED: { target: undefined }
          }
        }
      },
      on: {
        FALL: { actions: "parentFall" },
        "*": { actions: "parentWildcard" }
      }
    }
  }
}, {
  actions: {
    childWildcard: () => wildcardTrace.push("childWildcard"),
    parentFall: () => wildcardTrace.push("parentFall"),
    parentWildcard: () => wildcardTrace.push("parentWildcard"),
    wrong: () => wildcardTrace.push("wrong")
  },
  guards: {
    never: () => {
      wildcardTrace.push("never");
      return false;
    },
    notFall: ({ event }) => {
      wildcardTrace.push(`notFall:${event.type}`);
      return event.type !== "FALL";
    }
  }
});
const wildcardActor = createActor(wildcardMachine).start();
wildcardActor.send({ type: "GO" });
wildcardActor.send({ type: "FALL" });
wildcardActor.send({ type: "OTHER" });
wildcardActor.send({ type: "BLOCK" });
wildcardActor.send({ type: "STOP" });
wildcardActor.send({ type: "STOP_UNDEFINED" });
wildcardActor.send({ type: "STOP_TARGET_UNDEFINED" });
assert.deepEqual(wildcardTrace, [
  "never", "notFall:GO", "childWildcard",
  "notFall:FALL", "parentFall",
  "notFall:OTHER", "childWildcard", "never"
]);

const selfTrace = [];
const selfMachine = createMachine({
  initial: "Active",
  states: {
    Active: {
      entry: () => selfTrace.push("entry"),
      exit: () => selfTrace.push("exit"),
      on: {
        TARGETLESS: { actions: () => selfTrace.push("targetless") },
        PRESERVE: {
          target: "Active",
          actions: () => selfTrace.push("preserve")
        },
        REENTER: {
          target: "Active",
          reenter: true,
          actions: () => selfTrace.push("reenter")
        }
      }
    }
  }
});
const selfActor = createActor(selfMachine).start();
selfTrace.length = 0;
selfActor.send({ type: "TARGETLESS" });
selfActor.send({ type: "PRESERVE" });
selfActor.send({ type: "REENTER" });
assert.deepEqual(selfTrace, [
  "targetless", "preserve", "exit", "reenter", "entry"
]);

const literalContext = { count: 0, nested: { shared: true } };
const literalContextMachine = createMachine({
  context: literalContext,
  initial: "Active",
  states: {
    Active: {
      on: {
        UPDATE: {
          actions: assign({
            count: ({ context }) => context.count + 1
          })
        }
      }
    }
  }
});
const literalActorA = createActor(literalContextMachine).start();
const literalActorB = createActor(literalContextMachine).start();
const literalInitialA = literalActorA.getSnapshot().context;
const literalInitialB = literalActorB.getSnapshot().context;
literalActorA.send({ type: "UPDATE" });
const literalUpdatedA = literalActorA.getSnapshot().context;
assert.equal(literalInitialA, literalContext);
assert.equal(literalInitialB, literalContext);
assert.notEqual(literalUpdatedA, literalContext);
assert.equal(literalUpdatedA.count, 1);
assert.equal(literalUpdatedA.nested, literalContext.nested);
assert.equal(literalActorB.getSnapshot().context, literalContext);
assert.equal(literalContext.count, 0);

const contextTrace = [];
const fixedValue = { retained: true };
const assignmentMachine = createMachine({
  context: { count: 1 },
  initial: "Active",
  states: {
    Active: {
      on: {
        UPDATE: {
          actions: [
            ({ context }) => contextTrace.push(context),
            assign(({ context, event }) => ({
              count: context.count + 1,
              fromPartial: event.payload
            })),
            ({ context }) => contextTrace.push(context),
            assign({
              count: ({ context }) => context.count + 1,
              oldCount: ({ context }) => context.count,
              fixedValue
            }),
            ({ context }) => contextTrace.push(context),
            assign({}),
            ({ context }) => contextTrace.push(context)
          ]
        }
      }
    }
  }
});
const assignmentActor = createActor(assignmentMachine).start();
const assignmentInitial = assignmentActor.getSnapshot().context;
assignmentActor.send({ type: "UPDATE", payload: 42 });
const assignmentFinal = assignmentActor.getSnapshot().context;
assert.equal(contextTrace.length, 4);
assert.equal(contextTrace[0], assignmentInitial);
assert.notEqual(contextTrace[1], contextTrace[0]);
assert.equal(contextTrace[1].count, 2);
assert.equal(contextTrace[1].fromPartial, 42);
assert.notEqual(contextTrace[2], contextTrace[1]);
assert.equal(contextTrace[2].count, 3);
assert.equal(contextTrace[2].oldCount, 2);
assert.equal(contextTrace[2].fixedValue, fixedValue);
assert.notEqual(contextTrace[3], contextTrace[2]);
assert.equal(contextTrace[3], assignmentFinal);

let factoryCalls = 0;
const factoryMachine = createMachine({
  context: () => ({ owner: ++factoryCalls, nested: {} }),
  initial: "Active",
  states: { Active: {} }
});
const factoryActorA = createActor(factoryMachine);
const factoryActorB = createActor(factoryMachine);
const factoryCallsAfterCreateActor = factoryCalls;
factoryActorA.start();
factoryActorB.start();
assert.equal(factoryCallsAfterCreateActor, 2);
assert.equal(factoryCalls, 2);
assert.notEqual(
  factoryActorA.getSnapshot().context,
  factoryActorB.getSnapshot().context
);
assert.notEqual(
  factoryActorA.getSnapshot().context.nested,
  factoryActorB.getSnapshot().context.nested
);

const transitionDomainTrace = [];
const domainActionNames = [
  "enterRoot", "exitRoot", "enterParent", "exitParent", "initParent",
  "enterA", "exitA", "enterB", "exitB", "initB", "enterDeep",
  "exitDeep", "enterSibling", "exitSibling", "enterOther", "exitOther",
  "enterC", "exitC", "enterLeaf", "exitLeaf", "targetless", "wrong",
  "atomicSelf", "atomicReenter", "compoundSelf", "compoundReenter",
  "toDescendant", "toDescendantReenter", "rootToDescendant",
  "rootReenterDescendant", "toAncestor", "toAncestorReenter",
  "toSibling", "cross", "crossReenter"
];
const transitionDomainMachine = createMachine({
  id: "domains",
  initial: "Parent",
  entry: "enterRoot",
  exit: "exitRoot",
  states: {
    Parent: {
      entry: "enterParent",
      exit: "exitParent",
      initial: { target: "A", actions: "initParent" },
      states: {
        A: {
          entry: "enterA",
          exit: "exitA",
          on: {
            TARGETLESS: { reenter: true, actions: "targetless" },
            BLOCK: {},
            ATOMIC_SELF: { target: "A", actions: "atomicSelf" },
            ATOMIC_REENTER: {
              target: "A", reenter: true, actions: "atomicReenter"
            }
          }
        },
        B: {
          entry: "enterB",
          exit: "exitB",
          initial: { target: "Deep", actions: "initB" },
          states: {
            Deep: {
              entry: "enterDeep",
              exit: "exitDeep",
              on: {
                TO_ANCESTOR: {
                  target: "#domains.Parent", actions: "toAncestor"
                },
                TO_ANCESTOR_REENTER: {
                  target: "#domains.Parent", reenter: true,
                  actions: "toAncestorReenter"
                },
                TO_SIBLING: {
                  target: "Sibling", actions: "toSibling"
                },
                CROSS: {
                  target: "#domains.Other.C.Leaf", actions: "cross"
                },
                CROSS_REENTER: {
                  target: "#domains.Other.C.Leaf", reenter: true,
                  actions: "crossReenter"
                }
              }
            },
            Sibling: { entry: "enterSibling", exit: "exitSibling" }
          }
        }
      },
      on: {
        COMPOUND_SELF: {
          target: "Parent", actions: "compoundSelf"
        },
        COMPOUND_REENTER: {
          target: "Parent", reenter: true, actions: "compoundReenter"
        },
        TO_DESCENDANT: {
          target: ".B.Deep", actions: "toDescendant"
        },
        TO_DESCENDANT_REENTER: {
          target: ".B.Deep", reenter: true,
          actions: "toDescendantReenter"
        }
      }
    },
    Other: {
      entry: "enterOther",
      exit: "exitOther",
      initial: "C",
      states: {
        C: {
          entry: "enterC",
          exit: "exitC",
          initial: "Leaf",
          states: {
            Leaf: { entry: "enterLeaf", exit: "exitLeaf" }
          }
        }
      }
    }
  },
  on: {
    BLOCK: { actions: "wrong" },
    ROOT_TO_DESCENDANT: {
      target: ".Parent.B.Deep", actions: "rootToDescendant"
    },
    ROOT_REENTER_DESCENDANT: {
      target: ".Parent.B.Deep", reenter: true,
      actions: "rootReenterDescendant"
    }
  }
}, {
  actions: Object.fromEntries(domainActionNames.map((name) => [
    name, () => transitionDomainTrace.push(name)
  ]))
});

function runTransitionDomain(event, setup) {
  const actor = createActor(transitionDomainMachine).start();
  transitionDomainTrace.length = 0;
  if (setup) {
    actor.send({ type: setup });
    transitionDomainTrace.length = 0;
  }
  actor.send({ type: event });
  const observed = {
    trace: transitionDomainTrace.join("|"),
    value: actor.getSnapshot().value
  };
  transitionDomainTrace.length = 0;
  actor.stop();
  return observed;
}

const transitionDomainExpected = [
  ["TARGETLESS", undefined, "targetless", { Parent: "A" }],
  ["BLOCK", undefined, "", { Parent: "A" }],
  ["ATOMIC_SELF", undefined, "atomicSelf", { Parent: "A" }],
  ["ATOMIC_REENTER", undefined,
    "exitA|atomicReenter|enterA", { Parent: "A" }],
  ["COMPOUND_SELF", undefined,
    "exitA|compoundSelf|enterA", { Parent: "A" }],
  ["COMPOUND_REENTER", undefined,
    "exitA|exitParent|compoundReenter|enterParent|initParent|enterA",
    { Parent: "A" }],
  ["TO_DESCENDANT", undefined,
    "exitA|toDescendant|enterB|enterDeep", { Parent: { B: "Deep" } }],
  ["TO_DESCENDANT_REENTER", undefined,
    "exitA|exitParent|toDescendantReenter|enterParent|enterB|enterDeep",
    { Parent: { B: "Deep" } }],
  ["ROOT_TO_DESCENDANT", undefined,
    "exitA|exitParent|rootToDescendant|enterParent|enterB|enterDeep",
    { Parent: { B: "Deep" } }],
  ["ROOT_REENTER_DESCENDANT", undefined,
    "exitA|exitParent|exitRoot|rootReenterDescendant|enterRoot|" +
    "enterParent|enterB|enterDeep", { Parent: { B: "Deep" } }],
  ["TO_ANCESTOR", "TO_DESCENDANT",
    "exitDeep|exitB|exitParent|toAncestor|enterParent|initParent|enterA",
    { Parent: "A" }],
  ["TO_ANCESTOR_REENTER", "TO_DESCENDANT",
    "exitDeep|exitB|exitParent|toAncestorReenter|enterParent|" +
    "initParent|enterA", { Parent: "A" }],
  ["TO_SIBLING", "TO_DESCENDANT",
    "exitDeep|toSibling|enterSibling", { Parent: { B: "Sibling" } }],
  ["CROSS", "TO_DESCENDANT",
    "exitDeep|exitB|exitParent|cross|enterOther|enterC|enterLeaf",
    { Other: { C: "Leaf" } }],
  ["CROSS_REENTER", "TO_DESCENDANT",
    "exitDeep|exitB|exitParent|crossReenter|enterOther|enterC|enterLeaf",
    { Other: { C: "Leaf" } }]
];
const transitionDomainResults = transitionDomainExpected.map(
  ([event, setup, expectedTrace, expectedValue]) => {
    const observed = runTransitionDomain(event, setup);
    assert.equal(observed.trace, expectedTrace, event);
    assert.deepEqual(observed.value, expectedValue, event);
    return [event, observed.trace];
  }
);

const nestedInitialTrace = [];
const nestedInitialMachine = createMachine({
  id: "nestedInitial",
  initial: "Parent",
  states: {
    Parent: {
      initial: { target: "Nested", actions: "initParentNested" },
      states: {
        Nested: {
          initial: { target: "Leaf", actions: "initNested" },
          states: { Leaf: {} }
        }
      },
      on: {
        NESTED_COMPOUND_SELF: {
          target: "Parent", actions: "nestedCompoundSelf"
        }
      }
    }
  }
}, {
  actions: Object.fromEntries([
    "initParentNested", "initNested", "nestedCompoundSelf"
  ].map((name) => [name, () => nestedInitialTrace.push(name)]))
});
const nestedInitialActor = createActor(nestedInitialMachine).start();
nestedInitialTrace.length = 0;
nestedInitialActor.send({ type: "NESTED_COMPOUND_SELF" });
assert.deepEqual(nestedInitialTrace, ["nestedCompoundSelf", "initNested"]);
assert.deepEqual(nestedInitialActor.getSnapshot().value, {
  Parent: { Nested: "Leaf" }
});
transitionDomainResults.push([
  "NESTED_COMPOUND_SELF", nestedInitialTrace.join("|")
]);

const maximumDepthTrace = [];
let maximumDepthLeaf = {
  id: "deepLeaf",
  entry: "enter",
  exit: "exit",
  on: { RESET: { target: "#deep.L1", actions: "reset" } }
};
for (let depth = 31; depth >= 1; depth--) {
  const child = `L${depth + 1}`;
  maximumDepthLeaf = {
    initial: child,
    entry: "enter",
    exit: "exit",
    states: { [child]: maximumDepthLeaf }
  };
}
const maximumDepthMachine = createMachine({
  id: "deep",
  initial: "L1",
  states: { L1: maximumDepthLeaf }
}, {
  actions: {
    enter: () => maximumDepthTrace.push("enter"),
    exit: () => maximumDepthTrace.push("exit"),
    reset: () => maximumDepthTrace.push("reset")
  }
});
const maximumDepthActor = createActor(maximumDepthMachine).start();
assert.deepEqual(maximumDepthTrace, Array(32).fill("enter"));
maximumDepthTrace.length = 0;
maximumDepthActor.send({ type: "RESET" });
assert.deepEqual(maximumDepthTrace, [
  ...Array(32).fill("exit"),
  "reset",
  ...Array(32).fill("enter")
]);
assert.equal(maximumDepthActor.getSnapshot().matches("L1"), true);

const closureActionTrace = [];
let closureEvent;
let closureGuardEvent;
let closureActionEvent;
let closureThenObserved = false;
const closureActionMachine = createMachine({
  context: { count: 0 },
  initial: {
    target: "Active",
    actions: ["initialAction", assign({ count: 1 })]
  },
  states: {
    Active: {
      entry: "activeEntry",
      exit: "activeExit",
      on: {
        GO: {
          target: "Done",
          guard: "captureGuard",
          actions: [
            "ignoredReturn",
            assign({ count: ({ context }) => context.count + 1 }),
            "afterAssign"
          ]
        }
      }
    },
    Done: { type: "final", entry: "doneEntry" }
  }
}, {
  actions: {
    initialAction: ({ context, event }) =>
      closureActionTrace.push(`initial:${event.type}:${context.count}`),
    activeEntry: ({ context, event }) =>
      closureActionTrace.push(`entry:${event.type}:${context.count}`),
    activeExit: ({ context, event }) =>
      closureActionTrace.push(`exit:${event.type}:${context.count}`),
    ignoredReturn: ({ context, event }) => {
      closureActionEvent = event;
      closureActionTrace.push(`ordinary:${event.type}:${context.count}`);
      return { then: () => { closureThenObserved = true; } };
    },
    afterAssign: ({ context, event }) =>
      closureActionTrace.push(`after:${event.type}:${context.count}`),
    doneEntry: ({ context, event }) =>
      closureActionTrace.push(`done:${event.type}:${context.count}`)
  },
  guards: {
    captureGuard: ({ event }) => {
      closureGuardEvent = event;
      return {};
    }
  }
});
const closureActionActor = createActor(closureActionMachine).start();
closureEvent = { type: "GO", payload: 9 };
closureActionActor.send(closureEvent);
assert.deepEqual(closureActionTrace, [
  "initial:xstate.init:0",
  "entry:xstate.init:1",
  "exit:GO:1",
  "ordinary:GO:1",
  "after:GO:2",
  "done:GO:2"
]);
assert.equal(closureGuardEvent, closureEvent);
assert.equal(closureActionEvent, closureEvent);
assert.equal(closureThenObserved, false);

const closureSnapshotMachine = createMachine({
  initial: "Parent.With.Dot",
  states: {
    "Parent.With.Dot": {
      initial: "Child",
      states: {
        Child: { on: { NEXT: "Grand" } },
        Grand: { initial: "Leaf", states: { Leaf: {} } }
      }
    }
  }
});
const closureSnapshotActor = createActor(closureSnapshotMachine).start();
const closureSnapshotInitial = closureSnapshotActor.getSnapshot();
assert.deepEqual(closureSnapshotInitial.value, { "Parent.With.Dot": "Child" });
// XState parses a string match as a dotted path. Profile 1 deliberately treats
// it as one literal top-level key and records that difference separately.
assert.equal(closureSnapshotInitial.matches("Parent.With.Dot"), false);
assert.equal(
  closureSnapshotInitial.matches({ "Parent.With.Dot": "Child" }), true);
assert.equal(closureSnapshotInitial.matches("Parent"), false);
closureSnapshotActor.send({ type: "NEXT" });
const closureSnapshotNested = closureSnapshotActor.getSnapshot();
assert.deepEqual(closureSnapshotNested.value, {
  "Parent.With.Dot": { Grand: "Leaf" }
});
assert.equal(
  closureSnapshotNested.matches({ "Parent.With.Dot": "Grand" }), true);
assert.equal(closureSnapshotNested.matches({
  "Parent.With.Dot": { Grand: "Leaf" }
}), true);

console.log(JSON.stringify({
  reference: "xstate",
  version: packageMetadata.version,
  observedStates,
  completionStates,
  completionTrace,
  cascadeTrace,
  initialDoneTrace,
  hierarchyTrace,
  wildcardTrace,
  selfTrace,
  contextTrace: contextTrace.map(({ count, oldCount, fromPartial }) => ({
    count,
    oldCount,
    fromPartial
  })),
  factoryCallsAfterCreateActor,
  transitionDomainResults,
  maximumDepthTransitionActions: maximumDepthTrace.length,
  closureActionTrace,
  closureEventIdentity: closureGuardEvent === closureEvent &&
    closureActionEvent === closureEvent,
  closureSnapshotValues: [
    closureSnapshotInitial.value,
    closureSnapshotNested.value
  ],
  dottedStringMatchReference: false
}));
