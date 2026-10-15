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

Agents encode required sequences in comments on large options objects, or add a builder whose setters only copy fields. The first loses type guarantees; the second adds calls without adding guarantees.

## What to do instead

Use a builder when steps establish guarantees such as validated input, authentication, resource scope, output shape, or permission to perform the next operation. Each step must preserve earlier guarantees.

Do not use a builder when the result is just one object shape. Write the object directly, use `satisfies` to check it, and extract a function only when construction derives or validates data.

Give reusable builder behavior named steps. Split a step if mode flags or several booleans select different meanings.

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
