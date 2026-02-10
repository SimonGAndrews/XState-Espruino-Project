// FSMPlus Espruino harness for the start_matches scenario.
// Usage: load this file in Espruino and call `run()`.
'use strict';

var fsm = require('xstate_fsmPlus');
var machineConfig = require('start_matches.machine');
var events = require('start_matches.events');
var expected = require('start_matches.expected');

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

function printTrace(trace) {
  var i = 0;
  console.log('TRACE BEGIN');
  for (i = 0; i < trace.length; i++) {
    console.log(trace[i]);
  }
  console.log('TRACE END');
}

function compareTraces(actual, expectedTrace) {
  var max = Math.max(actual.length, expectedTrace.length);
  var i = 0;
  for (i = 0; i < max; i++) {
    if (actual[i] !== expectedTrace[i]) {
      return {
        index: i,
        expected: expectedTrace[i],
        actual: actual[i]
      };
    }
  }
  return null;
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

  printTrace(trace);

  var diff = compareTraces(trace, expected);
  if (diff) {
    console.log('Trace mismatch. First diff:');
    console.log('  index:   ' + diff.index);
    console.log('  expected:' + diff.expected);
    console.log('  actual:  ' + diff.actual);
    return false;
  }

  console.log('Trace matched (' + trace.length + ' lines).');
  return true;
}

exports.run = runScenario;
