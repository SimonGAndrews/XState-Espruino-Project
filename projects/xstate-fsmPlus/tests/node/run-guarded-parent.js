// FSMPlus Node harness for the guarded-parent scenario.
// Usage: `node projects/xstate-fsmPlus/tests/node/run-guarded-parent.js`
'use strict';

var fsm = require('../../src/xstate-fsmPlus');
var machineConfig = require('../../../../examples/guarded-parent/guarded-parent.machine');
var events = require('../../../../examples/guarded-parent/guarded-parent.events');
var expected = require('../../../../examples/guarded-parent/guarded-parent.expected');
var fs = require('fs');
var path = require('path');

function eventType(evt) {
  return typeof evt === 'string' ? evt : evt.type;
}

function formatAction(action) {
  if (!action) return 'unknown';
  if (typeof action === 'string') return action;
  if (typeof action === 'function') return '<fn>';
  if (action.type) {
    return action.name ? (action.type + ':' + action.name) : action.type;
  }
  return 'unknown';
}

function formatActions(actions) {
  if (!actions || !actions.length) return '-';
  var out = [];
  var i = 0;
  for (i = 0; i < actions.length; i++) {
    out.push(formatAction(actions[i]));
  }
  return out.join(',');
}

function formatState(state) {
  return 'STATE ' + state.value + ' ACTIONS ' + formatActions(state.actions);
}

function compareTraces(actual, expectedTrace) {
  var max = Math.max(actual.length, expectedTrace.length);
  var i = 0;
  var diffs = [];
  for (i = 0; i < max; i++) {
    if (actual[i] !== expectedTrace[i]) {
      diffs.push({
        index: i,
        expected: expectedTrace[i],
        actual: actual[i]
      });
    }
  }
  return diffs;
}

function runScenario() {
  var machine = fsm.createMachine(machineConfig);
  var service = fsm.interpret(machine);
  var trace = [];

  service.start();

  service.subscribe(function (state) {
    trace.push(formatState(state));
  });

  var i = 0;
  for (i = 0; i < events.length; i++) {
    trace.push('EVENT ' + eventType(events[i]));
    service.send(events[i]);
  }

  var resultsDir = path.join(__dirname, '..', 'results', 'node');
  var resultsPath = path.join(resultsDir, 'guarded-parent.trace.txt');
  try {
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(resultsPath, trace.join('\n') + '\n');
  } catch (err) {
    console.error('Failed to write results file:', resultsPath);
    console.error(err && err.message ? err.message : err);
  }

  var diffs = compareTraces(trace, expected);
  if (diffs.length) {
    console.error('Trace mismatch. First diff:');
    console.error('  index:   ' + diffs[0].index);
    console.error('  expected:' + diffs[0].expected);
    console.error('  actual:  ' + diffs[0].actual);
    process.exit(1);
  }

  console.log('Trace matched (' + trace.length + ' lines).');
}

runScenario();
