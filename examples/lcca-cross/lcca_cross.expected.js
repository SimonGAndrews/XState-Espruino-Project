// Expected normalized trace for cross-branch LCCA tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE root.a.x ACTIONS -',
  'EVENT GO',
  'STATE root.b.y ACTIONS log:exit_x,log:exit_a,log:go,log:enter_b,log:enter_y'
];
