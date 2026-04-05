---
example:
  primary: log-at-boundaries-not-everywhere
  format: code
  implements:
    - log-at-boundaries-not-everywhere
    - error-messages-are-ux
    - otel-conventions-from-day-one
---
# Log at Boundaries, Not Everywhere

**Rule:** Log at system boundaries — incoming requests, outgoing responses, errors, and state transitions. Don't scatter `console.log` through business logic. Every log line should be structured, purposeful, and useful for debugging production issues. If you're paying per log line (Cloudflare Workers, Datadog, etc.), treat logging as a budget.

See also: [Error Messages Are UX](error-messages-are-ux.md), [No Defensive Catches](no-defensive-catches.md), and [OTEL Conventions from Day One](../opinionated-stack/otel-conventions-from-day-one.md).

## Why agents get this wrong

Agents add `console.log` the way humans add `print` when debugging — everywhere, temporarily, and then they forget to remove it. They also confuse logging with error handling: `catch (e) { console.error(e) }` feels like they "handled" the error when they actually just hid it.

## What to do instead

Log:
- incoming requests and completed responses
- errors that cross a system boundary
- state transitions that matter operationally
- external calls that are expensive, flaky, or rate-limited

Do not log:
- function entry and exit
- values dumped for temporary debugging
- success paths that happen on every request
- the same fact at three different layers

Every production log should be structured, queryable, and named consistently. Keep the placement rule here, and take naming conventions from the OTEL stack opinion instead of inventing a second standard.

## Example

```typescript
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { LOG_EVENTS } from '@repo/contracts/observability/log-events';
import { OTEL_ATTRS } from '@repo/contracts/observability/otel-attrs';
import { logger } from '@/observability/logger';
import { appRouter } from '@/worker/orpc/router';

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logger.error(LOG_EVENTS.API_REQUEST_FAILED, { error });
    }),
  ],
});

export default async function fetch(request: Request) {
  const requestId = crypto.randomUUID();

  logger.info(LOG_EVENTS.API_REQUEST_STARTED, {
    [OTEL_ATTRS.HTTP_ROUTE]: new URL(request.url).pathname,
    [OTEL_ATTRS.HTTP_REQUEST_METHOD]: request.method,
    [OTEL_ATTRS.REQUEST_ID]: requestId,
  });

  const { response } = await handler.handle(request, {
    prefix: '/api',
    context: { requestId },
  });

  if (response) {
    logger.info(LOG_EVENTS.API_REQUEST_COMPLETED, {
      [OTEL_ATTRS.HTTP_ROUTE]: new URL(request.url).pathname,
      [OTEL_ATTRS.HTTP_RESPONSE_STATUS_CODE]: response.status,
      [OTEL_ATTRS.REQUEST_ID]: requestId,
    });

    return response;
  }

  return new Response('Not Found', { status: 404 });
}
```

Example implements: [Log at Boundaries, Not Everywhere](log-at-boundaries-not-everywhere.md), [Error Messages Are UX](error-messages-are-ux.md), [OTEL Conventions from Day One](../opinionated-stack/otel-conventions-from-day-one.md).
