// FSMPlus Espruino harness for the greenhouse scenario.
// Usage: load this file in Espruino and call `run()`.
'use strict';

var fsm = require('../../src/xstate_fsmPlus');
var machineConfig = require('../../../../examples/greenhouse/greenhouse.machine');
var events = require('../../../../examples/greenhouse/greenhouse.events');
var expected = require('../../../../examples/greenhouse/greenhouse.expected');

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

  service.start();

  service.subscribe(function (state) {
    trace.push(formatState(state));
  });

  var i = 0;
  for (i = 0; i < events.length; i++) {
    trace.push('EVENT ' + eventType(events[i]));
    service.send(events[i]);
  }

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
