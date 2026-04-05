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

**Rule:** Every error message has an audience. User-facing errors explain what happened and what to do next. Developer-facing errors include the technical cause. Never surface internal details to users. Never hide actionable context from developers.

See also: [Log at Boundaries, Not Everywhere](log-at-boundaries-not-everywhere.md) and [Errors Are Schema, Not Strings](../opinionated-stack/errors-are-schema.md).

## Why agents get this wrong

Agents write one error message and use it everywhere. Either it's too technical — `SQLITE_CONSTRAINT_UNIQUE: installations.repo_id` — or too vague — `Something went wrong. Please try again.` Both are failures. The user gets a database column name they can't act on, or a non-answer that wastes their time.

Agents also conflate the error response with the error log. They put the full stack trace in the HTTP response, or they put the generic message in the log. Neither consumer gets what they need.

## What to do instead

Give every error two outputs:

1. The response says what happened in domain language and what the user can do next.
2. The log records the technical cause, request context, and enough identifiers to debug it.

For user-visible messages, answer:
- What happened?
- Why did it happen?
- What should the user do next?

For developer-visible logs, include:
- the operation or boundary that failed
- the technical error
- the relevant identifiers or inputs

Mask internal failures in production responses. Expose the real failure only in logs, and include a `requestId` so support can bridge the two.

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

Example implements: [Error Messages Are UX](error-messages-are-ux.md), [Log at Boundaries, Not Everywhere](log-at-boundaries-not-everywhere.md), [Errors Are Schema, Not Strings](../opinionated-stack/errors-are-schema.md).
