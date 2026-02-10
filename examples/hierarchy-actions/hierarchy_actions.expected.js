// Expected normalized trace for hierarchy/entry/exit/action ordering tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE outer.a ACTIONS log:enter_outer,log:enter_a',
  'EVENT PING',
  'STATE outer.a ACTIONS log:ping',
  'EVENT TO_B',
  'STATE outer.b ACTIONS log:exit_a,log:trans_to_b,log:enter_b',
  'EVENT TO_A',
  'STATE outer.a ACTIONS log:exit_b,log:trans_to_a,log:enter_a',
  'EVENT REENTER',
  'STATE outer.a ACTIONS log:exit_a,log:reenter_action,log:enter_a',
  'EVENT STOP',
  'STATE idle ACTIONS log:exit_a,log:exit_outer,log:stop,log:enter_idle',
  'EVENT START',
  'STATE outer.a ACTIONS log:exit_idle,log:start,log:enter_outer,log:enter_a'
];
