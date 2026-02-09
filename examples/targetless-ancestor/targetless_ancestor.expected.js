// Expected normalized trace for targetless ancestor transition tests.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE root.child.leaf ACTIONS -',
  'EVENT PING',
  'STATE root.child.leaf ACTIONS log:root_ping'
];
