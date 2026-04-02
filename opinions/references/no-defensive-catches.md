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

**Rule:** Don't wrap things in try/catch "just in case." Only catch errors you can meaningfully handle. Let unexpected errors propagate and crash loudly.

See also: [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), [Log at Boundaries, Not Everywhere](log-at-boundaries-not-everywhere.md), and [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents add try/catch blocks around anything that *could* throw, even when there's no meaningful recovery. The catch block usually logs the error and returns a default value or silently continues. This feels robust but actually hides bugs — the system appears to work while silently producing wrong results.

## What to do instead

Ask: "What do I do in the catch block?" If the answer is "log it and return undefined" or "log it and continue" — don't catch it. Let it crash. A crash is a signal. A swallowed error is invisible corruption.

Catch errors when:
- You can retry with a different strategy
- You can return a meaningful fallback (not `undefined`)
- You're at a system boundary and need to convert to an error response
- You need to clean up resources (but prefer `finally` or `using` for this)

## Example

Procedure

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@repo/db/client';
import { users } from '@repo/db/schema/users';
import { getUserInputSchema } from '@repo/shared-types/users/user';
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
import { LOG_EVENTS } from '@repo/shared-types/observability';
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

Example implements: [No Defensive Catches](no-defensive-catches.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), [Log at Boundaries, Not Everywhere](log-at-boundaries-not-everywhere.md), [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).
