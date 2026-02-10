// Scenario machine definition for start override + matches() tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

module.exports = {
  id: 'startMatches',
  initial: 'root',
  states: {
    root: {
      initial: 'a',
      states: {
        a: {
          // no entry actions in this scenario
        },
        b: {
          // no entry actions in this scenario
        }
      }
    }
  }
};
