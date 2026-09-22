import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Targetless versus targeted self-transition",
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
              actions: [
                {
                  type: "recordTargetless",
                },
              ],
            },
          ],
          restart: [
            {
              target: "Active",
              actions: [
                {
                  type: "recordTargeted",
                },
              ],
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
      recordTargetless: (context, event) => {},
      recordTargeted: (context, event) => {},
    },
    services: {},
    guards: {},
    delays: {},
  },
);
