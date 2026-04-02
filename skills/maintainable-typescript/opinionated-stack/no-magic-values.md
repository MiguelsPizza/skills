---
example:
  primary: no-magic-values
  format: code
  implements:
    - no-magic-values
    - jsdoc-with-first-party-sources
    - otel-conventions-from-day-one
---
# No Magic Values

**Rule:** Every literal that controls behavior must be a named constant with provenance. Inline literals are for obvious identities only, not for business rules.

See also: [JSDoc with First-Party Sources](jsdoc-with-first-party-sources.md) and [OTEL Conventions from Day One](otel-conventions-from-day-one.md).

## Why agents get this wrong

Agents inline values because it is locally convenient. `3`, `5000`, `'pending_review'`, and `'pull_request'` all type-check immediately, so they get buried in control flow instead of becoming visible decisions.

Once one literal ships, future agents copy it without knowing whether it was deliberate, arbitrary, or already wrong.

## What to do instead

Extract behavioral literals into named constants, group them by domain, and document why the value exists.

Use `as const satisfies` for constant objects so values stay literal and exhaustive.

```typescript
/** 3 balances reliability with GitHub's 10 second webhook timeout. */
export const MAX_RETRIES = 3;

/** Base retry delay in milliseconds. Exponential backoff multiplies from here. */
export const RETRY_BASE_DELAY_MS = 1000;

export const GITHUB_EVENTS = {
  PULL_REQUEST: 'pull_request',
  INSTALLATION: 'installation',
} as const satisfies Record<string, string>;

if (attempts > MAX_RETRIES) throw error;
await sleep(RETRY_BASE_DELAY_MS * 2 ** attempts);
headers.set('X-GitHub-Event', GITHUB_EVENTS.PULL_REQUEST);
```

If a value is arbitrary, say so explicitly in the JSDoc so the next contributor knows it can be tuned.

## Example

Shared constants

```typescript
/**
 * GitHub sends the event type in the `X-GitHub-Event` header.
 *
 * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads
 */
export const GITHUB_EVENT_HEADER = 'X-GitHub-Event';

/**
 * Pull request webhook event name.
 *
 * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request
 */
export const GITHUB_EVENT_PULL_REQUEST = 'pull_request';

/**
 * 3 balances transient retry recovery against the webhook latency budget.
 *
 * @see ./.sources/github-webhook-retry-budget.md
 */
export const MAX_GITHUB_API_ATTEMPTS = 3;
```

Feature usage

```typescript
import {
  GITHUB_EVENT_HEADER,
  GITHUB_EVENT_PULL_REQUEST,
  MAX_GITHUB_API_ATTEMPTS,
} from '@repo/github-client/github-webhook-constants';
import { LOG_EVENTS, OTEL_ATTRS } from '@repo/shared-types/observability';

if (attempts > MAX_GITHUB_API_ATTEMPTS) throw error;
headers.set(GITHUB_EVENT_HEADER, GITHUB_EVENT_PULL_REQUEST);
logger.info(LOG_EVENTS.GITHUB_WEBHOOK_RECEIVED, {
  [OTEL_ATTRS.HTTP_ROUTE]: '/webhooks/github',
});
```

Example implements: [No Magic Values](no-magic-values.md), [JSDoc with First-Party Sources](jsdoc-with-first-party-sources.md), [OTEL Conventions from Day One](otel-conventions-from-day-one.md).
