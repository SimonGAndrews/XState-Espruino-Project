// Expected normalized trace for guarded parent fallback tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE root.leaf ACTIONS -',
  'EVENT EVT',
  'STATE root.leaf ACTIONS log:parent_hit'
];
