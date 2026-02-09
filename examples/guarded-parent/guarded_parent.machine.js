// Scenario machine definition for guarded parent fallback tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function assign(assignment) {
  return { type: 'xstate.assign', assignment: assignment };
}

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
  id: 'guardedParent',
  context: {
    value: 0
  },
  initial: 'root',
  states: {
    root: {
      initial: 'leaf',
      on: {
        EVT: [
          {
            guard: alwaysTrue,
            actions: [logAction('parent_hit')]
          }
        ]
      },
      states: {
        leaf: {
          on: {
            EVT: [
              {
                guard: alwaysFalse,
                actions: [logAction('leaf_fail_1')]
              },
              {
                guard: alwaysFalse,
                actions: [logAction('leaf_fail_2')]
              }
            ]
          }
        }
      }
    }
  }
};
