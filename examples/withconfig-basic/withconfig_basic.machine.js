// Scenario machine definition for withConfig basic tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

module.exports = {
  id: 'withConfigBasic',
  context: { count: 0 },
  initial: 'idle',
  states: {
    idle: {
      on: {
        GO: {
          target: 'active',
          guard: 'allow',
          actions: ['logGo']
        }
      }
    },
    active: {}
  }
};
