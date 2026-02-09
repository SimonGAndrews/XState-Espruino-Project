// Expected normalized trace for assign-before-entry tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE a ACTIONS -',
  'EVENT INC',
  'STATE b ACTIONS log:count_1'
];
