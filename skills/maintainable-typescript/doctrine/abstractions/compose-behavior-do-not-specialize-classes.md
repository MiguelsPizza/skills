---
example:
  primary: compose-behavior-do-not-specialize-classes
  format: code
  implements:
    - compose-behavior-do-not-specialize-classes
    - no-premature-abstractions
    - your-pattern-will-be-copied
---
# Compose Behavior, Do Not Specialize Classes

**Rule:** Add capabilities by composing functions and contained modules, not by growing inheritance hierarchies.

See also: [No Premature Abstractions](./no-premature-abstractions.md) and [Your Pattern Will Be Copied](../foundations/your-pattern-will-be-copied.md).

## Why agents get this wrong

Agents copy inheritance patterns into `BaseService`, `AuthenticatedService`, and `CachedAuditedService`. The hierarchy couples capabilities that should vary independently.

## What to do instead

Implement each capability as a function wrapper, contained dependency, or focused module. Assemble them in the feature that needs them so readers can see the behavior in one place.

Decide whether the API needs a class using [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md).

## Example

```typescript
const saveRepository = withAuditTrail(
  withWriteRateLimit(persistRepository),
);

await saveRepository({
  repositoryId,
  name,
});
```

Example implements: [Compose Behavior, Do Not Specialize Classes](./compose-behavior-do-not-specialize-classes.md), [No Premature Abstractions](./no-premature-abstractions.md), [Your Pattern Will Be Copied](../foundations/your-pattern-will-be-copied.md).
