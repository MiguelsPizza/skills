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

Agents rarely invent inheritance trees from scratch in a vacuum. They do, however, cargo-cult OO structure from Java and C# whenever the local code or prompt leans that way. Then they create `BaseService`, `AuthenticatedService`, `AuditedService`, and `CachedAuditedService`. Each subclass adds one concern, but the hierarchy couples unrelated behaviors and makes changes expensive.

## What to do instead

Model each capability as a composable unit:
- a function wrapper
- a contained dependency
- a narrow module with one responsibility

Then assemble the final behavior directly in the feature that needs it. Composition keeps the behavior graph explicit. Inheritance hides it in class ancestry and constructor chains.

This rule is specifically about inheritance and subclass specialization. Whether a class is warranted at all is the separate question answered by [Use Classes for Object APIs, Not Service Buckets](./use-classes-for-object-apis-not-service-buckets.md).

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
## The rule of thumb

If the important behavior lives in `extends`, your design is hiding composition from the reader.
