import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Explicit IDs and cross-hierarchy targets",
    initial: "Left",
    states: {
      Left: {
        initial: "Source",
        states: {
          Source: {
            on: {
              cross: [
                {
                  target:
                    "#Explicit IDs and cross-hierarchy targets.Right.Destination",
                  actions: [],
                },
              ],
            },
          },
          LeftSibling: {},
        },
      },
      Right: {
        initial: "RightInitial",
        states: {
          RightInitial: {},
          Destination: {
            on: {
              return: [
                {
                  target:
                    "#Explicit IDs and cross-hierarchy targets.Left.Source",
                  actions: [],
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    actions: {},
    actors: {},
    guards: {},
    delays: {},
  },
);
