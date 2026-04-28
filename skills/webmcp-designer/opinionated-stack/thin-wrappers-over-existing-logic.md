---
example:
  primary: thin-wrappers-over-existing-logic
  format: code
  implements:
    - thin-wrappers-over-existing-logic
    - start-here
    - module-local-webmcp-directories
---
# Thin Wrappers Over Existing Logic

**Rule:** WebMCP tool bodies should wrap existing application logic. Do not create parallel business logic inside the tool execute body.

See also: [Start Here](start-here.md) and [Module-Local WebMCP Directories](module-local-webmcp-directories.md).

## Why agents get this wrong

The WebMCP surface should stay as small as possible. A tool is usually an adapter layer:
- accept WebMCP inputs
- call existing selectors, actions, services, or router code
- return the right structured result

Thin wrappers keep re-renders, side effects, and feature parity under control because the real logic still lives in the app's normal modules.

Use the first-party WebMCP registration surface directly in that wrapper layer. Do not add another layer of homegrown or third-party "tool helper" abstractions unless the project already standardizes on them.

## What to do instead

Tool bodies may:
- switch between existing actions
- map schema fields to existing function arguments
- compose a small amount of orchestration around existing functions
- surface validation state before commit

Registration code should usually use the first-party surfaces directly:
- `useWebMCP()` in React when the app is using the React integration
- `registerTool()` when working directly with the core browser registration surface

Tool bodies should not:
- invent new domain rules that only tools know about
- duplicate API shaping logic that already exists in the feature
- become a second mutation path that the UI never uses

If the tool needs a lot of new logic, that is usually a signal that the app is missing a reusable function. Extract that function first, then have both the UI and the tool call it.

## Example

```typescript
// feature logic that already exists
export async function stageCheckout(input: CheckoutDraft) {
  return checkoutStore.stage(input);
}

export async function commitCheckout() {
  return checkoutStore.commit();
}

// WebMCP wrapper handler
async function handleCheckoutPreparation(input: CheckoutToolInput) {
  return stageCheckout(mapToolInputToDraft(input));
}

// Register this handler with useWebMCP() or registerTool()
// using the exact first-party syntax from the docs server.
```

Example implements: [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md), [Start Here](start-here.md), [Module-Local WebMCP Directories](module-local-webmcp-directories.md).
