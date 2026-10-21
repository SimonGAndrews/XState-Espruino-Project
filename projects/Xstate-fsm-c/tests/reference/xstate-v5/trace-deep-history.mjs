import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createActor, createMachine } from "xstate";

const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));
assert.equal(packageMetadata.version, "5.33.2");

const results = {
  schema: "xfc.xstate-deep-history-exploration",
  xstate: packageMetadata.version,
  cases: {}
};

const mark = (log, name) => () => log.push(name);
const value = (actor) => actor.getSnapshot().value;
const sendStep = (actor, log, event) => {
  log.length = 0;
  actor.send({ type: event });
  return { event, actions: [...log], value: value(actor) };
};

function summarizePersisted(actor) {
  const persisted = actor.getPersistedSnapshot();
  const history = {};
  for (const [key, nodes] of Object.entries(persisted.historyValue ?? {})) {
    history[key] = nodes.map((node) => node.id);
  }
  return {
    status: persisted.status,
    value: persisted.value,
    history
  };
}

{
  const log = [];
  const machine = createMachine({
    id: "deepOrder",
    initial: "working",
    states: {
      working: {
        id: "deepOrderWorking",
        entry: mark(log, "enter working"),
        exit: mark(log, "exit working"),
        initial: {
          target: "mode",
          actions: mark(log, "working initial")
        },
        states: {
          hist: { type: "history", history: "deep" },
          mode: {
            entry: mark(log, "enter mode"),
            exit: mark(log, "exit mode"),
            initial: {
              target: "phaseA",
              actions: mark(log, "mode initial")
            },
            states: {
              phaseA: {
                entry: mark(log, "enter phaseA"),
                exit: mark(log, "exit phaseA"),
                on: { NEXT: "phaseB" }
              },
              phaseB: {
                entry: mark(log, "enter phaseB"),
                exit: mark(log, "exit phaseB")
              }
            }
          }
        },
        on: { EXIT: "outside" }
      },
      outside: {
        entry: mark(log, "enter outside"),
        exit: mark(log, "exit outside"),
        on: {
          RESUME: {
            target: "#deepOrderWorking.hist",
            actions: mark(log, "transition resume")
          }
        }
      }
    }
  });
  const actor = createActor(machine).start();
  const steps = [
    { event: "start", actions: [...log], value: value(actor) },
    sendStep(actor, log, "NEXT"),
    sendStep(actor, log, "EXIT")
  ];
  const recorded = summarizePersisted(actor);
  steps.push(sendStep(actor, log, "RESUME"));
  assert.deepEqual(recorded.history, {
    "deepOrder.working.hist": ["deepOrder.working.mode.phaseB"]
  });
  assert.deepEqual(steps[3], {
    event: "RESUME",
    actions: [
      "exit outside",
      "transition resume",
      "enter working",
      "enter mode",
      "enter phaseB"
    ],
    value: { working: { mode: "phaseB" } }
  });
  results.cases.nestedRestoreAndActionOrder = { steps, recorded };
}

{
  const makeMachine = (id, target, log) => createMachine({
    id,
    initial: "outside",
    states: {
      outside: { on: { GO: `#${id}Owner.hist` } },
      owner: {
        id: `${id}Owner`,
        entry: mark(log, "enter owner"),
        initial: {
          target: "branch",
          actions: mark(log, "owner initial")
        },
        states: {
          hist: {
            type: "history",
            history: "deep",
            ...(target === undefined ? {} : { target })
          },
          branch: {
            entry: mark(log, "enter branch"),
            initial: {
              target: "phaseA",
              actions: mark(log, "branch initial")
            },
            states: {
              phaseA: { entry: mark(log, "enter phaseA") },
              phaseB: { entry: mark(log, "enter phaseB") }
            }
          }
        }
      }
    }
  });

  const normalLog = [];
  const normal = createActor(makeMachine("deepNormal", undefined, normalLog))
    .start();
  const normalFirstUse = sendStep(normal, normalLog, "GO");
  assert.deepEqual(normalFirstUse, {
    event: "GO",
    actions: [
      "enter owner",
      "owner initial",
      "enter branch",
      "enter phaseA"
    ],
    value: { owner: { branch: "phaseA" } }
  });

  const customLog = [];
  const custom = createActor(
    makeMachine("deepCustom", "branch.phaseB", customLog)
  ).start();
  const customFirstUse = sendStep(custom, customLog, "GO");
  assert.deepEqual(customFirstUse, {
    event: "GO",
    actions: ["enter owner", "enter branch", "enter phaseB"],
    value: { owner: { branch: "phaseB" } }
  });
  results.cases.firstUseFallback = { normalFirstUse, customFirstUse };
}

