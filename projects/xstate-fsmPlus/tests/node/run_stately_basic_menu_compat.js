// FSMPlus Node harness for the stately_basic_menu_compat scenario.
// Usage: `node projects/xstate-fsmPlus/tests/node/run_stately_basic_menu_compat.js`
'use strict';

var fsm = require('../../src/xstate_fsmPlus');
var machineConfig = require('../../../../examples/stately-basic-menu-compat/stately_basic_menu_compat.machine');
var events = require('../../../../examples/stately-basic-menu-compat/stately_basic_menu_compat.events');
var expected = require('../../../../examples/stately-basic-menu-compat/stately_basic_menu_compat.expected');
var fs = require('fs');
var path = require('path');

function eventType(evt) {
  return typeof evt === 'string' ? evt : evt.type;
}

function formatAction(action) {
  if (!action) return 'unknown';
  if (typeof action === 'string') return action;
  if (typeof action === 'function') return '<fn>';
  if (action.type) return action.type;
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
  var effects = [];
  var machine = fsm.createMachine(machineConfig, {
    actions: {
      disMenu: function (context, event, meta) {
        var item = meta && meta.params && meta.params.item ? meta.params.item : 'MISSING';
        effects.push('EFFECT disMenu:' + item);
      },
      dispValue: function (context, event, meta) {
        var value = meta && meta.params && meta.params.value ? meta.params.value : 'MISSING';
        effects.push('EFFECT dispValue:' + value);
      }
    }
  });

  var service = fsm.interpret(machine);
  var trace = [];

  service.start();

  service.subscribe(function (state) {
    trace.push(formatState(state));
    while (effects.length) {
      trace.push(effects.shift());
    }
  });

  var i = 0;
  for (i = 0; i < events.length; i++) {
    trace.push('EVENT ' + eventType(events[i]));
    service.send(events[i]);
  }

  var resultsDir = path.join(__dirname, '..', 'results', 'node');
  var resultsPath = path.join(resultsDir, 'stately_basic_menu_compat.trace.txt');
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
