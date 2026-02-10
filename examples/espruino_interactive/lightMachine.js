const createMachine = require('xstate_fsmPlus').createMachine;
const interpret = require('xstate_fsmPlus').interpret;
const assign = require('xstate_fsmPlus').assign;

function assign(assignment) {
  return { type: 'xstate.assign', assignment: assignment };
}

// define led connection pins and values
const greenLed = 25;
const yellowLed = 26;
const redLed = 27;
const on = 1;
const off = 0;

const allOff = () => {for (let i= 25; i<28; i++ ) {digitalWrite(i,0);}};

// define the state machine
const lightMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCWUAWAXAdFATmGAHYAy62AxACoCSAsgKIBKA2gAwC6ioADgPaxUWVP2I8QAD0QAmdgFYcATgBsM+ewAsSgBzyVAZiUGDAGhABPWQYDsyjewCMhzfM0zNOmwF9v5tJi4FmDIyPwA7uSBNAwsHNxIIAJCImIS0ggamjgqqpr5juo27HKa5lYIcio5mjbOBpqFMjquvv4UuIQQMUxsXBLJwqLiiRkadvLG8jZKSo1uJmWWiDqOODKzszPNtUrsSr5+IMT8EHASAdgDgkNpo4gAtCrlj9Xs7x82Mhsq8i2abRAl1wBCIZA61xSw3SiHcLwQjh0OhwmgaNj07B06nYNk0KkBwJwwVCESiV0Sg1SI1AGQaihsJmMSkcmneahs8LkyN+LO+rJKSnkMgJHRwXUht2pUkQKlqOAMvycrMFqhUOnhjgZOSV8nkjkck1yMnxhyAA */
  id: 'light',
  initial: "greenLight",
  context: { redLights: 0 },
  states: {
    greenLight: {
        entry: [ () => digitalWrite(greenLed,on)],
        exit: [ () => digitalWrite(greenLed,off)],
      on: {
        TIMER: "yellowLight"
      }
    },
    yellowLight: {
        entry: [ () => digitalWrite(yellowLed,on)],
        exit: [ () => digitalWrite(yellowLed,off)],
      on: {
        TIMER: {
          target: 'red',
          actions: () => console.log('Going to red!')
        }
      }
    },
    red: {
        entry: [
          assign({ redLights: (ctx) => ctx.redLights + 1 }),
          () => digitalWrite(redLed,on)
        ],
        exit: [ allOff ],
      on: {
        TIMER: "greenLight"
      }
    }
  }
});

// setup the machine interpreter
const lightService = interpret(lightMachine);

lightService.subscribe((state) => {
  console.log('At state: ' + state.value + ' with context:');
  console.log(state.context);
  console.log(' ');
});

// run the state machine (send three TIMER events)
lightService.start();
lightService.send('TIMER');
lightService.send('TIMER');
lightService.send('TIMER');