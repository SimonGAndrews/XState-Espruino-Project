// Scenario machine definition for cross-branch LCCA tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function logAction(name) {
  return { type: 'log', name: name };
}

module.exports = {
  id: 'lccaCross',
  context: {},
  initial: 'root',
  states: {
    root: {
      entry: [logAction('enter_root')],
      exit: [logAction('exit_root')],
      initial: 'a',
      states: {
        a: {
          entry: [logAction('enter_a')],
          exit: [logAction('exit_a')],
          initial: 'x',
          states: {
            x: {
              entry: [logAction('enter_x')],
              exit: [logAction('exit_x')],
              on: {
                GO: {
                  target: 'root.b.y',
                  actions: [logAction('go')]
                }
              }
            }
          }
        },
        b: {
          entry: [logAction('enter_b')],
          exit: [logAction('exit_b')],
          initial: 'y',
          states: {
            y: {
              entry: [logAction('enter_y')],
              exit: [logAction('exit_y')]
            }
          }
        }
      }
    }
  }
};
