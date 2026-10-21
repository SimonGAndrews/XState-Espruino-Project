var XFSM = require("XFSM");

var outputs = {
  heating: false,
  cooling: false,
  fan: "off"
};

function enableFan(speed) {
  if (outputs.fan === speed) return;
  outputs.fan = speed;
  print("Output: fan " + speed);
}

function enableHeating() {
  if (outputs.heating) return;
  outputs.heating = true;
  print("Output: heating on");
}

function disableheating() {
  if (!outputs.heating) return;
  outputs.heating = false;
  print("Output: heating off");
}

function enableCooling() {
  if (outputs.cooling) return;
  outputs.cooling = true;
  print("Output: cooling on");
}

function disableCooling() {
  if (!outputs.cooling) return;
  outputs.cooling = false;
  print("Output: cooling off");
  enableFan("off");
}

var machine = XFSM.createMachine({
   /** @xstate-layout N4IgpgJg5mDOIC5QTGADgCQJawC4HsAnATwBEwBbfAOgHciBrLAOygGIBlAUQBUB9HlwCyABQDaABgC6iUGnywsuLPmayQAD0QA2AJy7qARgDsAJgCsugCwAOG8eP3DAGhDFE5idXOGJp7XqmhrbmAMzGAL4Rrijo2HhEZJQ09IRMrGwARgCuuATMfIRwYLiSMkgg8orKqupaCIbaDtT2to02plahltqu7gi6XsZWusYSobrmprraNlbaUTGomDgEJORUdIwsUNQAhrn4FHvKAMZZufl8x8zZewA2ZepVSipqFfVNodSh4442JhM+mMfR0XRagwmkwkMMhixAsRWCXWyS2aR2+0OxzO1CwEHuYDY-FO+Hw9xYAHlmE8Ki8au9QPVDL5zNQJDZtFYJHoHGNwqCENpTDZqFZjOFQsLQqErKZQgtogjlvE1klNql0rsDgRsVhTrj8YT+AALMAnHZUmlyBSvWofRDMiSs+zGXRymz6Qwe0wCmzytmuv5BbozeGIlWJDYpbasTE683603mjIms3KVh8CkAMyzVsqNvpdQdvkMP1CvlsHt0XrdAuM5hFZglUplcoVSziq0jqI1GO1RwT1BJZJ2RL4AGFSeTWNnc9JngW3kWGszS9KK3ZPd6BVMvO0TGYHByOmHlV2UeqY1qsYPh9Pdvd8LQLnlVHws3tmAAZJ95ulL+0Gh8Aw5SbRxOXGUIBU5b4PXGfRPFhcZT07ZE1WjdFY37XV9TvDFjSwKBjRfK4P2YbAiL-Rc7UZB1gOoUDQI5LlpR3XRvgmeDoSQ0IUKRVUozRTVqBuO57hIt9+yo6oANohAxSsahdA6L5zGMTlhkaAV-FLKwTG9Rx1PCTk+IjC8MOE0SHgkgok3TKBpNtBlNAdewWjsHwphDKx5hsX1QhFfxlK5KYRlmGxTPPdChIxKzxJyV9bLTHYxEMcprRkmiXMFHyfk6Sw9O0NTfCgtxED9YwGPZOZuiaCQZlMSK0ME3tYzimy+Dw1hHMLQCTG+PkYXlPSuhlKwBS5bQlM8aU3VlHx5qagSeyvETPzEjquoctKF0y5zPhlahtAkLllJOvx6r8sqEHlb4mjMMIJGCcwrCmJbu02IpYBKey2C+koACU4GyCgwB62TssMIIvEGGZxW0eUmnMOtvjbDprCCEIAqiRVmHwFB4AqcMoqjXanOXZpBvGTlgmlHyBQAWn9ZTRj0xD6okcV3vMmLWDJ3q5Kh1kqeG2mxoFQw1JaSVTCddkTrMV7uei1rdgItD+YhpkuimzxZflYqoau-p8rLUxZdlrk5kcZWWtW7CE01rL6mrKb1xOzdqw9FxrplVlONGzSXsiRViealbMOveMcTxAknf2xAZkU93Ky3asd3LahjC9A9TCPWZDFtiPhIdnE7J2ePlyhvQGK6Gwwjq48fWuxxFOFSZ64e-QmiLy9I7jAccS2yu+osLxbDMWYAsaZkJslCFzsnir2N7iy+xvIepwxR9aBHwXphFCf-D9AFtFn67jsU0Zmz9Vt5VX3mo8HvUhy32MCKIvfIb0NunUmcV5ivRGNBTmopxTihbLKe+oczzhz7pZdaDwv71D0qWd0cxBj1RKqVfoDYRQwh8nMHwJYfIP3+nkCutJqIJwaHpUwR0Qr1zgr8JoO5KrjG5MBcsnhZSTBxhEIAA */
   
   id: "deepHistoryDemo",
  context: {
    currentTemp: 18,
    setValue: 20,
    manualHeatingOn: false,
    manualCoolingOn: false
  },
  initial: "working",

  states: {
    working: {
      id: "working",
      initial: "manual",

      states: {
        history: {
          type: "history",
          history: "deep"
        },

        automatic: {
          initial: "idle",
          on: {
            button_manual: "#working.manual"
          },

          states: {
            idle: {
              on: {
                T_coolinOn: "cooling",
                T_heatingOn: "heating"
              }
            },

            heating: {
              entry: "enableHeating",
              exit: "disableheating",
              on: {
                T_heating_Off: "idle"
              }
            },

            cooling: {
              entry: "enableCooling",
              exit: "disableCooling",
              on: {
                T_CoolingOff: "idle"
              },

              states: {
                low: {
                  entry: "enableLowFan",
                  on: {
                    button_fanLow: "high"
                  }
                },

                high: {
                  entry: "enableHighFan",

                  on: {
                    button_fanHigh: "low"
                  }
                }
              },

              initial: "low"
            }
          }
        },

        manual: {
          exit: [
            XFSM.assign({
              manualHeatingOn: false,
              manualCoolingOn: false
            }),
            "disableheating",
            "disableCooling"
          ],
          on: {
            button_auto: "automatic.idle",
            button_heating: [
              {
                target: "#working.manual",
                guard: "manualHeatingIsOn",
                actions: [
                  XFSM.assign({ manualHeatingOn: false }),
                  "disableheating"
                ]
              },
              {
                target: "#working.manual",
                actions: [
                  XFSM.assign({
                    manualHeatingOn: true,
                    manualCoolingOn: false
                  }),
                  "disableCooling",
                  "enableHeating"
                ]
              }
            ],
            button_cooling: [
              {
                target: "#working.manual",
                guard: "manualCoolingIsOn",
                actions: [
                  XFSM.assign({ manualCoolingOn: false }),
                  "disableCooling"
                ]
              },
              {
                target: "#working.manual",
                actions: [
                  XFSM.assign({
                    manualHeatingOn: false,
                    manualCoolingOn: true
                  }),
                  "disableheating",
                  "enableCooling"
                ]
              }
            ]
          }
        }
      },

      on: {
        SET_TEMP: {
          actions: XFSM.assign({
            currentTemp: function (context, event) {
              return event.value;
            }
          })
        },

        button_reset: "resetting"
      }
    },

    resetting: {
      on: {
        resetResume: "working.history"
      }
    }
  }
}, {
  actions: {
    enableHeating: enableHeating,
    disableheating: disableheating,
    enableCooling: enableCooling,
    disableCooling: disableCooling,
    enableLowFan: function (context, event) {
      enableFan("low");
    },
    enableHighFan: function (context, event) {
      enableFan("high");
    }
  },
  guards: {
    manualHeatingIsOn: function (context, event) {
      return context.manualHeatingOn;
    },
    manualCoolingIsOn: function (context, event) {
      return context.manualCoolingOn;
    }
  }
});

