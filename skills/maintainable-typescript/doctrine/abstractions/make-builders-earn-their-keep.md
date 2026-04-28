---
example:
  primary: make-builders-earn-their-keep
  format: code
  implements:
    - make-builders-earn-their-keep
    - no-premature-abstractions
    - no-type-casts
---
# Make Builders Earn Their Keep

**Rule:** Use a builder only when staged calls add type guarantees, capabilities, or lifecycle constraints. For plain data, use object literals and functions.

See also: [No Premature Abstractions](./no-premature-abstractions.md) and [No Type Casts](../boundaries/no-type-casts.md).

## Why agents get this wrong

Agents usually mishandle builders in both directions. Without a builder, they pile required steps into a giant options object and document valid combinations in comments. In object-oriented code, they copy the local shape too hard and create mutable `FooBuilder` classes with setters for fields that are just plain data.

Both failures hide the real contract. Either the required sequence is invisible to the type system, or the builder adds ceremony without adding any new fact.

## What to do instead

Use a builder when each step makes a new guarantee available to the next step:
- input has been validated
- auth has been added
- a resource has been scoped
- output has been declared
- the next operation is now legal

A good TypeScript builder is monotonic. Later steps add information; they do not reopen earlier uncertainty.

Do not use a builder when the result is just one object shape. Write the object directly, use `satisfies` to check it, and extract a function only when construction derives or validates data.

Reusable builder behavior should be a named step, not a branchy helper with `mode` flags. If one builder step needs an enum or several booleans to decide what it means, split it.

## Example

```typescript
const protectedProcedure = publicProcedure.use(requireAuthenticatedUser);

export const updateRepository = protectedProcedure
  .use(rateLimitWrites)
  .use(emitAuditEvent)
  .input(updateRepositoryInputSchema)
  .mutation(({ ctx, input }) => {
    return saveRepository(ctx.user.id, input);
  });

const repository = {
  id: repositoryId,
  name,
  visibility: 'private',
} satisfies Repository;
```

Example implements: [Make Builders Earn Their Keep](./make-builders-earn-their-keep.md), [No Premature Abstractions](./no-premature-abstractions.md), [No Type Casts](../boundaries/no-type-casts.md).

## The test

If each step changes what the next step can safely do, a builder may be right. If `.build()` only returns the object you could have written inline, delete the builder.
