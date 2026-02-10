// FSMPlus Node harness for the start_matches scenario.
// Usage: `node projects/xstate-fsmPlus/tests/node/run_start_matches.js`
'use strict';

var fsm = require('../../src/xstate_fsmPlus');
var machineConfig = require('../../../../examples/start-matches/start_matches.machine');
var events = require('../../../../examples/start-matches/start_matches.events');
var expected = require('../../../../examples/start-matches/start_matches.expected');
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

  service.start('root');

  service.subscribe(function (state) {
    trace.push(formatState(state));
  });

  var i = 0;
  for (i = 0; i < events.length; i++) {
    trace.push('EVENT ' + eventType(events[i]));
    service.send(events[i]);
  }

  var state = service.state;
  trace.push('MATCHES root ' + (state.matches('root') ? 'true' : 'false'));
  trace.push('MATCHES root.a ' + (state.matches('root.a') ? 'true' : 'false'));
  trace.push('MATCHES root.b ' + (state.matches('root.b') ? 'true' : 'false'));

  var resultsDir = path.join(__dirname, '..', 'results', 'node');
  var resultsPath = path.join(resultsDir, 'start_matches.trace.txt');
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
