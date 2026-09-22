import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Final state and parent done transition",
    initial: "Workflow",
    states: {
      Workflow: {
        entry: {
          type: "enterWorkflow",
        },
        exit: {
          type: "exitWorkflow",
        },
        initial: "Working",
        states: {
          Working: {
            entry: {
              type: "enterWorking",
            },
            exit: {
              type: "exitWorking",
            },
            on: {
              finish: [
                {
                  target: "Completed",
                  actions: [
                    {
                      type: "recordFinish",
                    },
                  ],
                },
              ],
            },
          },
          Completed: {
            entry: {
              type: "enterCompleted",
            },
            exit: {
              type: "exitCompleted",
            },
            type: "final",
          },
        },
        onDone: {
          target: "Success",
          actions: [
            {
              type: "recordDone",
            },
          ],
        },
      },
      Success: {
        entry: {
          type: "enterSuccess",
        },
      },
    },
  },
  {
    actions: {
      enterWorkflow: ({ context, event }) => {},
      exitWorkflow: ({ context, event }) => {},
      enterWorking: ({ context, event }) => {},
      exitWorking: ({ context, event }) => {},
      enterCompleted: ({ context, event }) => {},
      exitCompleted: ({ context, event }) => {},
      enterSuccess: ({ context, event }) => {},
      recordFinish: ({ context, event }) => {},
      recordDone: ({ context, event }) => {},
    },
    actors: {},
    guards: {},
    delays: {},
  },
);
