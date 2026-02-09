// Diff expected vs actual trace for FSMPlus scenarios.
// Usage: node projects/xstate-fsmPlus/tests/diff_trace.js <scenario> <runtime>
// Example: node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
'use strict';

var fs = require('fs');
var path = require('path');

function usage() {
  console.log('Usage: node projects/xstate-fsmPlus/tests/diff_trace.js <scenario> <runtime>');
  console.log('  scenario: e.g. greenhouse, hierarchy_actions');
  console.log('  runtime: node or espruino');
}

var scenario = process.argv[2];
var runtime = process.argv[3];

if (!scenario || !runtime) {
  usage();
  process.exit(1);
}

var expectedPath = path.join(__dirname, '..', '..', '..', 'examples', scenario, scenario + '.expected.js');
var actualPath = path.join(__dirname, 'results', runtime, scenario + '.trace.txt');

if (!fs.existsSync(expectedPath)) {
  console.error('Expected file not found:', expectedPath);
  process.exit(1);
}

if (!fs.existsSync(actualPath)) {
  console.error('Actual results file not found:', actualPath);
  process.exit(1);
}

var expected = require(expectedPath);
var actual = fs.readFileSync(actualPath, 'utf8').trim().split(/\r?\n/);

var max = Math.max(expected.length, actual.length);
var i = 0;
var diffs = [];
for (i = 0; i < max; i++) {
  if (expected[i] !== actual[i]) {
    diffs.push({
      index: i,
      expected: expected[i],
      actual: actual[i]
    });
  }
}

if (diffs.length) {
  console.error('Trace mismatch. First diff:');
  console.error('  index:   ' + diffs[0].index);
  console.error('  expected:' + diffs[0].expected);
  console.error('  actual:  ' + diffs[0].actual);
  process.exit(1);
}

console.log('Trace matched (' + expected.length + ' lines).');
