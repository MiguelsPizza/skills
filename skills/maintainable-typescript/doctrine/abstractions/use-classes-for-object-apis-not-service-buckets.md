---
example:
  primary: use-classes-for-object-apis-not-service-buckets
  format: code
  implements:
    - use-classes-for-object-apis-not-service-buckets
    - design-around-composable-primitives
    - compose-behavior-do-not-specialize-classes
---
# Use Classes for Object APIs, Not Service Buckets

**Rule:** Use a class when one named object gives callers a clearer API. Keep dependency containers, namespaces, and unrelated service methods in modules.

See also: [Design Around Composable Primitives](./design-around-composable-primitives.md) and [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md).

## Why agents get this wrong

Agents copy service classes that hold dependencies and group related methods. The class adds construction and state without giving callers a useful object API.

## What to do instead

Start with values, functions, and modules. Use a class for a coherent object API: a builder, parser, formatter, policy, domain object, or resource with state or a lifecycle.

Replace a class that only holds injected dependencies and exposes `create`, `update`, `delete`, or `process` methods with a module or a focused object. Compose capabilities using [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md).

## Example

```typescript
export class ReviewRunPolicy {
  constructor(private readonly now: Date) {}

  canStart(run: ReviewRun): boolean {
    return run.status === 'queued' && run.scheduledAt <= this.now;
  }

  canCancel(run: ReviewRun): boolean {
    return run.status === 'queued' || run.status === 'running';
  }
}
```

Example implements: [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md), [Design Around Composable Primitives](./design-around-composable-primitives.md), [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md).