var actor = XFSM.createActor(machine);

actor.subscribe(function (snapshot) {
  print("State: " + JSON.stringify(snapshot.value) +
    " Temp: " + snapshot.context.currentTemp +
    " ManualHeating: " + snapshot.context.manualHeatingOn +
    " ManualCooling: " + snapshot.context.manualCoolingOn +
    " Heating: " + outputs.heating +
    " Cooling: " + outputs.cooling +
    " Fan: " + outputs.fan);
});

function setTemperature(value) {
  actor.send({ type: "SET_TEMP", value: value });

  var snapshot = actor.getSnapshot();
  var heating = snapshot.matches({
    working: { automatic: "heating" }
  });
  var cooling = snapshot.matches({
    working: { automatic: "cooling" }
  });

  // Temperature changes only control outputs while automatic is active.
  if (!snapshot.matches({ working: "automatic" })) return;

  if (value > snapshot.context.setValue) {
    if (heating) actor.send("T_heating_Off");
    if (!cooling) actor.send("T_coolinOn");
  } else if (value < snapshot.context.setValue) {
    if (cooling) actor.send("T_CoolingOff");
    if (!heating) actor.send("T_heatingOn");
  } else if (cooling) {
    actor.send("T_CoolingOff");
  } else if (heating) {
    actor.send("T_heating_Off");
  }
}

actor.start();

// Manual buttons toggle outputs without leaving manual.
actor.send("button_heating");
actor.send("button_heating");
actor.send("button_cooling");
actor.send("button_heating");

// Enter automatic idle, then let the thermostat evaluate the temperature.
actor.send("button_auto");
setTemperature(18);

// At the set value, the thermostat turns heating off.
setTemperature(20);

// Above the set value, the thermostat turns cooling on.
setTemperature(22);

// Move to the deepest leaf before leaving working.
actor.send("button_fanLow");
actor.send("button_reset");

// Deep history restores automatic.cooling.high.
actor.send("RESUME");

// Below the set value, cooling turns off before heating turns on.
setTemperature(18);
