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

**Rule:** Keep important decisions testable as value-in/value-out code. Do not bury business rules inside I/O, logging, retries, or persistence.

See also: [Pass Values Across Boundaries](../boundaries/pass-values-across-boundaries.md) and [Design Around Composable Primitives](./design-around-composable-primitives.md).

## Why agents get this wrong

Agents solve tasks locally. They load data, branch on business rules, write to the database, emit logs, and call external APIs all in one function because that is the shortest path to "working code." The result is logic you cannot test without half the application.

## What to do instead

Keep decisions, transformations, validation, and policy separable from side effects. This does not require a `core/` folder, a `shell/` folder, or one file per step. In a deep module, the public workflow can stay top-to-bottom while the important decision remains a plain function over values.

If a rule can be tested without a database, queue, clock, or SDK client, keep it independent of those things. If splitting it out creates more navigation than clarity, keep it in the same module and test through the module's public behavior.

This rule is about side-effect placement, not architectural layering. It complements [Design Around Composable Primitives](./design-around-composable-primitives.md), which is about overall workflow shape.

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
## The test

If the important rule needs a database fixture just to assert a yes or no answer, I/O is swallowing the decision.
