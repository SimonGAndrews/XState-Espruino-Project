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
  },
  {
    actions: {
      recordEntry: ({ context, event }) => {},
      recordExit: ({ context, event }) => {},
      recordTargetless: ({ context, event }) => {},
      recordTargeted: ({ context, event }) => {},
    },
    actors: {},
    guards: {},
    delays: {},
  },
);
