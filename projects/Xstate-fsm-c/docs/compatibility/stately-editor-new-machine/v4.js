import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Untitled",
    initial: "Initial state",
    states: {
      "Initial state": {
        on: {
          next: [
            {
              target: "Another state",
              actions: [],
              meta: {},
            },
          ],
        },
      },
      "Another state": {
        on: {
          next: [
            {
              target: "Parent state",
              cond: "some condition",
              actions: [],
              meta: {},
            },
            {
              target: "Initial state",
              actions: [],
              meta: {},
            },
          ],
        },
      },
      "Parent state": {
        initial: "Child state",
        states: {
          "Child state": {
            on: {
              next: [
                {
                  target: "Another child state",
                  actions: [],
                  meta: {},
                },
              ],
            },
          },
          "Another child state": {},
        },
        on: {
          back: [
            {
              target: "Initial state",
              actions: [
                {
                  type: "reset",
                },
              ],
              meta: {},
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
      reset: (context, event) => {},
    },
    services: {},
    guards: {
      "some condition": (context, event) => {
        return false;
      },
    },
    delays: {},
  },
);
