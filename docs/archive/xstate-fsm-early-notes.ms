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