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

**Rule:** Keep business logic pure in the middle. Push I/O, logging, retries, and persistence to thin shells at the edges.

See also: [Pass Values Across Boundaries](../boundaries/pass-values-across-boundaries.md) and [Design Around Composable Primitives](./design-around-composable-primitives.md).

## Why agents get this wrong

Agents solve tasks locally. They load data, branch on business rules, write to the database, emit logs, and call external APIs all in one function because that is the shortest path to "working code." The result is logic you cannot test without half the application.

## What to do instead

Separate the code into two layers:
- functional core: decisions, transformations, validation, policy
- imperative shell: fetch input, call the core, persist results, emit side effects

The shell should read top-to-bottom and stay thin. The core should accept values and return values. If a rule can be tested without a database, queue, clock, or SDK client, it belongs in the core.

This rule is about purity and side-effect placement. It complements [Design Around Composable Primitives](./design-around-composable-primitives.md), which is about overall workflow shape rather than pure-core boundaries.

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

If the important rule needs a database fixture just to assert a yes or no answer, the shell is swallowing the core.
