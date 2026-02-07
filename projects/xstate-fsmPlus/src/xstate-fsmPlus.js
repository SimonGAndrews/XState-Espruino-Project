/*
  xstate-fsmPlus.js - Hierarchical FSM for Espruino V15
  
  ## Objectives:
  - Implement a **hierarchical finite state machine (FSM)** that supports **compound states**.
  - Ensure **fast execution** by using **precomputed lookup tables**.
  - Maintain **proper entry and exit action execution order** for hierarchical states.
  - Automatically **resolve initial states** for compound states.
  - Support **guard conditions** to allow or prevent state transitions.
  - Ensure **assign actions execute before other transition actions**, as per XState behavior.
  - Implement **parent state resolution for missing transitions**, ensuring transitions propagate upwards.
  
  ## Requirements:
  1. **State Hierarchy**
     - Each state can have **nested substates**, enabling deep state nesting.
  2. **Preprocessed State Model**
     - Transitions and lookup tables are **computed beforehand** to speed up execution.
  3. **Efficient Transitions**
     - Transitions only affect the necessary states rather than reprocessing the entire state tree.
  4. **State Targeting Methods**
     - Supports **absolute paths** (e.g., `#Machine.State.Substate`).
     - Supports **relative paths** (e.g., `..`, `.`, `SiblingState`).
  5. **Correct Entry/Exit Action Execution**
     - When transitioning, **exit actions execute first, then entry actions**.
  6. **Self-Transitions**
     - A state can **re-enter itself**, correctly executing exit and entry actions.
  7. **Transition Resolution**
     - If a transition target is a **compound state**, the FSM should automatically resolve to its **initial state**.
  8. **Debugging and Logging**
     - Logs **available transitions** before processing an event.
     - Warns if a **transition target is missing** in the lookup table.
  9. **Guards Implementation**
     - Transitions can define **guards** (conditions) that determine whether they can execute.
  10. **Ordered Action Execution**
     - `assign` actions execute **before** other actions in a transition, ensuring proper context updates.
  11. **Parent State Resolution**
     - If a transition is not found in a child state, the FSM will check the parent state for a matching transition.
*/

const InterpreterStatus = {
  NotStarted: 0,
  Running: 1,
  Stopped: 2
};

const INIT_EVENT = { type: 'xstate.init' };
const ASSIGN_ACTION = 'xstate.assign';

function toArray(item) {
  return item === undefined ? [] : [].concat(item);
}

function createMatcher(value) {
  return function (stateValue) { return value === stateValue; };
}

function toEventObject(event) {
  return typeof event === 'string' ? { type: event } : event;
}

function createUnchangedState(value, context) {
  return {
    value: value,
    context: context,
    actions: [],
    changed: false,
    matches: createMatcher(value)
  };
}

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

function preprocessFSMConfig(fsmConfig) {
  var stateLookup = {};

  function processState(path, stateConfig, parentConfig) {
    var fullPath = path.join('.');
    stateLookup[fullPath] = {
      id: fullPath,
      initialResolved: resolveInitialState(path, stateConfig),
      on: Object.assign({}, parentConfig && parentConfig.on ? parentConfig.on : {}, typeof stateConfig.on === "object" ? stateConfig.on : {})
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

function createMatcher(stateValue) {
  return function (target) {
    return stateValue === target;
  };
}

function createMachine(fsmConfig, options) {
  options = options || {};
  var stateLookup = preprocessFSMConfig(fsmConfig);
  var initialResolved = stateLookup[fsmConfig.initial] ? stateLookup[fsmConfig.initial].initialResolved : fsmConfig.initial;

  var machine = {
    config: fsmConfig,
    _options: options,
    initialState: {
      value: initialResolved,
      actions: [],
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

      var targetResolved = stateLookup[transition.target] ? stateLookup[transition.target].initialResolved : transition.target;
      console.log("Transition from:", state.value, "on event:", eventObject.type, "to:", targetResolved);

      return {
        value: targetResolved,
        context: newContext,
        actions: actions.filter(action => action.type !== ASSIGN_ACTION),
        changed: targetResolved !== state.value,
        matches: createMatcher(targetResolved)
      };
    }
  };
  return machine;
}

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

        state = {
          value: resolved.value,
          actions: [],
          context: resolved.context,
          matches: createMatcher(resolved.value)
        };

        if (!machine.config.states[state.value]) {
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
