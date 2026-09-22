# Stately Editor Final-state Example

## Provenance

- Producer: XState Editor, web version
- Authored through the visual GUI
- Captured: 2026-09-22
- Export profiles: XState v4 and XState v5
- Exact editor build/version: Not reported by the generated source

The `v4.js` and `v5.js` files preserve the generated output as supplied.
`Workflow` contains initial child `Working` and final child `Completed`.
Entering `Completed` completes `Workflow`, whose `onDone` transition targets
top-level state `Success`.

## Generated Structure

The v4 and v5 generators emit the same machine structure:

```javascript
Completed: {
  entry: { type: "enterCompleted" },
  exit: { type: "exitCompleted" },
  type: "final",
}

onDone: {
  target: "Success",
  actions: [{ type: "recordDone" }],
}
```

The GUI permits entry and exit actions on the final child. It represents
completion as the parent's `onDone` property rather than as a named entry in
the parent's `on` map.

## Reference Trace

Reference runs against XState 4.38.3 and XState 5.33.2 produced the same state
and action sequence:

```text
start:  enterWorkflow, enterWorking
finish: exitWorking, recordFinish, enterCompleted,
        exitCompleted, exitWorkflow, recordDone, enterSuccess
state:  Success
```

Completion is processed within the same public `send("finish")` operation.
The first microstep through entry of `Completed` supplies the original
`finish` event to actions. Completing `Workflow` then raises an internal event
that supplies the event argument to `exitCompleted`, `exitWorkflow`,
`recordDone`, and `enterSuccess`.

The internal event type differs by XState version:

```text
v4: done.state.Final state and parent done transition.Workflow
v5: xstate.done.state.Final state and parent done transition.Workflow
```

## Profile 1 Assessment

The machine structure is accepted after the standard host/binding adaptation.
Profile 1 supports `type: "final"` and compound-state `onDone`, follows the v5
internal completion-event type, and processes the entire action sequence as one
run-to-completion operation. A subscriber therefore observes `Success` as the
stable result and never observes the intermediate `Workflow.Completed`
configuration.
