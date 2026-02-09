// Scenario event sequence for hierarchy/entry/exit/action ordering tests.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

module.exports = [
  { type: 'PING' },
  { type: 'TO_B' },
  { type: 'TO_A' },
  { type: 'REENTER' },
  { type: 'STOP' },
  { type: 'START' }
];
