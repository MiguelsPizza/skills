---
example:
  primary: otel-conventions-from-day-one
  format: code
  implements:
    - otel-conventions-from-day-one
    - log-at-boundaries-not-everywhere
    - no-magic-values
---
# OTEL Conventions from Day One

**Rule:** Use OpenTelemetry semantic attribute keys and consistent event names for structured logs from the start; the SDK can come later.

See also: [Log at Boundaries, Not Everywhere](../doctrine/boundaries/log-at-boundaries-not-everywhere.md) and [No Magic Values](./no-magic-values.md).

## Why agents get this wrong

Locally invented log keys require migration when tracing, dashboards, or shared queries need consistent names.

## What to do instead

Use dotted `domain.action` event names and OTEL semantic attribute keys, including when writing plain JSON logs. Define keys and event names as shared constants so logs and later spans use the same names.

```typescript
export const OTEL_ATTRS = {
  HTTP_METHOD: 'http.request.method',
  HTTP_STATUS: 'http.response.status_code',
  HTTP_PATH: 'url.path',
  ERROR_TYPE: 'error.type',
  ERROR_MESSAGE: 'exception.message',
  INSTALLATION_ID: 'autotool.installation.id',
  PR_NUMBER: 'autotool.pr.number',
} as const satisfies Record<string, string>;

export const LOG_EVENTS = {
  WEBHOOK_RECEIVED: 'webhook.received',
  REVIEW_RUN_STATUS_CHANGE: 'review_run.status_change',
  GITHUB_API_CALL: 'github.api.call',
  INTERNAL_ERROR: 'error.internal',
} as const satisfies Record<string, string>;
```

## Example

OTEL attribute keys

```typescript
export const OTEL_ATTRS = {
  HTTP_REQUEST_METHOD: 'http.request.method',
  HTTP_RESPONSE_STATUS_CODE: 'http.response.status_code',
  URL_PATH: 'url.path',
  GITHUB_INSTALLATION_ID: 'github.installation.id',
  REQUEST_DURATION_MS: 'server.request.duration_ms',
} as const satisfies Record<string, string>;
```

Log event names

```typescript
export const LOG_EVENTS = {
  GITHUB_PULL_REQUEST_CREATED: 'github.pull_request.created',
} as const satisfies Record<string, string>;
```

Boundary log

```typescript
import { GITHUB_ENDPOINTS } from '@repo/github-client/endpoints';
import { LOG_EVENTS } from '@repo/contracts/observability/log-events';
import { OTEL_ATTRS } from '@repo/contracts/observability/otel-attrs';

const CREATE_PULL_REQUEST_STATUS_CODE = 201;

logger.info(LOG_EVENTS.GITHUB_PULL_REQUEST_CREATED, {
  [OTEL_ATTRS.HTTP_REQUEST_METHOD]: 'POST',
  [OTEL_ATTRS.URL_PATH]: GITHUB_ENDPOINTS.CREATE_PULL_REQUEST,
  [OTEL_ATTRS.HTTP_RESPONSE_STATUS_CODE]: CREATE_PULL_REQUEST_STATUS_CODE,
  [OTEL_ATTRS.GITHUB_INSTALLATION_ID]: installationId,
  [OTEL_ATTRS.REQUEST_DURATION_MS]: elapsedMs,
});
```

Example implements: [OTEL Conventions from Day One](./otel-conventions-from-day-one.md), [Log at Boundaries, Not Everywhere](../doctrine/boundaries/log-at-boundaries-not-everywhere.md), [No Magic Values](./no-magic-values.md).
