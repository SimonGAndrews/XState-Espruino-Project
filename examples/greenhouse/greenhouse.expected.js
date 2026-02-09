'use strict';

module.exports = [
  'STATE system.idle ACTIONS -',
  'EVENT START',
  'STATE system.active.heatingOff ACTIONS log:start',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:heater_on',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:keep_heat',
  'EVENT HEAT_OFF',
  'STATE system.active.heatingOff ACTIONS log:heater_off_manual',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:heater_on',
  'EVENT STOP',
  'STATE system.idle ACTIONS log:stop'
];
