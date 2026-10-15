---
example:
  primary: bounded-behavior
  format: code
  implements:
    - bounded-behavior
    - no-magic-values
    - log-at-boundaries-not-everywhere
---
# Bounded Behavior

**Rule:** Set explicit limits on retries, queues, polling, payloads, and every recurring operation.

## Why agents get this wrong

Retry logic without backoff or a ceiling can overload a failing service. Polling without a deadline can run forever. Unbounded queues and payloads can exhaust memory.

## What to do instead

Define visible constants that bound every loop, retry, queue, buffer, or recurring operation.

## Checklist

- [ ] Retries have `MAX_RETRIES` with exponential backoff
- [ ] Polling has a `TIMEOUT_MS` that stops the loop
- [ ] Queues have a `MAX_QUEUE_SIZE` that applies backpressure
- [ ] Payloads have a `MAX_PAYLOAD_BYTES` that rejects oversized input
- [ ] Batch operations have a `BATCH_SIZE` limit
- [ ] WebSocket reconnection has a maximum number of attempts
- [ ] Recursive functions have a depth limit or are rewritten as iteration

## Example

Owner constants

```typescript
export const MAX_GITHUB_FETCH_ATTEMPTS = 3;
export const INITIAL_RETRY_DELAY_MS = 250;
```

Feature usage

```typescript
import { getPullRequestDiffInputSchema } from '@repo/contracts/github/get-pull-request-diff';
import {
  INITIAL_RETRY_DELAY_MS,
  MAX_GITHUB_FETCH_ATTEMPTS,
} from '@repo/github-client/github-retry-policy';
import { buildPullRequestDiffUrl } from '@/lib/github/build-pull-request-diff-url';
import { publicProcedure } from '../orpc';
import { sleep } from '@/lib/sleep';

async function fetchPullRequestDiff(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < MAX_GITHUB_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(url);
    } catch {
      if (attempt < MAX_GITHUB_FETCH_ATTEMPTS - 1) {
        await sleep(INITIAL_RETRY_DELAY_MS * 2 ** attempt);
      }
    }
  }

  return null;
}

export const getPullRequestDiff = publicProcedure
  .input(getPullRequestDiffInputSchema)
  .handler(async ({ input, errors }) => {
    const response = await fetchPullRequestDiff(
      buildPullRequestDiffUrl(input.pullRequestNumber),
    );

    if (!response) {
      throw errors.BAD_GATEWAY({
        data: {
          code: 'pull_request_diff_unavailable',
          message: 'Unable to load the pull request diff.',
          attempts: MAX_GITHUB_FETCH_ATTEMPTS,
          pullRequestNumber: input.pullRequestNumber,
        },
      });
    }

    return { diff: await response.text() };
  });
```

Example implements: [Bounded Behavior](./bounded-behavior.md), [No Magic Values](../../stack/no-magic-values.md), [Log at Boundaries, Not Everywhere](../boundaries/log-at-boundaries-not-everywhere.md).
