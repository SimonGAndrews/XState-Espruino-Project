// Compatibility-target scenario from Stately-style menu machine output.
// This scenario is intentionally authored with relative targets and action params
// to track FSMPlus parity gaps.
'use strict';

module.exports = {
  id: 'SoilHeater',
  initial: 'run',
  context: {
    menu: 'config',
    menuItem: 1
  },
  states: {
    run: {
      on: {
        BTN_DOWN: [
          {
            target: 'menu',
            actions: [],
            meta: {}
          }
        ]
      }
    },
    menu: {
      initial: 'maxTemp',
      states: {
        maxTemp: {
          entry: {
            type: 'disMenu',
            params: { item: 'maxTemp' }
          },
          on: {
            BTN_DOWN: [{ target: 'minTemp', actions: [] }],
            BTN_SEL: [{ target: 'tMaxSel', actions: [] }]
          }
        },
        minTemp: {
          entry: {
            type: 'disMenu',
            params: { item: 'min_Temp' }
          },
          on: {
            BTN_UP: [{ target: 'maxTemp', actions: [] }],
            BTN_SEL: [{ target: 'tMinSel', actions: [] }]
          }
        },
        tMaxSel: {
          entry: {
            type: 'dispValue',
            params: { value: 'tMax' }
          },
          on: {
            BTN_SEL: [{ target: 'tMaxSet', actions: [] }],
            BTN_BACK: [{ target: 'maxTemp', actions: [] }]
          }
        },
        tMinSel: {
          entry: {
            type: 'dispValue',
            params: { value: 'tMin' }
          },
          on: {
            BTN_SEL: [{ target: 'tMinSet', actions: [] }],
            BTN_BACK: [{ target: 'minTemp', actions: [] }]
          }
        },
        tMaxSet: {
          on: {
            BTN_BACK: [{ target: 'tMaxSel', actions: [] }]
          }
        },
        tMinSet: {
          on: {
            BTN_BACK: [{ target: 'tMinSel', actions: [] }]
          }
        }
      },
      on: {
        BTN_UP: [{ target: 'run', actions: [] }],
        BTN_BACK: [{ target: 'run', actions: [] }]
      }
    }
  },
  predictableActionArguments: true,
  preserveActionOrder: true
};
