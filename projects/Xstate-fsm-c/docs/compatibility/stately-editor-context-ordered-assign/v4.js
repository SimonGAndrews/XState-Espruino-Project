import { createMachine, assign } from "xstate";
export const machine = createMachine(
  {
    context: {
      count: 0,
    },
    id: "Context and ordered assign",
    initial: "Idle",
    states: {
      Idle: {
        on: {
          go: [
            {
              target: "Done",
              actions: [
                {
                  type: "observeBefore",
                },
                {
                  type: "incrementCount",
                },
                {
                  type: "observeAfter",
                },
              ],
            },
          ],
        },
      },
      Done: {},
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      observeBefore: (context, event) => {},
      observeAfter: (context, event) => {},
      incrementCount: assign({
        count: ({ context }) => context.count + 1,
      }),
    },
    services: {},
    guards: {},
    delays: {},
  },
);
