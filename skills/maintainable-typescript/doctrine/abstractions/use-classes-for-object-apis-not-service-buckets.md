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

**Rule:** Use a class when methods hanging off one named object make the API clearer. Do not use classes as DI buckets, fake namespaces, or inheritance hooks.

See also: [Design Around Composable Primitives](./design-around-composable-primitives.md) and [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md).

## Why agents get this wrong

Agents do not default to classes in every repo. They mirror the dominant local style. In OO-leaning codebases or prompts, that means they reach for `FooService` and `FooManager` classes for ordinary backend logic. The class becomes a namespace with constructor injection, a few private helpers, and no real public shape beyond "here are some related methods."

## What to do instead

Start with values, functions, and modules. Use a class when the object itself is the concept and the method surface improves readability:
- a builder or fluent API
- a parser, formatter, or policy object
- a domain object with a small, coherent public surface
- a resource wrapper with lifecycle or state

If the class exists only to hold injected dependencies and expose verbs like `create`, `update`, `delete`, or `process`, it is probably a service bucket. Prefer a module or a smaller object with a sharper point of view.

This rule is about whether a class should exist. If the problem is subclass layering, use [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md).

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
## The test

Ask: does the class present one readable object API, or is it just a pile of related verbs? If it is the latter, the class is fake structure.
