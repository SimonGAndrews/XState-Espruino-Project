// Scenario machine definition for assign-before-entry tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function assign(assignment) {
  return { type: 'xstate.assign', assignment: assignment };
}

function logWithCount() {
  return { type: 'log', name: 'count_1' };
}

module.exports = {
  id: 'assignEntry',
  context: {
    count: 0
  },
  initial: 'a',
  states: {
    a: {
      on: {
        INC: {
          target: 'b',
          actions: [
            assign({ count: function (ctx) { return ctx.count + 1; } })
          ]
        }
      }
    },
    b: {
      entry: [logWithCount()]
    }
  }
};
