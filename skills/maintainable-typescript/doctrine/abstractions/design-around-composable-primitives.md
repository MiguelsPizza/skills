---
example:
  primary: design-around-composable-primitives
  format: code
  implements:
    - design-around-composable-primitives
    - split-by-stable-seam
    - no-premature-abstractions
---
# Design Around Composable Primitives

**Rule:** For ordinary application workflows, default to values, functions, and narrow modules. Do not centralize unrelated behavior in giant orchestrators, inheritance trees, or branch-heavy manager objects.

See also: [Split By Stable Seam](./split-by-stable-seam.md) and [No Premature Abstractions](./no-premature-abstractions.md).

## Why agents get this wrong

Agents optimize for "put the logic somewhere safe." That usually becomes a `FooService` with private methods, shared mutable state, and a few mode flags. The file grows because every new case is "close enough" to add to the same class. The result is one important object that knows too much and composes poorly.

## What to do instead

Start from the smallest durable pieces:
- values that describe state
- functions that transform those values
- modules that own one subsystem boundary

Then compose those pieces into workflows. Good primitives are reusable because they do one job and accept explicit input. Good compositions are readable because the steps are visible in order.

This rule is about where behavior lives. It is not the purity rule from [Keep a Functional Core and Imperative Shell](./keep-a-functional-core-and-imperative-shell.md), and it is not a blanket ban on classes. The narrower class rules live in [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md) and [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md).

## Example

```typescript
const draft = buildReviewRunDraft(input);
const validatedDraft = validateReviewRunDraft(draft);
const persistedReviewRun = await saveReviewRun(validatedDraft);
await publishReviewRunCreated(persistedReviewRun);
```

Example implements: [Design Around Composable Primitives](./design-around-composable-primitives.md), [Split By Stable Seam](./split-by-stable-seam.md), [No Premature Abstractions](./no-premature-abstractions.md).
## The smell

If every new feature starts with "add another branch to the service," the primitives are wrong.
