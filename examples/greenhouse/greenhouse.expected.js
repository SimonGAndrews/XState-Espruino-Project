// Expected normalized trace for the greenhouse scenario.
// Used by all runners for pass/fail comparison.
'use strict';

module.exports = [
  'STATE system.idle ACTIONS -',
  'CTX {"heaterOn":false,"target":20,"temp":18}',
  'EVENT START',
  'STATE system.active.heatingOff ACTIONS log:start',
  'CTX {"heaterOn":false,"target":20,"temp":18}',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:heater_on',
  'CTX {"heaterOn":true,"target":20,"temp":18}',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:keep_heat',
  'CTX {"heaterOn":true,"target":20,"temp":18}',
  'EVENT HEAT_OFF',
  'STATE system.active.heatingOff ACTIONS log:heater_off_manual',
  'CTX {"heaterOn":false,"target":20,"temp":18}',
  'EVENT TICK',
  'STATE system.active.heatingOn ACTIONS log:heater_on',
  'CTX {"heaterOn":true,"target":20,"temp":18}',
  'EVENT STOP',
  'STATE system.idle ACTIONS log:stop',
  'CTX {"heaterOn":true,"target":20,"temp":18}'
];
