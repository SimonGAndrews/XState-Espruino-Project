import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createActor, createMachine } from "xstate";

const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));
assert.equal(packageMetadata.version, "5.33.2");

const results = {
  schema: "xfc.xstate-history-exploration",
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
    id: "order",
    initial: "working",
    states: {
      working: {
        id: "orderWorking",
        entry: mark(log, "enter working"),
        exit: mark(log, "exit working"),
        initial: {
          target: "fast",
          actions: mark(log, "working initial")
        },
        states: {
          hist: { type: "history" },
          fast: {
            entry: mark(log, "enter fast"),
            exit: mark(log, "exit fast"),
            on: {
              SLOW: {
                target: "slow",
                actions: mark(log, "transition slow")
              }
            }
          },
          slow: {
            entry: mark(log, "enter slow"),
            exit: mark(log, "exit slow")
          }
        },
        on: {
          RESET: {
            target: "#order.resetting",
            actions: mark(log, "transition reset")
          }
        }
      },
      resetting: {
        entry: mark(log, "enter resetting"),
        exit: mark(log, "exit resetting"),
        on: {
          RESUME: {
            target: "#orderWorking.hist",
            actions: mark(log, "transition resume")
          }
        }
      }
    }
  });
  const actor = createActor(machine);
  actor.start();
  const steps = [
    { event: "start", actions: [...log], value: value(actor) },
    sendStep(actor, log, "SLOW"),
    sendStep(actor, log, "RESET"),
    sendStep(actor, log, "RESUME")
  ];
  assert.deepEqual(steps[3], {
    event: "RESUME",
    actions: [
      "exit resetting",
      "transition resume",
      "enter working",
      "enter slow"
    ],
    value: { working: "slow" }
  });
  results.cases.outsideRestoreAndActionOrder = steps;
}

{
  const log = [];
  const machine = createMachine({
    id: "nestedShallow",
    initial: "working",
    states: {
      working: {
        id: "nestedShallowWorking",
        entry: mark(log, "enter working"),
        exit: mark(log, "exit working"),
        initial: {
          target: "mode",
          actions: mark(log, "working initial")
        },
        states: {
          hist: { type: "history", history: "shallow" },
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
            target: "#nestedShallowWorking.hist",
            actions: mark(log, "transition resume")
          }
        }
      }
    }
  });
  const actor = createActor(machine);
  actor.start();
  const steps = [
    { event: "start", actions: [...log], value: value(actor) },
    sendStep(actor, log, "NEXT"),
    sendStep(actor, log, "EXIT"),
    sendStep(actor, log, "RESUME")
  ];
  assert.deepEqual(steps[0].actions, [
    "enter working",
    "working initial",
    "enter mode",
    "mode initial",
    "enter phaseA"
  ]);
  assert.deepEqual(steps[3], {
    event: "RESUME",
    actions: [
      "exit outside",
      "transition resume",
      "enter working",
      "enter mode",
      "enter phaseA"
    ],
    value: { working: { mode: "phaseA" } }
  });
  results.cases.nestedShallowInitialDescent = steps;
}

