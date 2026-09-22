import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Self Transition",
    initial: "Active",
    states: {
      Active: {
        entry: {
          type: "recordEntry",
        },
        exit: {
          type: "recordExit",
        },
        on: {
          stay: [
            {
              target: "Active",
              actions: [],
            },
          ],
          restart: [
            {
              target: "Active",
              actions: [],
            },
          ],
        },
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      recordEntry: (context, event) => {},
      recordExit: (context, event) => {},
    },
    services: {},
    guards: {},
    delays: {},
  },
);
