const createMachine = require('xstate_fsmPlus').createMachine;
const interpret = require('xstate_fsmPlus').interpret;

function assign(assignment) {
  return { type: 'xstate.assign', assignment: assignment };
}

const machine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QA8CyBDAxgCwJYDswA6WAF3QCdSBiMgewAcBtABgF1FQG7ZdTc6+TiGSIAzAHYArEQBsLBWKkslARiliAHABoQAT0QAmFqrkAWAJwWJZiUs2ypEgL7PdaLHkJFcEADZg1FB0rBxIINy8-ILCogiqsrJExgqqZqoSspksmoa6BgjGprKWFrKG5RYsjmau7hg4BMT0DAyQ1KR0dAAyglChwpF8AkLhcZIy8orKaho6+oiapoZW1hKGZlLqYqqGrm4g+HQQcLENXmCDPMMxY4gAtLL5D7J1IudNJORUV1EjsUYpEkzAoWMZNFJNGILGJnoUTEQbFYNBZbGYxDs3h5Gt4Wm0IL8bqMUIhLBIiJpQVochC5nDNBYiGYoStVJpbMpDGksR9vL4AoTosSRKS8gsEA4iBYWRY2RywQl9s4gA */
  id: "xMachine",
  initial: "idle",
  context: { c1: 0 },
  states: {
    start:{
      on: {
        stop: "stopped"
      }
    },

    stopped: {
      on: {
        tooLong: "idle"
      }
    },
    idle: {
      on: {
        go: "start"
      }
    }
  },
});
