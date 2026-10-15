---
example:
  primary: no-defensive-catches
  format: code
  implements:
    - no-defensive-catches
    - boundaries-validate-internals-trust
    - log-at-boundaries-not-everywhere
    - use-branded-scalar-types
---
# No Defensive Catches

**Rule:** Catch an error only to recover, translate it at a boundary, or clean up resources. Let unexpected errors propagate.

See also: [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [Log at Boundaries, Not Everywhere](./log-at-boundaries-not-everywhere.md), and [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents catch anything that could throw, then log and return a default or continue. Callers treat the operation as successful even when it failed.

## What to do instead

Catch errors when you can:

- retry with a different strategy
- return a meaningful fallback other than `undefined`
- convert the error to a response at a system boundary
- clean up resources; use `finally` or `using` when possible

Let the error propagate if the catch would only log and continue or return `undefined`.

## Example

Procedure

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@repo/db/client';
import { users } from '@repo/db/schema/users';
import { getUserInputSchema } from '@repo/contracts/users/user';
import { publicProcedure } from '../orpc';

export const getUser = publicProcedure
  .input(getUserInputSchema)
  .handler(async ({ input, errors }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });

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

OpenAPI boundary

```typescript
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { LOG_EVENTS } from '@repo/contracts/observability/log-events';
import { logger } from '@/observability/logger';
import { appRouter } from '@/worker/orpc/router';

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logger.error(LOG_EVENTS.USER_LOOKUP_FAILED, { error });
    }),
  ],
});

export default async function fetch(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: '/api',
    context: { requestId: crypto.randomUUID() },
  });

  if (matched) {
    return response;
  }

  return new Response('Not Found', { status: 404 });
}
```

Example implements: [No Defensive Catches](./no-defensive-catches.md), [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [Log at Boundaries, Not Everywhere](./log-at-boundaries-not-everywhere.md), [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).
