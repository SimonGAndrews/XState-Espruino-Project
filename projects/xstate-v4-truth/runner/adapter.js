// Adapter: converts FSMPlus-style scenario configs into XState v4 createMachine configs.
// Used by the truth runner (projects/xstate-v4-truth/runner/run_greenhouse.js).
'use strict';

var xstate = require('xstate');
var assign = xstate.assign;

function mapActions(actions) {
  if (!actions) return actions;
  var list = Array.isArray(actions) ? actions : [actions];
  var out = [];
  var i;

  for (i = 0; i < list.length; i++) {
    var action = list[i];
    if (action && action.type === 'xstate.assign' && action.assignment) {
      out.push(assign(action.assignment));
    } else {
      out.push(action);
    }
  }

  return out;
}

function mapTarget(target, rootId) {
  if (!target) return target;
  if (Array.isArray(target)) {
    return target.map(function (t) { return mapTarget(t, rootId); });
  }
  if (typeof target === 'string' && target.charAt(0) === '#') return target;
  return '#' + rootId + '.' + target;
}

function isDescendant(target, sourcePath) {
  if (!target || !sourcePath) return false;
  if (target === sourcePath) return false;
  return target.indexOf(sourcePath + '.') === 0;
}

function mapTransition(transition, rootId, sourcePath) {
  if (!transition) return transition;

  var mapped = {};
  Object.keys(transition).forEach(function (key) {
    if (key === 'guard') return;
    if (key === 'actions') return;
    mapped[key] = transition[key];
  });

  if (transition.guard) mapped.cond = transition.guard;
  if (transition.actions) mapped.actions = mapActions(transition.actions);
  if (mapped.target) mapped.target = mapTarget(mapped.target, rootId);

  if (transition.target && typeof transition.target === 'string') {
    if (isDescendant(transition.target, sourcePath)) {
      mapped.internal = true;
    }
  }

  return mapped;
}

function mapOn(on, rootId, sourcePath) {
  if (!on) return on;
  var mapped = {};

  Object.keys(on).forEach(function (eventType) {
    var value = on[eventType];
    if (Array.isArray(value)) {
      mapped[eventType] = value.map(function (item) {
        return mapTransition(item, rootId, sourcePath);
      });
    } else {
      mapped[eventType] = mapTransition(value, rootId, sourcePath);
    }
  });

  return mapped;
}

function mapState(state, rootId, statePath) {
  var mapped = {};
  if (state.initial) mapped.initial = state.initial;
  if (state.entry) mapped.entry = mapActions(state.entry);
  if (state.exit) mapped.exit = mapActions(state.exit);
  if (state.on) mapped.on = mapOn(state.on, rootId, statePath);

  if (state.states) {
    mapped.states = {};
    Object.keys(state.states).forEach(function (key) {
      var childPath = statePath ? (statePath + '.' + key) : key;
      mapped.states[key] = mapState(state.states[key], rootId, childPath);
    });
  }

  return mapped;
}

function convertMachineConfig(config) {
  var rootId = config.id || 'machine';
  var mapped = {
    id: rootId,
    initial: config.initial,
    context: config.context,
    predictableActionArguments: true,
    states: {}
  };

  Object.keys(config.states).forEach(function (key) {
    mapped.states[key] = mapState(config.states[key], rootId, key);
  });

  return mapped;
}

module.exports = {
  convertMachineConfig: convertMachineConfig
};
