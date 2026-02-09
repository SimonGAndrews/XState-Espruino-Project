// Scenario event sequence for the greenhouse example.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

module.exports = [
  { type: 'START' },
  { type: 'TICK' },
  { type: 'TICK' },
  { type: 'HEAT_OFF' },
  { type: 'TICK' },
  { type: 'STOP' }
];
