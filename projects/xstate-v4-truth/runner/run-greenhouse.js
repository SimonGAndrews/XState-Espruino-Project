// XState v4 truth runner for the greenhouse scenario.
// Usage: `node projects/xstate-v4-truth/runner/run-greenhouse.js`
'use strict';

var path = require('path');
var fs = require('fs');
var xstate = require('xstate');
var createMachine = xstate.createMachine;
var interpret = xstate.interpret;

var adapter = require('./adapter');
var machineConfig = require('../../../examples/greenhouse/greenhouse.machine');
var events = require('../../../examples/greenhouse/greenhouse.events');
var expected = require('../../../examples/greenhouse/greenhouse.expected');

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
    if (actions[i] && actions[i].type === 'xstate.assign') continue;
    out.push(formatAction(actions[i]));
  }
  if (!out.length) return '-';
  return out.join(',');
}

function formatState(state) {
  var value;
  if (state && typeof state.value === 'string') {
    value = state.value;
  } else if (state && typeof state.toStrings === 'function') {
    var paths = state.toStrings();
    if (paths && paths.length) {
      value = paths[0];
      var i = 0;
      for (i = 1; i < paths.length; i++) {
        if (paths[i].length > value.length) value = paths[i];
      }
    } else {
      value = state.value;
    }
  } else {
    value = state.value;
  }
  return 'STATE ' + value + ' ACTIONS ' + formatActions(state.actions);
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
  var mappedConfig = adapter.convertMachineConfig(machineConfig);
  var machine = createMachine(mappedConfig, {
    actions: {
      log: function () {}
    }
  });
  var service = interpret(machine);
  var trace = [];

  service.onTransition(function (state) {
    trace.push(formatState(state));
  });

  service.start();

  var i = 0;
  for (i = 0; i < events.length; i++) {
    trace.push('EVENT ' + eventType(events[i]));
    service.send(events[i]);
  }

  var resultsDir = path.join(__dirname, '..', 'tests', 'results', 'node');
  var resultsPath = path.join(resultsDir, 'greenhouse.trace.txt');
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
