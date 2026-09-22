import { createMachine } from "xstate";
export const machine = createMachine(
  {
    id: "Hierarchical entry/exit boundaries",
    initial: "Outside",
    states: {
      Outside: {
        entry: {
          type: "enterOutside",
        },
        exit: {
          type: "exitOutside",
        },
        on: {
          enter: [
            {
              target: "Parent",
              actions: [],
              meta: {},
            },
          ],
        },
      },
      Parent: {
        entry: {
          type: "enterParent",
        },
        exit: {
          type: "exitParent",
        },
        initial: "ChildA",
        states: {
          ChildA: {
            entry: {
              type: "enterChildA",
            },
            exit: {
              type: "exitChildA",
            },
            on: {
              next: [
                {
                  target: "ChildB",
                  actions: [],
                },
              ],
            },
          },
          ChildB: {
            entry: {
              type: "enterChildB",
            },
            exit: {
              type: "exitChildB",
            },
            on: {
              leave: [
                {
                  target: "#Hierarchical entry/exit boundaries.Outside",
                  actions: [],
                },
              ],
            },
          },
        },
        on: {
          reset: [
            {
              target: ".ChildA",
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
      enterParent: (context, event) => {},
      exitParent: (context, event) => {},
      exitChildA: (context, event) => {},
      exitChildB: (context, event) => {},
      enterChildA: (context, event) => {},
      enterChildB: (context, event) => {},
      enterOutside: (context, event) => {},
      exitOutside: (context, event) => {},
    },
    services: {},
    guards: {},
    delays: {},
  },
);
