---
example:
  primary: design-around-composable-primitives
  format: code
  implements:
    - design-around-composable-primitives
    - build-deep-modules-not-shallow-abstractions
    - no-premature-abstractions
---
# Design Around Composable Primitives

**Rule:** For ordinary application workflows, default to values, functions, and deep modules. Do not centralize unrelated behavior in giant orchestrators, inheritance trees, or branch-heavy manager objects.

See also: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md) and [No Premature Abstractions](./no-premature-abstractions.md).

## Why agents get this wrong

Agents optimize for "put the logic somewhere safe." That usually becomes a `FooService` with private methods, shared mutable state, and a few mode flags. The file grows because every new case is "close enough" to add to the same class. The result is one important object that knows too much and composes poorly.

## What to do instead

Start from the fewest durable pieces:
- values that describe state
- functions that transform those values
- modules that own one coherent subsystem

Then compose those pieces into workflows. Good primitives are not tiny by default; they are useful because they expose a small contract and hide the right amount of internal work. Good compositions are readable because the meaningful steps are visible in order.

This rule is about where behavior lives. It is not the purity rule from [Keep a Functional Core and Imperative Shell](./keep-a-functional-core-and-imperative-shell.md), and it is not a blanket ban on classes. The narrower class rules live in [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md) and [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md).

## Example

Bad: this is a phase-helper pipeline. The names look tidy, but each helper has the same caller and the same lifecycle.

```typescript
const draft = buildReviewRunDraft(input);
const validatedDraft = validateReviewRunDraft(draft);
const persistedReviewRun = await saveReviewRun(validatedDraft);
await publishReviewRunCreated(persistedReviewRun);
```

Good: the workflow owner composes real primitives: policy, persistence, and publication.

```typescript
export async function createReviewRun(input: CreateReviewRunInput) {
  const pullRequest = await pullRequests.load(input.pullRequestId);
  const decision = reviewRunPolicy.decideStart({
    pullRequest,
    requestedByUserId: input.requestedByUserId,
  });

  if (decision.status === 'blocked') {
    throw new ReviewRunBlockedError(decision.reason);
  }

  const reviewRun = await reviewRuns.insert({
    pullRequestId: pullRequest.id,
    requestedByUserId: input.requestedByUserId,
    status: 'queued',
  });

  await reviewRunEvents.publishStarted(reviewRun);

  return reviewRun;
}
```

Example implements: [Design Around Composable Primitives](./design-around-composable-primitives.md), [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [No Premature Abstractions](./no-premature-abstractions.md).
## The smell

If every new feature starts with "add another branch to the service," the module is too broad. If every change starts with "add another helper file," the module is too shallow.
