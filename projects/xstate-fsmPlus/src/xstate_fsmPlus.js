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

// State matcher helper (strict equality on dot-path value).
function createMatcher(value) {
  return function (stateValue) { return value === stateValue; };
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
function selectTransitionCandidate(candidate, context, eventObject) {
  var i;

  if (candidate === undefined || candidate === null) return null;

  if (Array.isArray(candidate)) {
    for (i = 0; i < candidate.length; i++) {
      if (!candidate[i]) continue;
      if (candidate[i].guard && !candidate[i].guard(context, eventObject)) {
        continue;
      }
      return candidate[i];
    }
    return null;
  }

  if (candidate.guard && !candidate.guard(context, eventObject)) {
    return null;
  }

  return candidate;
}

function findTransition(stateValue, eventObject, stateLookup, context) {
  // Walk up from leaf to root looking for a handler for eventType.
  // stateValue is a dot-path string (ADR-0002).
  var currentValue = stateValue;

  while (currentValue) {
    var currentState = stateLookup[currentValue];
    if (currentState && currentState.on && currentState.on[eventObject.type] !== undefined) {
      var candidate = currentState.on[eventObject.type];
      var resolved = selectTransitionCandidate(candidate, context, eventObject);
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
    return stateValue === target;
  };
}

function createMachine(fsmConfig, options) {
  options = options || {};
  var stateLookup = preprocessFSMConfig(fsmConfig);
  var initialResolved = stateLookup[fsmConfig.initial] ? stateLookup[fsmConfig.initial].initialResolved : fsmConfig.initial;
  var initialEntryActions = collectEntryActions(initialResolved, null, stateLookup);

  var machine = {
    config: fsmConfig,
    _options: options,
    _stateLookup: stateLookup,
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

      var transition = findTransition(state.value, eventObject, stateLookup, state.context);

      if (!transition) {
        console.log("No transition defined for event:", eventObject.type, "in state:", state.value);
        return createUnchangedState(state.value, state.context);
      }

      if (transition.guard && !transition.guard(state.context, eventObject)) {
        console.log("Guard condition failed for transition:", eventObject.type, "in state:", state.value);
        return createUnchangedState(state.value, state.context);
      }

      var newContext = Object.assign({}, state.context);
      var actions = transition.actions || [];

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
