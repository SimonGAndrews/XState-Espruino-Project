var fsm = require('xstate_fsmPlus');

var toggleMachine = fsm.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdgIYDGyeAbmAMQAqA8gOKMAyAogNoAMAuoqAAdUsPOVQF+IAB6IAjADZ5OAExc1XRQHYALAA4ArPoUAaEAE85AZlk51agJy6nRrgYC+b02gzYcpclR0TKycvJJCImISSNJyiip2WnqGJuaIujaWdpaaltp5mh6eIASoEHCS3lhg4cKieOKSMggAtPKmFq36OPa9ff39lh5e6NX4xGSUNTER9Y0xzdrKHelKjpZ5ytqyS-La8kPFVb7+U7WRDdGgzcq69jiassr6rq77risIdzh6GxvKuWUAKeRTcQA */
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
});

var toggleService = fsm.interpret(toggleMachine)
  .start();

toggleService.subscribe(function (state) {
  console.log(state.value);
});

toggleService.send('TOGGLE'); // => active
toggleService.send('TOGGLE'); // => inactive