{
  const log = [];
  const machine = createMachine({
    id: "fallback",
    initial: "outside",
    states: {
      outside: {
        on: {
          DEFAULT: "#fallbackWorking.normalHistory",
          CUSTOM: "#fallbackWorking.customHistory"
        }
      },
      working: {
        id: "fallbackWorking",
        entry: mark(log, "enter working"),
        exit: mark(log, "exit working"),
        initial: {
          target: "fast",
          actions: mark(log, "working initial")
        },
        states: {
          normalHistory: { type: "history" },
          customHistory: { type: "history", target: "slow" },
          fast: {
            entry: mark(log, "enter fast"),
            exit: mark(log, "exit fast"),
            on: { SLOW: "slow" }
          },
          slow: {
            entry: mark(log, "enter slow"),
            exit: mark(log, "exit slow"),
            on: { FAST: "fast" }
          }
        },
        on: { EXIT: "outside" }
      }
    }
  });

  const normal = createActor(machine).start();
  const normalFirstUse = sendStep(normal, log, "DEFAULT");
  assert.deepEqual(normalFirstUse, {
    event: "DEFAULT",
    actions: ["enter working", "working initial", "enter fast"],
    value: { working: "fast" }
  });

  const custom = createActor(machine).start();
  const customFirstUse = sendStep(custom, log, "CUSTOM");
  assert.deepEqual(customFirstUse, {
    event: "CUSTOM",
    actions: ["enter working", "enter slow"],
    value: { working: "slow" }
  });

  const later = [
    sendStep(custom, log, "EXIT"),
    sendStep(custom, log, "DEFAULT"),
    sendStep(custom, log, "FAST"),
    sendStep(custom, log, "EXIT"),
    sendStep(custom, log, "CUSTOM")
  ];
  assert.deepEqual(later[1].value, { working: "slow" });
  assert.deepEqual(later[4].value, { working: "fast" });
  results.cases.firstUseFallbackAndMultipleHistory = {
    normalFirstUse,
    customFirstUse,
    later
  };
}

{
  const log = [];
  const machine = createMachine({
    id: "internal",
    initial: "working",
    states: {
      working: {
        id: "internalWorking",
        initial: "fast",
        states: {
          hist: { type: "history" },
          fast: {
            entry: mark(log, "enter fast"),
            exit: mark(log, "exit fast"),
            on: {
              SLOW: "slow",
              RECALL: {
                target: "#internalWorking.hist",
                actions: mark(log, "transition recall")
              }
            }
          },
          slow: {
            entry: mark(log, "enter slow"),
            exit: mark(log, "exit slow"),
            on: { FAST: "fast" }
          }
        },
        on: { EXIT: "outside" }
      },
      outside: {
        on: { RESUME: "#internalWorking.hist" }
      }
    }
  });
  const actor = createActor(machine).start();
  const steps = [
    sendStep(actor, log, "SLOW"),
    sendStep(actor, log, "EXIT"),
    sendStep(actor, log, "RESUME"),
    sendStep(actor, log, "FAST"),
    sendStep(actor, log, "RECALL")
  ];
  assert.deepEqual(steps[4], {
    event: "RECALL",
    actions: ["exit fast", "transition recall", "enter slow"],
    value: { working: "slow" }
  });
  results.cases.targetFromInsideParent = steps;
}

{
  const log = [];
  const machine = createMachine({
    id: "finalHistory",
    initial: "working",
    states: {
      working: {
        id: "finalWorking",
        entry: mark(log, "enter working"),
        exit: mark(log, "exit working"),
        initial: {
          target: "active",
          actions: mark(log, "working initial")
        },
        states: {
          hist: { type: "history" },
          active: {
            entry: mark(log, "enter active"),
            exit: mark(log, "exit active"),
            on: {
              FINISH: {
                target: "completed",
                actions: mark(log, "transition finish")
              }
            }
          },
          completed: {
            type: "final",
            entry: mark(log, "enter completed"),
            exit: mark(log, "exit completed")
          }
        },
        onDone: {
          target: "resetting",
          actions: mark(log, "transition done")
        }
      },
      resetting: {
        entry: mark(log, "enter resetting"),
        exit: mark(log, "exit resetting"),
        on: { RESUME: "#finalWorking.hist" }
      }
    }
  });
  const actor = createActor(machine).start();
  const finish = sendStep(actor, log, "FINISH");
  const resume = sendStep(actor, log, "RESUME");
  assert.equal(finish.value, "resetting");
  assert.deepEqual(resume, {
    event: "RESUME",
    actions: [
      "exit resetting",
      "enter working",
      "enter completed",
      "exit completed",
      "exit working",
      "transition done",
      "enter resetting"
    ],
    value: "resetting"
  });
  results.cases.finalStateAndImmediateCompletion = { finish, resume };
}

