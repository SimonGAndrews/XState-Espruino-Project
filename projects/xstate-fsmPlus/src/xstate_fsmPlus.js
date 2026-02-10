/*   xstate_fsmPlus.js - Hierarchical FSM for Espruino V15 */
  
  

// -----------------------------
// Constants and helpers
// -----------------------------
const InterpreterStatus = {
  NotStarted: 0,
  Running: 1,
  Stopped: 2
};

const INIT_EVENT = { type: 'xstate.init' };
const ASSIGN_ACTION = 'xstate.assign';

// Coerce values to arrays for internal convenience.
function toArray(item) {
  return item === undefined ? [] : [].concat(item);
}

// State matcher helper (dot-path equality or ancestor match).
function createMatcher(value) {
  return function (target) {
    if (target === value) return true;
    if (typeof target !== 'string') return false;
    return value.indexOf(target + '.') === 0;
  };
}

// Normalize event inputs into `{ type, ... }` objects.
function toEventObject(event) {
  return typeof event === 'string' ? { type: event } : event;
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeOn(parentOn, childOn) {
  var merged = {};
  var key;

  if (isPlainObject(parentOn)) {
    for (key in parentOn) {
      if (parentOn.hasOwnProperty(key)) merged[key] = parentOn[key];
    }
  }

  if (isPlainObject(childOn)) {
    for (key in childOn) {
      if (childOn.hasOwnProperty(key)) merged[key] = childOn[key];
    }
  }

  return merged;
}

// Merge two plain maps (options/actions/guards) into a new object.
function mergeMaps(baseMap, overrideMap) {
  var merged = {};
  var key;
  if (baseMap) {
    for (key in baseMap) {
      if (baseMap.hasOwnProperty(key)) merged[key] = baseMap[key];
    }
  }
  if (overrideMap) {
    for (key in overrideMap) {
      if (overrideMap.hasOwnProperty(key)) merged[key] = overrideMap[key];
    }
  }
  return merged;
}

// Normalize and merge machine options (actions/guards) into a single bag.
function mergeOptions(baseOptions, overrideOptions) {
  var base = baseOptions || {};
  var over = overrideOptions || {};
  return {
    actions: mergeMaps(base.actions, over.actions),
    guards: mergeMaps(base.guards, over.guards)
  };
}

// Resolve action names/descriptors to a concrete action object when possible.
function resolveAction(action, options) {
  var actions = options && options.actions ? options.actions : null;
  if (!actions) return action;
  if (typeof action === 'string') {
    if (actions[action]) {
      return { type: action, exec: actions[action] };
    }
    return action;
  }
  if (action && action.type && actions[action.type]) {
    var copy = {};
    var key;
    for (key in action) {
      if (action.hasOwnProperty(key)) copy[key] = action[key];
    }
    if (!copy.exec) copy.exec = actions[action.type];
    return copy;
  }
  return action;
}

// Build a state object that represents "no transition".
function createUnchangedState(value, context) {
  return {
    value: value,
    context: context,
    actions: [],
    changed: false,
    matches: createMatcher(value)
  };
}

// -----------------------------
// Transition selection (guards + parent fallback)
// - Supports transition arrays; first passing guard wins
// -----------------------------
function selectTransitionCandidate(candidate, context, eventObject, options) {
  var i;
  var guards = options && options.guards ? options.guards : null;

  if (candidate === undefined || candidate === null) return null;

  if (Array.isArray(candidate)) {
    for (i = 0; i < candidate.length; i++) {
      if (!candidate[i]) continue;
      var guardFn = candidate[i].guard;
      if (typeof guardFn === 'string' && guards) {
        guardFn = guards[guardFn];
      }
      if (guardFn && typeof guardFn !== 'function') {
        continue;
      }
      if (guardFn && !guardFn(context, eventObject)) {
        continue;
      }
      if (guardFn) candidate[i].guard = guardFn;
      return candidate[i];
    }
    return null;
  }

  var guard = candidate.guard;
  if (typeof guard === 'string' && guards) guard = guards[guard];
  if (guard && typeof guard !== 'function') {
    return null;
  }
  if (guard && !guard(context, eventObject)) {
    return null;
  }
  if (guard) candidate.guard = guard;

  return candidate;
}

function findTransition(stateValue, eventObject, stateLookup, context, options) {
  // Walk up from leaf to root looking for a handler for eventType.
  // stateValue is a dot-path string (ADR-0002).
  var currentValue = stateValue;
  while (currentValue) {
    var currentState = stateLookup[currentValue];
    if (currentState && currentState.on && currentState.on[eventObject.type] !== undefined) {
      var candidate = currentState.on[eventObject.type];
      var resolved = selectTransitionCandidate(candidate, context, eventObject, options);
      if (resolved) return resolved;
    }

    // Move to parent: strip last segment
    var lastDot = currentValue.lastIndexOf('.');
    if (lastDot < 0) break;
    currentValue = currentValue.substr(0, lastDot);
  }

  return null;
}

// -----------------------------
// Preprocessing (flatten + initial resolution)
// - Records parent links and entry/exit arrays for LCCA/action ordering
// -----------------------------
function preprocessFSMConfig(fsmConfig) {
  var stateLookup = {};

  function processState(path, stateConfig, parentConfig) {
    var fullPath = path.join('.');
    var parentPath = path.length > 1 ? path.slice(0, -1).join('.') : null;
    stateLookup[fullPath] = {
      id: fullPath,
      parent: parentPath,
      initialResolved: resolveInitialState(path, stateConfig),
      on: mergeOn(parentConfig ? parentConfig.on : null, stateConfig ? stateConfig.on : null),
      entry: toArray(stateConfig.entry),
      exit: toArray(stateConfig.exit)
    };
    if (stateConfig.states) {
      Object.keys(stateConfig.states).forEach(function (subState) {
        processState(path.concat(subState), stateConfig.states[subState], stateConfig);
      });
    }
  }

  function resolveInitialState(path, stateConfig) {
    if (!stateConfig || !stateConfig.states) return path.join('.');
    if (!stateConfig.initial || !stateConfig.states[stateConfig.initial]) return path.join('.');
    return resolveInitialState(path.concat(stateConfig.initial), stateConfig.states[stateConfig.initial]);
  }

  Object.keys(fsmConfig.states).forEach(function (state) {
    processState([state], fsmConfig.states[state], null);
  });

  return stateLookup;
}

// Build leaf-to-root ancestor chain (including leaf).
function getAncestorChain(stateValue, stateLookup) {
  var chain = [];
  var current = stateValue;

  while (current) {
    chain.push(current);
    current = stateLookup[current] ? stateLookup[current].parent : null;
  }

  return chain;
}

// Find least common compound ancestor (LCCA) between source and target.
function findLCCA(sourceValue, targetValue, stateLookup) {
  var sourceChain = getAncestorChain(sourceValue, stateLookup);
  var sourceSet = {};
  var i;

  for (i = 0; i < sourceChain.length; i++) {
    sourceSet[sourceChain[i]] = true;
  }

  var targetChain = getAncestorChain(targetValue, stateLookup);
  for (i = 0; i < targetChain.length; i++) {
    if (sourceSet[targetChain[i]]) return targetChain[i];
  }

  return null;
}

// Collect exit actions from leaf up to (but excluding) LCCA.
function collectExitActions(sourceValue, lcca, stateLookup) {
  var actions = [];
  var chain = getAncestorChain(sourceValue, stateLookup);
  var i;

  for (i = 0; i < chain.length; i++) {
    if (chain[i] === lcca) break;
    var stateNode = stateLookup[chain[i]];
    if (stateNode && stateNode.exit && stateNode.exit.length) {
      actions = actions.concat(stateNode.exit);
    }
  }

  return actions;
}

// Collect entry actions from (excluding) LCCA down to target leaf.
function collectEntryActions(targetValue, lcca, stateLookup) {
  var actions = [];
  var chain = getAncestorChain(targetValue, stateLookup);
  chain.reverse(); // root -> leaf

  var i;
  var startIndex = 0;
  if (lcca) {
    for (i = 0; i < chain.length; i++) {
      if (chain[i] === lcca) {
        startIndex = i + 1;
        break;
      }
    }
  }

  for (i = startIndex; i < chain.length; i++) {
    var stateNode = stateLookup[chain[i]];
    if (stateNode && stateNode.entry && stateNode.entry.length) {
      actions = actions.concat(stateNode.entry);
    }
  }

  return actions;
}

// -----------------------------
// Machine creation + transition processing
// - Handles targetless transitions and self-reentry semantics
// -----------------------------
function createMatcher(stateValue) {
  return function (target) {
    if (target === stateValue) return true;
    if (typeof target !== 'string') return false;
    return stateValue.indexOf(target + '.') === 0;
  };
}

function createMachine(fsmConfig, options) {
  options = mergeOptions(null, options || {});
  var stateLookup = preprocessFSMConfig(fsmConfig);
  var initialResolved = stateLookup[fsmConfig.initial] ? stateLookup[fsmConfig.initial].initialResolved : fsmConfig.initial;
  var initialEntryActions = collectEntryActions(initialResolved, null, stateLookup);

  var machine = {
    config: fsmConfig,
    _options: options,
    _stateLookup: stateLookup,
    // Return a new machine with merged options and optional context override.
    withConfig: function (overrideOptions, contextOverride) {
      var merged = mergeOptions(machine._options, overrideOptions || {});
      var nextConfig = machine.config;
      if (contextOverride !== undefined) {
        nextConfig = {};
        var key;
        for (key in machine.config) {
          if (machine.config.hasOwnProperty(key)) nextConfig[key] = machine.config[key];
        }
        nextConfig.context = contextOverride;
      }
      return createMachine(nextConfig, merged);
    },
    // Convenience alias for overriding only context.
    withContext: function (contextOverride) {
      return machine.withConfig(null, contextOverride);
    },
    initialState: {
      value: initialResolved,
      actions: initialEntryActions,
      context: fsmConfig.context,
      matches: createMatcher(initialResolved)
    },
    transition: function (state, event) {
      var eventObject = toEventObject(event);
      var currentState = stateLookup[state.value];
      if (!currentState) {
        console.log("No transitions available for undefined state:", state.value);
        return createUnchangedState(state.value, state.context);
      }

      console.log("Available transitions in", state.value, ":", Object.keys(currentState.on));

      var transition = findTransition(state.value, eventObject, stateLookup, state.context, machine._options);

      if (!transition) {
        console.log("No transition defined for event:", eventObject.type, "in state:", state.value);
        return createUnchangedState(state.value, state.context);
      }

      if (transition.guard && typeof transition.guard !== 'function') {
        console.log("Guard not resolved for transition:", eventObject.type, "in state:", state.value);
        return createUnchangedState(state.value, state.context);
      }
      if (transition.guard && !transition.guard(state.context, eventObject)) {
        console.log("Guard condition failed for transition:", eventObject.type, "in state:", state.value);
        return createUnchangedState(state.value, state.context);
      }

      var newContext = Object.assign({}, state.context);
      var rawActions = transition.actions || [];
      var actions = [];
      var ai = 0;
      for (ai = 0; ai < rawActions.length; ai++) {
        actions.push(resolveAction(rawActions[ai], machine._options));
      }

      var assignActions = actions.filter(action => action.type === ASSIGN_ACTION);
      assignActions.forEach(action => {
        Object.keys(action.assignment).forEach(key => {
          newContext[key] = action.assignment[key](newContext, eventObject);
        });
      });

      console.log("Context updated before transition:", newContext);

      var hasTarget = transition.target !== undefined && transition.target !== null;
      var targetResolved = hasTarget
        ? (stateLookup[transition.target] ? stateLookup[transition.target].initialResolved : transition.target)
        : state.value;

      if (hasTarget) {
        console.log("Transition from:", state.value, "on event:", eventObject.type, "to:", targetResolved);
      } else {
        console.log("Targetless transition on event:", eventObject.type, "in state:", state.value);
      }

      var lcca = null;
      if (hasTarget) {
        lcca = findLCCA(state.value, targetResolved, stateLookup);
        if (targetResolved === state.value) {
          lcca = stateLookup[state.value] ? stateLookup[state.value].parent : null;
        }
      }

      var exitActions = hasTarget ? collectExitActions(state.value, lcca, stateLookup) : [];
      var entryActions = hasTarget ? collectEntryActions(targetResolved, lcca, stateLookup) : [];
      var nonAssignActions = actions.filter(action => action.type !== ASSIGN_ACTION);
      var allActions = hasTarget
        ? exitActions.concat(nonAssignActions, entryActions)
        : nonAssignActions;

      return {
        value: targetResolved,
        context: newContext,
        actions: allActions,
        changed: hasTarget ? targetResolved !== state.value : false,
        matches: createMatcher(targetResolved)
      };
    }
  };
  return machine;
}

// -----------------------------
// Interpreter lifecycle (start/stop/send/subscribe)
// - Emits state to listeners on each transition
// -----------------------------
function interpret(machine) {
  if (!machine) {
    throw new Error("Machine instance is undefined");
  }
  var stateLookup = machine._stateLookup;
  var state = machine.initialState;
  var status = InterpreterStatus.NotStarted;
  var listeners = {};

  var service = {
    _machine: machine,
    send: function (event) {
      if (status !== InterpreterStatus.Running) return;
      state = machine.transition(state, event);
      console.log("New state after transition:", state.value);
      Object.keys(listeners).forEach(key => listeners[key](state));
    },
    subscribe: function (listener) {
      listeners[listener] = listener;
      listener(state);
      return {
        unsubscribe: function () { delete listeners[listener]; }
      };
    },
    start: function (initialState) {
      if (initialState) {
        const resolved = typeof initialState === 'object'
          ? initialState
          : { value: initialState, context: machine.config.context };
        const resolvedValue = stateLookup[resolved.value]
          ? stateLookup[resolved.value].initialResolved
          : resolved.value;
        const entryActions = collectEntryActions(resolvedValue, null, stateLookup);

        state = {
          value: resolvedValue,
          actions: entryActions,
          context: resolved.context,
          matches: createMatcher(resolvedValue)
        };

        if (!stateLookup[state.value]) {
          throw new Error(`Cannot start service in state '${state.value}'. The state is not found on machine${machine.config.id ? ` '${machine.config.id}'` : ''}.`);
        }
      }

      status = InterpreterStatus.Running;
      console.log("FSM started with initial state:", state.value);
      return service;
    },
    stop: function () {
      status = InterpreterStatus.Stopped;
      listeners = {};
      console.log("FSM stopped.");
      return service;
    },
    get state() {
      return state;
    },
    get status() {
      return status;
    }
  };
  return service;
}


exports.createMachine = createMachine;
exports.interpret = interpret;
