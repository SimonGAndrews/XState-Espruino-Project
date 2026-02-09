// Scenario machine definition for targetless ancestor transition tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function logAction(name) {
  return { type: 'log', name: name };
}

module.exports = {
  id: 'targetlessAncestor',
  context: {},
  initial: 'root',
  states: {
    root: {
      initial: 'child',
      on: {
        PING: {
          actions: [logAction('root_ping')]
        }
      },
      states: {
        child: {
          initial: 'leaf',
          states: {
            leaf: {
              entry: [logAction('enter_leaf')],
              exit: [logAction('exit_leaf')]
            }
          }
        }
      }
    }
  }
};