{
  const errors = [];
  const machine = createMachine({
    id: "lifecycle",
    initial: "working",
    states: {
      working: {
        id: "lifecycleWorking",
        initial: "fast",
        states: {
          hist: { type: "history" },
          fast: { on: { SLOW: "slow" } },
          slow: { on: { FAST: "fast" } }
        },
        on: { EXIT: "outside" }
      },
      outside: { on: { RESUME: "#lifecycleWorking.hist" } }
    }
  });
  const actor = createActor(machine);
  actor.subscribe({ error: (error) => errors.push(String(error)) });
  actor.start();
  actor.send({ type: "SLOW" });
  actor.send({ type: "EXIT" });
  actor.send({ type: "RESUME" });
  actor.send({ type: "FAST" });
  const beforeStop = summarizePersisted(actor);
  actor.stop();
  const afterStop = summarizePersisted(actor);
  actor.start();
  const afterRestartAttempt = summarizePersisted(actor);
  assert.deepEqual(beforeStop.history, {
    "lifecycle.working.hist": ["lifecycle.working.slow"]
  });
  assert.deepEqual(afterStop, {
    status: "stopped",
    value: { working: "fast" },
    history: beforeStop.history
  });
  assert.deepEqual(afterRestartAttempt, afterStop);
  results.cases.stopAndPersistedHistory = {
    beforeStop,
    afterStop,
    afterRestartAttempt,
    errors
  };
}

{
  const machine = createMachine({
    id: "isolation",
    initial: "working",
    states: {
      working: {
        id: "isolationWorking",
        initial: "fast",
        states: {
          hist: { type: "history" },
          fast: { on: { SLOW: "slow" } },
          slow: {}
        },
        on: { EXIT: "outside" }
      },
      outside: { on: { RESUME: "#isolationWorking.hist" } }
    }
  });
  const slowActor = createActor(machine).start();
  const fastActor = createActor(machine).start();
  slowActor.send({ type: "SLOW" });
  slowActor.send({ type: "EXIT" });
  fastActor.send({ type: "EXIT" });
  slowActor.send({ type: "RESUME" });
  fastActor.send({ type: "RESUME" });
  assert.deepEqual(value(slowActor), { working: "slow" });
  assert.deepEqual(value(fastActor), { working: "fast" });
  results.cases.actorHistoryIsolation = {
    slowActor: summarizePersisted(slowActor),
    fastActor: summarizePersisted(fastActor)
  };
}

{
  const errors = [];
  const machine = createMachine({
    id: "fault",
    initial: "working",
    states: {
      working: {
        id: "faultWorking",
        initial: "fast",
        states: {
          hist: { type: "history" },
          fast: {
            exit: ({ event }) => {
              if (event.type === "FAIL") throw new Error("exit failed");
            },
            on: { SLOW: "slow" }
          },
          slow: { on: { FAST: "fast" } }
        },
        on: {
          EXIT: "outside",
          FAIL: "outside"
        }
      },
      outside: { on: { RESUME: "#faultWorking.hist" } }
    }
  });
  const actor = createActor(machine);
  actor.subscribe({ error: (error) => errors.push(String(error)) });
  actor.start();
  actor.send({ type: "SLOW" });
  actor.send({ type: "EXIT" });
  actor.send({ type: "RESUME" });
  actor.send({ type: "FAST" });
  const beforeFault = summarizePersisted(actor);
  actor.send({ type: "FAIL" });
  const afterFault = summarizePersisted(actor);
  assert.equal(afterFault.status, "error");
  assert.deepEqual(afterFault.value, beforeFault.value);
  assert.deepEqual(afterFault.history, beforeFault.history);
  results.cases.faultDuringExit = { beforeFault, afterFault, errors };
}

console.log(JSON.stringify(results, null, 2));
