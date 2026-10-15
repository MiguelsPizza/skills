---
example:
  primary: error-messages-are-ux
  format: code
  implements:
    - error-messages-are-ux
    - log-at-boundaries-not-everywhere
    - errors-are-schema
---
# Error Messages Are UX

**Rule:** Tell users what happened and what to do next. Give developers the technical cause and debugging context. Keep internal details out of user responses.

See also: [Log at Boundaries, Not Everywhere](./log-at-boundaries-not-everywhere.md) and [Errors Are Schema, Not Strings](../../stack/errors-are-schema.md).

## Why agents get this wrong

Agents reuse one message in responses and logs. Technical messages expose internals to users; generic messages leave developers without enough context to diagnose the failure.

## What to do instead

Give each error a response and a log:

- The response explains what happened, why, and what the user can do next, using domain language.
- The log records the failed operation or boundary, technical cause, request context, and relevant identifiers or inputs.

Mask internal failures in production responses. Include a `requestId` that connects the response to its log.

## Example

```typescript
import { connectRepositoryInputSchema } from '@repo/contracts/github/connect-repository';
import { publicProcedure } from '../orpc';
import { createInstallation } from '@/features/installations/create-installation';
import { isRepositoryAlreadyConnected } from '@/features/installations/is-repository-already-connected';

export const connectRepository = publicProcedure
  .input(connectRepositoryInputSchema)
  .handler(async ({ input, context, errors }) => {
    if (await isRepositoryAlreadyConnected(input.repoName)) {
      throw errors.CONFLICT({
        data: {
          code: 'repository_already_connected',
          message: 'Repository is already connected. Remove the existing installation first.',
          installationId: input.installationId,
          requestId: context.requestId,
        },
      });
    }

    return await createInstallation(input);
  });
```

```typescript
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { LOG_EVENTS } from '@repo/contracts/observability/log-events';
import { logger } from '@/observability/logger';
import { appRouter } from '@/worker/orpc/router';

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logger.error(LOG_EVENTS.REPOSITORY_CONNECTION_FAILED, { error });
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

Example implements: [Error Messages Are UX](./error-messages-are-ux.md), [Log at Boundaries, Not Everywhere](./log-at-boundaries-not-everywhere.md), [Errors Are Schema, Not Strings](../../stack/errors-are-schema.md).
