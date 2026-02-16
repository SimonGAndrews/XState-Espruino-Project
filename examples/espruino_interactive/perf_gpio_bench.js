// Espruino GPIO performance bench for FSMPlus.
// Purpose:
// - External timing via logic analyzer pulse width/gaps
// - Internal timing via getTime() summary
//
// Usage (after flashing xstate_fsmPlus):
//   espram examples/espruino_interactive/perf_gpio_bench.js
// or
//   espflash perf_gpio_bench examples/espruino_interactive/perf_gpio_bench.js
//   esprepl
//   require("perf_gpio_bench").run()
'use strict';

var fsm = require('xstate_fsmPlus');

// ---- Pin configuration (edit for your board) ----
var PULSE_PIN = D8;   // High around each service.send() call
var MARKER_PIN = D7;  // Case boundary markers

// ---- Bench configuration ----
var WARMUP = 50;
var ITER = 300;
var GAP_MS = 1; // delay between sends in burst mode

function pulse(pin, ms) {
  digitalWrite(pin, 1);
  if (ms && ms > 0) delay(ms / 1000);
  digitalWrite(pin, 0);
}

function emitCaseMarker(caseId) {
  var i = 0;
  // Emit N short pulses to identify case on analyzer.
  for (i = 0; i < caseId; i++) {
    pulse(MARKER_PIN, 1);
    delay(0.002);
  }
  delay(0.01);
}

function createBenchMachine() {
  return fsm.createMachine({
    id: 'perf',
    initial: 'root',
    context: { n: 0 },
    states: {
      root: {
        initial: 'a',
        states: {
          a: {
            initial: 'x',
            states: {
              x: {
                on: {
                  NOP: [],
                  PING: { actions: ['doWork'] },
                  GO: { target: '#perf.root.b.y', actions: ['doWork'] }
                }
              }
            }
          },
          b: {
            initial: 'y',
            states: {
              y: {
                on: {
                  BACK: { target: '#perf.root.a.x', actions: ['doWork'] }
                }
              }
            }
          }
        }
      }
    }
  }, {
    actions: {
      doWork: function (ctx) {
        // Small deterministic action payload to reflect runtime action path.
        ctx.n = (ctx.n + 1) | 0;
      }
    }
  });
}

function runBurst(service, eventType, iterations) {
  var i = 0;
  var t0 = getTime();
  for (i = 0; i < iterations; i++) {
    digitalWrite(PULSE_PIN, 1);
    service.send(eventType);
    digitalWrite(PULSE_PIN, 0);
    if (GAP_MS > 0) delay(GAP_MS / 1000);
  }
  var dt = getTime() - t0;
  return {
    event: eventType,
    iterations: iterations,
    seconds: dt,
    avgUsPerEvent: (dt * 1000000) / iterations
  };
}

function printSummary(label, summary) {
  console.log(
    label + ' EVENT=' + summary.event +
    ' ITER=' + summary.iterations +
    ' SEC=' + summary.seconds.toFixed(6) +
    ' AVG_US=' + summary.avgUsPerEvent.toFixed(2)
  );
}

function run() {
  pinMode(PULSE_PIN, 'output');
  pinMode(MARKER_PIN, 'output');
  digitalWrite(PULSE_PIN, 0);
  digitalWrite(MARKER_PIN, 0);

  var machine = createBenchMachine();
  var service = fsm.interpret(machine).start();

  console.log('PERF GPIO BENCH BEGIN');
  console.log('PULSE_PIN=' + PULSE_PIN + ' MARKER_PIN=' + MARKER_PIN);
  console.log('WARMUP=' + WARMUP + ' ITER=' + ITER + ' GAP_MS=' + GAP_MS);

  // Warm-up phase
  runBurst(service, 'PING', WARMUP);
  runBurst(service, 'GO', WARMUP);
  runBurst(service, 'BACK', WARMUP);

  // Case 1: no-op / unknown handling path
  emitCaseMarker(1);
  var s1 = runBurst(service, 'UNKNOWN_EVENT', ITER);
  printSummary('CASE1_NOOP', s1);

  // Case 2: targetless with action
  emitCaseMarker(2);
  var s2 = runBurst(service, 'PING', ITER);
  printSummary('CASE2_TARGETLESS', s2);

  // Case 3: hierarchical targeted transition (a.x -> b.y)
  emitCaseMarker(3);
  var s3 = runBurst(service, 'GO', ITER);
  printSummary('CASE3_TARGETED_GO', s3);

  // Case 4: hierarchical targeted transition back (b.y -> a.x)
  emitCaseMarker(4);
  var s4 = runBurst(service, 'BACK', ITER);
  printSummary('CASE4_TARGETED_BACK', s4);

  pulse(MARKER_PIN, 20); // End marker
  console.log('PERF GPIO BENCH END');

  return {
    case1: s1,
    case2: s2,
    case3: s3,
    case4: s4
  };
}

exports.run = run;

// Auto-run when sent with espram/espboot style workflow.
run();
