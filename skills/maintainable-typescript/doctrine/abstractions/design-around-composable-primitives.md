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

**Rule:** Build application workflows from values, functions, and deep modules. Give unrelated behavior separate owners.

See also: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md) and [No Premature Abstractions](./no-premature-abstractions.md).

## Why agents get this wrong

Agents put related-looking behavior in one service, then add shared state and mode flags for each new case. Callers cannot reuse one capability without taking on the others.

## What to do instead

Use values for state, functions for transformations, and modules for cohesive subsystems. Give each primitive a small contract that hides its internal work. Compose workflows with the meaningful steps visible in order.

Use [Keep a Functional Core and Imperative Shell](./keep-a-functional-core-and-imperative-shell.md) to place side effects. Use [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md) and [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md) when the API needs objects.

## Example

```typescript
const draft = buildReviewRunDraft(input);
const validatedDraft = validateReviewRunDraft(draft);
const persistedReviewRun = await saveReviewRun(validatedDraft);
await publishReviewRunCreated(persistedReviewRun);
```

Example implements: [Design Around Composable Primitives](./design-around-composable-primitives.md), [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [No Premature Abstractions](./no-premature-abstractions.md).
