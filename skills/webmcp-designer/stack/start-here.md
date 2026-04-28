---
example:
  primary: start-here
  format: workflow
  implements:
    - start-here
    - implementation-patterns
    - one-pass-instrumentation-plan
---
# Start Here

**Rule:** Instrument an existing app by composing a route layer, module-local `WebMCP/` wrappers, thin tool execute bodies, and user-story web skills around the app's existing features.

See also: [Implementation Patterns](./implementation-patterns.md) and [One-Pass Instrumentation Plan](./one-pass-instrumentation-plan.md).

## Why agents get this wrong

Agents usually start where the DOM makes work visible: a screen, button, or mutation handler. That creates a pile of local tools before the agent has a route story, a module ownership pattern, or a safe read-before-write sequence.

The failure mode is not missing WebMCP calls. It is scattering tool code across the app until the agent surface no longer mirrors the product.

## What to do instead

Use this house blueprint when the target is a React or JavaScript SPA and you want one coherent way to add WebMCP without scattering tool code across the app.

The stable pieces are:
- one route layer that orients the agent before feature work starts
- one `WebMCP/` seam per feature or module
- read, navigation, and write tools kept distinct
- thin wrappers that call existing app logic instead of parallel tool-only logic
- web-skill guidance written around user stories and routes, not tool names

For ordered implementation work, use [One-Pass Instrumentation Plan](./one-pass-instrumentation-plan.md). This file defines the house shape; the execution-plan file defines the work order.

Suggested layout:

```text
src/
  app/
    router/
    WebMCP/
      route-tools.ts
      route-skills.ts
  features/
    flights/
      api/
      model/
      ui/
      WebMCP/
        read-tools.ts
        navigation-tools.ts
        write-tools.ts
        hooks.ts
    checkout/
      model/
      ui/
      WebMCP/
        read-tools.ts
        write-tools.ts
```

The point is not the exact filenames. The point is one obvious place per module where WebMCP wrappers live.

Good:
- `features/flights/WebMCP/read-tools.ts`
- `features/flights/WebMCP/write-tools.ts`
- `features/flights/WebMCP/hooks.ts`

Avoid:
- `src/tools/webmcp/everything.ts`
- `src/webmcp/delete-flight.ts`
- `src/webmcp/fill-flight-form.ts`

Wrapper code may:
- map WebMCP schema fields to existing function inputs
- select which existing function or action to call
- surface validation and prepared state
- register and unregister tools with the framework lifecycle

Wrapper code should not:
- create new domain rules just for tools
- re-implement business logic that already exists elsewhere
- become the only place where a mutation path works

If the tool needs a lot of new logic, the app is probably missing a reusable function. Extract that function first, then have both the UI and the tool call it.

## Example

Good composition:
1. `app/WebMCP/route-tools.ts` exposes the route map.
2. `features/flights/WebMCP/read-tools.ts` wraps the existing search result selector.
3. `features/flights/WebMCP/navigation-tools.ts` changes tabs or sub-routes.
4. `features/checkout/WebMCP/write-tools.ts` stages traveler data, then commits through the existing checkout action.

Example implements: [Start Here](./start-here.md), [Implementation Patterns](./implementation-patterns.md), [One-Pass Instrumentation Plan](./one-pass-instrumentation-plan.md).
