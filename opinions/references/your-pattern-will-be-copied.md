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

**Rule:** Whatever you write becomes the template. The next AI agent will copy your pattern exactly. If you cut a corner, every generated file inherits that corner. Make the pattern worth copying.

See also: [No Type Casts](no-type-casts.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), and [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents pattern-match from local examples. They do not ask whether the local example was intentional, temporary, or already a mistake. If a repo contains one sloppy pattern, agents will amplify it because imitation is cheaper than design.

This means:
- One sloppy error handler becomes the template for every future error handler
- One over-abstracted utility becomes the template for every future utility
- One file with commented-out code signals that commenting out code is acceptable
- One function with 8 parameters signals that functions with 8 parameters are normal

## What to do instead

Write every file as if it's the example in a style guide. Because it is.

Before you ship, ask: "If an agent copies this pattern 50 times across the codebase, would that be good?" If the answer is no, fix the pattern before it propagates.

## Example

```typescript
import { getUserInputSchema, userSchema } from '@repo/shared-types/users/user';
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

Example implements: [Your Pattern Will Be Copied](your-pattern-will-be-copied.md), [No Type Casts](no-type-casts.md), [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).
