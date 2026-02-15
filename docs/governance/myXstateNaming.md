# xstateFsmPlus Naming Conventions  

This document defines recommended naming conventions for machines built with **xstateFsmPlus** running on **Espruino**.

These conventions:

- Align with XState best practice where practical
- Respect current engine behaviour (dot-path hierarchy)
- Avoid conflicts with the internal `.` delimiter
- Optimise memory usage under Espruino’s JsVar storage model
- Prefer camelCase where appropriate
- Keep object key strings compact to reduce RAM consumption

---

# Why Name Length Matters on Espruino

Espruino stores object keys in fixed-size memory blocks (JsVars).

Important consequences:

- Each object property uses **two JsVars** (key + value).
- If a key string exceeds ~10 characters (on 16-byte builds),
  additional JsVars are required.
- On smaller block builds (~12-byte), the safe threshold is ~7 characters.
- Longer names slightly increase lookup cost.
- FSM models contain many object keys (`states`, `on`, guards, actions, context keys).

Therefore:

> Keep object key strings ≤ 10 characters where possible.  
> Shorter is better.  
> Be consistent with abbreviations.

---

# 1. State Node Keys

## Format

Use **lowerCamelCase**.

State names represent **modes or conditions**, not actions.

## Good Examples

- idle
- menu
- menuView
- menuEdit
- watering
- heatCtrl
- fault
- sensFault

## Avoid

- startPump (action, not state)
- doWatering (verb phrase)
- Main_Menu (underscore)
- menu.edit (dot inside key – reserved)

## Hierarchy Rule

State keys **MUST NOT contain a dot (`.`)**.

Hierarchy must be expressed using nested `states`, not embedded dots.

Correct:

    states: {
      menu: {
        states: {
          view: {},
          edit: {}
        }
      }
    }

Runtime state value:

    menu.edit

---

## Optimal Espruino Usage – State Keys

- Prefer **≤ 10 characters** per state key.
- Prefer **≤ 8 characters** if possible.
- Keep dot-path segments short.
- Limit hierarchy depth (prefer ≤ 3 levels).
- Avoid long descriptive phrases.
- Use consistent abbreviations:
  - temperature → temp
  - sensor → sens
  - controller → ctrl
  - percentage → pct

Example comparison:

Better:
    heatCtrl
    sensFault

Avoid:
    temperatureController
    sensorFailureState

---

# 2. Compound State Keys

Use the same lowerCamelCase rule.

Keep parent state names short because:

- They form part of flattened dot-path strings.
- fsmPlus stores full path IDs.

Example:

    fault.sens
    fault.overTmp

---

## Optimal Espruino Usage – Compound States

- Each segment ≤ 8–10 chars.
- Keep full path ideally ≤ ~24 chars.
- Avoid deeply nested verbose naming.

Good:
    main.menuEdit

Avoid:
    mainMenuEditingSubsystem

---

# 3. Event Names

Events represent **things that happen**.

## Preferred Format

Use **UPPER_CASE** with optional namespace.

### Recommended Style (Embedded Friendly)

    NAMESPACE_EVENT

Examples:

- BTN_UP
- BTN_DN
- BTN_SEL
- BTN_LNG
- TMR_TICK
- TMR_EXP
- SENS_HI
- SENS_LO

Optional dot namespace (allowed but not required):

- BTN.UP
- TMR.EXP

Choose one style and apply consistently.

---

## Optimal Espruino Usage – Events

- Keep full event string ≤ 10 characters where practical.
- Avoid long descriptive events like:
    BUTTON_LONG_PRESS_RELEASED
- Use compact prefixes:
  - BTN
  - TMR
  - SENS
  - WIFI
- Use consistent abbreviations.

Compact > verbose.

---

# 4. Guard Function Names

Guards are boolean conditions.

## Format

Use **lowerCamelCase**, boolean phrase.

## Good Examples

- isDry
- isHot
- canHeat
- hasErr
- isSafe

## Avoid

- soilDry
- temperatureHigh

Boolean intent should be explicit.

---

## Optimal Espruino Usage – Guards

- Keep guard names ≤ 10 characters.
- Short boolean prefixes help:
  - is
  - has
  - can
- Avoid long condition descriptions.

Better:
    isTempHi

Avoid:
    isTemperatureAboveTarget

---

# 5. Action Names

Actions are imperative operations.

## Format

Use **lowerCamelCase verb phrases**.

## Good Examples

- startPmp
- stopPmp
- setMenu
- incMenu
- decMenu
- logSt
- buzzErr

## Avoid

- pumpStart
- menuShown

Actions should read like commands.

---

## Optimal Espruino Usage – Actions

- Keep action map keys ≤ 10 characters.
- Use consistent abbreviations:
  - pump → pmp
  - increase → inc
  - decrease → dec
  - error → err
- Avoid long operational descriptions.

Better:
    resetTmr

Avoid:
    resetWateringTimeoutTimer

---

# 6. Context Property Names

Use **lowerCamelCase nouns**.

## Good Examples

- soilPct
- tgtPct
- tempC
- tgtC
- menuIdx
- errCode

## Avoid

- Soil_Moisture
- targetTemperatureCelsius

---

## Optimal Espruino Usage – Context Keys

Context keys are object properties and consume memory.

- Keep ≤ 10 characters.
- Keep frequently accessed keys short.
- Use consistent suffix patterns:
  - C (Celsius)
  - Pct (percentage)
  - Idx (index)
  - Cnt (count)

Better:
    soilPct

Avoid:
    soilMoisturePercentage

---

# 7. Transition Target Strings

fsmPlus uses flattened dot-path IDs.

Targets must match:

    parent.child.leaf

Example:

    on: {
      BTN_SEL: { target: 'menu.edit' }
    }

Do not use:

- mainMenu/edit
- #mainMenu.edit (not implemented)
- Natural language strings

---

## Optimal Espruino Usage – Targets

- Keep state path segments short.
- Avoid long nested chains.
- Remember: flattened path strings are used as lookup keys internally.

Compact structure improves memory usage.

---

# 8. Self-Transitions

Explicit self-transition:

    on: {
      TMR_TICK: { target: 'watering' }
    }

No special naming convention required.

---

# 9. Machine ID Naming

If using an `id`, use camelCase noun.

Examples:

- greenhouseCtrl
- menuCtrl
- wateringMach

Keep it short.

---

# Overall Compact Naming Principles

1. Prefer ≤ 10 characters for any object key.
2. Keep hierarchy shallow.
3. Use consistent abbreviations.
4. Separate readability from verbosity.
5. Optimise runtime keys; document full meaning in comments.

---

# Final Summary Table

| Element | Convention | Target Length | Example |
|----------|------------|---------------|----------|
| States | lowerCamelCase | ≤ 10 chars | menuEdit |
| Events | UPPER_CASE | ≤ 10 chars | BTN_SEL |
| Guards | lowerCamelCase boolean | ≤ 10 chars | isDry |
| Actions | lowerCamelCase verb | ≤ 10 chars | startPmp |
| Context | lowerCamelCase noun | ≤ 10 chars | soilPct |
| Targets | dot-path | compact segments | menu.edit |
| Dot in state key | Not allowed | — | — |

---

Adhering to these rules ensures:

- Compatibility with current xstateFsmPlus implementation
- Predictable hierarchical dot-path behaviour
- Reduced JsVar usage
- Better memory efficiency on constrained MCU platforms
- Clean, consistent, and maintainable FSM models