{
  const machine = createMachine({
    id: "nestedOwners",
    initial: "outer",
    states: {
      outer: {
        id: "nestedOuter",
        initial: "inner",
        states: {
          outerHist: { type: "history", history: "deep" },
          inner: {
            id: "nestedInner",
            initial: "phaseA",
            states: {
              innerHist: { type: "history", history: "deep" },
              phaseA: { on: { NEXT: "phaseB" } },
              phaseB: { on: { PARK: "#nestedOuter.parked" } }
            }
          },
          parked: { on: { RESUME_INNER: "#nestedInner.innerHist" } }
        },
        on: { LEAVE: "away" }
      },
      away: { on: { RESUME_OUTER: "#nestedOuter.outerHist" } }
    }
  });
  const actor = createActor(machine).start();
  actor.send({ type: "NEXT" });
  actor.send({ type: "LEAVE" });
  const recorded = summarizePersisted(actor);
  actor.send({ type: "RESUME_OUTER" });
  const outerRestored = value(actor);
  actor.send({ type: "PARK" });
  actor.send({ type: "RESUME_INNER" });
  const innerRestored = value(actor);
  assert.deepEqual(recorded.history, {
    "nestedOwners.outer.inner.innerHist": [
      "nestedOwners.outer.inner.phaseB"
    ],
    "nestedOwners.outer.outerHist": ["nestedOwners.outer.inner.phaseB"]
  });
  assert.deepEqual(outerRestored, { outer: { inner: "phaseB" } });
  assert.deepEqual(innerRestored, { outer: { inner: "phaseB" } });
  results.cases.nestedOwners = { recorded, outerRestored, innerRestored };
}

{
  const log = [];
  const machine = createMachine({
    id: "deepFinal",
    initial: "task",
    states: {
      task: {
        id: "deepFinalTask",
        entry: mark(log, "enter task"),
        exit: mark(log, "exit task"),
        initial: "phase",
        states: {
          hist: { type: "history", history: "deep" },
          phase: {
            entry: mark(log, "enter phase"),
            exit: mark(log, "exit phase"),
            initial: "active",
            states: {
              active: {
                entry: mark(log, "enter active"),
                exit: mark(log, "exit active"),
                on: { FINISH: "completed" }
              },
              completed: {
                type: "final",
                entry: mark(log, "enter completed"),
                exit: mark(log, "exit completed")
              }
            },
            onDone: {
              target: "#deepFinal.holding",
              actions: mark(log, "phase done")
            }
          }
        }
      },
      holding: {
        entry: mark(log, "enter holding"),
        exit: mark(log, "exit holding"),
        on: { RESUME: "#deepFinalTask.hist" }
      }
    }
  });
  const actor = createActor(machine).start();
  const finish = sendStep(actor, log, "FINISH");
  const recorded = summarizePersisted(actor);
  const resume = sendStep(actor, log, "RESUME");
  assert.equal(finish.value, "holding");
  assert.deepEqual(recorded.history, {
    "deepFinal.task.hist": ["deepFinal.task.phase.completed"]
  });
  assert.deepEqual(resume, {
    event: "RESUME",
    actions: [
      "exit holding",
      "enter task",
      "enter phase",
      "enter completed",
      "exit completed",
      "exit phase",
      "exit task",
      "phase done",
      "enter holding"
    ],
    value: "holding"
  });
  results.cases.finalLeafCompletion = { finish, recorded, resume };
}

{
  const errors = [];
  const machine = createMachine({
    id: "deepFault",
    initial: "working",
    states: {
      working: {
        id: "deepFaultWorking",
        exit: ({ event }) => {
          if (event.type === "FAIL") throw new Error("exit failed");
        },
        initial: "mode",
        states: {
          hist: { type: "history", history: "deep" },
          mode: {
            initial: "phaseA",
            states: {
              phaseA: { on: { NEXT: "phaseB" } },
              phaseB: { on: { BACK: "phaseA" } }
            }
          }
        },
        on: { EXIT: "outside", FAIL: "outside" }
      },
      outside: { on: { RESUME: "#deepFaultWorking.hist" } }
    }
  });
  const actor = createActor(machine);
  actor.subscribe({ error: (error) => errors.push(String(error)) });
  actor.start();
  actor.send({ type: "NEXT" });
  actor.send({ type: "EXIT" });
  actor.send({ type: "RESUME" });
  actor.send({ type: "BACK" });
  const beforeFault = summarizePersisted(actor);
  actor.send({ type: "FAIL" });
  const afterFault = summarizePersisted(actor);
  assert.deepEqual(beforeFault.history, {
    "deepFault.working.hist": ["deepFault.working.mode.phaseB"]
  });
  assert.equal(afterFault.status, "error");
  assert.deepEqual(afterFault.value, beforeFault.value);
  assert.deepEqual(afterFault.history, beforeFault.history);
  results.cases.faultRollback = { beforeFault, afterFault, errors };
}

console.log(JSON.stringify(results, null, 2));
