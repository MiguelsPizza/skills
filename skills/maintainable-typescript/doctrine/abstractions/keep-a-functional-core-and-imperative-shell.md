---
example:
  primary: keep-a-functional-core-and-imperative-shell
  format: code
  implements:
    - keep-a-functional-core-and-imperative-shell
    - pass-values-across-boundaries
    - design-around-composable-primitives
---
# Keep a Functional Core and Imperative Shell

**Rule:** Express business decisions as functions of values. Keep I/O, logging, retries, and persistence around those functions.

See also: [Pass Values Across Boundaries](../boundaries/pass-values-across-boundaries.md) and [Design Around Composable Primitives](./design-around-composable-primitives.md).

## Why agents get this wrong

Agents mix business decisions with database access, logs, and API calls. Testing one rule then requires fixtures and mocks for unrelated systems.

## What to do instead

Keep decisions, transformations, validation, and policy independent of databases, queues, clocks, and SDK clients when their inputs can be values. Let the public workflow perform I/O and pass results to those functions.

Keep the functions in the same module when that makes the workflow easier to follow. Test through the module's public behavior; separate folders or a file per step are optional.

## Example

```typescript
const reviewRun = await getReviewRun(input.reviewRunId);
const decision = decideReviewRunTransition(reviewRun, input.command);

if (!decision.ok) {
  throw new Error(decision.reason);
}

await saveReviewRunTransition(decision.nextState);
await publishReviewRunUpdated(decision.nextState);
```

Example implements: [Keep a Functional Core and Imperative Shell](./keep-a-functional-core-and-imperative-shell.md), [Pass Values Across Boundaries](../boundaries/pass-values-across-boundaries.md), [Design Around Composable Primitives](./design-around-composable-primitives.md).
