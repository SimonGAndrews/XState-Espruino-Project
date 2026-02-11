// Espruino interactive test: action names resolved via createMachine options.
// Advantage: keeps machine config data-only, avoids withConfig call.
// Usage: paste into REPL after xstate_fsmPlus is in flash, or upload and run.
'use strict';

var fsm = require('xstate_fsmPlus');
pinMode(D8, 'output');

// Note: board wiring is inverted for D8 (1 = off, 0 = on).
function ledOn() { digitalWrite(D8, 0); console.log('LED action: ON'); }
function ledOff() { digitalWrite(D8, 1); console.log('LED action: OFF'); }

var machine = fsm.createMachine({
  id: 'ledD8_options',
  initial: 'off',
  states: {
    off: {
      entry: [ { type: 'led_off' } ],
      on: { TOGGLE: { target: 'on' } }
    },
    on: {
      entry: [ { type: 'led_on' } ],
      on: { TOGGLE: { target: 'off' } }
    }
  }
}, {
  actions: {
    led_on: ledOn,
    led_off: ledOff
  }
});

var service = fsm.interpret(machine);

service.subscribe(function (state) {
  console.log('State:', state.value);
});

service.start();

var intervalId = setInterval(function () {
  service.send('TOGGLE');
}, 500);

// Manual helpers:
// service.send('TOGGLE');
// clearInterval(intervalId);
