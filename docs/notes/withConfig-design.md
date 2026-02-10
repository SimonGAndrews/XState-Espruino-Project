# withConfig() Design Note (FSMPlus)

## Purpose
Provide a minimal, low‑bloat `withConfig()` API compatible with common XState v4
workflows (especially visualizer‑generated machines). The goal is to reuse a
static machine definition while injecting runtime implementations of actions,
guards, and context without rewriting the statechart.

This should act as a **convenience wrapper** over the same options mechanism
already accepted by `createMachine(fsmConfig, options)`. Both paths should feed
into a single internal options resolution flow.

**Intent:** support both API entry points (`createMachine(config, options)` and
`machine.withConfig(options, contextOverride)`) without duplicating logic. There
should be **one underlying options structure**, with `withConfig()` simply
producing a new machine instance that uses a merged options set.

## Why Now
- Visualizer output often chains `.withConfig(...)`.
- Keeps generated machines unchanged and avoids manual edits.
- Aligns FSMPlus ergonomics with common XState v4 patterns.

## Desired Minimal API (FSMPlus)

### Shape
```
machine.withConfig(options, contextOverride?)
machine.withContext(contextOverride)
```

### Options subset
- `actions`: map of action implementations by name
- `guards`: map of guard implementations by name

### Context override
- Optional `contextOverride` replaces `machine.config.context`.

## Proposed Semantics

1. **Return a new machine object**, leaving the original unmodified.
2. **Merge options**:
   - `actions` and `guards` merged shallowly (new keys override existing).
3. **Context**:
   - If `contextOverride` provided, use it for `machine.config.context`.
4. **withContext**:
   - Thin alias for `withConfig(null, contextOverride)`.
5. **No extra features**:
   - No services/invokes, delays, activities, or dynamic `resolve` helpers.
   - Keep ES5‑friendly implementation.

## Small Implementation Plan (No Code Yet)

1. **Unify options resolution**
   - Treat `createMachine(fsmConfig, options)` as the baseline source of options.
   - Store merged options on the machine as `machine._options` (actions/guards).
   - Ensure all action/guard resolution reads from `machine._options` so both
     entry points behave identically.

2. **Add `withConfig` + `withContext` methods**
   - `withConfig(options, contextOverride)` returns a shallow copy of the machine.
   - Merge `machine._options` with `options` (actions/guards only).
   - Reuse the same merge helper used by `createMachine` to avoid divergence.
   - If `contextOverride` provided, clone `machine.config` and replace `context`.
   - `withContext(contextOverride)` calls `withConfig(null, contextOverride)`.

3. **Resolve action/guard names at runtime**
   - Accept action names as strings or `{ type: 'name' }` descriptors.
   - Resolve to `machine._options.actions[name]` if present.
   - Accept guard names as strings and resolve via `machine._options.guards[name]`.
   - Keep existing inline function guards/actions working.

4. **Add a small test**
   - Scenario with `actions: ['log']` and `guard: 'isHot'`.
   - Apply `withConfig({ actions: { log: ... }, guards: { isHot: ... } })`.
   - Verify correct path and actions in trace.

## Footprint Considerations

- **Code size**: small (a method + shallow merge + name resolution helpers).
- **Runtime cost**: minimal; only resolves action/guard names when present.
- **Memory**: small extra object copies for merged config.

## Note on XState v5 Direction

XState v5 moves away from `withConfig()` as the primary configuration API.
Instead it favors:

- `setup({...}).createMachine({...})` for defining implementations
- `machine.provide({...})` for overriding implementations

FSMPlus remains v4‑shaped, so `withConfig()` is still the pragmatic compatibility
target, even if v5 patterns differ.

## Open Questions

- Should we also support `withContext(context)` as a convenience? (Proposed: yes, alias)
- Should action/guard name resolution accept `{ type: 'log' }` vs `{ type, name }`?
  (Proposed: accept strings and `{ type: 'name' }` only.)
- Do we want to allow replacing `machine.config.id` for downstream tooling?
  (Proposed: no; XState v4 does not change `id` via `withConfig`.)
