// Expected normalized trace for multi-level guarded parent fallback tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE root.mid.leaf ACTIONS -',
  'EVENT EVT',
  'STATE root.mid.leaf ACTIONS log:root_hit'
];
