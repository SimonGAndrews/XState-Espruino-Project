// Scenario machine definition for hierarchy/entry/exit/action ordering tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function logAction(name) {
  return { type: 'log', name: name };
}

module.exports = {
  id: 'hierarchyActions',
  context: {
    count: 0
  },
  initial: 'outer',
  states: {
    outer: {
      entry: [logAction('enter_outer')],
      exit: [logAction('exit_outer')],
      initial: 'a',
      on: {
        TO_B: {
          target: 'outer.b',
          actions: [logAction('trans_to_b')]
        },
        STOP: {
          target: 'idle',
          actions: [logAction('stop')]
        }
      },
      states: {
        a: {
          entry: [logAction('enter_a')],
          exit: [logAction('exit_a')],
          on: {
            PING: {
              actions: [logAction('ping')]
            },
            REENTER: {
              target: 'outer.a',
              actions: [logAction('reenter_action')]
            }
          }
        },
        b: {
          entry: [logAction('enter_b')],
          exit: [logAction('exit_b')],
          on: {
            TO_A: {
              target: 'outer.a',
              actions: [logAction('trans_to_a')]
            }
          }
        }
      }
    },
    idle: {
      entry: [logAction('enter_idle')],
      exit: [logAction('exit_idle')],
      on: {
        START: {
          target: 'outer',
          actions: [logAction('start')]
        }
      }
    }
  }
};
