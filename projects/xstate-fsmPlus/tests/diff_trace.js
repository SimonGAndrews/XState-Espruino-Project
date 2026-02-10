// Diff expected vs actual trace for FSMPlus scenarios.
// Usage: node projects/xstate-fsmPlus/tests/diff_trace.js <scenario> <runtime>
// Example: node projects/xstate-fsmPlus/tests/diff_trace.js greenhouse espruino
'use strict';

var fs = require('fs');
var path = require('path');

function usage() {
  console.log('Usage: node projects/xstate-fsmPlus/tests/diff_trace.js <scenario> <runtime> [--file <path>]');
  console.log('  scenario: e.g. greenhouse, hierarchy_actions');
  console.log('  runtime: node or espruino');
  console.log('  --file: optional explicit results file path');
}

var scenario = process.argv[2];
var runtime = process.argv[3];
var fileArgIndex = process.argv.indexOf('--file');
var explicitPath = null;
if (fileArgIndex !== -1 && process.argv[fileArgIndex + 1]) {
  explicitPath = process.argv[fileArgIndex + 1];
}

if (!scenario || !runtime) {
  usage();
  process.exit(1);
}

function resolveScenarioDir(name) {
  var direct = path.join(__dirname, '..', '..', '..', 'examples', name);
  if (fs.existsSync(direct)) return name;
  var dashed = name.replace(/_/g, '-');
  var dashedPath = path.join(__dirname, '..', '..', '..', 'examples', dashed);
  if (fs.existsSync(dashedPath)) return dashed;
  return null;
}

var scenarioDir = resolveScenarioDir(scenario);
if (!scenarioDir) {
  console.error('Expected scenario folder not found for:', scenario);
  process.exit(1);
}

var expectedPath = path.join(__dirname, '..', '..', '..', 'examples', scenarioDir, scenario + '.expected.js');
var actualPath = explicitPath
  ? explicitPath
  : path.join(__dirname, 'results', runtime, scenario + '.trace.txt');

if (!fs.existsSync(expectedPath)) {
  console.error('Expected file not found:', expectedPath);
  process.exit(1);
}

if (!fs.existsSync(actualPath)) {
  console.error('Actual results file not found:', actualPath);
  process.exit(1);
}

var expected = require(expectedPath);
var rawActual = fs.readFileSync(actualPath, 'utf8').trim().split(/\r?\n/);
function isIgnorable(line) {
  if (!line) return true;
  if (line === 'TRACE BEGIN' || line === 'TRACE END') return true;
  if (line.indexOf('TRACE BEGIN') === 0) return true;
  if (line.indexOf('TRACE END') === 0) return true;
  return false;
}
var actual = rawActual.filter(function (line) {
  return !isIgnorable(line);
});

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
