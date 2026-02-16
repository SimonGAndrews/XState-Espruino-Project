// Expected normalized trace for desired Stately-style compatibility behavior.
// This is a development target and may fail until relative targets and action
// params are fully supported in FSMPlus.
'use strict';

module.exports = [
  'STATE run ACTIONS -',
  'EVENT BTN_DOWN',
  'STATE menu.maxTemp ACTIONS disMenu',
  'EFFECT disMenu:maxTemp',
  'EVENT BTN_DOWN',
  'STATE menu.minTemp ACTIONS disMenu',
  'EFFECT disMenu:min_Temp',
  'EVENT BTN_SEL',
  'STATE menu.tMinSel ACTIONS dispValue',
  'EFFECT dispValue:tMin',
  'EVENT BTN_BACK',
  'STATE menu.minTemp ACTIONS disMenu',
  'EFFECT disMenu:min_Temp',
  'EVENT BTN_UP',
  'STATE menu.maxTemp ACTIONS disMenu',
  'EFFECT disMenu:maxTemp',
  'EVENT BTN_BACK',
  'STATE run ACTIONS -'
];
