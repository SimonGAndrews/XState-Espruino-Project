// Scenario machine definition for multi-level guarded parent fallback tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function logAction(name) {
  return { type: 'log', name: name };
}

function alwaysFalse() {
  return false;
}

function alwaysTrue() {
  return true;
}

module.exports = {
  id: 'guardedMultiParent',
  initial: 'root',
  states: {
    root: {
      initial: 'mid',
      on: {
        EVT: [
          { guard: alwaysFalse, actions: [logAction('root_fail')] },
          { guard: alwaysTrue, actions: [logAction('root_hit')] }
        ]
      },
      states: {
        mid: {
          initial: 'leaf',
          on: {
            EVT: [
              { guard: alwaysFalse, actions: [logAction('mid_fail_1')] },
              { guard: alwaysFalse, actions: [logAction('mid_fail_2')] }
            ]
          },
          states: {
            leaf: {
              on: {
                EVT: [
                  { guard: alwaysFalse, actions: [logAction('leaf_fail_1')] },
                  { guard: alwaysFalse, actions: [logAction('leaf_fail_2')] }
                ]
              }
            }
          }
        }
      }
    }
  }
};
