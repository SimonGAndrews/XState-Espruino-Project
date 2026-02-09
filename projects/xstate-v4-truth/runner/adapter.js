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

function mapTransition(transition, rootId) {
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

  return mapped;
}

function mapOn(on, rootId) {
  if (!on) return on;
  var mapped = {};

  Object.keys(on).forEach(function (eventType) {
    var value = on[eventType];
    if (Array.isArray(value)) {
      mapped[eventType] = value.map(function (item) {
        return mapTransition(item, rootId);
      });
    } else {
      mapped[eventType] = mapTransition(value, rootId);
    }
  });

  return mapped;
}

function mapState(state, rootId) {
  var mapped = {};
  if (state.initial) mapped.initial = state.initial;
  if (state.entry) mapped.entry = mapActions(state.entry);
  if (state.exit) mapped.exit = mapActions(state.exit);
  if (state.on) mapped.on = mapOn(state.on, rootId);

  if (state.states) {
    mapped.states = {};
    Object.keys(state.states).forEach(function (key) {
      mapped.states[key] = mapState(state.states[key], rootId);
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
    mapped.states[key] = mapState(config.states[key], rootId);
  });

  return mapped;
}

module.exports = {
  convertMachineConfig: convertMachineConfig
};
