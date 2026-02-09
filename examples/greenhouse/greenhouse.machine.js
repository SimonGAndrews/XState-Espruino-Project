// Scenario machine definition for the greenhouse example.
// Shared by all runners (FSMPlus, XState v4 truth, XFSM later).
'use strict';

function assign(assignment) {
  return { type: 'xstate.assign', assignment: assignment };
}

function logAction(name) {
  return { type: 'log', name: name };
}

function tempBelowTarget(ctx) {
  return ctx.temp < ctx.target;
}

function tempAtOrAboveTarget(ctx) {
  return ctx.temp >= ctx.target;
}

module.exports = {
  id: 'greenhouse',
  context: {
    temp: 18,
    target: 20,
    heaterOn: false
  },
  initial: 'system',
  states: {
    system: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: {
              target: 'system.active',
              actions: [logAction('start')]
            }
          }
        },
        active: {
          initial: 'heatingOff',
          on: {
            STOP: {
              target: 'system.idle',
              actions: [logAction('stop')]
            }
          },
          states: {
            heatingOff: {
              on: {
                TICK: [
                  {
                    target: 'system.active.heatingOn',
                    guard: tempBelowTarget,
                    actions: [
                      assign({ heaterOn: function () { return true; } }),
                      logAction('heater_on')
                    ]
                  },
                  {
                    target: 'system.active.heatingOff',
                    actions: [logAction('no_heat')]
                  }
                ],
                HEAT_ON: {
                  target: 'system.active.heatingOn',
                  actions: [
                    assign({ heaterOn: function () { return true; } }),
                    logAction('heater_on_manual')
                  ]
                }
              }
            },
            heatingOn: {
              on: {
                TICK: [
                  {
                    target: 'system.active.heatingOff',
                    guard: tempAtOrAboveTarget,
                    actions: [
                      assign({ heaterOn: function () { return false; } }),
                      logAction('heater_off')
                    ]
                  },
                  {
                    target: 'system.active.heatingOn',
                    actions: [logAction('keep_heat')]
                  }
                ],
                HEAT_OFF: {
                  target: 'system.active.heatingOff',
                  actions: [
                    assign({ heaterOn: function () { return false; } }),
                    logAction('heater_off_manual')
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
};
