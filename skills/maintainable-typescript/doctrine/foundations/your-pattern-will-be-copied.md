---
example:
  primary: your-pattern-will-be-copied
  format: code
  implements:
    - your-pattern-will-be-copied
    - no-type-casts
    - use-branded-scalar-types
---
# Your Pattern Will Be Copied

**Rule:** Write patterns worth copying; future agents use local code as their template.

See also: [No Type Casts](../boundaries/no-type-casts.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md), and [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).

## Why agents get this wrong

Local examples can turn temporary shortcuts into conventions. A weak error handler, unnecessary abstraction, commented-out block, or eight-parameter function gives later agents a pattern to repeat.

## What to do instead

Treat each file as a reference example. Before shipping, fix any pattern that would make the codebase harder to maintain if repeated.

## Example

```typescript
import { getUserInputSchema, userSchema } from '@repo/contracts/users/user';
import { fetchUserById } from '@repo/db/users/fetch-user-by-id';
import { publicProcedure } from '../orpc';

export const getUser = publicProcedure
  .input(getUserInputSchema)
  .output(userSchema)
  .handler(async ({ input, errors }) => {
    const user = await fetchUserById(input.userId);
    if (!user) {
      throw errors.NOT_FOUND({
        data: {
          code: 'user_not_found',
          message: 'User not found.',
          userId: input.userId,
        },
      });
    }

    return user;
  });
```

Example implements: [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md), [No Type Casts](../boundaries/no-type-casts.md), [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).
